import React, { useState, useRef } from 'react';
import { ExcelData, DiffRecord, ResolutionStrategy } from '../utils/types';
import { ExcelViewer } from './ExcelViewer';
import { SheetSelector } from './SheetSelector';
import { DiffList } from './DiffList';
import { ResolutionSettings } from './ResolutionSettings';
import { ExportButton } from './ExportButton';
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
  const [viewMode, setViewMode] = useState<'side-by-side' | 'list'>('side-by-side');
  const scrollSyncRef = useRef<HTMLDivElement>(null);

  // 自动选择第一个工作表
  React.useEffect(() => {
    if (!selectedSheet && fileA && fileA.sheets.length > 0) {
      setSelectedSheet(fileA.sheets[0].name);
    } else if (!selectedSheet && fileB && fileB.sheets.length > 0) {
      setSelectedSheet(fileB.sheets[0].name);
    }
  }, [fileA, fileB, selectedSheet]);

  const [selectedDiffId, setSelectedDiffId] = useState<string | null>(null);

  const handleCellClick = (row: number, col: number) => {
    const diff = diffs.find(
      d => d.sheetName === selectedSheet && d.row === row && d.col === col
    );
    if (diff) {
      // 切换到差异清单视图并选中该差异
      setSelectedDiffId(diff.id);
      setViewMode('list');
    }
  };

  const handleDiffClick = (diff: DiffRecord) => {
    setSelectedSheet(diff.sheetName);
    setViewMode('side-by-side');
    setSelectedDiffId(diff.id);
  };

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <div className="view-mode-toggle">
          <button
            className={viewMode === 'side-by-side' ? 'active' : ''}
            onClick={() => setViewMode('side-by-side')}
          >
            并排对比
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            差异清单
          </button>
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

      {viewMode === 'side-by-side' ? (
        <>
          <SheetSelector
            fileA={fileA}
            fileB={fileB}
            selectedSheet={selectedSheet}
            onSelectSheet={setSelectedSheet}
          />
          <div className="side-by-side-container">
            <div className="excel-viewer-wrapper" ref={scrollSyncRef}>
              <div className="viewer-label">文件A</div>
              <ExcelViewer
                data={fileA}
                sheetName={selectedSheet}
                diffs={diffs}
                onCellClick={handleCellClick}
                scrollSyncRef={scrollSyncRef}
              />
            </div>
            <div className="excel-viewer-wrapper">
              <div className="viewer-label">文件B</div>
              <ExcelViewer
                data={fileB}
                sheetName={selectedSheet}
                diffs={diffs}
                onCellClick={handleCellClick}
                scrollSyncRef={scrollSyncRef}
              />
            </div>
          </div>
        </>
      ) : (
        <DiffList
          diffs={diffs}
          onResolve={onResolve}
          onCellClick={handleDiffClick}
          selectedDiffId={selectedDiffId}
          onSelectedDiffChange={setSelectedDiffId}
        />
      )}
    </div>
  );
}
