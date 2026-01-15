import React, { useRef, useEffect } from 'react';
import { ExcelData, DiffRecord } from '../utils/types';
import './ExcelViewer.css';

interface ExcelViewerProps {
  data: ExcelData | null;
  sheetName: string | null;
  diffs: DiffRecord[];
  onCellClick?: (row: number, col: number, fileSource?: 'fileA' | 'fileB') => void;
  scrollSyncRef?: React.RefObject<HTMLDivElement>;
  fileSource?: 'fileA' | 'fileB'; // 标识这是文件A还是文件B
}

export function ExcelViewer({ data, sheetName, diffs, onCellClick, scrollSyncRef, fileSource }: ExcelViewerProps) {
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
    if (diff.resolution) classes.push('cell-resolved');
    
    return classes.join(' ');
  };

  return (
    <div className="excel-viewer" ref={containerRef}>
      <div className="excel-table-wrapper">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="row-header"></th>
              {Array.from({ length: sheet.colCount }, (_, i) => (
                <th key={i} className="col-header">
                  {String.fromCharCode(65 + (i % 26))}
                  {i >= 26 ? Math.floor(i / 26) : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: sheet.rowCount }, (_, row) => (
              <tr key={row}>
                <td className="row-header">{row + 1}</td>
                {Array.from({ length: sheet.colCount }, (_, col) => {
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
