pub mod wrapper;

pub mod fluxcraft {

    use polars_core::{error::PolarsError, frame::DataFrame};
    use polars_io::SerReader;
    use polars_lazy::frame::IntoLazy;

    use crate::core::wrapper::DataFrameWrapper;

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

        pub fn add(&mut self, mut name: String, df: DataFrame) -> &DataFrameWrapper {
            let mut i = 0;
            name = name.replace(".", "_");
            while let Some(_df) = self.wrappers.get(&name) {
                i += 1;
                name.push_str(&i.to_string());
            }

            self.sql_ctx.register(&name, df.clone().lazy());
            let wrapper: DataFrameWrapper = DataFrameWrapper::new(df, &name);

            self.wrappers.insert(name.clone(), wrapper);

            return self.wrappers.get(&name).unwrap();
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
                // .map_parse_options(|parse_options| {
                //     parse_options
                //         .with_try_parse_dates(true)
                //         .with_missing_is_null(true)
                // })
                .into_reader_with_file_handle(handle)
                .finish();
        }

        fn read_json(buffer: &[u8]) -> Result<DataFrame, PolarsError> {
            let handle = std::io::Cursor::new(&buffer);
            let mut df = polars_io::prelude::JsonReader::new(handle)
                .finish()
                .unwrap();

            df = unnest(df);

            fn unnest(mut df: polars_core::prelude::DataFrame) -> polars_core::prelude::DataFrame {
                let col_names = df
                    .column_iter()
                    .filter(|c| c.dtype().is_struct())
                    .map(|c| c.name().to_string())
                    .collect::<Vec<String>>();

                println!("{:?}", &col_names);

                for name in col_names {
                    let col = df.column(&name).unwrap();

                    let mut unnested = col.struct_().cloned().unwrap().unnest();
                    let new_col_names = unnested
                        .get_column_names()
                        .iter()
                        .map(|col_name| add_prefix(col_name, &name))
                        .collect::<Vec<String>>();

                    let _ = unnested.set_column_names(new_col_names);
                    let _ = unnested.drop_in_place(&name);

                    unnested = unnest(unnested);
                    let _ = df.drop_in_place(&name);
                    df = polars_core::functions::concat_df_horizontal(&[df, unnested], false)
                        .unwrap();
                }

                return df;
            }

            fn add_prefix(col_name: &&polars_core::prelude::PlSmallStr, prefix: &String) -> String {
                let mut new_s = col_name.to_string();
                new_s.insert(0, '.');
                new_s.insert_str(0, prefix);
                return new_s;
            }

            return Ok(df);
        }

        pub fn read_file(
            buffer: &[u8],
            has_headers: bool,
            filename: &str,
        ) -> Result<DataFrame, PolarsError> {
            return match filename.to_lowercase() {
                f if f.ends_with(CSV_SUFFIX) || f.ends_with(TXT_SUFFIX) => {
                    Self::read_csv(buffer, has_headers)
                }
                f if f.ends_with(JSON_SUFFIX) => Self::read_json(buffer),
                _ => Ok(DataFrame::empty()),
            };
        }

        pub fn query(
            &mut self,
            query: String,
        ) -> Result<polars_lazy::prelude::LazyFrame, polars_core::error::PolarsError> {
            return self.sql_ctx.execute(query.as_str());
        }

        pub fn get_dataframe_names(&self) -> Vec<String> {
            self.sql_ctx.get_tables()
        }
    }
}
