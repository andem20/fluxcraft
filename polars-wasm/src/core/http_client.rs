use std::error::Error;

pub async fn fetch_json(url: &str) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();

    let response = client
        .get(url)
        .header("API-KEY", "dummyKey")
        .send()
        .await?
        .text()
        .await?;

    return Ok(response);
}

pub async fn fetch_json_post(url: &str, payload: String) -> Result<String, Box<dyn Error>> {
    let client = reqwest::Client::new();

    let response = client
        .post(url)
        .body(payload)
        .header("content-type", "application/json")
        .send()
        .await?
        .text()
        .await?;

    return Ok(response);
}
