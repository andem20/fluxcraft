use polars_wasm::core::{fluxcraft::FluxCraft, pipeline::Pipeline};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // let file =
    //     std::fs::read("/home/anders/Documents/projects/fluxcraft/resources/datasets/structs.csv")
    //         .unwrap();

    // let df = FluxCraft::read_buffer(&file, true, "structs.csv")?;

    // let mut fl = FluxCraft::new();
    // fl.add("test".to_owned(), df);

    // let result = fl
    //     .query(
    //         // "select p.* from (select to_struct(properties, hello) as p from (select properties, 'hello' as hello from test) _a) _b".to_owned(),
    //         "select json_value(properties, '$.hello') as p from test".to_owned(),
    //     )?
    //     .collect();

    // println!("{:?}", result);

    let mut pipeline = Pipeline::load(
        "/home/anders/Documents/projects/fluxcraft/resources/example_pipeline.json",
    )?;

    let _ = pipeline.execute().await;

    return Ok(());
}
