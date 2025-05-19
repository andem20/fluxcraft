use wasm_bindgen::prelude::wasm_bindgen;

use crate::{DataFrameWrapper, create_df_wrapper};

#[wasm_bindgen]
pub struct DataFrameJS {
    wrapper: DataFrameWrapper,
}

impl DataFrameJS {
    pub fn get_df(&self) -> &polars_core::prelude::DataFrame {
        return &self.wrapper.get_df();
    }
}

#[wasm_bindgen]
pub struct ColumnJS {
    values: Vec<String>,
}

#[wasm_bindgen]
pub struct ColumnHeaderJS {
    name: String,
    dtype: polars_core::prelude::DataType,
}

#[wasm_bindgen]
impl ColumnHeaderJS {
    pub fn get_name(&self) -> String {
        return self.name.clone();
    }

    pub fn get_dtype(&self) -> String {
        return match self.dtype {
            polars_core::prelude::DataType::String => "string",
            polars_core::prelude::DataType::Datetime(_, _) => "datetime",
            _ => "number",
        }
        .to_string();
    }
}

#[wasm_bindgen]
impl ColumnJS {
    pub fn get_values(&self) -> Vec<String> {
        return self.values.clone();
    }
}

#[wasm_bindgen]
impl DataFrameJS {
    pub fn print(&self) -> String {
        return format!("{:?}", &self.get_df());
    }

    pub fn get_headers(&self) -> Vec<ColumnHeaderJS> {
        return self
            .get_df()
            .get_column_names()
            .iter()
            .zip(self.get_df().dtypes())
            .map(|(name, dtype)| ColumnHeaderJS {
                name: name.as_str().to_string(),
                dtype,
            })
            .collect();
    }

    pub fn get_columns_paged(&self, amount: usize, page: usize) -> Vec<ColumnJS> {
        let slice = self
            .get_df()
            .slice(amount as i64 * page as i64, amount * page + amount)
            .iter()
            .map(|s| {
                s.cast(&polars_core::datatypes::DataType::String)
                    .unwrap()
                    .str()
                    .unwrap()
                    .clone()
            })
            .map(|s| {
                s.into_iter()
                    .map(|e| e.unwrap_or("unknown"))
                    .map(|s| s.to_string())
                    .collect::<Vec<String>>()
            })
            .map(|e| ColumnJS { values: e })
            .collect::<Vec<ColumnJS>>();

        return slice;
    }

    pub fn get_columns(&self) -> Vec<ColumnJS> {
        let slice = self
            .get_df()
            .iter()
            .map(|s| {
                s.cast(&polars_core::datatypes::DataType::String)
                    .unwrap()
                    .str()
                    .unwrap()
                    .clone()
            })
            .map(|s| {
                s.into_iter()
                    .map(|e| e.unwrap_or("unknown"))
                    .map(|s| s.to_string())
                    .collect::<Vec<String>>()
            })
            .map(|e| ColumnJS { values: e })
            .collect::<Vec<ColumnJS>>();

        return slice;
    }

    pub fn query(&self, query: String) -> DataFrameJS {
        let filtered = DataFrameWrapper {
            wrapper: self.wrapper.query(query),
        };

        return DataFrameJS { wrapper: filtered };
    }
}

#[wasm_bindgen]
pub fn create_df(buffer: &[u8], has_headers: bool) -> DataFrameJS {
    return DataFrameJS {
        wrapper: create_df_wrapper(buffer, has_headers),
    };
}
