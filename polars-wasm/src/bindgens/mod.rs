use wasm_bindgen::prelude::wasm_bindgen;

pub mod dataframe_js;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
