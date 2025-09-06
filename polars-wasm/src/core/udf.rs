use polars_core::{
    error::PolarsError,
    frame::DataFrame,
    prelude::{BooleanChunked, Column, IntoColumn, StringChunked},
};
use polars_lazy::dsl::{GetOutput, UserDefinedFunction};
use serde_json::{Map, Value};

fn ilike(args: &mut [Column]) -> Result<Option<Column>, PolarsError> {
    if args.len() != 2 {
        return Err(PolarsError::ComputeError(
            "ilike expects exactly two arguments".into(),
        ));
    }

    let s1 = args[0].str()?;
    let s2 = args[1].str()?;

    let mask: BooleanChunked = s1
        .into_iter()
        .zip(s2.into_iter())
        .map(|(a, b)| match (a, b) {
            (Some(lhs), Some(rhs)) => lhs.to_lowercase().contains(&rhs.to_lowercase()),
            (None, None) => true,
            _ => false,
        })
        .collect();

    Ok(Some(mask.into_column()))
}

fn to_struct(args: &mut [Column]) -> Result<Option<Column>, PolarsError> {
    if args.len() != 1 {
        return Err(PolarsError::ComputeError(
            "to_struct expects exactly 1 argument".into(),
        ));
    }

    let s1 = &args[0].str()?;

    let json_map: Vec<Option<Map<String, Value>>> = s1
        .into_iter()
        .flat_map(|opt_s| {
            return opt_s.map(|s| {
                serde_json::from_str::<Value>(s)
                    .ok()
                    .and_then(|v| v.as_object().cloned())
            });
        })
        .collect();

    let mut all_keys: Vec<String> = json_map
        .iter()
        .flatten()
        .flat_map(|x| x.keys().cloned())
        .collect();
    all_keys.dedup();

    // TODO make this recursive
    let mut fields: Vec<Column> = Vec::new();
    for key in all_keys {
        let col: StringChunked = json_map
            .iter()
            .flatten()
            .map(|row| {
                row.get(&key).map(|v| {
                    return v.as_str().map(|x| x.to_string()).unwrap_or(v.to_string());
                })
            })
            .collect();

        fields.push(Column::new(key.into(), col));
    }

    let struct_ = DataFrame::new(fields)?.into_struct("test".into());

    Ok(Some(struct_.into_column()))
}

pub fn ilike_udf() -> (String, UserDefinedFunction) {
    let name = "ilike";
    return (
        name.to_string(),
        UserDefinedFunction::new(
            name.into(),
            GetOutput::from_type(polars_core::prelude::DataType::Boolean),
            ilike,
        ),
    );
}

pub fn to_struct_udf() -> (String, UserDefinedFunction) {
    let name = "to_struct";
    return (
        name.to_string(),
        UserDefinedFunction::new(
            name.into(),
            GetOutput::from_type(polars_core::prelude::DataType::Boolean),
            to_struct,
        ),
    );
}
