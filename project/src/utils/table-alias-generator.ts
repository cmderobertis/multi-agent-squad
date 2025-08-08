/**
 * Generates consistent table aliases for SQL queries
 */

export interface TableAlias {
  tableName: string;
  alias: string;
}

/**
 * Generates a short, meaningful alias for a table name
 */
export function generateTableAlias(tableName: string, existingAliases: string[] = []): string {
  let alias = '';
  
  // Method 1: Use first letter of each word
  const words = tableName.split(/[_\s-]+/);
  if (words.length > 1) {
    alias = words.map(word => word.charAt(0).toLowerCase()).join('');
  } else {
    // Method 2: Take first few letters
    alias = tableName.substring(0, Math.min(3, tableName.length)).toLowerCase();
  }
  
  // Handle plurals - remove 's' if it makes sense
  if (alias.endsWith('s') && alias.length > 2) {
    alias = alias.slice(0, -1);
  }
  
  // Ensure uniqueness
  let finalAlias = alias;
  let counter = 1;
  while (existingAliases.includes(finalAlias)) {
    finalAlias = `${alias}${counter}`;
    counter++;
  }
  
  return finalAlias;
}

/**
 * Generates aliases for multiple tables, ensuring no conflicts
 */
export function generateTableAliases(tableNames: string[]): TableAlias[] {
  const aliases: TableAlias[] = [];
  const usedAliases: string[] = [];
  
  for (const tableName of tableNames) {
    const alias = generateTableAlias(tableName, usedAliases);
    aliases.push({ tableName, alias });
    usedAliases.push(alias);
  }
  
  return aliases;
}

/**
 * Gets the alias for a specific table from a list of table aliases
 */
export function getAliasForTable(tableAliases: TableAlias[], tableName: string): string {
  const found = tableAliases.find(ta => ta.tableName === tableName);
  return found ? found.alias : tableName; // Fallback to table name if no alias
}

/**
 * Converts a column reference to use table aliases
 * Example: "users.name" -> "u.name" if users has alias "u"
 */
export function convertColumnToAliased(
  columnRef: string, 
  tableAliases: TableAlias[]
): string {
  const [tableName, columnName] = columnRef.split('.');
  if (!tableName || !columnName) return columnRef;
  
  const alias = getAliasForTable(tableAliases, tableName);
  return `${alias}.${columnName}`;
}

/**
 * Common alias patterns for well-known table names
 */
const COMMON_ALIASES: Record<string, string> = {
  'users': 'u',
  'orders': 'o',
  'products': 'p',
  'customers': 'c',
  'companies': 'co',
  'employees': 'e',
  'departments': 'd',
  'categories': 'cat',
  'transactions': 't',
  'payments': 'pay',
  'invoices': 'inv',
  'items': 'i',
  'addresses': 'addr',
  'contacts': 'cont'
};

/**
 * Gets a preferred alias for common table names
 */
export function getPreferredAlias(tableName: string): string {
  const lowerName = tableName.toLowerCase();
  return COMMON_ALIASES[lowerName] || generateTableAlias(tableName);
}