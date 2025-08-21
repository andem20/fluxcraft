use polars_wasm::core::fluxcraft::FluxCraft;

#[tokio::main]
async fn main() {
    let file = std::fs::read(
        "/home/anders/Documents/projects/fluxcraft/resources/datasets/non_normalized_customers_small.csv",
    )
    .unwrap();

    let df = FluxCraft::read_buffer(&file, true, "non_normalized_customers_small.csv");

    let slice: Vec<ColumnJS> = df
        .unwrap()
        .iter()
        .map(|s| {
            let values = s
                .rechunk()
                .iter()
                .map(|x| x.to_string())
                .collect::<Vec<String>>();
            ColumnJS { values }
        })
        .collect();

    println!("{:?}", slice);

    // let df = FluxCraft::read_http_json("https://dummyjson.com/products").await;

    // println!("{:?}", df);
}

#[derive(Debug)]
pub struct ColumnJS {
    values: Vec<String>,
}
