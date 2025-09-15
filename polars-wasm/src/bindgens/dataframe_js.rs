use std::{collections::HashMap, sync::Arc};

use polars_core::{prelude::DataType, schema::SchemaNamesAndDtypes};
use polars_schema::Schema;
use wasm_bindgen::{JsError, prelude::wasm_bindgen};
use wasm_bindgen_futures::js_sys;

use crate::{
    bindgens::{log, log_error},
    core::{fluxcraft::FluxCraft, wrapper::DataFrameWrapper},
};

#[wasm_bindgen]
pub struct JsFluxCraft {
    fluxcraft: FluxCraft,
}

#[wasm_bindgen]
impl JsFluxCraft {
    #[wasm_bindgen(constructor)]
    pub fn new() -> JsFluxCraft {
        return JsFluxCraft {
            fluxcraft: FluxCraft::new(),
        };
    }

    pub fn get(&self, name: &str) -> Result<JsDataFrame, JsError> {
        if let Some(wrapper) = self.fluxcraft.get(name) {
            return Ok(JsDataFrame { wrapper });
        } else {
            log("Could not find dataframe");
            Err(JsError::new("Could not find dataframe"))
        }
    }

    pub fn add(
        &mut self,
        buffer: &[u8],
        has_headers: bool,
        filename: String,
    ) -> Result<JsDataFrame, JsError> {
        let result = FluxCraft::read_buffer(buffer, has_headers, &filename)
            .map(|df| self.fluxcraft.add(filename, df))
            .map(|wrapper| JsDataFrame { wrapper })
            .map_err(|e| JsError::new(&e.to_string()));

        return result;
    }

    pub async fn add_from_http_json(
        &mut self,
        url: String,
        headers: js_sys::Map,
        name: String,
    ) -> Result<JsDataFrame, JsError> {
        let headers_map = get_headers(headers);

        let result = FluxCraft::read_http_json(&url, headers_map)
            .await
            .map(|df| self.fluxcraft.add(name, df))
            .map(|wrapper| JsDataFrame { wrapper })
            .map_err(|e| JsError::new(&e.to_string()));

        return result;
    }

    pub async fn add_from_http_json_post(
        &mut self,
        url: String,
        headers: js_sys::Map,
        name: String,
        mut payload: JsDataFrame,
    ) -> Result<JsDataFrame, JsError> {
        let headers_map = get_headers(headers);

        let payload_df = payload.wrapper.get_df_mut();

        let result = FluxCraft::read_http_json_post(&url, payload_df, headers_map)
            .await
            .map(|df| self.fluxcraft.add(name, df))
            .map(|wrapper| JsDataFrame { wrapper })
            .map_err(|e| JsError::new(&e.to_string()));

        return result;
    }

    pub fn query(&mut self, query: String) -> Result<JsDataFrame, JsError> {
        let filtered_df = self
            .fluxcraft
            .query(query)
            .map_err(|e| JsError::new(&e.to_string()))?;

        let collected = filtered_df
            .collect()
            .map_err(|e| JsError::new(&e.to_string()))?;

        let filtered_wrapper = DataFrameWrapper::new(collected, "query_dataframe");

        Ok(JsDataFrame {
            wrapper: filtered_wrapper,
        })
    }
    pub fn get_dataframe_names(&self) -> Vec<String> {
        self.fluxcraft.get_dataframe_names()
    }

    pub fn get_schema(&mut self, name: String) -> Result<Vec<ColumnHeaderJS>, JsError> {
        return self
            .fluxcraft
            .get_schema(&name)
            .map(to_column_header)
            .map_err(|e| JsError::new(&e.to_string()));
    }
}

fn to_column_header(schema: Arc<Schema<polars_core::datatypes::DataType>>) -> Vec<ColumnHeaderJS> {
    schema
        .iter_names_and_dtypes()
        .map(|(name, dtype)| ColumnHeaderJS {
            name: name.to_owned().to_string(),
            dtype: dtype.to_owned(),
            is_primary_key: false,
        })
        .collect()
}

fn get_headers(headers: js_sys::Map) -> HashMap<String, String> {
    let mut headers_map = HashMap::<String, String>::new();

    for entry in headers.entries() {
        let pair: js_sys::Array = entry.unwrap().into();
        let key = pair.get(0).as_string();
        let value = pair.get(0).as_string();

        if let (Some(k), Some(v)) = (key, value) {
            headers_map.insert(k, v);
        }
    }

    return headers_map;
}

#[wasm_bindgen]
pub struct JsDataFrame {
    wrapper: DataFrameWrapper,
}

impl JsDataFrame {
    fn get_df(&self) -> &polars_core::prelude::DataFrame {
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
    is_primary_key: bool,
}

#[wasm_bindgen]
impl ColumnHeaderJS {
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
    pub fn get_values(&self) -> Vec<String> {
        return self.values.clone();
    }
}

#[wasm_bindgen]
impl JsDataFrame {
    pub fn print(&self) -> String {
        return format!("{:?}", &self.get_df());
    }

    pub fn get_headers(&self) -> Vec<ColumnHeaderJS> {
        let primary_keys = self.wrapper.get_primary_keys();
        return self
            .get_df()
            .get_column_names()
            .iter()
            .zip(self.get_df().dtypes())
            .map(|(name, dtype)| ColumnHeaderJS {
                name: name.to_string(),
                dtype,
                is_primary_key: primary_keys.contains(&name.to_string()),
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
}
