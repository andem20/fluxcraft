mod function_registry;
mod http_client;
mod udf;
pub mod wrapper;

pub mod fluxcraft {

    use std::{collections::HashMap, sync::Arc};

    use calamine::{Data, Reader, Xlsx};
    use polars_core::{
        error::{ErrString, PolarsError},
        frame::DataFrame,
        functions::concat_df_horizontal,
        prelude::{AnyValue, Column, DataType, TimeUnit},
    };
    use polars_io::{SerReader, SerWriter};
    use polars_lazy::{
        dsl::{Expr, StrptimeOptions, coalesce, col, lit},
        frame::{IntoLazy, LazyFrame},
    };
    use polars_schema::Schema;
    use polars_sql::function_registry::FunctionRegistry;

    use crate::core::{
        function_registry::CustomFunctionRegistry, http_client, udf::ilike_udf,
        wrapper::DataFrameWrapper,
    };

    const CSV_SUFFIX: &str = ".csv";
    const TXT_SUFFIX: &str = ".txt";
    const JSON_SUFFIX: &str = ".json";

    pub struct FluxCraft {
        pub sql_ctx: polars_sql::SQLContext,
    }

    impl FluxCraft {
        pub fn new() -> Self {
            let sql_ctx = polars_sql::SQLContext::new();

            let mut function_registry = CustomFunctionRegistry::new();

            let (udf_name, udf) = ilike_udf();
            let _ = function_registry.register(&udf_name, udf);

            let sql_ctx = sql_ctx.with_function_registry(Arc::new(function_registry));

            Self { sql_ctx }
        }

        pub fn add(&mut self, name: String, df: DataFrame) -> DataFrameWrapper {
            let name = self.generate_name(name);

            self.sql_ctx.register(&name, df.clone().lazy());
            return DataFrameWrapper::new(df, &name);
        }

        fn generate_name(&mut self, name: String) -> String {
            let mut i = 0;
            let mut new_name = name.replace(".", "_");
            while let Some(_df) = self.sql_ctx.get_table_map().get(&new_name) {
                i += 1;
                new_name.push_str(&i.to_string());
            }

            return new_name;
        }

        pub fn remove(&mut self, name: String) {
            self.sql_ctx.unregister(&name);
        }

        pub fn get(&self, name: &str) -> Option<DataFrameWrapper> {
            return self
                .sql_ctx
                .get_table_map()
                .get(name)
                .map(|df| df.clone().collect().unwrap())
                .map(|df| DataFrameWrapper {
                    wrapper: df,
                    name: name.to_string(),
                });
        }

        pub fn get_schema(
            &mut self,
            name: &str,
        ) -> Result<Arc<Schema<polars_core::datatypes::DataType>>, PolarsError> {
            let df = self
                .sql_ctx
                .get_table_map()
                .get_mut(name)
                .map(|x| x.collect_schema())
                .unwrap_or(Err(PolarsError::AssertionError(ErrString::new_static(
                    "Could not find dataframe",
                ))));

            return df;
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

        pub async fn read_http_json(
            url: &str,
            headers: HashMap<String, String>,
        ) -> Result<DataFrame, Box<dyn std::error::Error>> {
            let buffer = http_client::fetch_json(url, headers).await?;
            let df = Self::read_buffer(buffer.as_bytes(), false, JSON_SUFFIX)?;

            return Ok(df);
        }

        pub async fn read_http_json_post(
            url: &str,
            mut payload_df: &mut DataFrame,
            headers: HashMap<String, String>,
        ) -> Result<DataFrame, Box<dyn std::error::Error>> {
            let mut buffer = vec![];
            polars_io::json::JsonWriter::new(&mut buffer)
                .with_json_format(polars_io::json::JsonFormat::Json)
                .finish(&mut payload_df)?;

            // FIXME
            let payload = String::from_utf8(buffer[1..buffer.len() - 1].to_vec())?;
            let buffer = http_client::fetch_json_post(url, payload, headers).await?;
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
