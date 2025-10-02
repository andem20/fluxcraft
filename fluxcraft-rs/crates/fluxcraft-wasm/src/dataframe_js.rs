use fluxcraft_core::wrapper::DataFrameWrapper;
use polars_core::{prelude::DataType, utils::Container};
use wasm_bindgen::prelude::wasm_bindgen;

use crate::log_error;

#[wasm_bindgen]
pub struct JsDataFrame {
    wrapper: DataFrameWrapper,
}

impl JsDataFrame {
    pub fn new(wrapper: DataFrameWrapper) -> Self {
        Self { wrapper }
    }

    fn get_df(&self) -> &polars_core::prelude::DataFrame {
        return &self.wrapper.get_df();
    }

    pub fn get_df_mut(&mut self) -> &mut polars_core::prelude::DataFrame {
        return self.wrapper.get_df_mut();
    }
}

#[wasm_bindgen]
pub struct ColumnJS {
    values: Vec<String>,
}

#[wasm_bindgen]
pub struct ColumnHeaderJS {
    name: String,
    dtype: String,
    is_primary_key: bool,
}

#[wasm_bindgen]
impl ColumnHeaderJS {
    pub fn new(name: String, dtype: String, is_primary_key: bool) -> Self {
        Self {
            name,
            dtype,
            is_primary_key,
        }
    }

    pub fn get_name(&self) -> String {
        return self.name.clone();
    }

    pub fn get_dtype(&self) -> String {
        return self.dtype.to_string();
    }

    pub fn is_primary_key(&self) -> bool {
        self.is_primary_key
    }
}

#[wasm_bindgen]
impl ColumnJS {
    pub fn get_values(self) -> Vec<String> {
        return self.values;
    }

    pub fn get_values_as_blob(&self, sep: &str) -> String {
        self.values.join(sep)
    }
}

#[wasm_bindgen]
impl JsDataFrame {
    pub fn print(&self) -> String {
        return format!("{:?}", &self.get_df());
    }

    pub fn get_headers(&self) -> Vec<ColumnHeaderJS> {
        // let primary_keys = self.wrapper.get_primary_keys();
        let primary_keys = vec![];
        return self
            .get_df()
            .get_column_names()
            .iter()
            .zip(self.get_df().dtypes())
            .map(|(name, dtype)| {
                ColumnHeaderJS::new(
                    name.to_string(),
                    dtype.to_string(),
                    primary_keys.contains(&name.to_string()),
                )
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
                let values = s
                    .rechunk()
                    .iter()
                    .map(|x| match x.dtype() {
                        DataType::String => x.get_str().unwrap_or("null").to_owned(),
                        _ => x.to_string(),
                    })
                    .collect::<Vec<String>>();
                ColumnJS { values }
            })
            .collect();

        return slice;
    }

    pub fn get_name(&self) -> String {
        self.wrapper.name.clone()
    }

    pub fn rename_columns(&mut self, old_column_names: Vec<String>, new_column_names: Vec<String>) {
        let _ = self
            .wrapper
            .rename_columns(old_column_names, new_column_names)
            .inspect_err(|e| log_error(e));
    }

    pub fn size(&self) -> usize {
        self.get_df().len()
    }
}
