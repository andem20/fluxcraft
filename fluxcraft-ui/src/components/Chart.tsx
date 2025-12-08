import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { useSelector } from "react-redux";
import { RootState } from "../stores/Store";
import {
  Button,
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

interface ChartProps {
  df: JsDataFrame | null;
}

const ChartType = {
  line: { type: "line" },
  bar: { type: "bar" },
  stackedArea: { type: "line" },
} as const;

type ChartTypeKey = keyof typeof ChartType;

export function Charts({ df }: ChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const [x, setX] = useState<string | null>(null);
  const [y, setY] = useState<string | null>(null);
  const [grouping, setGrouping] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartTypeKey>("line");
  const [render, setRender] = useState(false);

  const darkModeSelector = useSelector(
    (state: RootState) => state.darkMode.enabled
  );

  useEffect(() => {
    if (!chartRef.current || !x || !y || !df) return;

    const chart = echarts.init(
      chartRef.current,
      darkModeSelector ? "dark" : "light"
    );

    const xCol = df.get_column(x);
    const xDType = df.get_dtype(x);
    const yCol = df.get_column(y);

    const groupArray = grouping ? df.get_column(grouping).get_values() : [];

    const yValues = yCol.get_values();
    const xValues = xCol.get_values();

    const dataMap: Record<string, any[]> = {};
    const stackedX: Record<string, boolean> = {};

    xValues.forEach((v: any, i: number) => {
      const key = grouping ? groupArray[i] : y;
      if (!dataMap[key]) dataMap[key] = [];

      const point = chartType === "stackedArea" ? yValues[i] : [v, yValues[i]];

      stackedX[v] = true;
      dataMap[key].push(point);
    });

    const series = Object.entries(dataMap).map(([key, arr]) => {
      const s: any = {
        name: key,
        type: ChartType[chartType].type,
        data: arr,
      };

      if (chartType === "stackedArea") {
        s.stack = "total";
        s.areaStyle = {};
        s.emphasis = { focus: "series" };
      }

      return s;
    });

    const xType =
      xDType?.includes("datetime") && chartType !== "stackedArea"
        ? "time"
        : "category";

    const options = {
      title: { text: df.get_name() },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: xType,
      },
      yAxis: {},
      series,
      dataZoom: [
        { type: "inside", start: 0, end: 100 },
        { start: 0, end: 100 },
      ],
    };
    if (chartType === "stackedArea") {
      options["xAxis"] = {
        type: xType,
        //@ts-ignore,
        data: Object.keys(stackedX),
        axisLabel: {
          formatter: (val: string) =>
            moment(new Date(val)).format("YYYY-MM-DD HH:mm:ss"),
        },
      };
    }

    chart.setOption(options);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [df, x, y, grouping, chartType, render, darkModeSelector]);

  return (
    <>
      {render ? (
        <Card elevation={3} sx={{ m: 3, width: "100%" }}>
          <CardContent sx={{ p: 0 }}>
            <div ref={chartRef} style={{ width: "100%", height: 400 }} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h5">Assign column to axis</Typography>
          </CardContent>

          <CardContent
            sx={{ gap: "1rem", display: "flex", justifyContent: "center" }}
          >
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>X axis</InputLabel>
              <Select
                value={x}
                label="X axis"
                onChange={(e) => setX(e.target.value)}
              >
                {df?.get_headers().map((h) => (
                  <MenuItem key={h.get_name()} value={h.get_name()}>
                    {h.get_name()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Y axis</InputLabel>
              <Select
                value={y}
                label="Y axis"
                onChange={(e) => setY(e.target.value)}
              >
                {df?.get_headers().map((h) => (
                  <MenuItem key={h.get_name()} value={h.get_name()}>
                    {h.get_name()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Grouping</InputLabel>
              <Select
                value={grouping}
                label="Grouping"
                onChange={(e) => setGrouping(e.target.value)}
              >
                {df?.get_headers().map((h) => (
                  <MenuItem key={h.get_name()} value={h.get_name()}>
                    {h.get_name()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={(e) => setChartType(e.target.value as ChartTypeKey)}
              >
                {Object.keys(ChartType).map((k) => (
                  <MenuItem key={k} value={k}>
                    {k}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" onClick={() => setRender(true)}>
              Render
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
