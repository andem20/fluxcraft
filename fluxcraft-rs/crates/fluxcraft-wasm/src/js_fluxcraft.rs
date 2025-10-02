use std::{collections::HashMap, sync::Arc};

use fluxcraft_core::{FluxCraft, wrapper::DataFrameWrapper};
use polars_core::schema::SchemaNamesAndDtypes;
use polars_schema::Schema;
use wasm_bindgen::{JsError, prelude::wasm_bindgen};
use wasm_bindgen_futures::js_sys;

use crate::{
    dataframe_js::{ColumnHeaderJS, JsDataFrame},
    log,
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
            return Ok(JsDataFrame::new(wrapper));
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
            .map(|wrapper| JsDataFrame::new(wrapper))
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

        let result = fluxcraft_io::read_http_json(&url, headers_map)
            .await
            .map(|df| self.fluxcraft.add(name, df))
            .map(|wrapper| JsDataFrame::new(wrapper))
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

        let payload_df = payload.get_df_mut();

        let result = fluxcraft_io::read_http_json_post(&url, payload_df, headers_map)
            .await
            .map(|df| self.fluxcraft.add(name, df))
            .map(|wrapper| JsDataFrame::new(wrapper))
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

        Ok(JsDataFrame::new(filtered_wrapper))
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

    pub fn export_csv(&self, mut input_df: JsDataFrame) -> Result<String, JsError> {
        let mut df = input_df.get_df_mut();
        let result = FluxCraft::export_csv(&mut df).map_err(|e| JsError::new(&e.to_string()))?;
        let result_string = String::from_utf8(result).map_err(|e| JsError::new(&e.to_string()))?;
        return Ok(result_string);
    }
}

fn to_column_header(schema: Arc<Schema<polars_core::datatypes::DataType>>) -> Vec<ColumnHeaderJS> {
    schema
        .iter_names_and_dtypes()
        .map(|(name, dtype)| ColumnHeaderJS::new(name.to_string(), dtype.to_string(), false))
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
