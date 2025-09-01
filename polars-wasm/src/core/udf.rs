use polars_core::{
    error::PolarsError,
    prelude::{BooleanChunked, Column, IntoColumn},
};
use polars_lazy::dsl::{GetOutput, UserDefinedFunction};

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
