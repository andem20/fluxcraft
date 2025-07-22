use std::time::Instant;

use polars_io::SerReader;
use polars_wasm::fluxcraft::FluxCraft;

fn main() {
    let start = Instant::now();
    let file = std::fs::read(
        "/home/anders/Documents/projects/fluxcraft/resources/datasets/kaggle/train.csv",
    )
    .unwrap();

    let mut fc = FluxCraft::new();

    let handle = std::io::Cursor::new(&file);

    let df = polars_io::prelude::CsvReadOptions::default()
        .with_has_header(true)
        // .map_parse_options(|parse_options| {
        //     parse_options
        //         .with_try_parse_dates(true)
        //         .with_missing_is_null(true)
        // })
        .into_reader_with_file_handle(handle)
        .finish()
        .unwrap();

    let df2 = fc.add("test".to_string(), df);
    let primary_keys = df2.get_primary_keys();
    println!("{:?}", primary_keys);

    println!("{}", start.elapsed().as_millis())
}
