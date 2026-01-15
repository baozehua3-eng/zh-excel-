import React from 'react';
import { ExcelData, DiffRecord } from '../utils/types';
import { ExcelViewer } from './ExcelViewer';
import './MergedPreview.css';

interface MergedPreviewProps {
  mergedData: ExcelData | null;
  sheetName: string | null;
  diffs: DiffRecord[];
}

export function MergedPreview({ mergedData, sheetName, diffs }: MergedPreviewProps) {
  if (!mergedData) {
    return (
      <div className="merged-preview empty">
        <div className="empty-message">解决冲突后，合并结果将显示在这里</div>
      </div>
    );
  }

  return (
    <div className="merged-preview">
      <div className="merged-preview-header">
        <h3>合并结果预览</h3>
        <div className="merged-preview-hint">
          点击上方文件A或文件B的差异单元格来自动解决冲突
        </div>
      </div>
      <div className="merged-preview-content">
        <ExcelViewer
          data={mergedData}
          sheetName={sheetName}
          diffs={[]}
        />
      </div>
    </div>
  );
}
