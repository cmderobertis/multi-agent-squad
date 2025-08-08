import React, { useMemo } from 'react';
import { Button } from '../../ui/button';
import { SearchableSelect } from '../../ui/searchable-select';
import { useQueryBuilderStore } from '../../../stores/query-builder-store';
import { useDatabaseStore } from '../../../stores/database-store';
import { cn } from '../../../utils/cn';
import type { QueryJoin } from '../../../types/database';
import type { QueryBuilderMode } from '../../../types/query-builder';

interface JoinBuilderProps {
  selectedTables: string[];
  joins: QueryJoin[];
  mode: QueryBuilderMode;
}

export const JoinBuilder: React.FC<JoinBuilderProps> = ({
  selectedTables,
  joins: _propJoins,
  mode: _mode
}) => {
  const { tables } = useDatabaseStore();
  const { 
    addJoin, 
    updateJoin, 
    removeJoin, 
    clearJoins,
    currentQuery 
  } = useQueryBuilderStore();

  // Use live state from store
  const joins = currentQuery.joins;

  // Get available tables and their columns for JOIN dropdowns
  const availableTables = useMemo(() => {
    return tables.filter(table => selectedTables.includes(table.name));
  }, [tables, selectedTables]);

  // Get available columns for a specific table (for future use)
  // const getTableColumns = (tableName: string) => {
  //   const table = tables.find(t => t.name === tableName);
  //   return table?.columns || [];
  // };

  // Create a new empty JOIN
  const handleAddJoin = () => {
    if (selectedTables.length < 2) return;
    
    const newJoin: QueryJoin = {
      type: 'INNER',
      table: selectedTables[1], // Default to second table
      on: {
        leftColumn: '',
        rightColumn: ''
      }
    };
    
    addJoin(newJoin);
  };

  // Update JOIN type (INNER, LEFT, RIGHT, FULL OUTER)
  const handleJoinTypeChange = (index: number, type: QueryJoin['type']) => {
    const join = joins[index];
    if (join) {
      updateJoin(index, { ...join, type });
    }
  };

  // Update JOIN table
  const handleJoinTableChange = (index: number, tableName: string) => {
    const join = joins[index];
    if (join) {
      updateJoin(index, { 
        ...join, 
        table: tableName,
        on: { leftColumn: '', rightColumn: '' } // Reset columns when table changes
      });
    }
  };

  // Update JOIN columns
  const handleJoinColumnChange = (index: number, side: 'left' | 'right', column: string) => {
    const join = joins[index];
    if (join) {
      const newOn = { ...join.on };
      if (side === 'left') {
        newOn.leftColumn = column;
      } else {
        newOn.rightColumn = column;
      }
      updateJoin(index, { ...join, on: newOn });
    }
  };

  if (selectedTables.length < 2) {
    return (
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-2">Table Joins</h3>
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">🔗</div>
          <p className="text-sm">Select at least 2 tables to create joins</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Table Joins</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddJoin}
            className="text-xs h-6 px-2"
          >
            Add JOIN
          </Button>
          {joins.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearJoins}
              className="text-xs h-6 px-2"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Join Instructions */}
      {joins.length === 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Create JOINs to combine data from multiple tables. 
            Choose columns that have matching values (like foreign keys).
          </div>
        </div>
      )}

      {/* Join List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {joins.map((join, index) => {
          const joinTable = availableTables.find(t => t.name === join.table);
          const leftColumns = availableTables.flatMap(table => 
            table.columns.map(col => `${table.name}.${col.name}`)
          );
          const rightColumns = joinTable ? joinTable.columns.map(col => `${join.table}.${col.name}`) : [];

          return (
            <div key={index} className="border rounded-lg p-3 space-y-3 bg-card">
              {/* Join Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">JOIN #{index + 1}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {join.type}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeJoin(index)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>

              {/* Join Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* JOIN Type */}
                <div>
                  <label className="text-xs font-medium block mb-1">JOIN Type</label>
                  <SearchableSelect
                    value={join.type}
                    onChange={(value) => handleJoinTypeChange(index, value as QueryJoin['type'])}
                    options={[
                      { value: 'INNER', label: 'INNER JOIN' },
                      { value: 'LEFT', label: 'LEFT JOIN' },
                      { value: 'RIGHT', label: 'RIGHT JOIN' },
                      { value: 'FULL OUTER', label: 'FULL OUTER JOIN' }
                    ]}
                    placeholder="Select JOIN type..."
                    className="text-sm"
                  />
                </div>

                {/* Target Table */}
                <div>
                  <label className="text-xs font-medium block mb-1">Table</label>
                  <SearchableSelect
                    value={join.table}
                    onChange={(value) => handleJoinTableChange(index, value)}
                    options={selectedTables.map(tableName => ({
                      value: tableName,
                      label: tableName
                    }))}
                    placeholder="Select table..."
                    className="text-sm"
                  />
                </div>

                {/* Join Condition Indicator */}
                <div className="flex items-end">
                  <div className={cn(
                    "w-full px-2 py-1 text-xs rounded border text-center",
                    join.on.leftColumn && join.on.rightColumn
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  )}>
                    {join.on.leftColumn && join.on.rightColumn ? "✓ Configured" : "⚠ Incomplete"}
                  </div>
                </div>
              </div>

              {/* ON Clause */}
              <div className="space-y-2">
                <label className="text-xs font-medium block">ON Condition</label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                  {/* Left Column */}
                  <div className="md:col-span-2">
                    <SearchableSelect
                      value={join.on.leftColumn}
                      onChange={(value) => handleJoinColumnChange(index, 'left', value)}
                      options={leftColumns.map(column => {
                        const [table, _col] = column.split('.');
                        return {
                          value: column,
                          label: column,
                          group: table
                        };
                      })}
                      placeholder="Select left column..."
                      className="text-sm"
                    />
                  </div>

                  {/* Equals Sign */}
                  <div className="text-center">
                    <span className="text-sm font-medium">=</span>
                  </div>

                  {/* Right Column */}
                  <div className="md:col-span-2">
                    <SearchableSelect
                      value={join.on.rightColumn}
                      onChange={(value) => handleJoinColumnChange(index, 'right', value)}
                      options={rightColumns.map(column => {
                        const [table, _col] = column.split('.');
                        return {
                          value: column,
                          label: column,
                          group: table
                        };
                      })}
                      placeholder="Select right column..."
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Join Preview */}
              {join.on.leftColumn && join.on.rightColumn && (
                <div className="p-2 bg-gray-50 rounded text-sm font-mono">
                  {join.type} JOIN {join.table} ON {join.on.leftColumn} = {join.on.rightColumn}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Join Summary */}
      {joins.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <div className="text-sm font-medium text-green-900 mb-2">
            Active Joins ({joins.length})
          </div>
          <div className="space-y-1">
            {joins.map((join, index) => (
              <div key={index} className="text-xs text-green-800 font-mono">
                {join.type} JOIN {join.table}
                {join.on.leftColumn && join.on.rightColumn && 
                  ` ON ${join.on.leftColumn} = ${join.on.rightColumn}`
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};