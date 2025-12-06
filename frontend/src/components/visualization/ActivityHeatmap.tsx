import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useState } from 'react';
import { Button } from '../ui/Button';

interface HeatCell {
  day: string;
  hour: number;
  value: number;
}

interface ActivityHeatmapProps {
  title?: string;
  data?: HeatCell[];
  onExport?: (id: string) => void;
  fitToContainer?: boolean;
}

interface TooltipState {
  show: boolean;
  day: string;
  hour: number;
  value: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = [0, 4, 8, 12, 16, 20];
const CELL = 38;

function cellColor(value: number): string {
  if (value === 0) return '#f8fafc';
  if (value < 4) return '#bfdbfe';
  if (value < 8) return '#60a5fa';
  if (value < 11) return '#2563eb';
  return '#1d4ed8';
}

function legendColorClass(value: number): string {
  if (value === 0) return 'bg-slate-50';
  if (value < 4) return 'bg-blue-200';
  if (value < 8) return 'bg-blue-400';
  if (value < 11) return 'bg-blue-700';
  return 'bg-blue-800';
}

export function ActivityHeatmap({ title = 'Activity Heatmap', data = [], onExport }: ActivityHeatmapProps) {
  const heatmapId = `heatmap-${Math.random().toString(36).slice(2, 8)}`;
  const width = 80 + HOURS.length * CELL;
  const height = 40 + DAYS.length * CELL;
  const [tooltip, setTooltip] = useState<TooltipState>({ show: false, day: '', hour: 0, value: 0 });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {onExport && (
          <Button size="sm" variant="outline" onClick={() => onExport(heatmapId)}>
            Export SVG/PNG
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg id={heatmapId} width={width} height={height} role="img">
            <g transform="translate(60,20)">
              {HOURS.map((hour, idx) => (
                <text
                  key={`h-${hour}`}
                  x={idx * CELL + CELL / 2}
                  y={-6}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#475569"
                >
                  {hour}:00
                </text>
              ))}

              {DAYS.map((day, row) => (
                <g key={day} transform={`translate(0, ${row * CELL})`}>
                  <text x={-12} y={CELL / 2} textAnchor="end" alignmentBaseline="middle" fontSize={12} fill="#0f172a">
                    {day}
                  </text>
                  {HOURS.map((hour, col) => {
                    const cell = data.find((d) => d.day === day && d.hour === hour);
                    const value = cell?.value ?? 0;
                    return (
                      <g key={`${day}-${hour}`} transform={`translate(${col * CELL}, 0)`}>
                        <rect
                          width={CELL - 6}
                          height={CELL - 6}
                          rx={6}
                          ry={6}
                          fill={cellColor(value)}
                          onMouseEnter={(e) => {
                            setTooltip({
                              show: true,
                              day,
                              hour,
                              value
                            });
                          }}
                          onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                          className="cursor-pointer"
                        />
                        {value > 0 && (
                          <text
                            x={(CELL - 6) / 2}
                            y={(CELL - 6) / 2 + 4}
                            textAnchor="middle"
                            fontSize={11}
                            fill="#ffffff"
                          >
                            {value}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Less</span>
            <div className="flex gap-1">
              {[0, 4, 8, 12].map(level => (
                <div
                  key={level}
                  className={`w-4 h-4 rounded ${legendColorClass(level)}`}
                />
              ))}
            </div>
            <span className="text-slate-600">More</span>
          </div>
          <div className="text-slate-500">Activity intensity</div>
        </div>

        {/* Tooltip */}
        {tooltip.show && (
          <div
            className="mt-3 inline-block rounded-lg bg-slate-900 px-3 py-2 text-sm text-white shadow-lg"
          >
            <div className="font-medium">{tooltip.day}, {tooltip.hour}:00</div>
            <div>Activity: {tooltip.value} transactions</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActivityHeatmap;
