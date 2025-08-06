import { useMemo } from 'react';
import type { TableRow } from '../../types/database';

interface DataGridProps {
  data: TableRow[];
  loading: boolean;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  selectedRows: Set<number>;
  onSort: (column: string) => void;
  onRowSelect: (rowIndex: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onRowEdit?: (rowIndex: number) => void;
}

export function DataGrid({
  data,
  loading,
  sortColumn,
  sortDirection,
  selectedRows,
  onSort,
  onRowSelect,
  onSelectAll,
  onRowEdit
}: DataGridProps) {
  // Get column names from first row of data
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const allSelected = selectedRows.size === data.length && data.length > 0;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading table data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No data found</p>
          <p className="text-sm text-muted-foreground">This table is empty or no rows match your search</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="data-table">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="w-12 px-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            {columns.map((column) => (
              <th 
                key={column}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSort(column)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{column}</span>
                  <div className="flex flex-col ml-2">
                    <div 
                      className={`w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent transition-colors ${
                        sortColumn === column && sortDirection === 'asc' 
                          ? 'border-b-primary' 
                          : 'border-b-muted-foreground/30'
                      }`}
                    />
                    <div 
                      className={`w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent mt-[1px] transition-colors ${
                        sortColumn === column && sortDirection === 'desc' 
                          ? 'border-t-primary' 
                          : 'border-t-muted-foreground/30'
                      }`}
                    />
                  </div>
                </div>
              </th>
            ))}
            {onRowEdit && <th className="w-16">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className={`hover:bg-muted/30 transition-colors ${
                selectedRows.has(rowIndex) ? 'bg-primary/10' : ''
              }`}
            >
              <td className="px-2">
                <input
                  type="checkbox"
                  checked={selectedRows.has(rowIndex)}
                  onChange={(e) => onRowSelect(rowIndex, e.target.checked)}
                />
              </td>
              {columns.map((column) => (
                <td 
                  key={column}
                  className="editable-cell"
                  title={String(row[column] ?? '')}
                >
                  <div className="max-w-xs truncate">
                    {row[column] === null ? (
                      <span className="text-muted-foreground italic">NULL</span>
                    ) : row[column] === '' ? (
                      <span className="text-muted-foreground italic">Empty</span>
                    ) : (
                      String(row[column])
                    )}
                  </div>
                </td>
              ))}
              {onRowEdit && (
                <td className="px-2">
                  <button
                    onClick={() => onRowEdit(rowIndex)}
                    className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded transition-colors"
                    title="Edit row"
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Table Stats */}
      <div className="border-t bg-card p-3 sticky bottom-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {data.length} rows
            {selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
          </div>
          <div className="flex items-center space-x-4">
            <span>{columns.length} columns</span>
            <span>Page size: 50</span>
            {onRowEdit && <span>Double-click or use Edit button to modify rows</span>}
          </div>
        </div>
      </div>
    </div>
  );
}