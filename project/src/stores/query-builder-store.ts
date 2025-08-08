import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { sqliteService } from '../services/sqlite-service';
import { findForeignKeyBetweenTables } from '../utils/foreign-key-detector';
import { generateTableAliases, getAliasForTable } from '../utils/table-alias-generator';
import type { 
  QueryBuilderQuery, 
  SavedQuery, 
  QueryBuilderTab,
  QueryBuilderMode,
  CanvasState,
  Position,
  SelectedColumn,
  DraggedConnection,
  QueryExecutionMetrics,
  QueryBuilderSettings,
  QueryValidationResult,
  QueryTemplate,
  TableAlias
} from '../types/query-builder';
import type { QueryResult, QueryJoin, QueryCondition, Table } from '../types/database';

interface QueryBuilderState {
  // Current query state
  currentQuery: QueryBuilderQuery;
  
  // Available tables (for foreign key detection)
  availableTables: Table[];
  
  // Query management
  savedQueries: SavedQuery[];
  queryTemplates: QueryTemplate[];
  
  // UI state
  activeTab: QueryBuilderTab;
  mode: QueryBuilderMode;
  isExecuting: boolean;
  lastResult: QueryResult | null;
  executionMetrics: QueryExecutionMetrics | null;
  error: string | null;
  
  // Canvas state for visual builder
  canvas: CanvasState;
  draggedConnection: DraggedConnection | null;
  
  // Settings
  settings: QueryBuilderSettings;
  
  // Validation
  validation: QueryValidationResult | null;
  
  // Actions - Query Management
  updateQuery: (updates: Partial<QueryBuilderQuery>) => void;
  resetQuery: () => void;
  loadQuery: (query: SavedQuery | QueryTemplate) => void;
  
  // Actions - Query Execution
  executeQuery: () => Promise<void>;
  validateQuery: () => Promise<void>;
  generateSQL: () => string;
  
  // Actions - Table Management
  setAvailableTables: (tables: Table[]) => void;
  addTable: (tableName: string) => void;
  removeTable: (tableName: string) => void;
  updateTablePosition: (tableName: string, position: Position) => void;
  
  // Actions - Column Management
  toggleColumn: (column: SelectedColumn) => void;
  updateColumnAlias: (index: number, alias: string) => void;
  clearSelectedColumns: () => void;
  selectAllColumns: () => void;
  
  // Actions - Condition Management
  addCondition: () => void;
  updateCondition: (index: number, condition: QueryCondition) => void;
  removeCondition: (index: number) => void;
  clearConditions: () => void;
  
  // Actions - Join Management
  addJoin: (join: QueryJoin) => void;
  updateJoin: (index: number, join: QueryJoin) => void;
  removeJoin: (index: number) => void;
  clearJoins: () => void;
  
  // Actions - Query History
  saveQuery: (name: string, description?: string, tags?: string[]) => void;
  deleteQuery: (queryId: string) => void;
  duplicateQuery: (queryId: string) => void;
  
  // Actions - UI State
  setActiveTab: (tab: QueryBuilderTab) => void;
  setMode: (mode: QueryBuilderMode) => void;
  updateSettings: (settings: Partial<QueryBuilderSettings>) => void;
  
  // Actions - Canvas
  updateCanvas: (canvas: Partial<CanvasState>) => void;
  setDraggedConnection: (connection: DraggedConnection | null) => void;
  
  // Actions - Drag & Drop
  startColumnDrag: (table: string, column: string, position: Position) => void;
  endColumnDrag: () => void;
  handleColumnDrop: (targetTable: string, targetColumn: string) => void;
}

const defaultQuery: QueryBuilderQuery = {
  selectedTables: [],
  tableAliases: [],
  selectedColumns: [],
  selectAllColumns: true, // Default to SELECT *
  joins: [],
  conditions: [],
  groupBy: [],
  orderBy: [],
};

