import type { Table, Column } from '../types/database';

export interface ForeignKeyRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  confidence: number; // 0-1 score for how confident we are about this relationship
}

/**
 * Detects potential foreign key relationships between tables
 * Uses naming conventions and column types to infer relationships
 */
export function detectForeignKeyRelationships(tables: Table[]): ForeignKeyRelationship[] {
  const relationships: ForeignKeyRelationship[] = [];
  
  // Create a lookup for primary keys
  const primaryKeys = new Map<string, Column>();
  tables.forEach(table => {
    const pk = table.columns.find(col => col.primaryKey);
    if (pk) {
      primaryKeys.set(table.name, pk);
    }
  });

  // Check each table for potential foreign key columns
  tables.forEach(fromTable => {
    fromTable.columns.forEach(fromColumn => {
      // Skip primary keys (they reference themselves)
      if (fromColumn.primaryKey) return;
      
      // Look for potential foreign key relationships
      tables.forEach(toTable => {
        if (fromTable.name === toTable.name) return; // Skip self-references
        
        const toPrimaryKey = primaryKeys.get(toTable.name);
        if (!toPrimaryKey) return; // Target table has no primary key
        
        // Check various naming patterns and calculate confidence
        const confidence = calculateRelationshipConfidence(
          fromTable.name,
          fromColumn,
          toTable.name,
          toPrimaryKey
        );
        
        if (confidence > 0.5) { // Only include high-confidence relationships
          relationships.push({
            fromTable: fromTable.name,
            fromColumn: fromColumn.name,
            toTable: toTable.name,
            toColumn: toPrimaryKey.name,
            confidence
          });
        }
      });
    });
  });
  
  // Sort by confidence (highest first)
  return relationships.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Calculates confidence score for a potential foreign key relationship
 */
function calculateRelationshipConfidence(
  fromTable: string,
  fromColumn: Column,
  toTable: string,
  toPrimaryKey: Column
): number {
  let confidence = 0;
  const fromColName = fromColumn.name.toLowerCase();
  const toTableName = toTable.toLowerCase();
  const toPkName = toPrimaryKey.name.toLowerCase();
  
  // Type compatibility check (essential)
  if (fromColumn.type !== toPrimaryKey.type) {
    return 0; // No relationship if types don't match
  }
  
  // Pattern 1: Column named exactly like "table_id" or "tableId"
  if (fromColName === `${toTableName}_id` || fromColName === `${toTableName}id`) {
    confidence += 0.9;
  }
  
  // Pattern 2: Column named like the primary key of target table
  if (fromColName === toPkName && toPkName === 'id') {
    confidence += 0.3; // Lower confidence for generic "id" names
  } else if (fromColName === toPkName) {
    confidence += 0.8; // Higher confidence for specific names
  }
  
  // Pattern 3: Column ends with "_id" and contains table name
  if (fromColName.endsWith('_id') && fromColName.includes(toTableName)) {
    confidence += 0.7;
  }
  
  // Pattern 4: Singular/plural variations
  const singularTable = toTableName.endsWith('s') ? toTableName.slice(0, -1) : toTableName;
  if (fromColName === `${singularTable}_id` || fromColName === `${singularTable}id`) {
    confidence += 0.8;
  }
  
  // Pattern 5: Common foreign key patterns
  const commonPatterns = [
    `${toTableName}_${toPkName}`,
    `fk_${toTableName}`,
    `${toTableName}ref`,
    `ref_${toTableName}`
  ];
  
  for (const pattern of commonPatterns) {
    if (fromColName === pattern.toLowerCase()) {
      confidence += 0.6;
      break;
    }
  }
  
  // Pattern 6: Column contains target table name
  if (fromColName.includes(toTableName) && fromColName !== fromTable.toLowerCase()) {
    confidence += 0.4;
  }
  
  // Bonus: Both are integer types (common for IDs)
  if (fromColumn.type === 'INTEGER' && toPrimaryKey.type === 'INTEGER') {
    confidence += 0.1;
  }
  
  // Cap confidence at 1.0
  return Math.min(confidence, 1.0);
}

/**
 * Find the best foreign key relationship between two specific tables
 */
export function findForeignKeyBetweenTables(
  tables: Table[],
  fromTableName: string,
  toTableName: string
): ForeignKeyRelationship | null {
  const allRelationships = detectForeignKeyRelationships(tables);
  
  // Find direct relationship from fromTable to toTable
  const directRelationship = allRelationships.find(rel => 
    rel.fromTable === fromTableName && rel.toTable === toTableName
  );
  
  if (directRelationship) {
    return directRelationship;
  }
  
  // Find reverse relationship (toTable to fromTable)
  const reverseRelationship = allRelationships.find(rel => 
    rel.fromTable === toTableName && rel.toTable === fromTableName
  );
  
  if (reverseRelationship) {
    // Swap the relationship direction
    return {
      fromTable: fromTableName,
      fromColumn: reverseRelationship.toColumn,
      toTable: toTableName,
      toColumn: reverseRelationship.fromColumn,
      confidence: reverseRelationship.confidence
    };
  }
  
  return null;
}

/**
 * Get all foreign key relationships for a specific table
 */
export function getForeignKeysForTable(
  tables: Table[],
  tableName: string
): ForeignKeyRelationship[] {
  const allRelationships = detectForeignKeyRelationships(tables);
  return allRelationships.filter(rel => 
    rel.fromTable === tableName || rel.toTable === tableName
  );
}