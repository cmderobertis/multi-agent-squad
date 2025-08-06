interface TableSelectorProps {
  tables: string[];
  selectedTable?: string | null;
  onSelectTable: (tableName: string | null) => void;
}

export function TableSelector({ tables, selectedTable, onSelectTable }: TableSelectorProps) {
  if (tables.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No tables found in database
      </div>
    );
  }

  return (
    <select
      value={selectedTable || ''}
      onChange={(e) => onSelectTable(e.target.value || null)}
      className="px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    >
      <option value="">Select a table...</option>
      {tables.map((table) => (
        <option key={table} value={table}>
          {table}
        </option>
      ))}
    </select>
  );
}