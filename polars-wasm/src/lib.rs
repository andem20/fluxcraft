pub mod bindgens;

pub mod wrapper {
    use polars_core::utils::Container;
    use polars_io::SerReader;
    use polars_lazy::frame::IntoLazy;
    pub struct DataFrameWrapper {
        pub wrapper: polars_core::prelude::DataFrame,
    }

    impl DataFrameWrapper {
        pub fn get_df(&self) -> &polars_core::prelude::DataFrame {
            return &self.wrapper;
        }

        pub fn get_df_mut(&mut self) -> &mut polars_core::prelude::DataFrame {
            return &mut self.wrapper;
        }

        pub fn query(
            &self,
            query: String,
        ) -> Result<polars_lazy::prelude::LazyFrame, polars_core::error::PolarsError> {
            let mut ctx = polars_sql::SQLContext::new();

            ctx.register("df", self.get_df().clone().lazy());
            return ctx.execute(query.as_str());
        }

        pub fn get_primary_keys(&self) -> Vec<String> {
            self.get_df()
                .column_iter()
                .filter(|c| c.n_unique().unwrap_or(0) == self.get_df().len())
                .map(|c| c.name().to_string())
                .collect()
        }
    }

    pub fn read_csv(buffer: &[u8], has_headers: bool) -> DataFrameWrapper {
        let handle = std::io::Cursor::new(&buffer);
        let df = polars_io::prelude::CsvReadOptions::default()
            .with_has_header(has_headers)
            .map_parse_options(|parse_options| {
                parse_options
                    .with_try_parse_dates(true)
                    .with_missing_is_null(true)
            })
            .into_reader_with_file_handle(handle)
            .finish()
            .unwrap();

        return DataFrameWrapper { wrapper: df };
    }

    pub fn read_json(buffer: &[u8]) -> DataFrameWrapper {
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
                df = polars_core::functions::concat_df_horizontal(&[df, unnested], false).unwrap();
            }

            return df;
        }

        fn add_prefix(col_name: &&polars_core::prelude::PlSmallStr, prefix: &String) -> String {
            let mut new_s = col_name.to_string();
            new_s.insert(0, '.');
            new_s.insert_str(0, prefix);
            return new_s;
        }

        return DataFrameWrapper { wrapper: df };
    }

    pub fn read_file(buffer: &[u8], has_headers: bool, filename: String) -> DataFrameWrapper {
        return if filename.ends_with(".csv") {
            read_csv(buffer, has_headers)
        } else if filename.ends_with(".json") {
            read_json(buffer)
        } else {
            DataFrameWrapper {
                wrapper: polars_core::prelude::DataFrame::empty(),
            }
        };
    }
}
