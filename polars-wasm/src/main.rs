use polars_wasm::core::fluxcraft::FluxCraft;

#[tokio::main]
async fn main() {
    let df = FluxCraft::read_http_json("https://dummyjson.com/products")
        .await
        .unwrap();

    println!("{:?}", df);
}
