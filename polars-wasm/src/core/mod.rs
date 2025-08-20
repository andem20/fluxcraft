mod http_client;
pub mod wrapper;

pub mod fluxcraft {

    use calamine::{Data, Reader, Xlsx};
    use polars_core::{
        error::PolarsError,
        frame::DataFrame,
        functions::concat_df_horizontal,
        prelude::{AnyValue, Column, DataType, TimeUnit},
    };
    use polars_io::SerReader;
    use polars_lazy::{
        dsl::{Expr, StrptimeOptions, coalesce, col, lit},
        frame::{IntoLazy, LazyFrame},
    };

    use crate::core::{http_client, wrapper::DataFrameWrapper};

    const CSV_SUFFIX: &str = ".csv";
    const TXT_SUFFIX: &str = ".txt";
    const JSON_SUFFIX: &str = ".json";

    pub struct FluxCraft {
        pub wrappers: std::collections::HashMap<String, DataFrameWrapper>,
        pub sql_ctx: polars_sql::SQLContext,
    }

    impl FluxCraft {
        pub fn new() -> Self {
            Self {
                wrappers: std::collections::HashMap::new(),
                sql_ctx: polars_sql::SQLContext::new(),
            }
        }

        pub fn add(&mut self, mut name: String, df: DataFrame) -> &mut DataFrameWrapper {
            let mut i = 0;
            name = name.replace(".", "_");
            while let Some(_df) = self.wrappers.get(&name) {
                i += 1;
                name.push_str(&i.to_string());
            }

            self.sql_ctx.register(&name, df.clone().lazy());
            let wrapper: DataFrameWrapper = DataFrameWrapper::new(df, &name);

            self.wrappers.insert(name.clone(), wrapper);

            return self.wrappers.get_mut(&name).unwrap();
        }

        pub fn remove(&mut self, name: String) {
            if let Some(_df) = self.wrappers.remove(&name) {
                self.sql_ctx.unregister(&name);
            }
        }

        pub fn get(&self, name: &str) -> Option<&DataFrameWrapper> {
            return self.wrappers.get(name);
        }

        fn read_csv(buffer: &[u8], has_headers: bool) -> Result<DataFrame, PolarsError> {
            let handle = std::io::Cursor::new(&buffer);
            return polars_io::prelude::CsvReadOptions::default()
                .with_has_header(has_headers)
                .into_reader_with_file_handle(handle)
                .finish();
        }

        #[allow(dead_code)]
        fn read_json(buffer: &[u8]) -> Result<DataFrame, PolarsError> {
            let handle = std::io::Cursor::new(&buffer);
            let df = polars_io::prelude::JsonReader::new(handle).finish()?;

            // df = unnest(df)?;

            fn unnest(mut df: polars_core::prelude::DataFrame) -> Result<DataFrame, PolarsError> {
                let col_list_names = df
                    .column_iter()
                    .filter(|c| c.dtype().is_list())
                    .map(|c| c.name().to_string())
                    .collect::<Vec<String>>();

                for name in col_list_names {
                    df = df.explode(&[name])?;
                }

                let col_struct_names = df
                    .column_iter()
                    .filter(|c| c.dtype().is_struct())
                    .map(|c| c.name().to_string())
                    .collect::<Vec<String>>();

                for name in col_struct_names {
                    let col = df.column(&name)?;

                    let mut unnested = col.struct_().cloned().unwrap().unnest();
                    let new_col_names = unnested
                        .get_column_names()
                        .iter()
                        .map(|col_name| add_prefix(col_name, &name))
                        .collect::<Vec<String>>();

                    let _ = unnested.set_column_names(new_col_names);
                    let _ = unnested.drop_in_place(&name);

                    unnested = unnest(unnested)?;
                    let _ = df.drop_in_place(&name);
                    df = polars_core::functions::concat_df_horizontal(&[df, unnested], false)
                        .unwrap();
                }

                return Ok(df);
            }

            fn add_prefix(col_name: &&polars_core::prelude::PlSmallStr, prefix: &String) -> String {
                let mut new_s = col_name.to_string();
                new_s.insert(0, '.');
                new_s.insert_str(0, prefix);
                return new_s;
            }

            return Ok(df);
        }

        pub fn read_buffer(
            buffer: &[u8],
            has_headers: bool,
            filename: &str,
        ) -> Result<DataFrame, Box<dyn std::error::Error>> {
            let df = match filename.to_lowercase() {
                f if f.ends_with(CSV_SUFFIX) || f.ends_with(TXT_SUFFIX) => {
                    Ok(Self::read_csv(buffer, has_headers)?)
                }
                f if f.ends_with(JSON_SUFFIX) => Ok(Self::read_json(buffer)?),
                _ => Self::read_excel(buffer, has_headers),
            }?;

            return Ok(df);
        }

