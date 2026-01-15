import React, { useState } from 'react';
import { ExcelData, DiffRecord } from '../utils/types';
import { exportMergedExcel, downloadFile } from '../utils/excelExporter';
import './ExportButton.css';

interface ExportButtonProps {
  fileA: ExcelData | null;
  fileB: ExcelData | null;
  diffs: DiffRecord[];
  defaultStrategy: 'fileA' | 'fileB';
  unresolvedCount: number;
}

export function ExportButton({ fileA, fileB, diffs, defaultStrategy, unresolvedCount }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!fileA || !fileB) {
      alert('请先上传两个Excel文件');
      return;
    }

    if (unresolvedCount > 0) {
      const confirm = window.confirm(
        `还有 ${unresolvedCount} 个未解决的冲突。未解决的冲突将使用默认策略（${defaultStrategy === 'fileA' ? '文件A' : '文件B'}）。是否继续导出？`
      );
      if (!confirm) return;
    }

    setIsExporting(true);
    try {
      const blob = exportMergedExcel(fileA, fileB, diffs, defaultStrategy);
      const filename = `合并结果_${new Date().toISOString().slice(0, 10)}.xlsx`;
      downloadFile(blob, filename);
    } catch (error) {
      alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="export-button"
      onClick={handleExport}
      disabled={!fileA || !fileB || isExporting}
    >
      {isExporting ? '导出中...' : '导出整合后的Excel文件'}
    </button>
  );
}
