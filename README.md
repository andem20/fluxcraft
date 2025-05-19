# FluxCraft

Upload data or connect a datasource.

Transform data into another dataframe.

Create small models and train them.

Visualize the data. 

## Data I/O
- [ ] Upload data (csv, excel ...)
  - [ ] Store in memory
  - [ ] Persist as File
- [ ] Connect datasource
  - [ ] Postgres
  - [ ] HTTP
  - [ ] Kafka
- [ ] Export dataset (HTTP, Kafka, File)
  - [ ] HTTP
  - [ ] Kafka
  - [ ] File

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
- [ ] Tabular
- [ ] Bouding boxes


## Tech stack
### Frontend
React<br>
Rust wasm

### Backend
Rust - actix, polars<br>
Python - Pytorch/Tensorflow