import { useState } from 'react';
import { Button } from '../ui/button';
import { useDatabaseStore } from '../../stores/database-store';
import { sqliteService } from '../../services/sqlite-service';
import type { Column, SQLiteDataType } from '../../types/database';

interface CreateTableData {
  name: string;
  columns: Column[];
}

interface CSVImportData {
  tableName: string;
  columns: Column[];
  rows: any[];
  createTable: boolean;
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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [csvImportData, setCsvImportData] = useState<CSVImportData | null>(null);
  const [importing, setImporting] = useState(false);

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

  const handleCSVFileSelect = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) {
        alert('CSV file must have at least a header row and one data row');
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
      
      // Parse data rows
      const dataRows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: any = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || null;
        });
        return row;
      });

      // Detect column types from data
      const columns: Column[] = headers.map(header => {
        const sampleValues = dataRows.slice(0, 10).map(row => row[header]).filter(v => v !== null && v !== '');
        let type: SQLiteDataType = 'TEXT';
        
        // Simple type detection
        if (sampleValues.length > 0) {
          const isAllNumbers = sampleValues.every(v => !isNaN(Number(v)));
          const isAllIntegers = sampleValues.every(v => Number.isInteger(Number(v)));
          
          if (isAllNumbers) {
            type = isAllIntegers ? 'INTEGER' : 'REAL';
          }
        }

        return {
          name: header.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
          type,
          nullable: true,
          primaryKey: false,
          autoIncrement: false,
          unique: false,
          defaultValue: undefined
        };
      });

      const tableName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      
      setCsvImportData({
        tableName,
        columns,
        rows: dataRows,
        createTable: true
      });
      setShowImportDialog(true);
      
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      alert('Failed to parse CSV file. Please check the file format.');
    }
  };

  const handleImportCSV = async () => {
    if (!csvImportData) return;

    setImporting(true);
    
    try {
      // Create table if needed
      if (csvImportData.createTable) {
        await sqliteService.createTable(csvImportData.tableName, csvImportData.columns);
      }

      // Insert data
      for (const row of csvImportData.rows) {
        // Clean the row data to match column names
        const cleanRow: any = {};
        csvImportData.columns.forEach(col => {
          const originalName = Object.keys(row).find(k => 
            k.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() === col.name
          );
          if (originalName && row[originalName] !== null && row[originalName] !== '') {
            cleanRow[col.name] = row[originalName];
          }
        });
        
        if (Object.keys(cleanRow).length > 0) {
          await sqliteService.insertRow(csvImportData.tableName, cleanRow);
        }
      }

      // Reset and refresh
      setCsvImportData(null);
      setShowImportDialog(false);
      onTableCreated();
      
      alert(`Successfully imported ${csvImportData.rows.length} rows into table "${csvImportData.tableName}"`);
      
    } catch (error) {
      console.error('Failed to import CSV:', error);
      alert(`Failed to import CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
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
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            Create New Table
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = handleCSVFileSelect;
              input.click();
            }}
          >
            Import CSV
          </Button>
        </div>
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

      {/* CSV Import Dialog */}
      {showImportDialog && csvImportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Import CSV File</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review the detected schema and data before importing
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-6">
              {/* Table Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Table Name</label>
                <input
                  type="text"
                  value={csvImportData.tableName}
                  onChange={(e) => setCsvImportData(prev => prev ? { ...prev, tableName: e.target.value } : null)}
                  placeholder="Enter table name"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Schema Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Detected Schema ({csvImportData.columns.length} columns)</label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted p-2 text-sm font-medium border-b">
                    Columns
                  </div>
                  <div className="max-h-48 overflow-auto">
                    {csvImportData.columns.map((col, index) => (
                      <div key={index} className="p-2 border-b last:border-b-0 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="font-mono text-sm">{col.name}</span>
                          <span className="text-sm text-muted-foreground">{col.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={col.type}
                            onChange={(e) => {
                              setCsvImportData(prev => {
                                if (!prev) return null;
                                const newColumns = [...prev.columns];
                                newColumns[index] = { ...newColumns[index], type: e.target.value as SQLiteDataType };
                                return { ...prev, columns: newColumns };
                              });
                            }}
                            className="text-xs px-2 py-1 border rounded"
                          >
                            <option value="TEXT">TEXT</option>
                            <option value="INTEGER">INTEGER</option>
                            <option value="REAL">REAL</option>
                            <option value="BLOB">BLOB</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Preview ({csvImportData.rows.length} rows)</label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {Object.keys(csvImportData.rows[0] || {}).slice(0, 6).map((header) => (
                            <th key={header} className="text-left p-2 border-r last:border-r-0">
                              {header}
                            </th>
                          ))}
                          {Object.keys(csvImportData.rows[0] || {}).length > 6 && (
                            <th className="text-left p-2">...</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {csvImportData.rows.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-b">
                            {Object.keys(csvImportData.rows[0] || {}).slice(0, 6).map((header) => (
                              <td key={header} className="p-2 border-r last:border-r-0 truncate max-w-32">
                                {row[header] || '—'}
                              </td>
                            ))}
                            {Object.keys(csvImportData.rows[0] || {}).length > 6 && (
                              <td className="p-2">...</td>
                            )}
                          </tr>
                        ))}
                        {csvImportData.rows.length > 5 && (
                          <tr>
                            <td colSpan={Math.min(6, Object.keys(csvImportData.rows[0] || {}).length)} 
                                className="p-2 text-center text-muted-foreground">
                              ... and {csvImportData.rows.length - 5} more rows
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t p-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowImportDialog(false);
                  setCsvImportData(null);
                }}
                disabled={importing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleImportCSV}
                disabled={importing || !csvImportData.tableName.trim()}
              >
                {importing ? 'Importing...' : `Import ${csvImportData.rows.length} Rows`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}