const defaultCanvas: CanvasState = {
  tables: [],
  connections: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedElements: new Set(),
};

const defaultSettings: QueryBuilderSettings = {
  autoExecute: false,
  showQueryPlan: false,
  maxRowsPreview: 1000,
  syntaxHighlighting: true,
  autoSave: true,
};

export const useQueryBuilderStore = create<QueryBuilderState>()(
  immer((set, get) => ({
    // Initial state
    currentQuery: { ...defaultQuery },
    availableTables: [],
    savedQueries: [],
    queryTemplates: [],
    activeTab: 'builder',
    mode: 'simple',
    isExecuting: false,
    lastResult: null,
    executionMetrics: null,
    error: null,
    canvas: { ...defaultCanvas },
    draggedConnection: null,
    settings: { ...defaultSettings },
    validation: null,

    // Query Management Actions
    updateQuery: (updates) => set((state) => {
      Object.assign(state.currentQuery, updates);
      // Reset validation when query changes
      state.validation = null;
      state.error = null;
    }),

    resetQuery: () => set((state) => {
      state.currentQuery = { ...defaultQuery };
      state.canvas = { ...defaultCanvas };
      state.validation = null;
      state.error = null;
      state.lastResult = null;
      state.executionMetrics = null;
    }),

    loadQuery: (queryOrTemplate) => set((state) => {
      if ('query' in queryOrTemplate && queryOrTemplate.query) {
        // Loading a saved query - direct assignment
        Object.assign(state.currentQuery, queryOrTemplate.query);
      } else if ('query' in queryOrTemplate && queryOrTemplate.query) {
        // Loading a template - merge with defaults
        Object.assign(state.currentQuery, defaultQuery, queryOrTemplate.query);
      }
      state.validation = null;
      state.error = null;
    }),

    // Query Execution Actions
    executeQuery: async () => {
      const { currentQuery, generateSQL, settings } = get();
      
      set((state) => {
        state.isExecuting = true;
        state.error = null;
        state.executionMetrics = null;
      });

      try {
        const sql = generateSQL();
        if (!sql.trim()) {
          throw new Error('No valid SQL query to execute');
        }

        const startTime = performance.now();
        const result = await sqliteService.executeQuery(sql);
        const endTime = performance.now();

        const metrics: QueryExecutionMetrics = {
          executionTime: endTime - startTime,
          rowsReturned: result.rows.length,
        };

        // Limit results for preview if needed
        if (result.rows.length > settings.maxRowsPreview) {
          result.rows = result.rows.slice(0, settings.maxRowsPreview);
        }

        set((state) => {
          state.lastResult = result;
          state.executionMetrics = metrics;
          state.isExecuting = false;
          state.activeTab = 'results';
        });

        // Auto-save query if enabled
        if (settings.autoSave && currentQuery.selectedTables.length > 0) {
          const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
          get().saveQuery(`Auto-saved query ${timestamp}`);
        }
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Unknown error occurred';
          state.isExecuting = false;
        });
      }
    },

    validateQuery: async () => {
      const { currentQuery } = get();
      
      try {
        // Note: SQL generation is available but not needed for basic validation
        
        // Basic validation
        const errors: Array<{ field: string; message: string; severity: 'error' | 'warning' | 'info' }> = [];
        const warnings: Array<{ field: string; message: string; severity: 'error' | 'warning' | 'info' }> = [];

        if (currentQuery.selectedTables.length === 0) {
          errors.push({ field: 'tables', message: 'At least one table must be selected', severity: 'error' });
        }

        if (currentQuery.selectedColumns.length === 0) {
          warnings.push({ field: 'columns', message: 'No columns selected, will use SELECT *', severity: 'warning' });
        }

        // Check for missing join conditions
        if (currentQuery.selectedTables.length > 1 && currentQuery.joins.length === 0) {
          warnings.push({ 
            field: 'joins', 
            message: 'Multiple tables selected but no joins defined. This may result in a cartesian product.', 
            severity: 'warning' 
          });
        }

        // Validate column references in conditions
        currentQuery.conditions.forEach((condition, index) => {
          if (!condition.column) {
            errors.push({ 
              field: `condition-${index}`, 
              message: 'Condition missing column selection', 
              severity: 'error' 
            });
          }
        });

        set((state) => {
          state.validation = {
            isValid: errors.length === 0,
            errors,
            warnings,
          };
        });
      } catch (error) {
        set((state) => {
          state.validation = {
            isValid: false,
            errors: [{ field: 'query', message: 'Invalid query structure', severity: 'error' }],
            warnings: [],
          };
        });
      }
    },

    generateSQL: () => {
      const { currentQuery } = get();
      return generateSQLFromQuery(currentQuery);
    },

    // Table Management Actions
    setAvailableTables: (tables) => set((state) => {
      state.availableTables = tables;
    }),

    addTable: (tableName) => set((state) => {
      if (!state.currentQuery.selectedTables.includes(tableName)) {
        // Set as primary table if it's the first one
        if (state.currentQuery.selectedTables.length === 0) {
          state.currentQuery.primaryTable = tableName;
        }
        
        state.currentQuery.selectedTables.push(tableName);
        
        // Regenerate aliases for all tables
        state.currentQuery.tableAliases = generateTableAliases(state.currentQuery.selectedTables);
        
        // Auto-generate LEFT JOIN if this is not the primary table
        if (state.currentQuery.primaryTable && state.currentQuery.primaryTable !== tableName) {
          const relationship = findForeignKeyBetweenTables(
            state.availableTables,
            state.currentQuery.primaryTable,
            tableName
          );
          
          if (relationship) {
            // Check if JOIN already exists
            const existingJoin = state.currentQuery.joins.find(
              join => join.table === tableName
            );
            
            if (!existingJoin) {
              // Use aliases in JOIN conditions
              const fromAlias = getAliasForTable(state.currentQuery.tableAliases, relationship.fromTable);
              const toAlias = getAliasForTable(state.currentQuery.tableAliases, relationship.toTable);
              
              const newJoin: QueryJoin = {
                type: 'LEFT',
                table: tableName,
                on: {
                  leftColumn: `${fromAlias}.${relationship.fromColumn}`,
                  rightColumn: `${toAlias}.${relationship.toColumn}`
                }
              };
              
              state.currentQuery.joins.push(newJoin);
              
              console.log(`🔗 Auto-generated LEFT JOIN: ${fromAlias}.${relationship.fromColumn} = ${toAlias}.${relationship.toColumn} (confidence: ${Math.round(relationship.confidence * 100)}%)`);
            }
          }
        }
        
        // Add table to canvas with auto-positioning
        const existingPositions = state.canvas.tables.map(t => t.position);
        const newPosition = calculateNewTablePosition(existingPositions);
        
        state.canvas.tables.push({
          tableName,
          position: newPosition,
          size: { width: 200, height: 150 }, // Default size
        });
      }
    }),

    removeTable: (tableName) => set((state) => {
      // Remove from selected tables
      state.currentQuery.selectedTables = state.currentQuery.selectedTables
        .filter(t => t !== tableName);
      
      // Regenerate aliases after removal
      state.currentQuery.tableAliases = generateTableAliases(state.currentQuery.selectedTables);
      
      // Update primary table if we removed it
      if (state.currentQuery.primaryTable === tableName) {
        state.currentQuery.primaryTable = state.currentQuery.selectedTables[0] || undefined;
      }
      
      // Remove related columns
      state.currentQuery.selectedColumns = state.currentQuery.selectedColumns
        .filter(c => c.table !== tableName);
      
      // Remove related joins
      state.currentQuery.joins = state.currentQuery.joins
        .filter(j => j.table !== tableName);
      
      // Remove related conditions
      state.currentQuery.conditions = state.currentQuery.conditions
        .filter(c => !c.column.startsWith(`${tableName}.`));
      
      // Remove from canvas
      state.canvas.tables = state.canvas.tables
        .filter(t => t.tableName !== tableName);
      
      // Remove related connections
      state.canvas.connections = state.canvas.connections
        .filter(c => c.from.table !== tableName && c.to.table !== tableName);
    }),

    updateTablePosition: (tableName, position) => set((state) => {
      const table = state.canvas.tables.find(t => t.tableName === tableName);
      if (table) {
        table.position = position;
      }
    }),

    // Column Management Actions
    toggleColumn: (column) => set((state) => {
      // Special handling when SELECT * is active
      if (state.currentQuery.selectAllColumns) {
        // First click when using SELECT * - switch to explicit mode and uncheck this column
        state.currentQuery.selectAllColumns = false;
        
        // Build explicit column list with all columns EXCEPT the one being unchecked
        const allColumns: SelectedColumn[] = [];
        for (const tableName of state.currentQuery.selectedTables) {
          const table = state.availableTables.find(t => t.name === tableName);
          if (table) {
            for (const col of table.columns) {
              // Skip the column we're unchecking
              if (tableName === column.table && col.name === column.column) continue;
              
              allColumns.push({
                table: tableName,
                column: col.name
              });
            }
          }
        }
        
        state.currentQuery.selectedColumns = allColumns;
        return; // Exit early
      }
      
      // Normal explicit column mode logic
      const index = state.currentQuery.selectedColumns.findIndex(
        c => c.table === column.table && c.column === column.column
      );
      
      if (index >= 0) {
        // Unchecking a column in explicit mode
        state.currentQuery.selectedColumns.splice(index, 1);
      } else {
        // Checking a column in explicit mode
        state.currentQuery.selectedColumns.push(column);
        
        // Check if we now have all columns selected - if so, switch back to SELECT *
        const allPossibleColumns: SelectedColumn[] = [];
        for (const tableName of state.currentQuery.selectedTables) {
          const table = state.availableTables.find(t => t.name === tableName);
          if (table) {
            for (const col of table.columns) {
              allPossibleColumns.push({
                table: tableName,
                column: col.name
              });
            }
          }
        }
        
        // Check if we have all columns
        const hasAllColumns = allPossibleColumns.every(possibleCol =>
          state.currentQuery.selectedColumns.some(selectedCol =>
            selectedCol.table === possibleCol.table && selectedCol.column === possibleCol.column
          )
        );
        
        if (hasAllColumns && allPossibleColumns.length > 0) {
          state.currentQuery.selectAllColumns = true;
          state.currentQuery.selectedColumns = []; // Clear explicit columns when using *
        }
      }
    }),

    updateColumnAlias: (index, alias) => set((state) => {
      if (state.currentQuery.selectedColumns[index]) {
        state.currentQuery.selectedColumns[index].alias = alias || undefined;
      }
    }),

    clearSelectedColumns: () => set((state) => {
      state.currentQuery.selectedColumns = [];
    }),

    selectAllColumns: () => set((state) => {
      // This would need access to table schemas - to be implemented
      // For now, just clear the selection to indicate "SELECT *"
      state.currentQuery.selectedColumns = [];
    }),

    // Condition Management Actions
    addCondition: () => set((state) => {
      const newCondition: QueryCondition = {
        column: '',
        operator: 'equals',
        value: '',
        logicalOperator: state.currentQuery.conditions.length > 0 ? 'AND' : undefined,
      };
      state.currentQuery.conditions.push(newCondition);
    }),

    updateCondition: (index, condition) => set((state) => {
      if (state.currentQuery.conditions[index]) {
        state.currentQuery.conditions[index] = condition;
      }
    }),

    removeCondition: (index) => set((state) => {
      state.currentQuery.conditions.splice(index, 1);
      // Update logical operators - first condition shouldn't have one
      if (state.currentQuery.conditions.length > 0) {
        state.currentQuery.conditions[0].logicalOperator = undefined;
      }
    }),

    clearConditions: () => set((state) => {
      state.currentQuery.conditions = [];
    }),

    // Join Management Actions
    addJoin: (join) => set((state) => {
      state.currentQuery.joins.push(join);
    }),

    updateJoin: (index, join) => set((state) => {
      if (state.currentQuery.joins[index]) {
        state.currentQuery.joins[index] = join;
      }
    }),

    removeJoin: (index) => set((state) => {
      state.currentQuery.joins.splice(index, 1);
    }),

    clearJoins: () => set((state) => {
      state.currentQuery.joins = [];
    }),

    // Query History Actions
    saveQuery: (name, description, tags) => set((state) => {
      const savedQuery: SavedQuery = {
        id: crypto.randomUUID(),
        name,
        description,
        tags,
        query: { ...state.currentQuery },
        sql: generateSQLFromQuery(state.currentQuery),
        createdAt: new Date(),
      };
      
      state.savedQueries.push(savedQuery);
      
      // Keep only last 100 queries to prevent memory issues
      if (state.savedQueries.length > 100) {
        state.savedQueries = state.savedQueries.slice(-100);
      }
    }),

    deleteQuery: (queryId) => set((state) => {
      state.savedQueries = state.savedQueries.filter(q => q.id !== queryId);
    }),

    duplicateQuery: (queryId) => set((state) => {
      const originalQuery = state.savedQueries.find(q => q.id === queryId);
      if (originalQuery) {
        const duplicatedQuery: SavedQuery = {
          ...originalQuery,
          id: crypto.randomUUID(),
          name: `${originalQuery.name} (Copy)`,
          createdAt: new Date(),
        };
        state.savedQueries.push(duplicatedQuery);
      }
    }),

    // UI State Actions
    setActiveTab: (tab) => set((state) => {
      state.activeTab = tab;
    }),

    setMode: (mode) => set((state) => {
      state.mode = mode;
    }),

    updateSettings: (newSettings) => set((state) => {
      Object.assign(state.settings, newSettings);
    }),

    // Canvas Actions
    updateCanvas: (canvasUpdates) => set((state) => {
      Object.assign(state.canvas, canvasUpdates);
    }),

    setDraggedConnection: (connection) => set((state) => {
      state.draggedConnection = connection;
    }),

    // Drag & Drop Actions
    startColumnDrag: (table, column, position) => set((state) => {
      state.draggedConnection = {
        start: position,
        current: position,
        sourceTable: table,
        sourceColumn: column,
      };
    }),

    endColumnDrag: () => set((state) => {
      state.draggedConnection = null;
    }),

    handleColumnDrop: (targetTable, targetColumn) => set((state) => {
      const { draggedConnection } = state;
      if (draggedConnection) {
        // Create a new join
        const newJoin: QueryJoin = {
          type: 'INNER',
          table: targetTable,
          on: {
            leftColumn: `${draggedConnection.sourceTable}.${draggedConnection.sourceColumn}`,
            rightColumn: `${targetTable}.${targetColumn}`,
          },
        };
        
        // Add the target table if not already selected
        if (!state.currentQuery.selectedTables.includes(targetTable)) {
          state.currentQuery.selectedTables.push(targetTable);
        }
        
        state.currentQuery.joins.push(newJoin);
        state.draggedConnection = null;
      }
    }),
  }))
);

