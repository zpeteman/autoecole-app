interface ChartProps {
  type: "line" | "bar" | "pie";
  data: {
    labels: string | string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: {
      y?: {
        beginAtZero?: boolean;
      };
    };
  };
}

export default function Chart({ type, data, options = {} }: ChartProps) {
  return (
    <div class="h-64">
      <canvas
        id={`chart-${Math.random().toString(36).substr(2, 9)}`}
        data-type={type}
        data-labels={JSON.stringify(data.labels)}
        data-datasets={JSON.stringify(data.datasets)}
        data-options={JSON.stringify(options)}
      />
    </div>
  );
} 