use std::io::Cursor;

use polars_arrow::io::ipc::write::WriteOptions;
use polars_core::{
    frame::DataFrame,
    prelude::{Column, CompatLevel, DataType, PlSmallStr},
    series::Series,
};
use polars_io::SerWriter;

#[derive(Clone, Debug)]
pub struct DataFrameWrapper {
    pub df: DataFrame,
    pub name: String,
}

impl DataFrameWrapper {
    pub fn new(df: DataFrame, name: &str) -> Self {
        Self {
            df,
            name: name.to_string(),
        }
    }

    pub fn get_df(&self) -> &DataFrame {
        return &self.df;
    }

    pub fn get_df_mut(&mut self) -> &mut DataFrame {
        return &mut self.df;
    }

    pub fn get_primary_keys(&self) -> Vec<String> {
        self.get_df()
            .column_iter()
            .filter(|c| c.n_unique().unwrap_or(0) == self.get_df().size())
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

    pub fn to_csv_bytes(&self, separator: char) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        let cols: Vec<Column> = self
            .df
            .iter()
            .map(|s| {
                let series = s
                    .rechunk()
                    .iter()
                    .map(|x| match x.dtype() {
                        DataType::String => x.get_str().unwrap_or("null").to_owned(),
                        _ => x.to_string(),
                    })
                    .collect::<Series>();

                Column::new(s.name().to_owned(), series)
            })
            .collect();

        let mut df = DataFrame::new(cols)?;

        let mut buffer = vec![];

        let writer = Cursor::new(&mut buffer);
        let _ = polars_io::csv::write::CsvWriter::new(writer)
            .include_header(true)
            .with_separator(separator as u8)
            .finish(&mut df);

        Ok(buffer)
    }

    pub fn to_arrow_buffer(&self) -> Vec<u8> {
        let rechunk_to_record_batch = self
            .get_df()
            .clone()
            .rechunk_to_record_batch(CompatLevel::newest());

        let schema = rechunk_to_record_batch.schema();

        let mut buffer = Vec::new();
        let mut cursor = Cursor::new(&mut buffer);
        let mut stream_writer = polars_arrow::io::ipc::write::StreamWriter::new(
            &mut cursor,
            WriteOptions { compression: None },
        );

        let _ = stream_writer.start(schema, None);
        let _ = stream_writer.write(&rechunk_to_record_batch, None);
        let _ = stream_writer.finish();

        return buffer;
    }

    pub fn get_estimated_allocated_size(&self) -> usize {
        self.get_df().estimated_size()
    }
}