// Utility function to generate SQL from query state
function generateSQLFromQuery(query: QueryBuilderQuery): string {
  const parts: string[] = [];
  
  // SELECT clause with aliases
  if (query.selectAllColumns || query.selectedColumns.length === 0) {
    parts.push('SELECT *');
  } else {
    const columns = query.selectedColumns.map(col => {
      const tableAlias = getAliasForTable(query.tableAliases, col.table);
      const fullColumn = `${tableAlias}.${col.column}`;
      return col.alias ? `${fullColumn} AS ${col.alias}` : fullColumn;
    });
    parts.push(`SELECT ${columns.join(', ')}`);
  }
  
  // FROM clause with aliases
  if (query.selectedTables.length > 0) {
    const primaryTableAlias = getAliasForTable(query.tableAliases, query.selectedTables[0]);
    const primaryTableName = query.selectedTables[0];
    parts.push(`FROM ${primaryTableName} ${primaryTableAlias}`);
    
    // JOIN clauses with aliases
    query.joins.forEach(join => {
      const joinTableAlias = getAliasForTable(query.tableAliases, join.table);
      parts.push(
        `${join.type} JOIN ${join.table} ${joinTableAlias} ON ${join.on.leftColumn} = ${join.on.rightColumn}`
      );
    });
  }
  
  // WHERE clause (conditions already use aliases from JoinBuilder/ConditionBuilder)
  if (query.conditions.length > 0) {
    const whereConditions = query.conditions.map((condition, index) => {
      let conditionStr = formatCondition(condition, query.tableAliases);
      if (index > 0 && condition.logicalOperator) {
        conditionStr = `${condition.logicalOperator} ${conditionStr}`;
      }
      return conditionStr;
    });
    parts.push(`WHERE ${whereConditions.join(' ')}`);
  }
  
  // GROUP BY clause
  if (query.groupBy.length > 0) {
    parts.push(`GROUP BY ${query.groupBy.join(', ')}`);
  }
  
  // ORDER BY clause
  if (query.orderBy.length > 0) {
    const orderColumns = query.orderBy.map(
      order => `${order.column} ${order.direction}`
    );
    parts.push(`ORDER BY ${orderColumns.join(', ')}`);
  }
  
  // LIMIT clause
  if (query.limit) {
    parts.push(`LIMIT ${query.limit}`);
    if (query.offset) {
      parts.push(`OFFSET ${query.offset}`);
    }
  }
  
  return parts.join('\n');
}

