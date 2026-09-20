import React from 'react';

export interface TableColumn<T> {
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyText = 'No data available',
  onRowClick,
  isLoading = false,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((_, cIdx) => (
                  <td key={cIdx} className="px-4 py-4">
                    <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500 dark:text-zinc-400 font-medium">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 cursor-pointer' : ''
                }`}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={`px-4 py-3.5 ${col.className || ''}`}>
                    {col.cell ? col.cell(row) : col.accessor ? String(row[col.accessor] ?? '') : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
