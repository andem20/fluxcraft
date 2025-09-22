# FluxCraft

Upload data or connect a datasource.

Transform data into another dataframe.

Create small models and train them.

Visualize the data.

## Next

---

**Week 41-42**

- [ ] Improve excel datatype inference
- [ ] Visualize dataframes
- [ ] Create tests
- [ ] Replay data pipeline

---

**Week 39-40**

- [ ] Hide header values / use placeholders
- [ ] Create Java interface
- [x] Refactor into multiple crates

---

**Week 37-38**

- [x] Export data as file
- [x] Save and load pipelines

---

**Week 35-36**

- [x] Improve error handling
- [x] Use dataframe in http requests
- [x] Setup simple data pipeline
- [x] Show errors in ui

---

**Week 33-34**

- [x] Add http client
- [x] Handle timestamps

---

**Week 31-32**

- [x] Read excel
- [x] Change / add column names

---

- [x] detect primary columns
- [x] Handle multiple files
- [x] Create functions for getting df names

---

## Data I/O

- [x] Upload data (csv, excel ...)
  - [x] Store in memory
    - [x] CSV
    - [x] Excel
    - [x] JSON
  - [ ] Persist as File
  - [x] Handle multiple dataframes
- [ ] Connect datasource
  - [ ] Postgres
  - [x] HTTP/JSON
  - [ ] Kafka
- [ ] Export dataset (HTTP, Kafka, File)
  - [ ] HTTP
  - [ ] Kafka
  - [ ] File
    - [ ] CSV
    - [ ] Excel
    - [ ] JSON

## Data Transformation

- [x] Rename columns of dataframe
- [x] Aggregate columns (handled as sql)
- [ ] Reshape dataframe (columns to rows -> new set of columns)
- [ ] Clean data
  - [ ] Remove outliers
  - [ ] Fill missing data points
- [ ] Data augmentation
- [x] Normalization (handled as sql)

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
