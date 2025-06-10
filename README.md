# FluxCraft

Upload data or connect a datasource.

Transform data into another dataframe.

Create small models and train them.

Visualize the data.

## Next

- [x] detect primary columns
- [ ] Melt dataframe
- [ ] Transform to another frame

## Data I/O

- [x] Upload data (csv, excel ...)
  - [x] Store in memory
  - [ ] Persist as File
- [ ] Connect datasource
  - [ ] Postgres
  - [ ] HTTP/JSON
  - [ ] Kafka
- [ ] Export dataset (HTTP, Kafka, File)
  - [ ] HTTP
  - [ ] Kafka
  - [ ] File
    - [ ] CSV
    - [ ] Excel
    - [ ] JSON

## Data Transformation

- [ ] Rename columns of dataframe
- [ ] Aggregate columns
- [ ] Reshape dataframe (columns to rows -> new set of columns)
- [ ] Clean data
  - [ ] Remove outliers
  - [ ] Fill missing data points
- [ ] Data augmentation
- [ ] Normalization

## ML Modelling

- [ ] Create models by connecting modules
  - [ ] Neural networks
  - [ ] Clustering
- [ ] Train/fit models

## Data Visualizing

- [ ] Graph data (Bar, line, plot ...)
- [x] Tabular
- [ ] Bouding boxes

## Tech stack

### Frontend

React<br>
Rust wasm

### Backend

Rust - actix, polars<br>
Python - Pytorch/Tensorflow
