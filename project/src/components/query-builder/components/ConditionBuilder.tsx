import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { SearchableSelect } from '../../ui/searchable-select';
import { useQueryBuilderStore } from '../../../stores/query-builder-store';
import { useDatabaseStore } from '../../../stores/database-store';
import { cn } from '../../../utils/cn';
import type { QueryCondition } from '../../../types/database';
import type { QueryBuilderMode } from '../../../types/query-builder';

interface ConditionBuilderProps {
  conditions: QueryCondition[];
  availableTables: string[];
  mode: QueryBuilderMode;
}

const OPERATORS = [
  { value: 'equals', label: 'Equals', symbol: '=' },
  { value: 'not_equals', label: 'Not Equals', symbol: '!=' },
  { value: 'greater_than', label: 'Greater Than', symbol: '>' },
  { value: 'less_than', label: 'Less Than', symbol: '<' },
  { value: 'like', label: 'Contains', symbol: 'LIKE' },
  { value: 'in', label: 'In List', symbol: 'IN' },
  { value: 'is_null', label: 'Is Empty', symbol: 'IS NULL' },
  { value: 'is_not_null', label: 'Is Not Empty', symbol: 'IS NOT NULL' },
] as const;

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  conditions,
  availableTables,
  mode
}) => {
  const { tables } = useDatabaseStore();
  const {
    addCondition,
    updateCondition,
    removeCondition,
    clearConditions
  } = useQueryBuilderStore();

  const availableColumns = React.useMemo(() => {
    return availableTables.flatMap(tableName => {
      const table = tables.find(t => t.name === tableName);
      return table ? table.columns.map(col => ({
        value: `${tableName}.${col.name}`,
        label: `${tableName}.${col.name}`,
        table: tableName,
        column: col.name,
        type: col.type
      })) : [];
    });
  }, [availableTables, tables]);

  const handleConditionChange = (index: number, field: keyof QueryCondition, value: any) => {
    const condition = conditions[index];
    if (condition) {
      updateCondition(index, { ...condition, [field]: value });
    }
  };

  if (availableTables.length === 0) {
    return (
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-2">Conditions (WHERE)</h3>
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">Select tables first to add conditions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Conditions (WHERE)</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={addCondition}
            className="text-xs h-7 px-3"
          >
            ➕ Add Condition
          </Button>
          {conditions.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearConditions}
              className="text-xs h-7 px-2"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {conditions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm mb-2">No conditions added</p>
          <p className="text-xs">Click "Add Condition" to filter your results</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <ConditionRow
              key={index}
              condition={condition}
              index={index}
              availableColumns={availableColumns}
              showLogicalOperator={index > 0}
              mode={mode}
              onChange={handleConditionChange}
              onRemove={() => removeCondition(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ConditionRowProps {
  condition: QueryCondition;
  index: number;
  availableColumns: Array<{
    value: string;
    label: string;
    table: string;
    column: string;
    type: string;
  }>;
  showLogicalOperator: boolean;
  mode: QueryBuilderMode;
  onChange: (index: number, field: keyof QueryCondition, value: any) => void;
  onRemove: () => void;
}

const ConditionRow: React.FC<ConditionRowProps> = ({
  condition,
  index,
  availableColumns,
  showLogicalOperator,
  mode,
  onChange,
  onRemove
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedColumn = availableColumns.find(col => col.value === condition.column);
  const needsValue = !['is_null', 'is_not_null'].includes(condition.operator);

  const renderValueInput = () => {
    if (!needsValue) return null;

    const inputProps = {
      value: condition.value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange(index, 'value', e.target.value),
      className: "px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
      placeholder: "Enter value..."
    };

    switch (condition.operator) {
      case 'in':
        return (
          <textarea
            {...inputProps}
            placeholder="Enter values separated by commas"
            rows={2}
            className={cn(inputProps.className, "resize-none")}
          />
        );
      
      case 'like':
        return (
          <input
            {...inputProps}
            placeholder="Search text..."
          />
        );
      
      default:
        return (
          <input
            {...inputProps}
            type={selectedColumn?.type === 'INTEGER' || selectedColumn?.type === 'REAL' ? 'number' : 'text'}
          />
        );
    }
  };

  return (
    <div className="flex items-start gap-2 p-3 border rounded-lg bg-gray-50">
      {/* Logical operator */}
      {showLogicalOperator && (
        <SearchableSelect
          value={condition.logicalOperator || 'AND'}
          onChange={(value) => onChange(index, 'logicalOperator', value)}
          options={[
            { value: 'AND', label: 'AND' },
            { value: 'OR', label: 'OR' }
          ]}
          className="text-sm min-w-20"
        />
      )}

      {/* Column selector */}
      <div className="flex-1">
        <SearchableSelect
          value={condition.column}
          onChange={(value) => onChange(index, 'column', value)}
          options={availableColumns.map(col => ({
            value: col.value,
            label: `${col.label} (${col.type})`,
            group: col.table
          }))}
          placeholder="Select field..."
          className="text-sm"
        />
      </div>

      {/* Operator selector */}
      <div className="min-w-32">
        <SearchableSelect
          value={condition.operator}
          onChange={(value) => onChange(index, 'operator', value)}
          options={OPERATORS.map(op => ({
            value: op.value,
            label: mode === 'simple' ? op.label : `${op.label} (${op.symbol})`
          }))}
          placeholder="Select operator..."
          className="text-sm"
        />
      </div>

      {/* Value input */}
      {needsValue && (
        <div className="flex-1">
          {renderValueInput()}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        {mode === 'advanced' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-8 w-8 p-0"
          >
            ⚙️
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          🗑️
        </Button>
      </div>

      {/* Advanced options */}
      {mode === 'advanced' && showAdvanced && (
        <div className="absolute z-10 mt-2 p-3 bg-white border rounded-lg shadow-lg">
          <div className="text-xs font-medium mb-2">Advanced Options</div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs">
              <input type="checkbox" />
              <span>Case sensitive</span>
            </label>
            <label className="flex items-center space-x-2 text-xs">
              <input type="checkbox" />
              <span>Use parentheses</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};