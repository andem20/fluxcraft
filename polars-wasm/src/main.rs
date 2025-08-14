use std::str::FromStr;

use chrono::{DateTime, FixedOffset, NaiveDate, NaiveDateTime, NaiveTime, ParseResult};
use polars_core::utils::arrow::legacy::time_zone::Tz;
use polars_wasm::core::fluxcraft::FluxCraft;

fn main() {
    let file = std::fs::read(
        "/home/anders/Documents/projects/fluxcraft/resources/datasets/unnormalized.csv",
    )
    .unwrap();

    let df = FluxCraft::read_file(&file, true, "unnormalized.csv");

    println!("{:?}", df);

    // let date_strs = [
    //     "2025-08-25 10:00:00",
    //     "2025-08-25 10:00",
    //     "2025-08-25 10:00:00.123",
    //     "2025-08-25T10:00:00",
    //     "2025-08-25T10:00:00Z",
    //     "2025-08-25T10:00:00+0200",
    //     "10:00:00",
    //     "10:00:00.1234",
    //     "10:00",
    //     "25/08/2025",
    // ];

    // for date_str in date_strs {
    //     if let Some(datetime) = parse_timestamp_to_datetime(date_str) {
    //         println!("{:?}", datetime);
    //     } else if let Some(time) = parse_timestamp_to_time(date_str) {
    //         println!("{:?}", time);
    //     }
    // }
}

fn parse_timestamp_to_datetime(timestamp: &str) -> Option<NaiveDateTime> {
    let date_formats = ["%Y-%m-%d", "%d/%m/%Y", "%m-%d-%Y", "%b %d, %Y"];

    let mut result = None;

    for fmt in date_formats {
        let date_and_remainder = NaiveDate::parse_and_remainder(timestamp, fmt);

        if let Ok((naive_date, remainder)) = date_and_remainder {
            let time = remainder
                .parse::<NaiveTime>()
                .unwrap_or(NaiveTime::default());

            result = Some(naive_date.and_time(time));
        }
    }

    return result;
}

fn parse_timestamp_to_time(timestamp: &str) -> Option<NaiveTime> {
    return timestamp
        .parse::<NaiveTime>()
        .map_or_else(|_e| None, |x| Some(x));
}
