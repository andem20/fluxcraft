import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { useSelector } from "react-redux";
import { RootState } from "../stores/Store";
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { JsDataFrame } from "polars-wasm";
import moment from "moment";
// import * as theme from "../assets/chalk.project.json" with { type: "json" };

interface ChartProps {
  df: JsDataFrame | null;
}

enum ChartType {
  LINE = "line",
  BAR = "bar",
}

export function Charts(chartProps: ChartProps) {
  const chartRef = useRef(null);
  const [x, setX] = useState<string | null>(null);
  const [y, setY] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>(ChartType.LINE);

  let chart: echarts.ECharts;
  const darkModeSelector = useSelector(
    (state: RootState) => state.darkMode.enabled
  );

  //   echarts.registerTheme("dark", theme.theme);

  useEffect(() => {
    if (!chartRef.current || !x || !y) return;
    chart = echarts.init(chartRef.current);

    const xData = chartProps.df?.get_column(x);
    const yData = chartProps.df?.get_column(y);

    chart.setOption({
      title: { text: chartProps.df?.get_name() },
      tooltip: {},
      xAxis: {
        name: x,
        data: xData?.get_values(),
        axisLabel: {
          formatter: (value) => moment(new Date(value)).format("DD-MM-YYYY"),
        },
      },
      yAxis: {},
      series: [
        {
          name: y,
          type: chartType.toLowerCase(),
          data: yData?.get_values(),
        },
      ],
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 100,
        },
      ],
    });

    chart.setTheme(darkModeSelector ? "dark" : "light");
    const handleResize = () => chart.resize();
    window.addEventListener("resize", () => handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [darkModeSelector, x, y]);

  return (
    <>
      {x && y ? (
        <Card elevation={3} sx={{ m: 3, width: "100%" }}>
          <CardContent sx={{ p: 0, m: 0, "&:last-child": { pb: 0 } }}>
            <div
              ref={chartRef}
              id="main"
              style={{ width: "100%", height: 400 }}
            ></div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Assign column to axis
            </Typography>
          </CardContent>
          <CardContent
            sx={{ gap: "1rem", display: "flex", justifyContent: "center" }}
          >
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="x-axis-select-label">X axis</InputLabel>
              <Select
                labelId="x-axis-select-label"
                id="x-axis-select"
                value={x}
                label="X axis"
                onChange={(e) => setX(e.target.value)}
              >
                {chartProps.df?.get_headers().map((header) => (
                  <MenuItem value={header.get_name()}>
                    {header.get_name()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="y-axis-select-label">Y axis</InputLabel>
              <Select
                labelId="y-axis-select-label"
                id="y-axis-select"
                value={y}
                label="Y axis"
                onChange={(e) => setY(e.target.value)}
              >
                {chartProps.df?.get_headers().map((header) => (
                  <MenuItem value={header.get_name()}>
                    {header.get_name()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="chartType-axis-select-label">
                Cart ChartType
              </InputLabel>
              <Select
                labelId="chartType-axis-select-label"
                id="chartType-axis-select"
                value={chartType}
                label="Chart type"
                onChange={(e) => setChartType(e.target.value as ChartType)}
              >
                {Object.keys(ChartType).map((c) => (
                  //@ts-ignore
                  <MenuItem value={ChartType[c]}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      )}
    </>
  );
}
