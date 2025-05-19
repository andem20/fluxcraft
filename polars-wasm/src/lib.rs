use polars_core::utils::Container;
use polars_io::SerReader;
use polars_lazy::frame::IntoLazy;
use wasm_bindgen::prelude::*;

pub mod bindgens;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

pub struct DataFrameWrapper {
    wrapper: polars_core::prelude::DataFrame,
}

impl DataFrameWrapper {
    pub fn get_df(&self) -> &polars_core::prelude::DataFrame {
        return &self.wrapper;
    }

    pub fn get_df_mut(&mut self) -> &mut polars_core::prelude::DataFrame {
        return &mut self.wrapper;
    }

    pub fn query(&self, query: String) -> polars_core::prelude::DataFrame {
        let mut ctx = polars_sql::SQLContext::new();

        ctx.register("df", self.get_df().clone().lazy());
        return ctx.execute(query.as_str()).unwrap().collect().unwrap();
    }
}

pub fn create_df_wrapper(buffer: &[u8], has_headers: bool) -> DataFrameWrapper {
    let handle = std::io::Cursor::new(&buffer);
    let mut df = polars_io::prelude::CsvReadOptions::default()
        .with_has_header(has_headers)
        .into_reader_with_file_handle(handle)
        .finish()
        .unwrap();

    //TODO: REMOOOOOOOVE

    let date_column = polars_core::prelude::Column::new(
        "Date".into(),
        (0..df.len())
            .map(|i| {
                chrono::NaiveDateTime::parse_from_str("2023-01-01 12:00:00", "%Y-%m-%d %H:%M:%S")
                    .unwrap()
                    .checked_add_days(chrono::Days::new(i as u64))
                    .unwrap()
            })
            .map(|dt| dt.and_utc().timestamp_millis())
            .collect::<Vec<_>>(),
    )
    .cast(&polars_core::prelude::DataType::Datetime(
        polars_core::prelude::TimeUnit::Milliseconds,
        None,
    ))
    .expect("Could not create column");

    let _ = df.with_column(date_column);

    //TODO: REMOOOOOOOVE END

    return DataFrameWrapper { wrapper: df };
}
