use polars_wasm::core::fluxcraft::FluxCraft;

#[tokio::main]
async fn main() {
    // let file = std::fs::read(
    //     "/home/anders/Documents/projects/fluxcraft/resources/datasets/non_normalized_customers_small.csv",
    // )
    // .unwrap();

    // let df = FluxCraft::read_buffer(&file, true, "non_normalized_customers_small.csv");

    // println!("{:?}", df);

    let df = FluxCraft::read_http_json("https://dummyjson.com/products").await;

    println!("{:?}", df);
}
