import React, { useState, useRef, useMemo } from 'react';
import { ExcelData, DiffRecord, ResolutionStrategy } from '../utils/types';
import { ExcelViewer } from './ExcelViewer';
import { SheetSelector } from './SheetSelector';
import { ResolutionSettings } from './ResolutionSettings';
import { ExportButton } from './ExportButton';
import { MergedPreview } from './MergedPreview';
import { generateMergedData } from '../utils/mergedDataGenerator';
import { analyzeIdenticalRowsAndCols } from '../utils/diffFilter';
import { getRowsWithConflicts } from '../utils/rowConflictAnalyzer';
import './ComparisonView.css';

interface ComparisonViewProps {
  fileA: ExcelData | null;
  fileB: ExcelData | null;
  diffs: DiffRecord[];
  onResolve: (diffId: string, strategy: ResolutionStrategy, customValue?: any) => void;
  onInsertRow?: (row: number, sheetName: string, fileSource: 'fileA' | 'fileB') => void;
  defaultStrategy: 'fileA' | 'fileB' | 'newValue' | 'oldValue' | 'manual';
  onStrategyChange: (strategy: 'fileA' | 'fileB' | 'newValue' | 'oldValue' | 'manual') => void;
  onApplyDefault: () => void;
  unresolvedCount: number;
}

export function ComparisonView({
  fileA,
  fileB,
  diffs,
  onResolve,
  onInsertRow,
  defaultStrategy,
  onStrategyChange,
  onApplyDefault,
  unresolvedCount
}: ComparisonViewProps) {
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [hideIdenticalContent, setHideIdenticalContent] = useState<boolean>(true);
  const scrollSyncRef = useRef<HTMLDivElement>(null);

  // 自动选择第一个工作表
  React.useEffect(() => {
    if (!selectedSheet && fileA && fileA.sheets.length > 0) {
      setSelectedSheet(fileA.sheets[0].name);
    } else if (!selectedSheet && fileB && fileB.sheets.length > 0) {
      setSelectedSheet(fileB.sheets[0].name);
    }
  }, [fileA, fileB, selectedSheet]);

  // 生成合并后的预览数据
  const mergedData = useMemo(() => {
    if (!fileA || !fileB) return null;
    const defaultStrategyForPreview = defaultStrategy === 'fileA' || defaultStrategy === 'oldValue' ? 'fileA' : 'fileB';
    return generateMergedData(fileA, fileB, diffs, defaultStrategyForPreview);
  }, [fileA, fileB, diffs, defaultStrategy]);

  // 分析相同行和列
  const { identicalRows, identicalCols } = useMemo(() => {
    if (!fileA || !fileB || !selectedSheet) {
      return { identicalRows: new Set<number>(), identicalCols: new Set<number>() };
    }
    return analyzeIdenticalRowsAndCols(fileA, fileB, diffs, selectedSheet);
  }, [fileA, fileB, diffs, selectedSheet]);

  // 分析冲突行
  const conflictRows = useMemo(() => {
    if (!fileA || !fileB || !selectedSheet) {
      return new Set<number>();
    }
    const maxRow = Math.max(
      fileA.sheets.find(s => s.name === selectedSheet)?.rowCount ?? 0,
      fileB.sheets.find(s => s.name === selectedSheet)?.rowCount ?? 0
    );
    return getRowsWithConflicts(diffs, selectedSheet, maxRow);
  }, [fileA, fileB, diffs, selectedSheet]);

  const handleCellClick = (row: number, col: number, fileSource?: 'fileA' | 'fileB') => {
    const diff = diffs.find(
      d => d.sheetName === selectedSheet && d.row === row && d.col === col
    );
    if (diff && fileSource) {
      // 点击差异单元格时，直接采用该文件的值（允许重复点击切换选择）
      const strategy: ResolutionStrategy = fileSource === 'fileA' ? 'fileA' : 'fileB';
      onResolve(diff.id, strategy);
    }
  };

  const handleInsertRow = (row: number, fileSource?: 'fileA' | 'fileB') => {
    if (selectedSheet && fileSource && onInsertRow) {
      onInsertRow(row, selectedSheet, fileSource);
    }
  };

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <div className="header-info">
          <h2>Excel文件对比</h2>
          <p className="usage-hint">点击文件A或文件B中的差异单元格来选择采用哪个文件的值</p>
        </div>
        <ExportButton
          fileA={fileA}
          fileB={fileB}
          diffs={diffs}
          defaultStrategy={defaultStrategy === 'fileA' || defaultStrategy === 'oldValue' ? 'fileA' : 'fileB'}
          unresolvedCount={unresolvedCount}
        />
      </div>

      <ResolutionSettings
        defaultStrategy={defaultStrategy}
        onStrategyChange={onStrategyChange}
        onApplyDefault={onApplyDefault}
        unresolvedCount={unresolvedCount}
      />

      <div className="view-controls">
        <SheetSelector
          fileA={fileA}
          fileB={fileB}
          selectedSheet={selectedSheet}
          onSelectSheet={setSelectedSheet}
        />
        <div className="filter-control">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={hideIdenticalContent}
              onChange={(e) => setHideIdenticalContent(e.target.checked)}
            />
            <span>隐藏相同内容（只显示差异）</span>
          </label>
          {hideIdenticalContent && (
            <span className="filter-info">
              （已隐藏 {identicalRows.size} 行，{identicalCols.size} 列）
            </span>
          )}
        </div>
      </div>
      <div className="side-by-side-container">
        <div className="excel-viewer-wrapper" ref={scrollSyncRef}>
          <div className="viewer-label">文件A（点击差异单元格采用此文件的值）</div>
          <ExcelViewer
            data={fileA}
            sheetName={selectedSheet}
            diffs={diffs}
            onCellClick={handleCellClick}
            onInsertRow={handleInsertRow}
            scrollSyncRef={scrollSyncRef}
            fileSource="fileA"
            hideIdenticalRows={hideIdenticalContent ? identicalRows : new Set()}
            hideIdenticalCols={hideIdenticalContent ? identicalCols : new Set()}
            conflictRows={conflictRows}
          />
        </div>
        <div className="excel-viewer-wrapper">
          <div className="viewer-label">文件B（点击差异单元格采用此文件的值）</div>
          <ExcelViewer
            data={fileB}
            sheetName={selectedSheet}
            diffs={diffs}
            onCellClick={handleCellClick}
            onInsertRow={handleInsertRow}
            scrollSyncRef={scrollSyncRef}
            fileSource="fileB"
            hideIdenticalRows={hideIdenticalContent ? identicalRows : new Set()}
            hideIdenticalCols={hideIdenticalContent ? identicalCols : new Set()}
            conflictRows={conflictRows}
          />
        </div>
      </div>
      <MergedPreview
        mergedData={mergedData}
        sheetName={selectedSheet}
        diffs={diffs}
        hideIdenticalRows={hideIdenticalContent ? identicalRows : new Set()}
        hideIdenticalCols={hideIdenticalContent ? identicalCols : new Set()}
      />
    </div>
  );
}
