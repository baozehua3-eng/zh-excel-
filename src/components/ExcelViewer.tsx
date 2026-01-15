import React, { useRef, useEffect } from 'react';
import { ExcelData, DiffRecord } from '../utils/types';
import './ExcelViewer.css';

interface ExcelViewerProps {
  data: ExcelData | null;
  sheetName: string | null;
  diffs: DiffRecord[];
  onCellClick?: (row: number, col: number, fileSource?: 'fileA' | 'fileB') => void;
  onInsertRow?: (row: number, fileSource?: 'fileA' | 'fileB') => void;
  scrollSyncRef?: React.RefObject<HTMLDivElement>;
  fileSource?: 'fileA' | 'fileB'; // 标识这是文件A还是文件B
  hideIdenticalRows?: Set<number>; // 要隐藏的相同行
  hideIdenticalCols?: Set<number>; // 要隐藏的相同列
  conflictRows?: Set<number>; // 有冲突的行
}

export function ExcelViewer({ 
  data, 
  sheetName, 
  diffs, 
  onCellClick,
  onInsertRow,
  scrollSyncRef, 
  fileSource,
  hideIdenticalRows = new Set(),
  hideIdenticalCols = new Set(),
  conflictRows = new Set()
}: ExcelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollSyncRef?.current && containerRef.current) {
      const syncScroll = () => {
        if (scrollSyncRef.current && containerRef.current) {
          containerRef.current.scrollLeft = scrollSyncRef.current.scrollLeft;
        }
      };

      const target = scrollSyncRef.current;
      target.addEventListener('scroll', syncScroll);
      return () => target.removeEventListener('scroll', syncScroll);
    }
  }, [scrollSyncRef]);

  if (!data || !sheetName) {
    return (
      <div className="excel-viewer empty">
        <div className="empty-message">请上传Excel文件</div>
      </div>
    );
  }

  const sheet = data.sheets.find(s => s.name === sheetName);
  if (!sheet) {
    return (
      <div className="excel-viewer empty">
        <div className="empty-message">工作表不存在</div>
      </div>
    );
  }

  // 获取该工作表的差异
  const sheetDiffs = diffs.filter(d => d.sheetName === sheetName);
  const diffMap = new Map<string, DiffRecord>();
  sheetDiffs.forEach(diff => {
    if (diff.row >= 0 && diff.col >= 0) {
      diffMap.set(`${diff.row}-${diff.col}`, diff);
    }
  });

  const getCellClass = (row: number, col: number): string => {
    const diff = diffMap.get(`${row}-${col}`);
    if (!diff) return 'cell';
    
    const classes = ['cell', 'cell-diff'];
    if (diff.type === 'added') classes.push('cell-added');
    if (diff.type === 'deleted') classes.push('cell-deleted');
    if (diff.type === 'modified') classes.push('cell-modified');
    
    // 只有当解决方案选择的文件与当前查看的文件一致时，才显示对勾
    if (diff.resolution && diff.resolution.strategy !== 'unresolved') {
      const isResolvedForThisFile = 
        (diff.resolution.strategy === 'fileA' && fileSource === 'fileA') ||
        (diff.resolution.strategy === 'fileB' && fileSource === 'fileB');
      
      if (isResolvedForThisFile) {
        classes.push('cell-resolved');
      }
    }
    
    return classes.join(' ');
  };

  // 过滤要显示的行和列
  const visibleRows = Array.from({ length: sheet.rowCount }, (_, i) => i)
    .filter(row => !hideIdenticalRows.has(row));
  const visibleCols = Array.from({ length: sheet.colCount }, (_, i) => i)
    .filter(col => !hideIdenticalCols.has(col));

  return (
    <div className="excel-viewer" ref={containerRef}>
      <div className="excel-table-wrapper">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="row-header"></th>
              {visibleCols.map((col) => (
                <th key={col} className="col-header">
                  {String.fromCharCode(65 + (col % 26))}
                  {col >= 26 ? Math.floor(col / 26) : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const hasConflict = conflictRows.has(row);
              const rowDiffs = diffs.filter(d => d.sheetName === sheetName && d.row === row);
              const isInserted = rowDiffs.some(d => d.resolution?.strategy === 'insertRow');
              
              return (
                <tr key={row}>
                  <td className="row-header">
                    <div className="row-header-content">
                      {hasConflict && !isInserted && (
                        <button
                          className="insert-row-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInsertRow?.(row, fileSource);
                          }}
                          title="点击将此行作为新行插入到原行下方（保留两行内容）"
                        >
                          +
                        </button>
                      )}
                      {isInserted && (
                        <span className="inserted-indicator" title="此行将被插入">↳</span>
                      )}
                      <span>{row + 1}</span>
                    </div>
                  </td>
                  {visibleCols.map((col) => {
                  const cell = sheet.data[row]?.[col];
                  const value = cell?.value ?? '';
                  const diff = diffMap.get(`${row}-${col}`);
                  
                  return (
                    <td
                      key={col}
                      className={getCellClass(row, col)}
                      onClick={() => onCellClick?.(row, col, fileSource)}
                      title={diff ? `差异: ${diff.oldValue} → ${diff.newValue} (点击采用当前文件的值)` : ''}
                    >
                      {value}
                    </td>
                  );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
