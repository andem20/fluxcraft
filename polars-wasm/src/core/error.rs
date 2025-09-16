use std::fmt::Display;

#[derive(Debug)]
pub struct FluxCraftError {
    msg: String,
}

impl FluxCraftError {
    pub fn new(msg: &str) -> Self {
        Self {
            msg: msg.to_owned(),
        }
    }
}

impl std::error::Error for FluxCraftError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        None
    }

    fn description(&self) -> &str {
        "description() is deprecated; use Display"
    }

    fn cause(&self) -> Option<&dyn std::error::Error> {
        self.source()
    }
}

impl Display for FluxCraftError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        println!("{:?}", self.msg);

        Ok(())
    }
}
