use polars_core::{
    error::PolarsError,
    prelude::{BooleanChunked, Column, DataType, Field, IntoColumn, StringChunked},
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
    if args.len() < 2 {
        return Err(PolarsError::ComputeError(
            "to_struct expects column, ...keys".into(),
        ));
    }

    let s1 = &args[0].str()?;

    let keys: Vec<String> = args[1..]
        .iter()
        .map(|col| {
            col.str()
                .map_err(|_e| PolarsError::ComputeError("expected literal string".into()))?
                .get(0)
                .ok_or_else(|| PolarsError::ComputeError("empty literal".into()))
                .map(|s| s.to_string())
        })
        .collect::<Result<Vec<_>, PolarsError>>()?;

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

    let mut fields: Vec<Column> = Vec::new();
    for key in &keys {
        let col: StringChunked = json_map
            .iter()
            .flatten()
            .map(|row| {
                row.get(key).map(|v| {
                    return v.as_str().map(|x| x.to_string()).unwrap_or(v.to_string());
                })
            })
            .collect();

        fields.push(Column::new(key.into(), col));
    }

    let chunked_struct = polars_core::prelude::StructChunked::from_columns(
        s1.name().clone(),
        fields[0].len(),
        &fields,
    )?;

    println!("{:?}", chunked_struct.dtype());

    let col = chunked_struct.into_column();
    println!("{:?}", col);
    Ok(Some(col))
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
            GetOutput::map_fields(|input_fields| {
                // skip the first argument (the JSON column itself)
                let child_fields: Vec<Field> = input_fields[1..]
                    .iter()
                    .map(|f| Field::new(f.name.clone(), DataType::String))
                    .collect();

                Ok(Field::new("struct".into(), DataType::Struct(child_fields)))
            }),
            to_struct,
        ),
    );
}
