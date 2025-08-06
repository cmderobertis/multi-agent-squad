import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import { useQueryBuilderStore } from '../../stores/query-builder-store';
import { useDatabaseStore } from '../../stores/database-store';
import { cn } from '../../utils/cn';
import { TableSelector } from './components/TableSelector';
import { FieldSelector } from './components/FieldSelector';
import { ConditionBuilder } from './components/ConditionBuilder';
import { QueryPreview } from './components/QueryPreview';
import { ResultsPanel } from './components/ResultsPanel';
import { QueryBuilderTabs } from './components/QueryBuilderTabs';

interface QueryBuilderProps {
  className?: string;
  onQueryChange?: (sql: string) => void;
  onExecute?: (result: any) => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  className,
  onQueryChange,
  onExecute
}) => {
  const { currentDatabase, tables } = useDatabaseStore();
  const {
    currentQuery,
    activeTab,
    isExecuting,
    error,
    lastResult,
    mode,
    executeQuery,
    resetQuery,
    generateSQL,
    setActiveTab,
    setMode
  } = useQueryBuilderStore();

  const sql = generateSQL();

  // Notify parent of SQL changes
  useEffect(() => {
    onQueryChange?.(sql);
  }, [sql, onQueryChange]);

  // Notify parent of execution results
  useEffect(() => {
    if (lastResult) {
      onExecute?.(lastResult);
    }
  }, [lastResult, onExecute]);

  if (!currentDatabase) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Database Connected
          </h3>
          <p className="text-gray-600 mb-4">
            Please connect to a database to use the Query Builder
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Connect Database
          </Button>
        </div>
      </div>
    );
  }

  const handleExecute = async () => {
    try {
      await executeQuery();
    } catch (error) {
      console.error('Query execution failed:', error);
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Header */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Query Builder</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={mode === 'simple' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('simple')}
              >
                Simple
              </Button>
              <Button
                variant={mode === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('advanced')}
              >
                Advanced
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetQuery}
              disabled={isExecuting}
            >
              Clear
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || !sql.trim()}
              size="sm"
            >
              {isExecuting ? 'Executing...' : 'Run Query'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <QueryBuilderTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasResults={!!lastResult}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'builder' && (
          <div className="h-full flex">
            {/* Left Sidebar - Table Selection */}
            <div className="w-80 border-r bg-card flex flex-col">
              <TableSelector 
                tables={tables}
                selectedTables={currentQuery.selectedTables}
                mode={mode}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Field Selection */}
              <div className="border-b">
                <FieldSelector 
                  selectedTables={currentQuery.selectedTables}
                  selectedColumns={currentQuery.selectedColumns}
                  mode={mode}
                />
              </div>

              {/* Conditions */}
              <div className="border-b">
                <ConditionBuilder 
                  conditions={currentQuery.conditions}
                  availableTables={currentQuery.selectedTables}
                  mode={mode}
                />
              </div>

              {/* SQL Preview */}
              <div className="flex-1">
                <QueryPreview 
                  sql={sql}
                  editable={mode === 'advanced'}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sql' && (
          <div className="h-full">
            <QueryPreview 
              sql={sql}
              editable={true}
              fullHeight={true}
            />
          </div>
        )}

        {activeTab === 'results' && lastResult && (
          <div className="h-full">
            <ResultsPanel 
              result={lastResult}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="h-full p-4">
            <h3 className="text-lg font-semibold mb-4">Query History</h3>
            <div className="text-center text-gray-500">
              <p>Query history coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>
              Database: <span className="font-medium">{currentDatabase.name}</span>
            </span>
            <span>
              Tables: <span className="font-medium">{currentQuery.selectedTables.length}</span>
            </span>
            <span>
              Columns: <span className="font-medium">
                {currentQuery.selectedColumns.length || 'All'}
              </span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {lastResult && (
              <span>
                Rows: <span className="font-medium">{lastResult.rows.length}</span>
              </span>
            )}
            <span className="text-xs">
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};