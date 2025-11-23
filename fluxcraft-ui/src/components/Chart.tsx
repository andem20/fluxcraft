import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useSelector } from "react-redux";
import { RootState } from "../stores/Store";
import { Card, CardContent } from "@mui/material";
// import * as theme from "../assets/chalk.project.json" with { type: "json" };

export function Charts() {
  const chartRef = useRef(null);
  let chart: echarts.ECharts;
  const darkModeSelector = useSelector(
    (state: RootState) => state.darkMode.enabled
  );

  //   echarts.registerTheme("dark", theme.theme);
  const dates: String[] = [];
  for (let i = 1; i < 7; i++) {
    const date = new Date();
    date.setMonth(i);
    dates.push(date.toISOString());
  }

  useEffect(() => {
    if (!chartRef.current) return;

    chart = echarts.init(chartRef.current);

    chart.setOption({
      title: { text: "Dummy title" },
      tooltip: {},
      xAxis: {
        data: dates,
      },
      yAxis: {},
      series: [
        {
          name: "sales",
          type: "line",
          data: [5, 20, 36, 10, 10, 20],
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
  }, [darkModeSelector]);

  return (
    <Card elevation={3} sx={{ m: 3, width: "100%" }}>
      <CardContent sx={{ p: 0, m: 0, "&:last-child": { pb: 0 } }}>
        <div
          ref={chartRef}
          id="main"
          style={{ width: "100%", height: 400 }}
        ></div>
      </CardContent>
    </Card>
  );
}
