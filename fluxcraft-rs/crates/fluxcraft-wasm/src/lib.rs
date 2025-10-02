use wasm_bindgen::prelude::wasm_bindgen;

pub mod dataframe_js;
pub mod js_fluxcraft;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

pub fn log_error(e: &Box<dyn std::error::Error>) {
    log(format!("{}", e).as_str());
}
