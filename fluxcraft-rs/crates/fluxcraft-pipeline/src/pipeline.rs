use std::{collections::HashMap, fmt::Display};

use fluxcraft_core::{FluxCraft, error::FluxCraftError, wrapper::DataFrameWrapper};
use polars_core::frame::DataFrame;

//FIMXE
const BASE_PATH: &str = "/home/anders/Documents/projects/fluxcraft/resources/datasets";

#[allow(dead_code)]
pub struct Pipeline {
    pipeline: StepDefinition,
    fluxcraft: FluxCraft,
    output_type_name: String,
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
            output_type_name: "TestType".to_owned(), // FIXME SHOULD COME FROM FILE
            options: None,
        })
    }

    pub async fn execute(&mut self) -> Result<DataFrameWrapper, Box<dyn std::error::Error>> {
        let mut result = None;
        let mut final_df_name = "output";

        for step in self.pipeline.steps.iter() {
            println!("Running step #{}, {}", step.id, step.title);

            for load in step.load.iter() {
                let df = self.handle_load(load).await?;

                let _ = self.fluxcraft.add(load.name.to_owned(), df);
            }

            println!("  Execute query: {}", step.query);
            let df = self.fluxcraft.query(step.query.to_owned())?.collect()?;
            println!("{}", df.head(Some(1)));
            println!("");

            result = Some(df);
            final_df_name = &step.title;
        }

        if let Some(df) = result {
            let wrapper = DataFrameWrapper::new(df, final_df_name);
            return Ok(wrapper);
        }

        Err(FluxCraftError::new("No final df defined").into())
    }

    async fn handle_load(&self, load: &Load) -> Result<DataFrame, Box<dyn std::error::Error>> {
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
            LoadKind::HTTP => {
                if let Some(method) = load.options.get("method") {
                    match method.as_str() {
                        "GET" => {
                            fluxcraft_io::read_http_json(
                                &load.uri,
                                load.headers.clone().unwrap_or(HashMap::new()),
                            )
                            .await?
                        }
                        _ => {
                            let mut payload_df = load
                                .options
                                .get("payload_name")
                                .map(|name| self.fluxcraft.get(name))
                                .flatten()
                                .map(|df| df.get_df().clone())
                                .unwrap_or(DataFrame::empty());

                            fluxcraft_io::read_http_json_post(
                                &load.uri,
                                &mut payload_df,
                                load.headers.clone().unwrap_or(HashMap::new()),
                            )
                            .await?
                        }
                    }
                } else {
                    return Err(FluxCraftError::new("Method must be specified").into());
                }
            }
        };

        Ok(df)
    }

    pub fn get_output_type(&self) -> String {
        "test".to_owned()
    }
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
    headers: Option<HashMap<String, String>>,
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
