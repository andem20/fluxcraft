use polars_wasm::core::fluxcraft::FluxCraft;

fn main() {
    let file = std::fs::read(
        "/home/anders/Documents/projects/fluxcraft/resources/datasets/unnormalized.csv",
    )
    .unwrap();

    let df = FluxCraft::read_file(&file, false, "unnormalized.csv");

    println!("{:?}", df);
}
