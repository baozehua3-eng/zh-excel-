import { useState, useCallback } from 'react';
import { ExcelData, DiffRecord, DefaultResolutionStrategy, ResolutionStrategy } from '../utils/types';
import { compareExcelFiles, getDiffStats } from '../utils/comparisonEngine';

export function useExcelComparison() {
  const [fileA, setFileA] = useState<ExcelData | null>(null);
  const [fileB, setFileB] = useState<ExcelData | null>(null);
  const [diffs, setDiffs] = useState<DiffRecord[]>([]);
  const [defaultStrategy, setDefaultStrategy] = useState<DefaultResolutionStrategy>('fileB');

  const compare = useCallback(() => {
    if (!fileA || !fileB) {
      setDiffs([]);
      return;
    }

    const newDiffs = compareExcelFiles(fileA, fileB);
    setDiffs(newDiffs);
  }, [fileA, fileB]);

  const resolveDiff = useCallback((diffId: string, strategy: ResolutionStrategy, customValue?: any) => {
    setDiffs(prev => prev.map(diff => {
      if (diff.id === diffId) {
        return {
          ...diff,
          resolution: {
            strategy,
            resolvedValue: strategy === 'custom' ? customValue : undefined
          }
        };
      }
      return diff;
    }));
  }, []);

  const insertRow = useCallback((row: number, sheetName: string, fileSource: 'fileA' | 'fileB') => {
    // 将该行的所有差异标记为插入行
    setDiffs(prev => prev.map(diff => {
      if (diff.sheetName === sheetName && diff.row === row && diff.row >= 0 && diff.col >= 0) {
        return {
          ...diff,
          resolution: {
            strategy: 'insertRow',
            resolvedValue: fileSource === 'fileA' ? diff.oldValue : diff.newValue
          }
        };
      }
      return diff;
    }));
  }, []);

  const applyDefaultStrategy = useCallback(() => {
    setDiffs(prev => prev.map(diff => {
      if (!diff.resolution || diff.resolution.strategy === 'unresolved') {
        let strategy: ResolutionStrategy = 'unresolved';
        let resolvedValue: any = undefined;

        if (defaultStrategy === 'fileA') {
          strategy = 'fileA';
        } else if (defaultStrategy === 'fileB') {
          strategy = 'fileB';
        } else if (defaultStrategy === 'newValue') {
          strategy = 'fileB';
        } else if (defaultStrategy === 'oldValue') {
          strategy = 'fileA';
        }

        return {
          ...diff,
          resolution: { strategy, resolvedValue }
        };
      }
      return diff;
    }));
  }, [defaultStrategy]);

  const stats = getDiffStats(diffs);

  return {
    fileA,
    fileB,
    setFileA,
    setFileB,
    diffs,
    compare,
    resolveDiff,
    insertRow,
    defaultStrategy,
    setDefaultStrategy,
    applyDefaultStrategy,
    stats
  };
}
