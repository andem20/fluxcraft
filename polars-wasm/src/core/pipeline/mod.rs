use std::{collections::HashMap, fmt::Display};

use crate::core::fluxcraft::FluxCraft;

const BASE_PATH: &str = "/home/anders/Documents/projects/fluxcraft/resources/datasets";

pub struct Pipeline {
    pipeline: StepDefinition,
    fluxcraft: FluxCraft,
    options: Option<PipelineOptions>,
}

pub struct PipelineOptions();

#[derive(serde::Deserialize, Debug)]
struct StepDefinition {
    steps: Vec<Step>,
}

impl Pipeline {
    pub fn new() {}

    pub fn load(file_path: &str) -> Result<Self, std::io::Error> {
        let file_string = std::fs::read_to_string(file_path)?;
        let pipeline = serde_json::from_str::<StepDefinition>(&file_string)?;

        let fluxcraft = FluxCraft::new();

        Ok(Pipeline {
            pipeline,
            fluxcraft,
            options: None,
        })
    }

    pub async fn execute(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        for step in self.pipeline.steps.iter() {
            println!("Running step #{}, {}", step.id, step.title);

            for load in step.load.iter() {
                let df = handle_load(load).await?;

                let _ = self.fluxcraft.add(load.name.to_owned(), df);
            }

            println!("  Execute query: {}", step.query);
            let df = self.fluxcraft.query(step.query.to_owned())?.collect()?;
            println!("{}", df.head(Some(1)));
            println!("");
        }

        Ok(())
    }
}

async fn handle_load(
    load: &Load,
) -> Result<polars_core::prelude::DataFrame, Box<dyn std::error::Error>> {
    println!(
        "  Loading resource with name {} from uri: {}, using type {}",
        load.name, load.uri, load.kind
    );

    let df = match load.kind {
        LoadKind::FILE => {
            let buffer = std::fs::read(format!("{}/{}", BASE_PATH, load.uri))?;
            let has_headers = load
                .options
                .get("has_headers")
                .map(|v| v.to_lowercase() == "true")
                .unwrap_or(true);

            FluxCraft::read_buffer(&buffer, has_headers, &load.name)?
        }
        LoadKind::HTTP => FluxCraft::read_http_json(&load.uri, load.options.clone()).await?,
    };

    Ok(df)
}

#[derive(serde::Deserialize, Debug)]
struct Step {
    id: usize,
    title: String,
    load: Vec<Load>,
    query: String,
}

#[derive(serde::Deserialize, Debug)]
struct Load {
    #[serde(rename = "type")]
    kind: LoadKind,
    uri: String,
    name: String,
    options: HashMap<String, String>,
}

#[derive(serde::Deserialize, Debug)]
enum LoadKind {
    HTTP,
    FILE,
}

impl Display for LoadKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}
