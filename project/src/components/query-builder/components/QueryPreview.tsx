import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { cn } from '../../../utils/cn';

interface QueryPreviewProps {
  sql: string;
  editable?: boolean;
  fullHeight?: boolean;
  sidebarMode?: boolean;
  onSqlChange?: (sql: string) => void;
}

export const QueryPreview: React.FC<QueryPreviewProps> = ({
  sql,
  editable = false,
  fullHeight = false,
  sidebarMode = false,
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
    <div className={cn(
      "flex flex-col bg-white", 
      fullHeight ? "h-full" : "",
      sidebarMode ? "h-full" : "border-t"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between border-b bg-gray-50",
        sidebarMode ? "p-2" : "p-3"
      )}>
        <h3 className={cn("font-semibold", sidebarMode ? "text-xs" : "text-sm")}>SQL Preview</h3>
        <div className={cn("flex", sidebarMode ? "gap-1" : "gap-2")}>
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
            className={cn(sidebarMode ? "h-6 px-1 text-xs" : "h-7 px-2")}
          >
            {copied ? '✓' : '📋'}
          </Button>
          
          {editable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className={cn(sidebarMode ? "h-6 px-1 text-xs" : "h-7 px-2")}
            >
              {isEditing ? '👁️' : '✏️'}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-hidden",
        sidebarMode ? "p-2" : "p-3",
        fullHeight ? "overflow-hidden" : ""
      )}>
        {isEditing ? (
          <div className="h-full flex flex-col space-y-2">
            <textarea
              value={editedSql}
              onChange={(e) => setEditedSql(e.target.value)}
              className={cn(
                "w-full font-mono border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                sidebarMode ? "text-xs p-2 flex-1" : "text-sm p-3",
                fullHeight ? "flex-1" : sidebarMode ? "flex-1" : "h-48"
              )}
              placeholder="Enter your SQL query..."
              spellCheck={false}
            />
            
            <div className={cn("flex", sidebarMode ? "gap-1" : "gap-2")}>
              <Button size={sidebarMode ? "sm" : "sm"} onClick={handleSave} className={sidebarMode ? "text-xs h-7" : ""}>
                Apply
              </Button>
              <Button size={sidebarMode ? "sm" : "sm"} variant="outline" onClick={handleCancel} className={sidebarMode ? "text-xs h-7" : ""}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {sql ? (
              <pre className={cn(
                "font-mono bg-gray-50 rounded-md border overflow-x-auto whitespace-pre-wrap",
                sidebarMode ? "text-xs p-2" : "text-sm p-3"
              )}>
                <code className="language-sql">
                  {formatSQL(sql)}
                </code>
              </pre>
            ) : (
              <div className={cn(
                "text-center text-muted-foreground",
                sidebarMode ? "py-4" : "py-8"
              )}>
                <div className={cn("mb-2", sidebarMode ? "text-2xl" : "text-4xl")}>📝</div>
                <p className={cn(sidebarMode ? "text-xs" : "text-sm")}>Query will appear here</p>
                {!sidebarMode && <p className="text-xs mt-1">Select tables and fields to build your query</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {sql && !isEditing && !sidebarMode && (
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