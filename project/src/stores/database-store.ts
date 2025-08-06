import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { DatabaseConnection, Table, TableRow } from '../types/database';

interface DatabaseState {
  // Database connection state
  currentDatabase: DatabaseConnection | null;
  tables: Table[];
  selectedTable: string | null;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Table data state
  tableData: Record<string, TableRow[]>;
  editingCell: { table: string; row: number; column: string } | null;
  selectedRows: Set<number>;
  
  // Loading states
  isLoadingTables: boolean;
  isLoadingTableData: boolean;
  
  // Actions
  setCurrentDatabase: (database: DatabaseConnection | null) => void;
  setTables: (tables: Table[]) => void;
  selectTable: (tableName: string | null) => void;
  setTableData: (tableName: string, data: TableRow[]) => void;
  updateTableRow: (tableName: string, rowIndex: number, data: Partial<TableRow>) => void;
  
  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  startCellEdit: (table: string, row: number, column: string) => void;
  endCellEdit: () => void;
  toggleRowSelection: (rowIndex: number) => void;
  clearRowSelection: () => void;
  
  // Loading actions
  setLoadingTables: (loading: boolean) => void;
  setLoadingTableData: (loading: boolean) => void;
}

export const useDatabaseStore = create<DatabaseState>()(
  immer((set) => ({
    // Initial state
    currentDatabase: null,
    tables: [],
    selectedTable: null,
    sidebarOpen: true,
    theme: 'light',
    tableData: {},
    editingCell: null,
    selectedRows: new Set(),
    isLoadingTables: false,
    isLoadingTableData: false,

    // Database actions
    setCurrentDatabase: (database) => set((state) => {
      state.currentDatabase = database;
      state.tables = database?.tables || [];
      state.selectedTable = null;
      state.tableData = {};
    }),

    setTables: (tables) => set((state) => {
      state.tables = tables;
      if (state.currentDatabase) {
        state.currentDatabase.tables = tables;
      }
    }),

    selectTable: (tableName) => set((state) => {
      state.selectedTable = tableName;
      state.selectedRows.clear();
      state.editingCell = null;
    }),

    setTableData: (tableName, data) => set((state) => {
      state.tableData[tableName] = data;
    }),

    updateTableRow: (tableName, rowIndex, data) => set((state) => {
      if (state.tableData[tableName] && state.tableData[tableName][rowIndex]) {
        Object.assign(state.tableData[tableName][rowIndex], data);
      }
    }),

    // UI actions
    setSidebarOpen: (open) => set((state) => {
      state.sidebarOpen = open;
    }),

    setTheme: (theme) => set((state) => {
      state.theme = theme;
    }),

    startCellEdit: (table, row, column) => set((state) => {
      state.editingCell = { table, row, column };
    }),

    endCellEdit: () => set((state) => {
      state.editingCell = null;
    }),

    toggleRowSelection: (rowIndex) => set((state) => {
      if (state.selectedRows.has(rowIndex)) {
        state.selectedRows.delete(rowIndex);
      } else {
        state.selectedRows.add(rowIndex);
      }
    }),

    clearRowSelection: () => set((state) => {
      state.selectedRows.clear();
    }),

    // Loading actions
    setLoadingTables: (loading) => set((state) => {
      state.isLoadingTables = loading;
    }),

    setLoadingTableData: (loading) => set((state) => {
      state.isLoadingTableData = loading;
    }),
  }))
);

