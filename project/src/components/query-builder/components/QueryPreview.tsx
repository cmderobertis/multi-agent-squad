import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { cn } from '../../../utils/cn';

interface QueryPreviewProps {
  sql: string;
  editable?: boolean;
  fullHeight?: boolean;
  onSqlChange?: (sql: string) => void;
}

export const QueryPreview: React.FC<QueryPreviewProps> = ({
  sql,
  editable = false,
  fullHeight = false,
  onSqlChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSql, setEditedSql] = useState(sql);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditedSql(sql);
  }, [sql]);

  const handleSave = () => {
    onSqlChange?.(editedSql);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSql(sql);
    setIsEditing(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatSQL = (sqlText: string) => {
    // Simple SQL formatting - add line breaks and indentation
    return sqlText
      .replace(/\bSELECT\b/gi, '\nSELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bJOIN\b/gi, '\n  JOIN')
      .replace(/\bLEFT JOIN\b/gi, '\n  LEFT JOIN')
      .replace(/\bRIGHT JOIN\b/gi, '\n  RIGHT JOIN')
      .replace(/\bINNER JOIN\b/gi, '\n  INNER JOIN')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bLIMIT\b/gi, '\nLIMIT')
      .trim();
  };

  return (
    <div className={cn("border-t bg-white flex flex-col", fullHeight ? "h-full" : "")}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <h3 className="font-semibold text-sm">SQL Preview</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
            className="h-7 px-2"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </Button>
          
          {editable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="h-7 px-2"
            >
              {isEditing ? '👁️ Preview' : '✏️ Edit'}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex-1 p-3", fullHeight ? "overflow-hidden" : "")}>
        {isEditing ? (
          <div className="h-full flex flex-col space-y-3">
            <textarea
              value={editedSql}
              onChange={(e) => setEditedSql(e.target.value)}
              className={cn(
                "w-full font-mono text-sm border rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                fullHeight ? "flex-1" : "h-48"
              )}
              placeholder="Enter your SQL query..."
              spellCheck={false}
            />
            
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Apply Changes
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn("h-full overflow-auto", fullHeight ? "" : "max-h-48")}>
            {sql ? (
              <pre className="font-mono text-sm bg-gray-50 p-3 rounded-md border overflow-x-auto whitespace-pre-wrap">
                <code className="language-sql">
                  {formatSQL(sql)}
                </code>
              </pre>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm">Your query will appear here</p>
                <p className="text-xs mt-1">Select tables and fields to build your query</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {sql && !isEditing && (
        <div className="px-3 pb-3 text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>
              Query length: {sql.length} characters
            </span>
            <span>
              Lines: {sql.split('\n').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};