use polars_wasm::fluxcraft::FluxCraft;

fn main() {
    let file = std::fs::read(
        "/home/anders/Documents/projects/fluxcraft/resources/datasets/non_normalized_customers_small.csv",
    )
    .unwrap();

    let mut fluxcraft = FluxCraft::new();

    let df = FluxCraft::read_file(&file, true, "test.csv");
    let added_df = fluxcraft.add("test".to_string(), df);

    println!("{:?}", added_df.get_df());
}
