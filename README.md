# FluxCraft

Upload data or connect a datasource.

Transform data into another dataframe.

Create small models and train them.

Visualize the data.

## Next

---

**Week 39-40**

- [ ] Visualize dataframes

---

**Week 37-38**

- [ ] Create Java interface

---

**Week 35-36**

- [ ] Save and load pipelines
- [ ] Improve error handling
- [ ] Export data as file

---

**Week 33-34**

- [ ] Add http client
- [ ] Setup simple data pipeline
- [ ] Handle timestamps

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
