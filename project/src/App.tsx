import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { useDatabaseStore } from './stores/database-store';
import { QueryBuilder } from './components/query-builder/QueryBuilder';
import { TableBrowser } from './components/table-browser/TableBrowser';
import { TableManager } from './components/table-browser/TableManager';
import { sqliteService } from './services/sqlite-service';

function App() {
  const { currentDatabase, theme, setTheme, setCurrentDatabase } = useDatabaseStore();
  const [activeView, setActiveView] = useState<'table-browser' | 'query-builder' | 'table-manager'>('table-browser');
  const [isCreatingDb, setIsCreatingDb] = useState(false);

  // Apply theme to document element for global dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
  }, [setTheme,theme]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleCreateDatabase = async () => {
    setIsCreatingDb(true);
    try {
      const database = await sqliteService.createDatabase('Demo Database');
      
      // Create sample tables for demonstration
      await sqliteService.executeQuery(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          age INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await sqliteService.executeQuery(`
        CREATE TABLE orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          product_name TEXT NOT NULL,
          quantity INTEGER DEFAULT 1,
          price DECIMAL(10,2),
          order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
      
      // Insert sample data
      await sqliteService.executeQuery(`
        INSERT INTO users (name, email, age) VALUES 
        ('John Doe', 'john@example.com', 30),
        ('Jane Smith', 'jane@example.com', 25),
        ('Bob Johnson', 'bob@example.com', 35)
      `);
      
      await sqliteService.executeQuery(`
        INSERT INTO orders (user_id, product_name, quantity, price) VALUES 
        (1, 'Laptop', 1, 999.99),
        (1, 'Mouse', 2, 25.50),
        (2, 'Keyboard', 1, 75.00),
        (3, 'Monitor', 1, 299.99)
      `);
      
      // Refresh tables list
      const tables = await sqliteService.getTables();
      const updatedDatabase = { ...database, tables };
      setCurrentDatabase(updatedDatabase);
      
    } catch (error) {
      console.error('Failed to create database:', error);
      alert('Failed to create database. Please try again.');
    } finally {
      setIsCreatingDb(false);
    }
  };

  const handleLoadDatabase = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.db,.sqlite,.sqlite3';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const database = await sqliteService.loadDatabase(arrayBuffer, file.name);
        const tables = await sqliteService.getTables();
        setCurrentDatabase({ ...database, tables });
      } catch (error) {
        console.error('Failed to load database:', error);
        alert('Failed to load database. Please check the file format.');
      }
    };
    input.click();
  };

  const handleExportDatabase = async () => {
    if (!currentDatabase) return;
    
    try {
      const data = await sqliteService.exportDatabase();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentDatabase.name.replace(/[^a-zA-Z0-9]/g, '_')}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export database:', error);
      alert('Failed to export database. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-database-700">
              SQLite Database Manager
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
              {currentDatabase && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={activeView === 'table-browser' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveView('table-browser')}
                  >
                    Browse
                  </Button>
                  <Button 
                    variant={activeView === 'query-builder' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveView('query-builder')}
                  >
                    Query
                  </Button>
                  <Button 
                    variant={activeView === 'table-manager' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveView('table-manager')}
                  >
                    Manage
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleExportDatabase}
                  >
                    Export
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {!currentDatabase ? (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold mb-4">
                  Welcome to SQLite Database Manager
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  A powerful web-based interface for managing SQLite databases with visual query building and CSV import capabilities.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="border rounded-lg p-6 hover:bg-accent transition-colors">
                  <h3 className="font-semibold mb-2">Create New Database</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start with a fresh SQLite database in memory
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateDatabase}
                    disabled={isCreatingDb}
                  >
                    {isCreatingDb ? 'Creating...' : 'Create Database'}
                  </Button>
                </div>

                <div className="border rounded-lg p-6 hover:bg-accent transition-colors">
                  <h3 className="font-semibold mb-2">Load Existing Database</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload and open an existing SQLite file
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleLoadDatabase}
                  >
                    Load Database
                  </Button>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-6">Key Features</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">🗄️ Database Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Full CRUD operations on tables, columns, and rows with an intuitive interface
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">🔍 Visual Query Builder</h4>
                    <p className="text-sm text-muted-foreground">
                      Build complex SQL queries with drag-and-drop interface and real-time preview
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">📊 CSV Import</h4>
                    <p className="text-sm text-muted-foreground">
                      Import CSV files with automatic schema detection and data validation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeView === 'query-builder' ? (
          <QueryBuilder />
        ) : activeView === 'table-browser' ? (
          <TableBrowser />
        ) : activeView === 'table-manager' ? (
          <TableManager 
            onTableCreated={async () => {
              // Refresh the database tables
              const tables = await sqliteService.getTables();
              setCurrentDatabase({ ...currentDatabase, tables });
            }}
          />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-4">
                Database: {currentDatabase.name}
              </h2>
              <p className="text-muted-foreground">
                {currentDatabase.tables.length} tables • {currentDatabase.isInMemory ? 'In Memory' : 'File-based'}
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => setActiveView('table-browser')}>
                  📊 Browse Data
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveView('query-builder')}
                >
                  🔍 Query Builder
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setActiveView('table-manager')}
                >
                  ⚙️ Manage Tables
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;