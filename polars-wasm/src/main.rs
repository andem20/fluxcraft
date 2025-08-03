use polars_wasm::core::fluxcraft::FluxCraft;

fn main() {
    let file =
        std::fs::read("/home/anders/Documents/projects/fluxcraft/resources/datasets/dtypes.xlsx")
            .unwrap();

    let _fc = FluxCraft::new();
    let df = FluxCraft::read_excel(&file, true);

    println!("{:?}", df);
}
