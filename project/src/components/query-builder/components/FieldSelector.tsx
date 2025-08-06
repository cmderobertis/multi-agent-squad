import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { useQueryBuilderStore } from '../../../stores/query-builder-store';
import { useDatabaseStore } from '../../../stores/database-store';
import { cn } from '../../../utils/cn';
import type { SelectedColumn, QueryBuilderMode } from '../../../types/query-builder';

interface FieldSelectorProps {
  selectedTables: string[];
  selectedColumns: SelectedColumn[];
  mode: QueryBuilderMode;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({
  selectedTables,
  selectedColumns,
  mode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(selectedTables));
  
  const { tables } = useDatabaseStore();
  const { 
    toggleColumn, 
    clearSelectedColumns, 
    selectAllColumns, 
    updateColumnAlias 
  } = useQueryBuilderStore();

  // Removed filteredColumns as it's not used in favor of inline filtering

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const isColumnSelected = (table: string, column: string) => {
    return selectedColumns.some(col => col.table === table && col.column === column);
  };

  const getColumnAlias = (table: string, column: string) => {
    const selectedCol = selectedColumns.find(col => col.table === table && col.column === column);
    return selectedCol?.alias || '';
  };

  const handleColumnToggle = (table: string, column: string) => {
    toggleColumn({ table, column });
  };

  const handleAliasChange = (table: string, column: string, alias: string) => {
    const index = selectedColumns.findIndex(col => col.table === table && col.column === column);
    if (index >= 0) {
      updateColumnAlias(index, alias);
    }
  };

  const selectTableColumns = (tableName: string) => {
    const table = tables.find(t => t.name === tableName);
    if (table) {
      table.columns.forEach(col => {
        if (!isColumnSelected(tableName, col.name)) {
          toggleColumn({ table: tableName, column: col.name });
        }
      });
    }
  };

  const deselectTableColumns = (tableName: string) => {
    const table = tables.find(t => t.name === tableName);
    if (table) {
      table.columns.forEach(col => {
        if (isColumnSelected(tableName, col.name)) {
          toggleColumn({ table: tableName, column: col.name });
        }
      });
    }
  };

  if (selectedTables.length === 0) {
    return (
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-2">Select Fields</h3>
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm">Select tables first to choose fields</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Select Fields</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={selectAllColumns}
            className="text-xs h-6 px-2"
          >
            Select All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelectedColumns}
            className="text-xs h-6 px-2"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <div className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400">
          🔍
        </div>
      </div>

      {/* Column Selection */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {selectedTables.map(tableName => {
          const table = tables.find(t => t.name === tableName);
          if (!table) return null;

          const isExpanded = expandedTables.has(tableName);
          const tableColumns = table.columns.filter(col =>
            !searchTerm || 
            col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tableName.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          const selectedTableColumns = selectedColumns.filter(col => col.table === tableName);

          return (
            <div key={tableName} className="border rounded-lg">
              {/* Table Header */}
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleTableExpansion(tableName)}
                    className="p-1 hover:bg-background rounded"
                  >
                    <div className={cn(
                      "w-3 h-3 transition-transform",
                      isExpanded ? "rotate-90" : ""
                    )}>
                      ▶
                    </div>
                  </button>
                  <h4 className="font-medium text-sm">{tableName}</h4>
                  <span className="text-xs text-muted-foreground">
                    ({selectedTableColumns.length}/{table.columns.length})
                  </span>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => selectTableColumns(tableName)}
                    className="text-xs h-6 px-2"
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deselectTableColumns(tableName)}
                    className="text-xs h-6 px-2"
                  >
                    None
                  </Button>
                </div>
              </div>

              {/* Columns */}
              {isExpanded && (
                <div className="p-2 space-y-1">
                  {tableColumns.map(column => {
                    const isSelected = isColumnSelected(tableName, column.name);
                    const alias = getColumnAlias(tableName, column.name);

                    return (
                      <div key={column.name} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                        {/* Checkbox */}
                        <div
                          className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          )}
                          onClick={() => handleColumnToggle(tableName, column.name)}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-sm" />
                          )}
                        </div>

                        {/* Column info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">{column.name}</span>
                            
                            {/* Type badges */}
                            <div className="flex items-center space-x-1">
                              {column.primaryKey && (
                                <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                                  PK
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                                {column.type}
                              </span>
                              {!column.nullable && (
                                <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                  NOT NULL
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Alias input (Advanced mode) */}
                        {mode === 'advanced' && isSelected && (
                          <input
                            type="text"
                            placeholder="alias"
                            value={alias}
                            onChange={(e) => handleAliasChange(tableName, column.name, e.target.value)}
                            className="w-20 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected columns summary */}
      {selectedColumns.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm font-medium text-blue-900 mb-2">
            Selected Fields ({selectedColumns.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedColumns.map((col) => (
              <div
                key={`${col.table}.${col.column}`}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
              >
                <span className="font-mono">
                  {col.table}.{col.column}
                  {col.alias && ` as ${col.alias}`}
                </span>
                <button
                  onClick={() => toggleColumn(col)}
                  className="ml-1 hover:bg-blue-200 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};