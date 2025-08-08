import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';

interface ResizablePanelsProps {
  children: [React.ReactNode, React.ReactNode];
  direction?: 'horizontal' | 'vertical';
  defaultSplit?: number; // percentage (0-100)
  minSize?: number; // percentage (0-100)
  maxSize?: number; // percentage (0-100)
  className?: string;
  disabled?: boolean;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  children,
  direction = 'vertical',
  defaultSplit = 50,
  minSize = 10,
  maxSize = 90,
  className,
  disabled = false
}) => {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  }, [disabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current || disabled) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    let newSplit: number;
    
    if (direction === 'horizontal') {
      const totalHeight = rect.height;
      const mouseY = e.clientY - rect.top;
      newSplit = (mouseY / totalHeight) * 100;
    } else {
      const totalWidth = rect.width;
      const mouseX = e.clientX - rect.left;
      newSplit = (mouseX / totalWidth) * 100;
    }

    // Apply constraints
    newSplit = Math.max(minSize, Math.min(maxSize, newSplit));
    setSplit(newSplit);
  }, [isDragging, direction, minSize, maxSize, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, direction]);

  const isHorizontal = direction === 'horizontal';
  const firstPanelSize = `${split}%`;
  const secondPanelSize = `${100 - split}%`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full w-full",
        isHorizontal ? "flex-col" : "flex-row",
        className
      )}
    >
      {/* First Panel */}
      <div
        className="overflow-hidden"
        style={{
          [isHorizontal ? 'height' : 'width']: firstPanelSize,
        }}
      >
        {children[0]}
      </div>

      {/* Resizer */}
      <div
        className={cn(
          "bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0 relative group",
          isHorizontal 
            ? "h-1 cursor-row-resize hover:h-2" 
            : "w-1 cursor-col-resize hover:w-2",
          isDragging && (isHorizontal ? "h-2 bg-gray-400" : "w-2 bg-gray-400"),
          disabled && "cursor-default hover:bg-gray-200"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Drag handle indicator */}
        <div className={cn(
          "absolute bg-gray-400 group-hover:bg-gray-600 transition-colors",
          isHorizontal 
            ? "left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 rounded-full"
            : "left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full"
        )} />
      </div>

      {/* Second Panel */}
      <div
        className="overflow-hidden"
        style={{
          [isHorizontal ? 'height' : 'width']: secondPanelSize,
        }}
      >
        {children[1]}
      </div>
    </div>
  );
};

// Convenience component for horizontal split
export const HorizontalResizablePanels: React.FC<Omit<ResizablePanelsProps, 'direction'>> = (props) => (
  <ResizablePanels {...props} direction="horizontal" />
);

// Convenience component for vertical split
export const VerticalResizablePanels: React.FC<Omit<ResizablePanelsProps, 'direction'>> = (props) => (
  <ResizablePanels {...props} direction="vertical" />
);