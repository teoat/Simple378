
import { useState, useRef, useCallback } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import {
  BarChart3,
  Table,
  FileText,
  Save,
  Eye,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';
import { Button } from '../ui/Button';
// Used card imports removed

export interface ReportComponent {
  id: string;
  type: 'chart' | 'table' | 'text' | 'metric';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; width: number; height: number };
}

interface ReportBuilderProps {
  onSave?: (report: ReportDefinition) => void;
  onPreview?: (report: ReportDefinition) => void;
  initialReport?: ReportDefinition;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  components: ReportComponent[];
  layout: 'grid' | 'freeform';
  filters: ReportFilter[];
  schedule?: ReportSchedule;
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string | number | boolean | null;
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'html';
}

const COMPONENT_TYPES = [
  { type: 'chart', icon: BarChart3, label: 'Chart', chartTypes: ['bar', 'line', 'pie', 'area'] },
  { type: 'table', icon: Table, label: 'Data Table' },
  { type: 'metric', icon: FileText, label: 'Metric Card' },
  { type: 'text', icon: FileText, label: 'Text Block' }
];

const DATA_SOURCES = [
  'transactions',
  'cases',
  'subjects',
  'risk_scores',
  'audit_logs',
  'user_activity'
];

export function ReportBuilder({ onSave, onPreview, initialReport }: ReportBuilderProps) {
  const [report, setReport] = useState<ReportDefinition>(initialReport || {
    id: '',
    title: 'New Report',
    description: '',
    components: [],
    layout: 'grid',
    filters: []
  });

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const addComponent = useCallback((type: string, position?: { x: number; y: number }) => {
    const newComponent: ReportComponent = {
      id: `component-${Date.now()}`,
      type: type as ReportComponent['type'],
      title: `New ${type}`,
      dataSource: DATA_SOURCES[0],
      config: {},
      position: position ? { ...position, width: 300, height: 200 } : { x: 0, y: 0, width: 300, height: 200 }
    };

    setReport(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  }, []);

  const updateComponent = useCallback((id: string, updates: Partial<ReportComponent>) => {
    setReport(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === id ? { ...comp, ...updates } : comp
      )
    }));
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setReport(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== id)
    }));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: { type: string }, monitor: DropTargetMonitor) => {
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const position = {
          x: offset.x - rect.left,
          y: offset.y - rect.top,
          width: 300,
          height: 200
        };
        addComponent(item.type, position);
      }
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver()
    })
  }));

  const renderComponent = (component: ReportComponent) => {
    const isSelected = selectedComponent === component.id;

    return (
      <div
        key={component.id}
        className={`absolute border-2 rounded-lg bg-white dark:bg-slate-800 cursor-move transition-all ${
          isSelected ? 'border-blue-500 shadow-lg' : 'border-slate-200 dark:border-slate-700'
        }`}
        style={{
          left: component.position.x,
          top: component.position.y,
          width: component.position.width,
          height: component.position.height,
          minWidth: 200,
          minHeight: 150
        }}
        onClick={() => setSelectedComponent(component.id)}
      >
        {/* Component Header */}
        <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-lg">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {component.title}
          </h4>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Duplicate component
                const newComponent = {
                  ...component,
                  id: `component-${Date.now()}`,
                  position: {
                    ...component.position,
                    x: component.position.x + 20,
                    y: component.position.y + 20
                  }
                };
                setReport(prev => ({
                  ...prev,
                  components: [...prev.components, newComponent]
                }));
              }}
              className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              title="Duplicate Component"
              aria-label="Duplicate Component"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteComponent(component.id);
              }}
              className="p-1 text-red-500 hover:text-red-700"
              title="Delete Component"
              aria-label="Delete Component"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Component Content */}
        <div className="p-4 h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
          {component.type === 'chart' && (
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{component.chartType || 'bar'} chart</p>
              <p className="text-xs mt-1">Data: {component.dataSource}</p>
            </div>
          )}
          {component.type === 'table' && (
            <div className="text-center">
              <Table className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Data Table</p>
              <p className="text-xs mt-1">Source: {component.dataSource}</p>
            </div>
          )}
          {component.type === 'metric' && (
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Metric Card</p>
              <p className="text-xs mt-1">Value: 1,234</p>
            </div>
          )}
          {component.type === 'text' && (
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Text Block</p>
              <p className="text-xs mt-1">Custom content</p>
            </div>
          )}
        </div>

        {/* Resize Handle */}
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Report Builder
            </h1>
            <input
              type="text"
              value={report.title}
              onChange={(e) => setReport(prev => ({ ...prev, title: e.target.value }))}
              className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
              placeholder="Report Title"
              aria-label="Report Title"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview?.(report)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => onSave?.(report)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Report
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Component Palette */}
          <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
              Components
            </h3>

            <div className="space-y-2">
              {COMPONENT_TYPES.map((compType) => (
                <div key={compType.type}>
                  {compType.chartTypes ? (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Charts
                      </p>
                      {compType.chartTypes.map((chartType) => (
                        <div
                          key={chartType}
                          className="flex items-center gap-2 p-2 rounded-md border border-dashed border-slate-300 dark:border-slate-600 cursor-move hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify({
                              type: 'chart',
                              chartType
                            }));
                          }}
                        >
                          <compType.icon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                            {chartType} Chart
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 p-2 rounded-md border border-dashed border-slate-300 dark:border-slate-600 cursor-move hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: compType.type
                        }));
                      }}
                    >
                      <compType.icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {compType.label}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Data Sources */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                Data Sources
              </h4>
              <div className="space-y-1">
                {DATA_SOURCES.map((source) => (
                  <div
                    key={source}
                    className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                  >
                    {source.replace('_', ' ')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={(node) => {
                canvasRef.current = node;
                drop(node);
              }}
              className={`h-full bg-slate-100 dark:bg-slate-900 relative overflow-auto ${
                isOver ? 'bg-blue-50 dark:bg-blue-950' : ''
              }`}
              style={{
                backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            >
              {report.components.map(renderComponent)}

              {report.components.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Start Building Your Report</p>
                    <p className="text-sm">Drag components from the left panel to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Panel */}
          {selectedComponent && (
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
                Component Properties
              </h3>

              {(() => {
                const component = report.components.find(c => c.id === selectedComponent);
                if (!component) return null;

                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={component.title}
                        onChange={(e) => updateComponent(component.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                        aria-label="Component Title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Data Source
                      </label>
                      <select
                        value={component.dataSource}
                        onChange={(e) => updateComponent(component.id, { dataSource: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                        aria-label="Data Source"
                      >
                        {DATA_SOURCES.map((source) => (
                          <option key={source} value={source}>
                            {source.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {component.type === 'chart' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Chart Type
                        </label>
                        <select
                          value={component.chartType || 'bar'}
                          onChange={(e) => updateComponent(component.id, { chartType: e.target.value as 'bar' | 'line' | 'pie' | 'area' })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                          aria-label="Chart Type"
                        >
                          <option value="bar">Bar Chart</option>
                          <option value="line">Line Chart</option>
                          <option value="pie">Pie Chart</option>
                          <option value="area">Area Chart</option>
                        </select>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteComponent(component.id)}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Component
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}