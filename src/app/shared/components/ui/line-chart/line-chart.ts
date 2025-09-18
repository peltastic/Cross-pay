import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, ChartData } from 'chart.js';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

export interface ChartDataPoint {
  x: string | Date;
  y: number;
}

export interface LineChartData {
  label: string;
  data: ChartDataPoint[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
}

@Component({
  selector: 'app-line-chart',
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './line-chart.html',
  styles: [
    `
      .chart-container {
        position: relative;
        width: 100%;
        min-height: 400px;
      }

      canvas {
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class LineChartComponent implements OnInit, OnChanges {
  @Input() datasets: LineChartData[] = [];
  @Input() title: string = '';
  @Input() xAxisLabel: string = 'Date';
  @Input() yAxisLabel: string = 'Value';
  @Input() height: string = '400px';
  @Input() width: string = '100%';
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() showGrid: boolean = true;
  @Input() showLegend: boolean = true;
  @Input() responsive: boolean = true;
  @Input() maintainAspectRatio: boolean = false;

  @Output() chartClick = new EventEmitter<any>();
  @Output() chartHover = new EventEmitter<any>();

  public chartType: ChartType = 'line';
  public chartData: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: this.responsive,
    maintainAspectRatio: this.maintainAspectRatio,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      title: {
        display: false,
        text: this.title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: this.showLegend,
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: !!this.xAxisLabel,
          text: this.xAxisLabel,
          font: {
            weight: 'bold',
          },
        },
        grid: {
          display: this.showGrid,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        title: {
          display: !!this.yAxisLabel,
          text: this.yAxisLabel,
          font: {
            weight: 'bold',
          },
        },
        grid: {
          display: this.showGrid,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        beginAtZero: false,
      },
    },
    onClick: (event, elements) => {
      this.chartClick.emit({ event, elements });
    },
    onHover: (event, elements) => {
      this.chartHover.emit({ event, elements });
    },
  };

  ngOnInit(): void {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datasets'] || changes['title'] || changes['showLegend'] || changes['showGrid']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (!this.datasets || this.datasets.length === 0) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    const allLabels = this.datasets[0]?.data?.map((point) => point.x) || [];

    this.chartData = {
      labels: allLabels,
      datasets: this.datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data.map((point) => point.y),
        borderColor: dataset.borderColor || this.getDefaultColor(index),
        backgroundColor: dataset.backgroundColor || this.getDefaultColor(index, 0.1),
        fill: dataset.fill || false,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
        pointBackgroundColor: dataset.borderColor || this.getDefaultColor(index),
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      })),
    };
  }

  private getDefaultColor(index: number, alpha: number = 1): string {
    const colors = [
      `rgba(59, 130, 246, ${alpha})`,
      `rgba(16, 185, 129, ${alpha})`,
      `rgba(245, 101, 101, ${alpha})`,
      `rgba(251, 191, 36, ${alpha})`,
      `rgba(139, 92, 246, ${alpha})`,
      `rgba(236, 72, 153, ${alpha})`,
      `rgba(20, 184, 166, ${alpha})`,
      `rgba(251, 146, 60, ${alpha})`,
    ];
    return colors[index % colors.length];
  }

  public updateData(newDatasets: LineChartData[]): void {
    this.datasets = newDatasets;
    this.updateChart();
  }
}
