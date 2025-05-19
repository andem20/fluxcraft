use polars_lazy::frame::IntoLazy;
use polars_wasm::create_df_wrapper;

fn main() {
    let file =
        std::fs::read("/home/anders/Documents/projects/fluxcraft/resources/datasets/Pokemon.csv")
            .unwrap();

    let df = create_df_wrapper(&file, true);

    let mut ctx = polars_sql::SQLContext::new();

    ctx.register("df", df.get_df().clone().lazy());
    let filtered_df = ctx
        .execute(
            "SELECT *
    FROM (
        SELECT
            \"Type 1\",
            CASE WHEN \"Type 2\" = 'Poison' THEN Attack ELSE NULL END AS type
        FROM df
    ) one
    GROUP BY \"Type 1\", type",
        )
        .unwrap()
        .collect()
        .unwrap();

    println!("{:?}", filtered_df);
}
