// Query Builder specific types extending the base database types

export interface Position {
  x: number;
  y: number;
}

export interface SelectedColumn {
  table: string;
  column: string;
  alias?: string;
}

export interface DraggedConnection {
  start: Position;
  current: Position;
  sourceTable: string;
  sourceColumn: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  query: QueryBuilderQuery;
  sql: string;
  createdAt: Date;
  tags?: string[];
  description?: string;
}

export interface AvailableColumn {
  table: string;
  column: import('./database').Column;
}

export interface TableAlias {
  tableName: string;
  alias: string;
}

export interface QueryBuilderQuery {
  selectedTables: string[];
  primaryTable?: string; // The first table selected - base for JOINs
  tableAliases: TableAlias[]; // Auto-generated aliases for all tables
  selectedColumns: SelectedColumn[];
  selectAllColumns: boolean; // Whether to use SELECT * 
  joins: import('./database').QueryJoin[];
  conditions: import('./database').QueryCondition[];
  groupBy: string[];
  orderBy: { column: string; direction: 'ASC' | 'DESC' }[];
  limit?: number;
  offset?: number;
}

export interface DraggedItem {
  type: 'column' | 'table';
  table: string;
  column?: string;
  startPosition: Position;
}

export interface DropTarget {
  type: 'canvas' | 'join' | 'condition';
  table?: string;
  column?: string;
}

export interface TablePosition {
  tableName: string;
  position: Position;
  size: { width: number; height: number };
}

export interface CanvasState {
  tables: TablePosition[];
  connections: ConnectionState[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  selectedElements: Set<string>;
}

export interface ConnectionState {
  id: string;
  from: {
    table: string;
    column: string;
    position: Position;
  };
  to: {
    table: string;
    column: string;
    position: Position;
  };
  joinType: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
}

export interface QueryExecutionMetrics {
  executionTime: number;
  rowsReturned: number;
  queryPlan?: string;
  memoryUsed?: number;
}

export interface QueryBuilderSettings {
  autoExecute: boolean;
  showQueryPlan: boolean;
  maxRowsPreview: number;
  syntaxHighlighting: boolean;
  autoSave: boolean;
}

// UI State types
export type QueryBuilderTab = 'builder' | 'sql' | 'results' | 'history';
export type QueryBuilderMode = 'simple' | 'advanced';
export type LayoutMode = 'desktop' | 'tablet' | 'mobile';

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface QueryValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Template types
export interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  query: Partial<QueryBuilderQuery>;
  variables?: {
    name: string;
    type: string;
    defaultValue?: any;
    required: boolean;
  }[];
}