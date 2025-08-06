import { useState } from 'react';
import { Button } from '../ui/button';
import { useDatabaseStore } from '../../stores/database-store';
import { sqliteService } from '../../services/sqlite-service';
import type { Column, SQLiteDataType } from '../../types/database';

interface CreateTableData {
  name: string;
  columns: Column[];
}

interface TableManagerProps {
  onTableCreated: () => void;
}

export function TableManager({ onTableCreated }: TableManagerProps) {
  const { currentDatabase } = useDatabaseStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTable, setNewTable] = useState<CreateTableData>({
    name: '',
    columns: []
  });
  const [creating, setCreating] = useState(false);

  const addColumn = () => {
    setNewTable(prev => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          name: '',
          type: 'TEXT' as SQLiteDataType,
          nullable: true,
          primaryKey: false,
          autoIncrement: false,
          unique: false,
          defaultValue: undefined
        }
      ]
    }));
  };

  const updateColumn = (index: number, updates: Partial<Column>) => {
    setNewTable(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === index ? { ...col, ...updates } : col
      )
    }));
  };

  const removeColumn = (index: number) => {
    setNewTable(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }));
  };

  const handleCreateTable = async () => {
    if (!newTable.name.trim() || newTable.columns.length === 0) {
      alert('Please provide a table name and at least one column');
      return;
    }

    // Validate column names
    const invalidColumns = newTable.columns.filter(col => !col.name.trim());
    if (invalidColumns.length > 0) {
      alert('All columns must have a name');
      return;
    }

    setCreating(true);
    
    try {
      await sqliteService.createTable(newTable.name, newTable.columns);
      
      // Reset form
      setNewTable({ name: '', columns: [] });
      setShowCreateDialog(false);
      
      // Notify parent to refresh
      onTableCreated();
      
    } catch (error) {
      console.error('Failed to create table:', error);
      alert(`Failed to create table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  if (!currentDatabase) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No database connected</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Table Management</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create New Table
        </Button>
      </div>

      {/* Existing Tables */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Existing Tables ({currentDatabase.tables.length})</h3>
        
        {currentDatabase.tables.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tables found in the database</p>
            <p className="text-sm">Create your first table to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentDatabase.tables.map((table) => (
              <div key={table.name} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{table.name}</h4>
                  <span className="text-sm text-muted-foreground">
                    {table.rowCount} rows
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {table.columns.length} columns
                </div>
                <div className="space-y-1">
                  {table.columns.slice(0, 3).map((col) => (
                    <div key={col.name} className="text-xs flex items-center space-x-2">
                      <span className="font-mono text-primary">{col.name}</span>
                      <span className="text-muted-foreground">{col.type}</span>
                      {col.primaryKey && <span className="bg-primary/10 text-primary px-1 rounded">PK</span>}
                    </div>
                  ))}
                  {table.columns.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{table.columns.length - 3} more columns
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Table Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Create New Table</h2>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto p-4 space-y-6">
              {/* Table Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Table Name</label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter table name"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Columns */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Columns</label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={addColumn}
                  >
                    Add Column
                  </Button>
                </div>

                {newTable.columns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No columns defined</p>
                    <p className="text-sm">Click "Add Column" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newTable.columns.map((column, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium">Column Name</label>
                            <input
                              type="text"
                              value={column.name}
                              onChange={(e) => updateColumn(index, { name: e.target.value })}
                              placeholder="column_name"
                              className="w-full px-2 py-1 text-sm border rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Type</label>
                            <select
                              value={column.type}
                              onChange={(e) => updateColumn(index, { type: e.target.value as SQLiteDataType })}
                              className="w-full px-2 py-1 text-sm border rounded"
                            >
                              <option value="TEXT">TEXT</option>
                              <option value="INTEGER">INTEGER</option>
                              <option value="REAL">REAL</option>
                              <option value="BLOB">BLOB</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <label className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={column.primaryKey}
                              onChange={(e) => updateColumn(index, { primaryKey: e.target.checked })}
                            />
                            <span>Primary Key</span>
                          </label>
                          
                          <label className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={!column.nullable}
                              onChange={(e) => updateColumn(index, { nullable: !e.target.checked })}
                            />
                            <span>Required</span>
                          </label>
                          
                          <label className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={column.unique}
                              onChange={(e) => updateColumn(index, { unique: e.target.checked })}
                            />
                            <span>Unique</span>
                          </label>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeColumn(index)}
                            className="ml-auto"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t p-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewTable({ name: '', columns: [] });
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTable}
                disabled={creating || !newTable.name.trim() || newTable.columns.length === 0}
              >
                {creating ? 'Creating...' : 'Create Table'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}