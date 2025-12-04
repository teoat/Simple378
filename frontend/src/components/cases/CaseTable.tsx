import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { RiskBar } from './RiskBar';
import { StatusBadge } from './StatusBadge';
import { QuickPreview } from './QuickPreview';
import { cn } from '../../lib/utils';

const SortIcon = ({ column, sortBy, sortOrder }: { column: string; sortBy: string; sortOrder: 'asc' | 'desc' }) => {
  if (sortBy !== column) return null;
  return sortOrder === 'asc' ? (
    <ArrowUp className="h-3 w-3 inline-block ml-1" />
  ) : (
    <ArrowDown className="h-3 w-3 inline-block ml-1" />
  );
};

interface Case {
  id: string;
  subject_name: string;
  risk_score: number;
  status: string;
  created_at: string;
  assigned_to: string;
}

interface CaseTableProps {
  cases: Case[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  selectedCases: Set<string>;
  onSelectCase: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  hoveredCase: string | null;
  onHoverCase: (id: string | null) => void;
  mousePos: { x: number; y: number };
  onMouseMove: (e: React.MouseEvent) => void;
}

export function CaseTable({
  cases,
  sortBy,
  sortOrder,
  onSort,
  selectedCases,
  onSelectCase,
  onSelectAll,
  hoveredCase,
  onHoverCase,
  mousePos,
  onMouseMove,
}: CaseTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <div className="relative">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table ref={tableRef} className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedCases.size === cases.length && cases.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                onClick={() => onSort('subject_name')}
              >
                Subject
                <SortIcon column="subject_name" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                onClick={() => onSort('risk_score')}
              >
                Risk Score
                <SortIcon column="risk_score" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                onClick={() => onSort('status')}
              >
                Status
                <SortIcon column="status" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                onClick={() => onSort('created_at')}
              >
                Created
                <SortIcon column="created_at" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                onClick={() => onSort('assigned_to')}
              >
                Assigned To
                <SortIcon column="assigned_to" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {cases.map((case_) => (
              <motion.tr
                key={case_.id}
                className={cn(
                  "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                  selectedCases.has(case_.id) && "bg-blue-50 dark:bg-blue-900/20"
                )}
                onMouseEnter={() => onHoverCase(case_.id)}
                onMouseLeave={() => onHoverCase(null)}
                onMouseMove={onMouseMove}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.1 }}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCases.has(case_.id)}
                    onChange={() => onSelectCase(case_.id)}
                    className="rounded border-slate-300 dark:border-slate-600"
                  />
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/cases/${case_.id}`}
                    className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  >
                    {case_.subject_name}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32">
                    <RiskBar score={case_.risk_score} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={case_.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {new Date(case_.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {case_.assigned_to || 'Unassigned'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Preview */}
      {hoveredCase && (
        <QuickPreview
          isOpen={true}
          data={cases.find(c => c.id === hoveredCase)!}
          position={mousePos}
        />
      )}
    </div>
  );
}