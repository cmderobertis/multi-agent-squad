import React from 'react';
import { cn } from '../../../utils/cn';
import type { QueryBuilderTab } from '../../../types/query-builder';

interface QueryBuilderTabsProps {
  activeTab: QueryBuilderTab;
  onTabChange: (tab: QueryBuilderTab) => void;
  hasResults: boolean;
}

export const QueryBuilderTabs: React.FC<QueryBuilderTabsProps> = ({
  activeTab,
  onTabChange,
  hasResults
}) => {
  const tabs = [
    { id: 'builder' as const, label: 'Visual Builder', icon: '🔧' },
    { id: 'sql' as const, label: 'SQL Editor', icon: '📝' },
    { id: 'results' as const, label: 'Results', icon: '📊', disabled: !hasResults },
    { id: 'history' as const, label: 'History', icon: '📚' },
  ];

  return (
    <div className="border-b bg-card">
      <nav className="flex px-4" aria-label="Query Builder Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === 'results' && hasResults && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                New
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};