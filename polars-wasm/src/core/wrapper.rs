use polars_core::{prelude::PlSmallStr, utils::Container};

#[derive(Clone, Debug)]
pub struct DataFrameWrapper {
    pub wrapper: polars_core::prelude::DataFrame,
    pub name: String,
}

impl DataFrameWrapper {
    pub fn new(wrapper: polars_core::prelude::DataFrame, name: &str) -> Self {
        Self {
            wrapper,
            name: name.to_string(),
        }
    }

    pub fn get_df(&self) -> &polars_core::prelude::DataFrame {
        return &self.wrapper;
    }

    pub fn get_df_mut(&mut self) -> &mut polars_core::prelude::DataFrame {
        return &mut self.wrapper;
    }

    pub fn get_primary_keys(&self) -> Vec<String> {
        self.get_df()
            .column_iter()
            .filter(|c| c.n_unique().unwrap_or(0) == self.get_df().len())
            .map(|c| c.name().to_string())
            .collect()
    }

    pub fn rename_columns(
        &mut self,
        old_column_names: Vec<String>,
        new_column_names: Vec<String>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        for (old_name, new_name) in old_column_names.iter().zip(new_column_names) {
            self.get_df_mut().rename(&old_name, new_name.into())?;
        }

        return Ok(());
    }

    pub fn get_column_names(&self) -> Vec<String> {
        return self
            .get_df()
            .get_column_names()
            .into_iter()
            .map(PlSmallStr::to_string)
            .collect();
    }
}
