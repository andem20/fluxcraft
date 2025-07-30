use polars_wasm::core::fluxcraft::FluxCraft;

fn main() {
    let file = std::fs::read(
        "/home/anders/Documents/projects/fluxcraft/resources/datasets/non_normalized_data.xlsx",
    )
    .unwrap();

    let _fc = FluxCraft::new();
    let df = FluxCraft::read_excel(&file, false);

    println!("{:?}", df);
}
