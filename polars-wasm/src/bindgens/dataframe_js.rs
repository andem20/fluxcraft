use polars_core::frame::DataFrame;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::{
    bindgens::{log, log_error},
    core::{fluxcraft::FluxCraft, wrapper::DataFrameWrapper},
};

#[wasm_bindgen]
pub struct FluxCraftJS {
    fluxcraft: FluxCraft,
}

#[wasm_bindgen]
impl FluxCraftJS {
    #[wasm_bindgen(constructor)]
    pub fn new() -> FluxCraftJS {
        return FluxCraftJS {
            fluxcraft: FluxCraft::new(),
        };
    }

    pub fn get(&self, name: &str) -> DataFrameJS {
        if let Some(df) = self.fluxcraft.get(name) {
            return DataFrameJS {
                wrapper: df.clone(),
            };
        } else {
            log("Could not find dataframe");

            panic!("Could not find dataframe");
        }
    }

    pub fn add(&mut self, buffer: &[u8], has_headers: bool, filename: String) -> DataFrameJS {
        let wrapper = match FluxCraft::read_buffer(buffer, has_headers, &filename) {
            Ok(df) => self.fluxcraft.add(filename, df),
            Err(err) => {
                log_error(&err);
                &DataFrameWrapper::new(DataFrame::empty(), "")
            }
        };

        return DataFrameJS {
            wrapper: wrapper.clone(),
        };
    }

    pub async fn add_from_http_json(&mut self, url: String, name: String) -> DataFrameJS {
        let wrapper = match FluxCraft::read_http_json(&url).await {
            Ok(df) => self.fluxcraft.add(name, df),
            Err(err) => {
                log_error(&err);
                &DataFrameWrapper::new(DataFrame::empty(), "")
            }
        };

        return DataFrameJS {
            wrapper: wrapper.clone(),
        };
    }

    pub fn query(&mut self, query: String) -> DataFrameJS {
        let filtered_df = self.fluxcraft.query(query);

        let wrapper = match filtered_df {
            Ok(df) => df.collect().unwrap(),
            Err(e) => {
                log(&e.to_string());
                polars_core::prelude::DataFrame::empty()
            }
        };

        let filtered_wrapper = DataFrameWrapper::new(wrapper, "query_dataframe");

        return DataFrameJS {
            wrapper: filtered_wrapper,
        };
    }

    pub fn get_dataframe_names(&self) -> Vec<String> {
        self.fluxcraft.get_dataframe_names()
    }
}

#[wasm_bindgen]
pub struct DataFrameJS {
    wrapper: DataFrameWrapper,
}

impl DataFrameJS {
    pub fn empty() -> Self {
        DataFrameJS {
            wrapper: DataFrameWrapper::new(DataFrame::empty(), ""),
        }
    }

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
impl DataFrameJS {
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
