import { Sankey, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface SankeyNode {
  id: string;
  name: string;
  color?: string;
}

interface SankeyLink {
  source: string | number;
  target: string | number;
  value: number;
  color?: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyFlowProps {
  title?: string;
  data?: SankeyData;
  nodes?: SankeyNode[];
  links?: SankeyLink[];
  height?: number;
  onExport?: (id: string) => void;
  fitToContainer?: boolean;
}

export function SankeyFlow({
  title = 'Financial Flow (Sankey)',
  data,
  nodes: propNodes,
  links: propLinks,
  height = 360,
  onExport,
  fitToContainer,
}: SankeyFlowProps) {
  // Use data prop if provided, otherwise fall back to individual props
  const nodes = data ? data.nodes : (propNodes || []);
  const links = data ? data.links.map(link => ({
    source: typeof link.source === 'string' ? nodes.findIndex(n => n.id === link.source) : link.source,
    target: typeof link.target === 'string' ? nodes.findIndex(n => n.id === link.target) : link.target,
    value: link.value,
    color: link.color
  })) : (propLinks || []);
  const chartId = `sankey-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {onExport && (
          <Button size="sm" variant="outline" onClick={() => onExport(chartId)}>
            Export SVG/PNG
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {nodes.length === 0 || links.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <p>No financial flow data available</p>
              <p className="text-sm">Transaction data will appear here</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <Sankey
              data={{ nodes, links }}
              nodePadding={18}
              margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
              linkCurvature={0.5}
            >
              <Tooltip
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name
                ]}
                labelFormatter={(label) => `Flow: ${label}`}
              />
              <Legend />
            </Sankey>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default SankeyFlow;
