/**
 * Chart Wrapper Components
 * Recharts-based charts with built-in export functionality
 */

import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, Maximize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { exportChartToPNG, generateFilename } from '../../lib/exportUtils';

// ============================================================================
// Types
// ============================================================================

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartWrapperRef {
  export: (filename?: string) => Promise<void>;
  getElement: () => HTMLDivElement | null;
}

interface BaseChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  showExport?: boolean;
  showFullscreen?: boolean;
  exportFilename?: string;
  colors?: string[];
}

// Default color palette
const DEFAULT_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
];

// ============================================================================
// Chart Wrapper Base
// ============================================================================

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  className?: string;
  showExport?: boolean;
  exportFilename?: string;
  children: React.ReactNode;
}

const ChartContainer = forwardRef<ChartWrapperRef, ChartContainerProps>(
  ({ title, subtitle, className, showExport, exportFilename, children }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
      if (!containerRef.current) return;
      setExporting(true);
      try {
        await exportChartToPNG(
          containerRef.current,
          generateFilename(exportFilename || title || 'chart')
        );
      } finally {
        setExporting(false);
      }
    };

    useImperativeHandle(ref, () => ({
      export: handleExport,
      getElement: () => containerRef.current,
    }));

    return (
      <div
        className={cn(
          'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6',
          className
        )}
      >
        {/* Header */}
        {(title || showExport) && (
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {showExport && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Export as PNG"
              >
                <Download className={cn('w-4 h-4', exporting && 'animate-pulse')} />
              </button>
            )}
          </div>
        )}

        {/* Chart Content */}
        <div ref={containerRef}>{children}</div>
      </div>
    );
  }
);

ChartContainer.displayName = 'ChartContainer';

// ============================================================================
// Line Chart
// ============================================================================

interface LineChartWrapperProps extends BaseChartProps {
  xKey: string;
  yKeys: { key: string; name: string; color?: string }[];
  curved?: boolean;
  showGrid?: boolean;
  showDots?: boolean;
}

export const LineChartWrapper = forwardRef<ChartWrapperRef, LineChartWrapperProps>(
  (
    {
      data,
      xKey,
      yKeys,
      title,
      subtitle,
      height = 300,
      className,
      showExport = true,
      exportFilename,
      colors = DEFAULT_COLORS,
      curved = true,
      showGrid = true,
      showDots = false,
    },
    ref
  ) => {
    return (
      <ChartContainer
        ref={ref}
        title={title}
        subtitle={subtitle}
        className={className}
        showExport={showExport}
        exportFilename={exportFilename}
      >
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            )}
            <XAxis
              dataKey={xKey}
              className="text-xs fill-slate-500"
              tickLine={false}
              axisLine={false}
            />
            <YAxis className="text-xs fill-slate-500" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #fff)',
                border: '1px solid var(--tooltip-border, #e2e8f0)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {yKeys.map((yKey, index) => (
              <Line
                key={yKey.key}
                type={curved ? 'monotone' : 'linear'}
                dataKey={yKey.key}
                name={yKey.name}
                stroke={yKey.color || colors[index % colors.length]}
                strokeWidth={2}
                dot={showDots}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }
);

LineChartWrapper.displayName = 'LineChartWrapper';

// ============================================================================
// Area Chart
// ============================================================================

interface AreaChartWrapperProps extends BaseChartProps {
  xKey: string;
  yKeys: { key: string; name: string; color?: string }[];
  stacked?: boolean;
  gradient?: boolean;
}

export const AreaChartWrapper = forwardRef<ChartWrapperRef, AreaChartWrapperProps>(
  (
    {
      data,
      xKey,
      yKeys,
      title,
      subtitle,
      height = 300,
      className,
      showExport = true,
      exportFilename,
      colors = DEFAULT_COLORS,
      stacked = false,
      gradient = true,
    },
    ref
  ) => {
    return (
      <ChartContainer
        ref={ref}
        title={title}
        subtitle={subtitle}
        className={className}
        showExport={showExport}
        exportFilename={exportFilename}
      >
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              {yKeys.map((yKey, index) => {
                const color = yKey.color || colors[index % colors.length];
                return (
                  <linearGradient
                    key={`gradient-${yKey.key}`}
                    id={`gradient-${yKey.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey={xKey} className="text-xs fill-slate-500" tickLine={false} axisLine={false} />
            <YAxis className="text-xs fill-slate-500" tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            {yKeys.map((yKey, index) => {
              const color = yKey.color || colors[index % colors.length];
              return (
                <Area
                  key={yKey.key}
                  type="monotone"
                  dataKey={yKey.key}
                  name={yKey.name}
                  stroke={color}
                  fill={gradient ? `url(#gradient-${yKey.key})` : color}
                  fillOpacity={gradient ? 1 : 0.3}
                  stackId={stacked ? 'stack' : undefined}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }
);

AreaChartWrapper.displayName = 'AreaChartWrapper';

// ============================================================================
// Bar Chart
// ============================================================================

interface BarChartWrapperProps extends BaseChartProps {
  xKey: string;
  yKeys: { key: string; name: string; color?: string }[];
  stacked?: boolean;
  horizontal?: boolean;
}

export const BarChartWrapper = forwardRef<ChartWrapperRef, BarChartWrapperProps>(
  (
    {
      data,
      xKey,
      yKeys,
      title,
      subtitle,
      height = 300,
      className,
      showExport = true,
      exportFilename,
      colors = DEFAULT_COLORS,
      stacked = false,
    },
    ref
  ) => {
    return (
      <ChartContainer
        ref={ref}
        title={title}
        subtitle={subtitle}
        className={className}
        showExport={showExport}
        exportFilename={exportFilename}
      >
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey={xKey} className="text-xs fill-slate-500" tickLine={false} axisLine={false} />
            <YAxis className="text-xs fill-slate-500" tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            {yKeys.map((yKey, index) => (
              <Bar
                key={yKey.key}
                dataKey={yKey.key}
                name={yKey.name}
                fill={yKey.color || colors[index % colors.length]}
                stackId={stacked ? 'stack' : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }
);

BarChartWrapper.displayName = 'BarChartWrapper';

// ============================================================================
// Pie Chart
// ============================================================================

interface PieChartWrapperProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
}

export const PieChartWrapper = forwardRef<ChartWrapperRef, PieChartWrapperProps>(
  (
    {
      data,
      dataKey,
      nameKey,
      title,
      subtitle,
      height = 300,
      className,
      showExport = true,
      exportFilename,
      colors = DEFAULT_COLORS,
      innerRadius = 0,
      outerRadius = 80,
      showLabels = true,
    },
    ref
  ) => {
    return (
      <ChartContainer
        ref={ref}
        title={title}
        subtitle={subtitle}
        className={className}
        showExport={showExport}
        exportFilename={exportFilename}
      >
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              label={
                showLabels
                  ? ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`
                  : undefined
              }
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }
);

PieChartWrapper.displayName = 'PieChartWrapper';
