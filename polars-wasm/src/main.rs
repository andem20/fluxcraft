use polars_wasm::core::fluxcraft::FluxCraft;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let file = std::fs::read(
        "/home/anders/Documents/projects/fluxcraft/resources/datasets/Pokemon_small.csv",
    )
    .unwrap();

    let df = FluxCraft::read_buffer(&file, true, "non_normalized_customers_small.csv")?;

    let mut fc = FluxCraft::new();
    fc.add("df".to_owned(), df);

    let query = "
        SELECT testfn(Name, Type_1) FROM df
    ";

    let result = fc.query(query.to_owned())?.collect()?;

    println!("{:?}", result);

    return Ok(());
}