        pub fn query(&mut self, query: String) -> Result<LazyFrame, PolarsError> {
            return self.sql_ctx.execute(query.as_str());
        }

        pub fn get_dataframe_names(&self) -> Vec<String> {
            self.sql_ctx.get_tables()
        }

        pub fn read_excel(
            buffer: &[u8],
            has_headers: bool,
        ) -> Result<DataFrame, Box<dyn std::error::Error>> {
            let handle = std::io::Cursor::new(buffer);
            let reader = std::io::BufReader::new(handle);
            let mut workbook: Xlsx<_> = calamine::open_workbook_from_rs(reader)?;

            let range = workbook
                .worksheet_range_at(0)
                .ok_or("Could not parse excel to dataframe")??;

            let width = range.width() as u32;
            let start_index = has_headers as u32;
            let height = (range.height() as u32 - start_index) as u32;
            let headers = range.headers();

            let columns = (0..width)
                .map(|i| {
                    let cells = range.range((start_index, i), (height, i)).clone();

                    let col: Vec<AnyValue> = Vec::from_iter(cells.rows().into_iter().map(|d| {
                        let cell_data = d.get(0).unwrap();
                        return match cell_data {
                            Data::Empty => AnyValue::Null,
                            Data::Int(i) => AnyValue::Int64(*i),
                            Data::Bool(b) => AnyValue::Boolean(*b),
                            Data::Error(_e) => AnyValue::Null,
                            Data::Float(f) => AnyValue::Float64(*f),
                            Data::DateTime(d) => AnyValue::Datetime(
                                d.as_datetime().unwrap().and_utc().timestamp_millis(),
                                TimeUnit::Milliseconds,
                                None,
                            ),
                            Data::String(s) | Data::DateTimeIso(s) | Data::DurationIso(s) => {
                                AnyValue::String(s)
                            }
                        };
                    }));

                    let mut header_name = &i.to_string();

                    if has_headers {
                        header_name = headers
                            .as_ref()
                            .and_then(|h| h.get(i as usize))
                            .unwrap_or(header_name)
                    }

                    // TODO cast to most occuring type

                    return Column::new(header_name.into(), col);
                })
                .collect::<Vec<Column>>();

            return Ok(DataFrame::new(columns)?);
        }

        pub async fn read_http_json(url: &str) -> Result<DataFrame, Box<dyn std::error::Error>> {
            let buffer = http_client::fetch_json(url).await?;
            let df = Self::read_buffer(buffer.as_bytes(), false, JSON_SUFFIX)?;

            return Ok(df);
        }
    }

    #[allow(dead_code)]
    fn try_parse_timestamps(df: &mut DataFrame) -> Result<DataFrame, Box<dyn std::error::Error>> {
        let formats = vec![
            "%FT%T%.fZ".to_owned(), // ISO + fractional seconds
            "%FT%TZ".to_owned(),    // ISO no fractional
            "%F %T".to_owned(),     // space separated
            "%F %TZ".to_owned(),    // space separated
            "%F".to_owned(),        // date only
        ];

        let string_cols: Vec<Expr> = df
            .get_columns()
            .iter()
            .filter(|col| matches!(col.dtype(), DataType::String))
            .map(|col| col.name().to_string())
            .map(|name| coalesce(&generate_time_formats(&formats, &name)))
            .collect();

        let test = df.clone().lazy().with_columns(string_cols).collect();

        let df2 = test?;
        let string_cols: Vec<String> = df2
            .get_columns()
            .iter()
            .filter(|col| col.is_not_null().any())
            .map(|c| c.name().to_string())
            .collect();

        return Ok(concat_df_horizontal(
            &[df.drop_many(&string_cols), df2.select(string_cols).unwrap()],
            false,
        )?);
    }

    fn generate_time_formats(formats: &[String], name: &str) -> Vec<Expr> {
        let result = formats
            .iter()
            .map(|fmt| {
                col(name).str().to_datetime(
                    Some(TimeUnit::Milliseconds),
                    None,
                    StrptimeOptions {
                        format: Some(fmt.into()),
                        strict: false,
                        exact: true,
                        cache: true,
                    },
                    lit("raise"),
                )
            })
            .collect::<Vec<Expr>>();

        return result;
    }
}
