use polars_core::df;
use polars_wasm::core::fluxcraft::FluxCraft;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // let file = std::fs::read(
    //     "/home/anders/Documents/projects/fluxcraft/resources/datasets/Pokemon_small.csv",
    // )
    // .unwrap();

    // let df = FluxCraft::read_buffer(&file, true, "non_normalized_customers_small.csv")?;

    let df = df!("username" => ["andy"], "password" => ["struggles"])?;

    let result = FluxCraft::fetch_json("https://dummyjson.com/auth/login", df).await?;

    println!("{:?}", result);

    return Ok(());
}
