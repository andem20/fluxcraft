use polars_wasm::core::fluxcraft::FluxCraft;

#[tokio::main]
async fn main() {
    let df = FluxCraft::read_http_json("https://dummyjson.com/todos")
        .await
        .unwrap();

    println!("{:?}", df);
}
