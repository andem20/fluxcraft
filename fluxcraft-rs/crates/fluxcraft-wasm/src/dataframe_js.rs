use fluxcraft_core::wrapper::DataFrameWrapper;
use polars_core::{
    prelude::{Column, DataType},
    series::Series,
    utils::Container,
};
use wasm_bindgen::{JsError, prelude::wasm_bindgen};

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

    pub fn get_wrapper(&self) -> &DataFrameWrapper {
        return &self.wrapper;
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

    pub fn get_values_as_string(&self) -> String {
        self.values.join("")
    }

    pub fn get_string_lengths(&self) -> Vec<u16> {
        self.values
            .iter()
            .map(|v| v.chars().count() as u16)
            .collect()
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

    pub fn get_columns_paged(&self, size: usize, page: usize) -> Result<Vec<ColumnJS>, JsError> {
        return self
            .get_df()
            .slice((size * page) as i64, size)
            .iter()
            .map(Self::to_column_js)
            .map(|res| res.map_err(|e| JsError::new(&e.to_string())))
            .collect();
    }

    pub fn get_columns(&self) -> Result<Vec<ColumnJS>, JsError> {
        return self
            .get_df()
            .iter()
            .map(Self::to_column_js)
            .map(|res| res.map_err(|e| JsError::new(&e.to_string())))
            .collect();
    }

    pub fn get_column(&self, name: String) -> Result<ColumnJS, JsError> {
        return self
            .get_df()
            .column(&name)?
            .as_series()
            .map(Self::to_column_js)
            .map(|res| res.map_err(|e| JsError::new(&e.to_string())))
            .unwrap_or_else(|| Err(JsError::new("Failed getting column as series")));
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

    pub fn get_dtype(&self, name: String) -> Result<String, JsError> {
        self.get_df()
            .column(&name)
            .map_err(|err| JsError::new(&err.to_string()))
            .map(Column::dtype)
            .map(DataType::to_string)
    }

    fn to_column_js(s: &Series) -> Result<ColumnJS, Box<dyn std::error::Error>> {
        let values = if s.dtype().is_struct() || s.dtype().is_list() {
            s.rechunk()
                .iter()
                .map(|x| match x.dtype() {
                    DataType::String => x
                        .get_str()
                        .unwrap_or(&DataType::Null.to_string())
                        .to_owned(),
                    _ => x.to_string(),
                })
                .collect::<Vec<String>>()
        } else {
            s.cast(&DataType::String)?
                .str()?
                .rechunk()
                .into_iter()
                .map(|x| x.unwrap_or(&DataType::Null.to_string()).to_string())
                .collect::<Vec<String>>()
        };

        Ok(ColumnJS { values })
    }
}
