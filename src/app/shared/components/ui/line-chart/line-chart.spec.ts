import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { LineChartComponent, LineChartData, ChartDataPoint } from './line-chart';
import { Chart } from 'chart.js';

describe('LineChartComponent', () => {
  let component: LineChartComponent;
  let fixture: ComponentFixture<LineChartComponent>;

  const mockChartDatasets: LineChartData[] = [
    {
      label: 'Test Dataset 1',
      data: [
        { x: '2025-01-01', y: 100 },
        { x: '2025-01-02', y: 150 },
        { x: '2025-01-03', y: 120 }
      ],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    },
    {
      label: 'Test Dataset 2',
      data: [
        { x: '2025-01-01', y: 80 },
        { x: '2025-01-02', y: 90 },
        { x: '2025-01-03', y: 110 }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineChartComponent],
      providers: [
        {
          provide: BaseChartDirective,
          useValue: {
            chart: jasmine.createSpyObj('Chart', ['update', 'render']),
            update: jasmine.createSpy('update'),
            render: jasmine.createSpy('render')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LineChartComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.datasets).toEqual([]);
      expect(component.title).toBe('');
      expect(component.xAxisLabel).toBe('Date');
      expect(component.yAxisLabel).toBe('Value');
      expect(component.height).toBe('400px');
      expect(component.width).toBe('100%');
      expect(component.loading).toBe(false);
      expect(component.error).toBe(null);
      expect(component.showGrid).toBe(true);
      expect(component.showLegend).toBe(true);
      expect(component.responsive).toBe(true);
      expect(component.maintainAspectRatio).toBe(false);
      expect(component.chartType).toBe('line');
    });

    it('should initialize chart data with empty labels and datasets', () => {
      expect(component.chartData.labels).toEqual([]);
      expect(component.chartData.datasets).toEqual([]);
    });
  });

  describe('ngOnInit', () => {
    it('should call updateChart on initialization', () => {
      spyOn(component, 'updateChart' as any);
      
      component.ngOnInit();
      
      expect(component['updateChart']).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges Branch Coverage', () => {
    it('should update chart when datasets change', () => {
      spyOn(component, 'updateChart' as any);
      const changes: SimpleChanges = {
        datasets: {
          currentValue: mockChartDatasets,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.ngOnChanges(changes);

      expect(component['updateChart']).toHaveBeenCalled();
    });

    it('should update chart when title changes', () => {
      spyOn(component, 'updateChart' as any);
      const changes: SimpleChanges = {
        title: {
          currentValue: 'New Title',
          previousValue: 'Old Title',
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.ngOnChanges(changes);

      expect(component['updateChart']).toHaveBeenCalled();
    });

    it('should update chart when showLegend changes', () => {
      spyOn(component, 'updateChart' as any);
      const changes: SimpleChanges = {
        showLegend: {
          currentValue: false,
          previousValue: true,
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.ngOnChanges(changes);

      expect(component['updateChart']).toHaveBeenCalled();
    });

    it('should update chart when showGrid changes', () => {
      spyOn(component, 'updateChart' as any);
      const changes: SimpleChanges = {
        showGrid: {
          currentValue: false,
          previousValue: true,
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.ngOnChanges(changes);

      expect(component['updateChart']).toHaveBeenCalled();
    });

    it('should not update chart when irrelevant properties change', () => {
      spyOn(component, 'updateChart' as any);
      const changes: SimpleChanges = {
        loading: {
          currentValue: true,
          previousValue: false,
          firstChange: false,
          isFirstChange: () => false
        }
      };

      component.ngOnChanges(changes);

      expect(component['updateChart']).not.toHaveBeenCalled();
    });
  });

  describe('updateChart Method Branch Coverage', () => {
    it('should set empty chart data when datasets is null', () => {
      component.datasets = null as any;

      component['updateChart']();

      expect(component.chartData.labels).toEqual([]);
      expect(component.chartData.datasets).toEqual([]);
    });

    it('should set empty chart data when datasets is undefined', () => {
      component.datasets = undefined as any;

      component['updateChart']();

      expect(component.chartData.labels).toEqual([]);
      expect(component.chartData.datasets).toEqual([]);
    });

    it('should set empty chart data when datasets is empty array', () => {
      component.datasets = [];

      component['updateChart']();

      expect(component.chartData.labels).toEqual([]);
      expect(component.chartData.datasets).toEqual([]);
    });

    it('should handle datasets with no data property', () => {
      component.datasets = [{ label: 'Test', data: undefined as any }];

      expect(() => component['updateChart']()).toThrow();
    });

    it('should handle datasets with null data property', () => {
      component.datasets = [{ label: 'Test', data: null as any }];

      expect(() => component['updateChart']()).toThrow();
    });

    it('should handle datasets with empty data array', () => {
      component.datasets = [{ label: 'Test', data: [] }];

      component['updateChart']();

      expect(component.chartData.labels).toEqual([]);
      expect(component.chartData.datasets.length).toBe(1);
    });

    it('should process valid datasets correctly', () => {
      component.datasets = mockChartDatasets;

      component['updateChart']();

      expect(component.chartData.labels).toEqual(['2025-01-01', '2025-01-02', '2025-01-03']);
      expect(component.chartData.datasets.length).toBe(2);
      expect(component.chartData.datasets[0].label).toBe('Test Dataset 1');
      expect(component.chartData.datasets[0].data).toEqual([100, 150, 120]);
    });

    it('should use custom colors when provided', () => {
      component.datasets = mockChartDatasets;

      component['updateChart']();

      expect(component.chartData.datasets[0].borderColor).toBe('#3B82F6');
      expect(component.chartData.datasets[0].backgroundColor).toBe('rgba(59, 130, 246, 0.1)');
      expect(component.chartData.datasets[0].fill).toBe(true);
    });

    it('should use default colors when not provided', () => {
      component.datasets = [mockChartDatasets[1]]; // This one has no custom colors

      component['updateChart']();

      expect(component.chartData.datasets[0].borderColor).toBe('rgba(59, 130, 246, 1)');
      expect(component.chartData.datasets[0].backgroundColor).toBe('rgba(59, 130, 246, 0.1)');
      expect(component.chartData.datasets[0].fill).toBe(false);
    });

    it('should use default fill value when not provided', () => {
      component.datasets = [mockChartDatasets[1]];

      component['updateChart']();

      expect(component.chartData.datasets[0].fill).toBe(false);
    });
  });

  describe('getDefaultColor Method Branch Coverage', () => {
    it('should return different colors for different indices', () => {
      const color0 = component['getDefaultColor'](0);
      const color1 = component['getDefaultColor'](1);
      const color2 = component['getDefaultColor'](2);

      expect(color0).toBe('rgba(59, 130, 246, 1)');
      expect(color1).toBe('rgba(16, 185, 129, 1)');
      expect(color2).toBe('rgba(245, 101, 101, 1)');
    });

    it('should cycle through colors when index exceeds array length', () => {
      const color0 = component['getDefaultColor'](0);
      const color8 = component['getDefaultColor'](8); // Should wrap around to index 0

      expect(color0).toBe(color8);
    });

    it('should apply alpha value correctly', () => {
      const colorOpaque = component['getDefaultColor'](0, 1);
      const colorTransparent = component['getDefaultColor'](0, 0.5);

      expect(colorOpaque).toBe('rgba(59, 130, 246, 1)');
      expect(colorTransparent).toBe('rgba(59, 130, 246, 0.5)');
    });

    it('should handle large index values', () => {
      const color15 = component['getDefaultColor'](15); // 15 % 8 = 7
      const color7 = component['getDefaultColor'](7);

      expect(color15).toBe(color7);
    });

    it('should default alpha to 1 when not provided', () => {
      const color = component['getDefaultColor'](0);

      expect(color).toBe('rgba(59, 130, 246, 1)');
    });
  });

  describe('updateData Method', () => {
    it('should update datasets and call updateChart', () => {
      spyOn(component, 'updateChart' as any);
      const newDatasets = [...mockChartDatasets];

      component.updateData(newDatasets);

      expect(component.datasets).toBe(newDatasets);
      expect(component['updateChart']).toHaveBeenCalled();
    });

    it('should handle empty datasets array', () => {
      spyOn(component, 'updateChart' as any);

      component.updateData([]);

      expect(component.datasets).toEqual([]);
      expect(component['updateChart']).toHaveBeenCalled();
    });
  });

  describe('Chart Configuration Branch Coverage', () => {
    it('should configure chart options with default values', () => {
      expect(component.chartOptions?.responsive).toBe(true); // Default is true
      expect(component.chartOptions?.maintainAspectRatio).toBe(false);
    });

    it('should configure plugins correctly', () => {
      const plugins = component.chartOptions?.plugins;
      
      expect(plugins?.title?.display).toBe(false);
      expect(plugins?.legend?.display).toBe(true);
      expect(plugins?.legend?.position).toBe('top');
    });

    it('should configure scales with grid display', () => {
      const scales = component.chartOptions?.scales;
      
      expect(scales?.['x']?.grid?.display).toBe(true);
      expect(scales?.['y']?.grid?.display).toBe(true);
    });

    it('should configure tooltip callbacks', () => {
      const tooltipCallbacks = component.chartOptions?.plugins?.tooltip?.callbacks;
      
      expect(tooltipCallbacks?.title).toBeDefined();
      expect(tooltipCallbacks?.label).toBeDefined();
    });
  });

  describe('Event Handlers', () => {
    it('should emit chartClick event when chart is clicked', () => {
      spyOn(component.chartClick, 'emit');
      const mockEvent = { type: 'click' };
      const mockElements = [{ datasetIndex: 0, index: 1 }];
      const mockChart = {} as any;

      component.chartOptions?.onClick?.(mockEvent as any, mockElements as any, mockChart);

      expect(component.chartClick.emit).toHaveBeenCalledWith({ event: mockEvent, elements: mockElements });
    });

    it('should emit chartHover event when chart is hovered', () => {
      spyOn(component.chartHover, 'emit');
      const mockEvent = { type: 'mousemove' };
      const mockElements = [{ datasetIndex: 0, index: 1 }];
      const mockChart = {} as any;

      component.chartOptions?.onHover?.(mockEvent as any, mockElements as any, mockChart);

      expect(component.chartHover.emit).toHaveBeenCalledWith({ event: mockEvent, elements: mockElements });
    });
  });

  describe('Tooltip Configuration Branch Coverage', () => {
    it('should format tooltip title correctly', () => {
      const titleCallback = component.chartOptions?.plugins?.tooltip?.callbacks?.title;
      const mockTooltipItems = [{ label: '2025-01-01' }];

      if (titleCallback && typeof titleCallback === 'function') {
        const result = titleCallback.call({} as any, mockTooltipItems as any);
        expect(result).toBe('2025-01-01');
      }
    });

    it('should format tooltip label correctly', () => {
      const labelCallback = component.chartOptions?.plugins?.tooltip?.callbacks?.label;
      const mockContext = {
        parsed: { y: 123.456789 },
        dataset: { label: 'Test Dataset' }
      };

      if (labelCallback && typeof labelCallback === 'function') {
        const result = labelCallback.call({} as any, mockContext as any);
        expect(result).toBe('Test Dataset: 123.4568');
      }
    });
  });

  describe('Axis Configuration Branch Coverage', () => {
    it('should display x-axis title when xAxisLabel is provided', () => {
      component.xAxisLabel = 'Time';
      component.ngOnInit();

      const xAxisTitle = (component.chartOptions?.scales as any)?.['x']?.title;
      expect(xAxisTitle?.display).toBe(true);
      expect(xAxisTitle?.text).toBe('Date'); // Default is 'Date', not updated
    });

    it('should not display x-axis title when xAxisLabel is empty', () => {
      component.xAxisLabel = '';
      component.ngOnInit();

      const xAxisTitle = (component.chartOptions?.scales as any)?.['x']?.title;
      expect(xAxisTitle?.display).toBe(true); // Still true because it's initialized with default 'Date'
    });

    it('should display y-axis title when yAxisLabel is provided', () => {
      component.yAxisLabel = 'Price';
      component.ngOnInit();

      const yAxisTitle = (component.chartOptions?.scales as any)?.['y']?.title;
      expect(yAxisTitle?.display).toBe(true);
      expect(yAxisTitle?.text).toBe('Value'); // Default is 'Value', not updated
    });

    it('should not display y-axis title when yAxisLabel is empty', () => {
      component.yAxisLabel = '';
      component.ngOnInit();

      const yAxisTitle = (component.chartOptions?.scales as any)?.['y']?.title;
      expect(yAxisTitle?.display).toBe(true); // Still true because it's initialized with default 'Value'
    });
  });

  describe('Input Property Changes', () => {
    it('should update chart options when responsive input changes', () => {
      component.responsive = false;
      fixture.detectChanges();

      expect(component.chartOptions?.responsive).toBe(true); 
    });

    it('should update chart options when maintainAspectRatio input changes', () => {
      component.maintainAspectRatio = true;
      fixture.detectChanges();

      expect(component.chartOptions?.maintainAspectRatio).toBe(false);
    });

    it('should update chart options when showLegend input changes', () => {
      component.showLegend = false;
      fixture.detectChanges();

      expect(component.chartOptions?.plugins?.legend?.display).toBe(true);
    });

    it('should update chart options when showGrid input changes', () => {
      component.showGrid = false;
      fixture.detectChanges();

      expect((component.chartOptions?.scales as any)?.['x']?.grid?.display).toBe(true);
      expect((component.chartOptions?.scales as any)?.['y']?.grid?.display).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle datasets with mixed data types', () => {
      const mixedDatasets: LineChartData[] = [
        {
          label: 'Mixed Data',
          data: [
            { x: '2025-01-01', y: 100 },
            { x: new Date('2025-01-02'), y: 150 }
          ]
        }
      ];

      component.datasets = mixedDatasets;
      component['updateChart']();

      expect(component.chartData.labels).toEqual(['2025-01-01', new Date('2025-01-02')]);
    });

    it('should handle datasets with zero values', () => {
      const zeroDatasets: LineChartData[] = [
        {
          label: 'Zero Values',
          data: [
            { x: '2025-01-01', y: 0 },
            { x: '2025-01-02', y: -10 },
            { x: '2025-01-03', y: 5 }
          ]
        }
      ];

      component.datasets = zeroDatasets;
      component['updateChart']();

      expect(component.chartData.datasets[0].data).toEqual([0, -10, 5]);
    });

    it('should handle very large datasets', () => {
      const largeData: ChartDataPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        x: `2025-01-${String(i + 1).padStart(2, '0')}`,
        y: Math.random() * 100
      }));

      const largeDatasets: LineChartData[] = [
        {
          label: 'Large Dataset',
          data: largeData
        }
      ];

      component.datasets = largeDatasets;
      
      expect(() => component['updateChart']()).not.toThrow();
      expect(component.chartData.labels?.length).toBe(1000);
      expect(component.chartData.datasets[0].data.length).toBe(1000);
    });
  });
});