use std::fmt::Display;

pub struct Pipeline {
    pipeline: StepDefinition,
    options: Option<String>,
}

#[derive(serde::Deserialize, Debug)]
struct StepDefinition {
    steps: Vec<Step>,
}

impl Pipeline {
    pub fn new() {}

    pub fn load(file_path: &str) -> Result<Self, std::io::Error> {
        let file_string = std::fs::read_to_string(file_path)?;
        let pipeline = serde_json::from_str::<StepDefinition>(&file_string)?;

        Ok(Pipeline {
            pipeline,
            options: None,
        })
    }

    pub fn execute(&self) {
        for step in self.pipeline.steps.iter() {
            println!("Running step #{}, {}", step.id, step.title);

            for load in step.load.iter() {
                println!(
                    "  Loading resource with name {} from uri: {}, using type {}",
                    load.name, load.uri, load.kind
                )
            }

            println!("  Execute query: {}", step.query);
            println!("");
        }
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
