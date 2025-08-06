import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { sqliteService } from '../../services/sqlite-service';
import type { TableRow, Column } from '../../types/database';

interface RowEditorProps {
  mode: 'add' | 'edit';
  tableName: string;
  existingRow?: TableRow;
  columns: Column[];
  onSave: () => void;
  onCancel: () => void;
}

export function RowEditor({ 
  mode, 
  tableName, 
  existingRow, 
  columns, 
  onSave, 
  onCancel 
}: RowEditorProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && existingRow) {
      setFormData(existingRow);
    } else {
      // Initialize form with default values for add mode
      const initialData: Record<string, any> = {};
      columns.forEach(col => {
        if (col.autoIncrement) {
          initialData[col.name] = null; // Auto-increment fields are handled by DB
        } else if (col.defaultValue !== undefined) {
          initialData[col.name] = col.defaultValue;
        } else {
          initialData[col.name] = '';
        }
      });
      setFormData(initialData);
    }
  }, [mode, existingRow, columns]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    columns.forEach(col => {
      const value = formData[col.name];
      
      // Check required fields
      if (!col.nullable && !col.autoIncrement && (value === null || value === '' || value === undefined)) {
        newErrors[col.name] = `${col.name} is required`;
      }
      
      // Type validation
      if (value !== null && value !== '' && value !== undefined) {
        switch (col.type) {
          case 'INTEGER':
            if (isNaN(Number(value))) {
              newErrors[col.name] = `${col.name} must be a number`;
            }
            break;
          case 'REAL':
            if (isNaN(Number(value))) {
              newErrors[col.name] = `${col.name} must be a decimal number`;
            }
            break;
          // Add more type validations as needed
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    
    try {
      if (mode === 'add') {
        // Filter out auto-increment fields for insert
        const insertData: TableRow = {};
        columns.forEach(col => {
          if (!col.autoIncrement) {
            insertData[col.name] = formData[col.name] || null;
          }
        });
        
        await sqliteService.insertRow(tableName, insertData);
      } else {
        // For edit mode, we need to construct a WHERE clause
        // In a real app, you'd use primary keys, but for simplicity we'll use all original values
        if (!existingRow) throw new Error('No existing row data for update');
        
        const whereConditions = Object.entries(existingRow)
          .map(([key, value]) => `${key} = ${value === null ? 'NULL' : `'${value}'`}`)
          .join(' AND ');
        
        const updateData: Partial<TableRow> = {};
        columns.forEach(col => {
          if (formData[col.name] !== existingRow[col.name]) {
            updateData[col.name] = formData[col.name] || null;
          }
        });
        
        if (Object.keys(updateData).length > 0) {
          await sqliteService.updateRow(tableName, whereConditions, updateData);
        }
      }
      
      onSave(); // Trigger refresh
    } catch (error) {
      console.error('Failed to save row:', error);
      setErrors({
        _general: error instanceof Error ? error.message : 'Failed to save row'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (columnName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[columnName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnName];
        return newErrors;
      });
    }
  };

  const renderField = (column: Column) => {
    const value = formData[column.name] ?? '';
    const error = errors[column.name];
    
    if (column.autoIncrement && mode === 'add') {
      return (
        <div key={column.name} className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">
            {column.name} {column.primaryKey && '(Primary Key)'}
          </label>
          <input
            type="text"
            value="Auto-generated"
            disabled
            className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed"
          />
        </div>
      );
    }

    return (
      <div key={column.name} className="space-y-1">
        <label className="text-sm font-medium">
          {column.name}
          {!column.nullable && !column.autoIncrement && <span className="text-destructive ml-1">*</span>}
          {column.primaryKey && <span className="text-xs text-muted-foreground ml-1">(PK)</span>}
        </label>
        <input
          type={column.type === 'INTEGER' || column.type === 'REAL' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleFieldChange(column.name, e.target.value)}
          placeholder={column.nullable ? 'Optional' : 'Required'}
          className={`w-full px-3 py-2 border rounded-md ${
            error ? 'border-destructive focus:border-destructive' : ''
          }`}
          disabled={saving}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">
            {mode === 'add' ? 'Add New Row' : 'Edit Row'} - {tableName}
          </h2>
        </div>
        
        {/* Form */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {errors._general && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-destructive text-sm">{errors._general}</p>
            </div>
          )}
          
          {columns.map(renderField)}
        </div>
        
        {/* Actions */}
        <div className="border-t p-4 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : mode === 'add' ? 'Add Row' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}