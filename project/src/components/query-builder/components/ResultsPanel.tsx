import React, { useState, useMemo } from 'react';
import { Button } from '../../ui/button';
import { useQueryBuilderStore } from '../../../stores/query-builder-store';
import { cn } from '../../../utils/cn';
import type { QueryResult } from '../../../types/database';

interface ResultsPanelProps {
  result: QueryResult;
  sql?: string;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { executionMetrics } = useQueryBuilderStore();

  // Pagination
  const totalPages = Math.ceil(result.rows.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, result.rows.length);

  // Sorting
  const sortedRows = useMemo(() => {
    if (!sortColumn) return result.rows;

    return [...result.rows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [result.rows, sortColumn, sortDirection]);

  const paginatedRows = sortedRows.slice(startIndex, endIndex);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = result.columns.join(',');
    const csvContent = [
      headers,
      ...result.rows.map(row => 
        result.columns.map(col => {
          const value = row[col];
          // Escape quotes and wrap in quotes if contains comma or quote
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'query-results.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(result.rows, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'query-results.json';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Query Results</h3>
          
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-sm border rounded"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={200}>200 per page</option>
            </select>
            
            <Button size="sm" variant="outline" onClick={exportToCSV}>
              📊 Export CSV
            </Button>
            
            <Button size="sm" variant="outline" onClick={exportToJSON}>
              📄 Export JSON
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>
            <strong>{result.rows.length.toLocaleString()}</strong> rows returned
          </span>
          
          {executionMetrics && (
            <>
              <span>
                Executed in <strong>{executionMetrics.executionTime.toFixed(2)}ms</strong>
              </span>
              {executionMetrics.rowsReturned !== result.rows.length && (
                <span className="text-orange-600">
                  Results limited to {result.rows.length} rows
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto">
        {result.rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium mb-2">No Results</h3>
              <p className="text-sm">Your query returned no rows</p>
            </div>
          </div>
        ) : (
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50 border-b">
                <tr>
                  {result.columns.map((column) => (
                    <th
                      key={column}
                      className="text-left p-3 font-medium text-sm border-r last:border-r-0 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{column}</span>
                        <div className="ml-2 flex flex-col">
                          <div className={cn(
                            "w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent",
                            sortColumn === column && sortDirection === 'asc'
                              ? "border-b-primary"
                              : "border-b-gray-400"
                          )} />
                          <div className={cn(
                            "w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent mt-0.5",
                            sortColumn === column && sortDirection === 'desc'
                              ? "border-t-primary"
                              : "border-t-gray-400"
                          )} />
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {paginatedRows.map((row, rowIndex) => (
                  <tr
                    key={startIndex + rowIndex}
                    className="border-b hover:bg-gray-50"
                  >
                    {result.columns.map((column) => (
                      <td
                        key={column}
                        className="p-3 text-sm border-r last:border-r-0 max-w-xs"
                      >
                        <div className="truncate" title={String(row[column] ?? '')}>
                          {row[column] === null || row[column] === undefined ? (
                            <span className="text-gray-400 italic">NULL</span>
                          ) : typeof row[column] === 'boolean' ? (
                            <span className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              row[column] 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            )}>
                              {String(row[column])}
                            </span>
                          ) : typeof row[column] === 'number' ? (
                            <span className="font-mono text-blue-600">
                              {row[column].toLocaleString()}
                            </span>
                          ) : (
                            String(row[column])
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {result.rows.length > 0 && totalPages > 1 && (
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{endIndex} of {result.rows.length} rows
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};