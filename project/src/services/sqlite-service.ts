import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import type { 
  DatabaseConnection, 
  Table, 
  Column, 
  TableRow, 
  QueryResult,
  SQLiteDataType 
} from '../types/database';

class SQLiteService {
  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.SQL = await initSqlJs({
        // Load SQL.js WASM from CDN or local copy
        locateFile: (file) => `https://sql.js.org/dist/${file}`
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
      throw new Error('SQLite initialization failed');
    }
  }

  async createDatabase(name: string): Promise<DatabaseConnection> {
    await this.initialize();
    if (!this.SQL) throw new Error('SQLite not initialized');

    this.db = new this.SQL.Database();
    
    return {
      name,
      isInMemory: true,
      tables: [],
      lastModified: new Date()
    };
  }

  async loadDatabase(arrayBuffer: ArrayBuffer, name: string): Promise<DatabaseConnection> {
    await this.initialize();
    if (!this.SQL) throw new Error('SQLite not initialized');

    this.db = new this.SQL.Database(new Uint8Array(arrayBuffer));
    const tables = await this.getTables();
    
    return {
      name,
      isInMemory: false,
      tables,
      lastModified: new Date()
    };
  }

  async getTables(): Promise<Table[]> {
    if (!this.db) throw new Error('No database loaded');

    const stmt = this.db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    const tables: Table[] = [];
    
    while (stmt.step()) {
      const tableName = stmt.get()[0] as string;
      const columns = await this.getTableColumns(tableName);
      const rowCount = await this.getTableRowCount(tableName);
      
      tables.push({
        name: tableName,
        columns,
        rowCount,
        indexes: [], // TODO: Implement index retrieval
        foreignKeys: [] // TODO: Implement foreign key retrieval
      });
    }
    
    stmt.free();
    return tables;
  }

  async getTableColumns(tableName: string): Promise<Column[]> {
    if (!this.db) throw new Error('No database loaded');

    const stmt = this.db.prepare(`PRAGMA table_info(${tableName})`);
    const columns: Column[] = [];

    while (stmt.step()) {
      const row = stmt.get();
      columns.push({
        name: row[1] as string,
        type: this.mapSQLiteType(row[2] as string),
        nullable: (row[3] as number) === 0,
        primaryKey: (row[5] as number) === 1,
        autoIncrement: false, // TODO: Detect autoincrement
        defaultValue: row[4] as string | number | null | undefined,
        unique: false // TODO: Detect unique constraints
      });
    }

    stmt.free();
    return columns;
  }

  async getTableRowCount(tableName: string): Promise<number> {
    if (!this.db) throw new Error('No database loaded');

    const stmt = this.db.prepare(`SELECT COUNT(*) FROM ${tableName}`);
    stmt.step();
    const count = stmt.get()[0] as number;
    stmt.free();
    
    return count;
  }

  async getTableData(tableName: string, limit = 100, offset = 0): Promise<TableRow[]> {
    if (!this.db) throw new Error('No database loaded');

    const stmt = this.db.prepare(`
      SELECT * FROM ${tableName} 
      LIMIT ${limit} OFFSET ${offset}
    `);

    const rows: TableRow[] = [];
    const columns = stmt.getColumnNames();

    while (stmt.step()) {
      const values = stmt.get();
      const row: TableRow = {};
      
      columns.forEach((col, index) => {
        row[col] = values[index] as string | number | null;
      });
      
      rows.push(row);
    }

    stmt.free();
    return rows;
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    if (!this.db) throw new Error('No database loaded');

    const startTime = performance.now();
    
    try {
      const stmt = this.db.prepare(sql);
      const columns = stmt.getColumnNames();
      const rows: TableRow[] = [];

      while (stmt.step()) {
        const values = stmt.get();
        const row: TableRow = {};
        
        columns.forEach((col, index) => {
          row[col] = values[index] as string | number | null;
        });
        
        rows.push(row);
      }

      const executionTime = performance.now() - startTime;
      stmt.free();

      return {
        columns,
        rows,
        executionTime,
        rowsAffected: rows.length
      };
    } catch (error) {
      throw new Error(`Query failed: ${error}`);
    }
  }

  async updateRow(tableName: string, whereClause: string, data: Partial<TableRow>): Promise<void> {
    if (!this.db) throw new Error('No database loaded');

    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(data);
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
    
    const stmt = this.db.prepare(sql);
    stmt.run(values);
    stmt.free();
  }

  async insertRow(tableName: string, data: TableRow): Promise<void> {
    if (!this.db) throw new Error('No database loaded');

    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    
    const stmt = this.db.prepare(sql);
    stmt.run(values);
    stmt.free();
  }

  async deleteRows(tableName: string, whereClause: string): Promise<number> {
    if (!this.db) throw new Error('No database loaded');

    const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
    const stmt = this.db.prepare(sql);
    stmt.run();
    const changes = this.db.getRowsModified();
    stmt.free();
    
    return changes;
  }

  async createTable(tableName: string, columns: Column[]): Promise<void> {
    if (!this.db) throw new Error('No database loaded');

    const columnDefinitions = columns.map(col => {
      let def = `${col.name} ${col.type}`;
      if (col.primaryKey) def += ' PRIMARY KEY';
      if (col.autoIncrement) def += ' AUTOINCREMENT';
      if (!col.nullable) def += ' NOT NULL';
      if (col.unique && !col.primaryKey) def += ' UNIQUE';
      if (col.defaultValue !== undefined) def += ` DEFAULT ${col.defaultValue}`;
      return def;
    }).join(', ');

    const sql = `CREATE TABLE ${tableName} (${columnDefinitions})`;
    this.db.exec(sql);
  }

  async exportDatabase(): Promise<Uint8Array> {
    if (!this.db) throw new Error('No database loaded');
    return this.db.export();
  }

  private mapSQLiteType(sqliteType: string): SQLiteDataType {
    const type = sqliteType.toUpperCase();
    if (type.includes('INT')) return 'INTEGER';
    if (type.includes('REAL') || type.includes('FLOAT') || type.includes('DOUBLE')) return 'REAL';
    if (type.includes('BLOB')) return 'BLOB';
    if (type.includes('TEXT') || type.includes('CHAR') || type.includes('VARCHAR')) return 'TEXT';
    return 'TEXT'; // Default to TEXT
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const sqliteService = new SQLiteService();