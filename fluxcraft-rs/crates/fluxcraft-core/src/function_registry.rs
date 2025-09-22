use std::collections::HashMap;

use polars_core::error::PolarsResult;
use polars_lazy::dsl::UserDefinedFunction;
use polars_sql::function_registry::FunctionRegistry;

pub struct CustomFunctionRegistry {
    udf_map: HashMap<String, UserDefinedFunction>,
}

impl CustomFunctionRegistry {
    pub fn new() -> Self {
        Self {
            udf_map: HashMap::new(),
        }
    }
}

impl FunctionRegistry for CustomFunctionRegistry {
    fn register(&mut self, name: &str, fun: UserDefinedFunction) -> PolarsResult<()> {
        self.udf_map.insert(name.to_owned(), fun);

        return Ok(());
    }

    fn get_udf(&self, name: &str) -> PolarsResult<Option<UserDefinedFunction>> {
        let udf = self.udf_map.get(name).cloned();
        return Ok(udf);
    }

    fn contains(&self, name: &str) -> bool {
        return self.udf_map.contains_key(name);
    }
}
