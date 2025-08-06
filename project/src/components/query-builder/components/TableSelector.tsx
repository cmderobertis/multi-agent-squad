import React, { useState, useMemo } from 'react';
import { Button } from '../../ui/button';
import { useQueryBuilderStore } from '../../../stores/query-builder-store';
import { cn } from '../../../utils/cn';
import type { Table } from '../../../types/database';
import type { QueryBuilderMode } from '../../../types/query-builder';

interface TableSelectorProps {
  tables: Table[];
  selectedTables: string[];
  mode: QueryBuilderMode;
}

export const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  selectedTables,
  mode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  
  const { addTable, removeTable } = useQueryBuilderStore();

  const filteredTables = useMemo(() => {
    return tables.filter(table =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tables, searchTerm]);

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const handleTableToggle = (tableName: string) => {
    if (selectedTables.includes(tableName)) {
      removeTable(tableName);
    } else {
      addTable(tableName);
    }
  };

  const clearAllTables = () => {
    selectedTables.forEach(tableName => removeTable(tableName));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Tables</h3>
          {selectedTables.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllTables}
              className="text-xs h-6 px-2"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400">
            🔍
          </div>
        </div>

        {/* Selected tables summary */}
        {selectedTables.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            {selectedTables.length} table{selectedTables.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      {/* Table List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTables.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {tables.length === 0 ? 'No tables found' : 'No tables match your search'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredTables.map((table) => {
              const isSelected = selectedTables.includes(table.name);
              const isExpanded = expandedTables.has(table.name);

              return (
                <div key={table.name} className="group">
                  {/* Table Row */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                    onClick={() => handleTableToggle(table.name)}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-sm" />
                        )}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {table.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {table.rowCount.toLocaleString()} rows • {table.columns.length} columns
                        </div>
                      </div>
                    </div>

                    {/* Expand button */}
                    {mode === 'advanced' && isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTableExpansion(table.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded"
                      >
                        <div className={cn(
                          "w-3 h-3 transition-transform",
                          isExpanded ? "rotate-90" : ""
                        )}>
                          ▶
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Column List (Advanced Mode) */}
                  {mode === 'advanced' && isSelected && isExpanded && (
                    <div className="ml-6 mt-1 mb-2 space-y-1">
                      {table.columns.map((column) => (
                        <div
                          key={column.name}
                          className="flex items-center justify-between p-1.5 text-xs rounded hover:bg-muted/50"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              column.primaryKey
                                ? "bg-yellow-500"
                                : column.nullable
                                ? "bg-gray-300"
                                : "bg-blue-500"
                            )} />
                            <span className="font-mono">{column.name}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {column.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground text-center">
          {tables.length} table{tables.length !== 1 ? 's' : ''} available
        </div>
      </div>
    </div>
  );
};