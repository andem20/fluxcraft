use polars_core::utils::Container;

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
}
