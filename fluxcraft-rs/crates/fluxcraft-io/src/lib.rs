use std::collections::HashMap;

use fluxcraft_core::{FluxCraft, constants};
use polars_core::frame::DataFrame;
use polars_io::SerWriter;

pub mod http_client;

pub async fn read_http_json(
    url: &str,
    headers: HashMap<String, String>,
) -> Result<DataFrame, Box<dyn std::error::Error>> {
    let buffer = http_client::fetch_json(url, headers).await?;
    let df = FluxCraft::read_buffer(buffer.as_bytes(), false, constants::JSON_SUFFIX)?;

    return Ok(df);
}

pub async fn read_http_json_post(
    url: &str,
    mut payload_df: &mut DataFrame,
    headers: HashMap<String, String>,
) -> Result<DataFrame, Box<dyn std::error::Error>> {
    let mut buffer = vec![];
    polars_io::json::JsonWriter::new(&mut buffer)
        .with_json_format(polars_io::json::JsonFormat::Json)
        .finish(&mut payload_df)?;

    // FIXME
    let payload = String::from_utf8(buffer[1..buffer.len() - 1].to_vec())?;
    let buffer = http_client::fetch_json_post(url, payload, headers).await?;
    let df = FluxCraft::read_buffer(buffer.as_bytes(), false, constants::JSON_SUFFIX)?;

    return Ok(df);
}
