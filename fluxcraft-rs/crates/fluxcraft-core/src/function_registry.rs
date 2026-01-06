use std::collections::HashMap;

use polars_core::{
    error::{PolarsResult, polars_ensure},
    prelude::{Column, Field, IntoColumn},
    schema::Schema,
};
use polars_lazy::dsl::{BaseColumnUdf, UserDefinedFunction};
use polars_sql::function_registry::FunctionRegistry;
use polars_time::{Duration, PolarsTruncate};

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

pub fn date_trunc_definition(name: &str) -> UserDefinedFunction {
    UserDefinedFunction::new(
        name.into(),
        BaseColumnUdf::new(
            move |c: &mut [Column]| {
                let date_part = c[0].str()?;
                polars_ensure!(Duration::try_parse(date_part.get(0).unwrap_or("")).is_ok(), InvalidOperation: "expected duration format as 1h, 1h2d");

                c[1].datetime()?
                    .truncate(None, date_part)
                    .map(|x| x.into_column())
            },
            |_: &Schema, fs: &[Field]| {
                polars_ensure!(fs.len() == 2, SchemaMismatch: "expected date_trunc(date part, timestamp)");
                let duration = &fs[0];
                let timestamp = &fs[1];
                polars_ensure!(duration.dtype().is_string(), SchemaMismatch: format!("expected first arg to be a string, got: {}", duration.dtype()));
                polars_ensure!(timestamp.dtype().is_datetime(), SchemaMismatch: format!("expected second arg to be a datetime column, got {}", timestamp.dtype()));

                Ok(timestamp.clone())
            },
        ),
    )
}
