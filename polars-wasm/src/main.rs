use std::collections::HashMap;

use polars_core::df;
use polars_wasm::core::fluxcraft::FluxCraft;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // let file = std::fs::read(
    //     "/home/anders/Documents/projects/fluxcraft/resources/datasets/Pokemon_small.csv",
    // )
    // .unwrap();

    // let df = FluxCraft::read_buffer(&file, true, "non_normalized_customers_small.csv")?;

    let mut df = df!("username" => ["emilys"], "password" => ["emilyspass"])?;

    let result =
        FluxCraft::read_http_json_post("https://dummyjson.com/auth/login", &mut df, HashMap::new())
            .await?;

    println!("{:?}", result);

    return Ok(());
}