// Helper function to format individual conditions
function formatCondition(condition: QueryCondition, tableAliases: TableAlias[]): string {
  const { column, operator, value } = condition;
  
  // Convert column reference to use aliases if it contains a table prefix
  let formattedColumn = column;
  if (column.includes('.')) {
    const [tableName, columnName] = column.split('.');
    const alias = getAliasForTable(tableAliases, tableName);
    formattedColumn = `${alias}.${columnName}`;
  }
  
  switch (operator) {
    case 'equals':
      return `${formattedColumn} = '${value}'`;
    case 'not_equals':
      return `${formattedColumn} != '${value}'`;
    case 'greater_than':
      return `${formattedColumn} > ${value}`;
    case 'less_than':
      return `${formattedColumn} < ${value}`;
    case 'like':
      return `${formattedColumn} LIKE '%${value}%'`;
    case 'in':
      const values = Array.isArray(value) ? value : [value];
      return `${formattedColumn} IN (${values.map(v => `'${v}'`).join(', ')})`;
    case 'is_null':
      return `${formattedColumn} IS NULL`;
    case 'is_not_null':
      return `${formattedColumn} IS NOT NULL`;
    default:
      return `${formattedColumn} = '${value}'`;
  }
}

// Helper function to calculate new table position
function calculateNewTablePosition(existingPositions: Position[]): Position {
  const gridSize = 220; // Space between tables
  const startX = 50;
  const startY = 50;
  
  // Simple grid layout algorithm
  let x = startX;
  let y = startY;
  let row = 0;
  
  while (existingPositions.some(pos => 
    Math.abs(pos.x - x) < gridSize && Math.abs(pos.y - y) < gridSize
  )) {
    x += gridSize;
    if (x > 800) { // Max width before wrapping
      x = startX;
      y += 200; // Row height
      row++;
    }
  }
  
  return { x, y };
}

