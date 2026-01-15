import React, { useState, useRef, useMemo } from 'react';
import { ExcelData, DiffRecord, ResolutionStrategy } from '../utils/types';
import { ExcelViewer } from './ExcelViewer';
import { SheetSelector } from './SheetSelector';
import { ResolutionSettings } from './ResolutionSettings';
import { ExportButton } from './ExportButton';
import { MergedPreview } from './MergedPreview';
import { generateMergedData } from '../utils/mergedDataGenerator';
import './ComparisonView.css';

interface ComparisonViewProps {
  fileA: ExcelData | null;
  fileB: ExcelData | null;
  diffs: DiffRecord[];
  onResolve: (diffId: string, strategy: ResolutionStrategy, customValue?: any) => void;
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
  defaultStrategy,
  onStrategyChange,
  onApplyDefault,
  unresolvedCount
}: ComparisonViewProps) {
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
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

      <SheetSelector
        fileA={fileA}
        fileB={fileB}
        selectedSheet={selectedSheet}
        onSelectSheet={setSelectedSheet}
      />
      <div className="side-by-side-container">
        <div className="excel-viewer-wrapper" ref={scrollSyncRef}>
          <div className="viewer-label">文件A（点击差异单元格采用此文件的值）</div>
          <ExcelViewer
            data={fileA}
            sheetName={selectedSheet}
            diffs={diffs}
            onCellClick={handleCellClick}
            scrollSyncRef={scrollSyncRef}
            fileSource="fileA"
          />
        </div>
        <div className="excel-viewer-wrapper">
          <div className="viewer-label">文件B（点击差异单元格采用此文件的值）</div>
          <ExcelViewer
            data={fileB}
            sheetName={selectedSheet}
            diffs={diffs}
            onCellClick={handleCellClick}
            scrollSyncRef={scrollSyncRef}
            fileSource="fileB"
          />
        </div>
      </div>
      <MergedPreview
        mergedData={mergedData}
        sheetName={selectedSheet}
        diffs={diffs}
      />
    </div>
  );
}
