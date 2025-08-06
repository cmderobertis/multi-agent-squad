// Core database types for SQLite management

export type SQLiteDataType = 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB' | 'NULL';

export interface DatabaseConnection {
  name: string;
  path?: string;
  isInMemory: boolean;
  tables: Table[];
  lastModified: Date;
}

export interface Table {
  name: string;
  columns: Column[];
  rowCount: number;
  indexes: Index[];
  foreignKeys: ForeignKey[];
}

export interface Column {
  name: string;
  type: SQLiteDataType;
  nullable: boolean;
  primaryKey: boolean;
  autoIncrement: boolean;
  defaultValue?: string | number | null;
  unique: boolean;
}

export interface Index {
  name: string;
  tableName: string;
  columns: string[];
  unique: boolean;
}

export interface ForeignKey {
  name: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface TableRow {
  [columnName: string]: any;
}

export interface QueryResult {
  columns: string[];
  rows: TableRow[];
  executionTime: number;
  rowsAffected?: number;
}

// Query Builder Types
export interface QueryCondition {
  column: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'like' | 'in' | 'is_null' | 'is_not_null';
  value?: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface QueryJoin {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  table: string;
  on: {
    leftColumn: string;
    rightColumn: string;
  };
}

export interface QueryBuilder {
  selectedTables: string[];
  selectedColumns: { table: string; column: string; alias?: string }[];
  joins: QueryJoin[];
  conditions: QueryCondition[];
  groupBy: string[];
  orderBy: { column: string; direction: 'ASC' | 'DESC' }[];
  limit?: number;
  offset?: number;
}

// CSV Import Types
export interface CSVImportConfig {
  file: File;
  tableName: string;
  hasHeader: boolean;
  delimiter: string;
  encoding: string;
  skipRows: number;
  maxRows?: number;
}

export interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
  dataType: SQLiteDataType;
  nullable: boolean;
  defaultValue?: any;
}

export interface ImportValidationError {
  row: number;
  column: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

export interface ImportProgress {
  totalRows: number;
  processedRows: number;
  errors: ImportValidationError[];
  status: 'analyzing' | 'importing' | 'completed' | 'failed';
  startTime: Date;
  estimatedTimeRemaining?: number;
}