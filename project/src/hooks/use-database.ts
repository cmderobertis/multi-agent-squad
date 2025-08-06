import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sqliteService } from '../services/sqlite-service';
import { useDatabaseStore } from '../stores/database-store';
import type { TableRow } from '../types/database';

// Hook for loading tables
export const useTables = () => {
  const currentDatabase = useDatabaseStore(state => state.currentDatabase);
  
  return useQuery({
    queryKey: ['tables', currentDatabase?.name],
    queryFn: () => sqliteService.getTables(),
    enabled: !!currentDatabase,
    staleTime: 30000, // 30 seconds
  });
};

// Hook for loading table data with pagination
export const useTableData = (tableName: string | null, limit = 100, offset = 0) => {
  return useQuery({
    queryKey: ['table-data', tableName, limit, offset],
    queryFn: () => {
      if (!tableName) throw new Error('No table selected');
      return sqliteService.getTableData(tableName, limit, offset);
    },
    enabled: !!tableName,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: false,
  });
};

// Hook for executing custom SQL queries
export const useQuery_ = () => {
  return useMutation({
    mutationFn: (sql: string) => sqliteService.executeQuery(sql),
  });
};

// Hook for updating table rows
export const useUpdateRow = () => {
  const queryClient = useQueryClient();
  const selectedTable = useDatabaseStore(state => state.selectedTable);
  
  return useMutation({
    mutationFn: ({ 
      tableName, 
      whereClause, 
      data 
    }: { 
      tableName: string; 
      whereClause: string; 
      data: Partial<TableRow> 
    }) => sqliteService.updateRow(tableName, whereClause, data),
    
    onSuccess: () => {
      // Invalidate table data to refresh
      queryClient.invalidateQueries({ 
        queryKey: ['table-data', selectedTable] 
      });
    },
  });
};

// Hook for inserting new rows
export const useInsertRow = () => {
  const queryClient = useQueryClient();
  const selectedTable = useDatabaseStore(state => state.selectedTable);
  
  return useMutation({
    mutationFn: ({ 
      tableName, 
      data 
    }: { 
      tableName: string; 
      data: TableRow 
    }) => sqliteService.insertRow(tableName, data),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['table-data', selectedTable] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['tables'] 
      });
    },
  });
};

// Hook for deleting rows
export const useDeleteRows = () => {
  const queryClient = useQueryClient();
  const selectedTable = useDatabaseStore(state => state.selectedTable);
  
  return useMutation({
    mutationFn: ({ 
      tableName, 
      whereClause 
    }: { 
      tableName: string; 
      whereClause: string 
    }) => sqliteService.deleteRows(tableName, whereClause),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['table-data', selectedTable] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['tables'] 
      });
    },
  });
};

// Hook for creating tables
export const useCreateTable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      tableName, 
      columns 
    }: { 
      tableName: string; 
      columns: import('../types/database').Column[] 
    }) => sqliteService.createTable(tableName, columns),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['tables'] 
      });
    },
  });
};

// Hook for database operations
export const useDatabase = () => {
  const queryClient = useQueryClient();
  const setCurrentDatabase = useDatabaseStore(state => state.setCurrentDatabase);
  
  const createDatabase = useMutation({
    mutationFn: (name: string) => sqliteService.createDatabase(name),
    onSuccess: (database) => {
      setCurrentDatabase(database);
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
  
  const loadDatabase = useMutation({
    mutationFn: ({ file, name }: { file: File; name: string }) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const database = await sqliteService.loadDatabase(arrayBuffer, name);
            setCurrentDatabase(database);
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });
    },
  });
  
  return {
    createDatabase,
    loadDatabase,
  };
};