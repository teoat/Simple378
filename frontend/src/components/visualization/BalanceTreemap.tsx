import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface BalanceTreemapProps {
  data: Array<{ name: string; children: Array<{ name: string; size: number }> }>;
}

// Custom Content for Treemap cell
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? '#3b82f6' : 'none',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
      ) : null}
      {depth === 1 ? (
        <text
          x={x + 4}
          y={y + 18}
          fill="#fff"
          fontSize={16}
          fontWeight="bold"
          fillOpacity={0.9}
        >
          {index + 1}
        </text>
      ) : null}
    </g>
  );
};

export function BalanceTreemap({ data }: BalanceTreemapProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Balance Sheet Composition</h3>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          stroke="#fff"
          fill="#3b82f6"
          aspectRatio={4 / 3}
          content={<CustomizedContent />}
        >
          <Tooltip />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
