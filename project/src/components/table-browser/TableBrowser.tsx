import { useState, useEffect } from 'react';
import { useDatabaseStore } from '../../stores/database-store';
import { sqliteService } from '../../services/sqlite-service';
import { Button } from '../ui/button';
import { DataGrid } from './DataGrid';
import { TableSelector } from './TableSelector';
import { RowEditor } from './RowEditor';
import type { TableRow, Column } from '../../types/database';

interface TableBrowserState {
  tableData: TableRow[];
  loading: boolean;
  error: string | null;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  searchTerm: string;
  selectedRows: Set<number>;
  currentPage: number;
  pageSize: number;
  editingRow: { mode: 'add' | 'edit'; data?: TableRow } | null;
  tableColumns: Column[];
}

export function TableBrowser() {
  const { currentDatabase, selectedTable, selectTable } = useDatabaseStore();
  const [state, setState] = useState<TableBrowserState>({
    tableData: [],
    loading: false,
    error: null,
    sortColumn: null,
    sortDirection: 'asc',
    searchTerm: '',
    selectedRows: new Set(),
    currentPage: 1,
    pageSize: 50,
    editingRow: null,
    tableColumns: []
  });

  // Load table data when selected table changes
  useEffect(() => {
    if (!selectedTable || !currentDatabase) {
      setState(prev => ({ ...prev, tableData: [], tableColumns: [], loading: false }));
      return;
    }

    loadTableData();
    loadTableColumns();
  }, [selectedTable, currentDatabase]);

  const loadTableData = async () => {
    if (!selectedTable) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await sqliteService.getTableData(
        selectedTable, 
        state.pageSize, 
        (state.currentPage - 1) * state.pageSize
      );
      setState(prev => ({ 
        ...prev, 
        tableData: data, 
        loading: false,
        selectedRows: new Set() 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load table data' 
      }));
    }
  };

  const loadTableColumns = async () => {
    if (!selectedTable) return;
    
    try {
      const columns = await sqliteService.getTableColumns(selectedTable);
      setState(prev => ({ ...prev, tableColumns: columns }));
    } catch (error) {
      console.error('Failed to load table columns:', error);
    }
  };

  const handleSort = (column: string) => {
    setState(prev => {
      const newDirection = prev.sortColumn === column && prev.sortDirection === 'asc' 
        ? 'desc' 
        : 'asc';
      
      const sortedData = [...prev.tableData].sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const comparison = aVal < bVal ? -1 : 1;
        return newDirection === 'asc' ? comparison : -comparison;
      });

      return {
        ...prev,
        tableData: sortedData,
        sortColumn: column,
        sortDirection: newDirection
      };
    });
  };

  const handleSearch = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term, currentPage: 1 }));
    // Trigger reload with search filter
    // Note: For now we'll filter client-side, but could be server-side for large datasets
    if (term.trim()) {
      loadTableData();
    }
  };

  const handleRowSelect = (rowIndex: number, selected: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedRows);
      if (selected) {
        newSelected.add(rowIndex);
      } else {
        newSelected.delete(rowIndex);
      }
      return { ...prev, selectedRows: newSelected };
    });
  };

  const handleSelectAll = (selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedRows: selected 
        ? new Set(Array.from({ length: prev.tableData.length }, (_, i) => i))
        : new Set()
    }));
  };

  // const handlePageChange = (page: number) => {
  //   setState(prev => ({ ...prev, currentPage: page }));
  //   // This will trigger a reload via the useEffect
  // };

  const handleDeleteSelected = async () => {
    if (state.selectedRows.size === 0 || !selectedTable) return;
    
    const confirmed = window.confirm(
      `Delete ${state.selectedRows.size} selected row(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Delete rows by constructing WHERE clause with row indices
      // This is simplified - in production you'd want to use primary keys
      const rowsToDelete = Array.from(state.selectedRows).map(i => state.tableData[i]);
      
      for (const row of rowsToDelete) {
        // Construct WHERE clause using all columns for safety
        const whereConditions = Object.entries(row)
          .map(([key, value]) => `${key} = ${value === null ? 'NULL' : `'${value}'`}`)
          .join(' AND ');
        
        await sqliteService.executeQuery(
          `DELETE FROM ${selectedTable} WHERE ${whereConditions}`
        );
      }
      
      // Reload table data
      await loadTableData();
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete rows' 
      }));
    }
  };

  if (!currentDatabase) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No database connected</p>
      </div>
    );
  }

  if (!selectedTable) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-4">Select a Table</h3>
          <p className="text-muted-foreground mb-6">
            Choose a table from your database to view and manage its data
          </p>
          <TableSelector 
            tables={currentDatabase.tables.map(t => t.name)} 
            onSelectTable={selectTable}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Table Browser</h2>
            <TableSelector 
              tables={currentDatabase.tables.map(t => t.name)}
              selectedTable={selectedTable}
              onSelectTable={selectTable}
            />
          </div>
          <div className="flex items-center space-x-2">
            {state.selectedRows.size > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteSelected}
                disabled={state.loading}
              >
                Delete Selected ({state.selectedRows.size})
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadTableData}
              disabled={state.loading}
            >
              {state.loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button 
              size="sm"
              onClick={() => setState(prev => ({
                ...prev, 
                editingRow: { mode: 'add' }
              }))}
            >
              Add Row
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search table data..."
              value={state.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {state.tableData.length} rows
            {state.selectedRows.size > 0 && ` • ${state.selectedRows.size} selected`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {state.error ? (
          <div className="p-4 text-center">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-destructive font-medium">Error loading table data</p>
              <p className="text-sm text-muted-foreground mt-1">{state.error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={loadTableData}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <DataGrid
            data={state.tableData}
            loading={state.loading}
            sortColumn={state.sortColumn}
            sortDirection={state.sortDirection}
            selectedRows={state.selectedRows}
            onSort={handleSort}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            onRowEdit={(rowIndex) => setState(prev => ({
              ...prev,
              editingRow: { mode: 'edit', data: prev.tableData[rowIndex] }
            }))}
          />
        )}
      </div>

      {/* Row Editor Modal */}
      {state.editingRow && selectedTable && (
        <RowEditor
          mode={state.editingRow.mode}
          tableName={selectedTable}
          existingRow={state.editingRow.data}
          columns={state.tableColumns}
          onSave={() => {
            setState(prev => ({ ...prev, editingRow: null }));
            loadTableData();
          }}
          onCancel={() => setState(prev => ({ ...prev, editingRow: null }))}
        />
      )}
    </div>
  );
}