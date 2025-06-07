import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function SpectrumChart() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: 64 }, (_, i) => i * 100),
        datasets: [
          {
            label: "Original",
            data: Array.from({ length: 64 }, () => Math.random() * 100),
            borderColor: "blue",
            fill: false,
          },
          {
            label: "Procesado",
            data: Array.from({ length: 64 }, () => Math.random() * 60),
            borderColor: "red",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      chartInstance.current.destroy();
    };
  }, []);

  return <canvas ref={chartRef} width="600" height="300"></canvas>;
}

export default SpectrumChart;
