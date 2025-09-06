use polars_wasm::core::fluxcraft::FluxCraft;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let file =
        std::fs::read("/home/anders/Documents/projects/fluxcraft/resources/datasets/structs.csv")
            .unwrap();

    let df = FluxCraft::read_buffer(&file, true, "structs.csv")?;

    let mut fl = FluxCraft::new();
    fl.add("test".to_owned(), df);

    let result = fl
        .query("select to_struct(properties) from test".to_owned())?
        .collect();

    println!("{:?}", result);

    return Ok(());
}
