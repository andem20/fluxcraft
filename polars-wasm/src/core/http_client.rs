use std::{collections::HashMap, error::Error};

use reqwest::{RequestBuilder, header};

pub async fn fetch_json(
    url: &str,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();

    let mut request_builder: RequestBuilder = client.get(url);

    for (key, value) in headers {
        request_builder = request_builder.header(key, value);
    }

    let response = request_builder.send().await?.text().await?;

    return Ok(response);
}

pub async fn fetch_json_post(
    url: &str,
    payload: String,
    headers: HashMap<String, String>,
) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();

    let mut request_builder = client.post(url);

    for (key, value) in headers {
        request_builder = request_builder.header(key, value);
    }

    let response = request_builder
        .body(payload)
        .header(header::CONTENT_TYPE, "application/json")
        .send()
        .await?
        .text()
        .await?;

    return Ok(response);
}
