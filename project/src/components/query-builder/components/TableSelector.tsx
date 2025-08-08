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
  selectedTables: _propSelectedTables,
  mode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  
  const { addTable, removeTable, currentQuery } = useQueryBuilderStore();
  
  // Use the live state from the store instead of props to ensure reactivity
  const selectedTables = currentQuery.selectedTables;

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

              const isPrimary = currentQuery.primaryTable === table.name;

              return (
                <div key={table.name} className="group">
                  {/* Table Row */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                      isSelected
                        ? isPrimary 
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                    onClick={() => handleTableToggle(table.name)}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        )}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate flex items-center space-x-1">
                          <span>{table.name}</span>
                          {isSelected && currentQuery.tableAliases.length > 0 && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded font-mono">
                              {currentQuery.tableAliases.find(ta => ta.tableName === table.name)?.alias}
                            </span>
                          )}
                          {isPrimary && (
                            <span className="px-1.5 py-0.5 text-xs bg-green-200 text-green-800 rounded font-medium">
                              PRIMARY
                            </span>
                          )}
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