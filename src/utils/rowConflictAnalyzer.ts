import { DiffRecord } from './types';

/**
 * 分析哪些行有冲突（整行都有差异）
 */
export function getRowsWithConflicts(
  diffs: DiffRecord[],
  sheetName: string,
  maxRow: number
): Set<number> {
  const rowsWithConflicts = new Set<number>();
  
  // 获取该工作表的所有差异
  const sheetDiffs = diffs.filter(d => d.sheetName === sheetName && d.row >= 0 && d.col >= 0);
  
  // 按行分组差异
  const diffsByRow = new Map<number, DiffRecord[]>();
  sheetDiffs.forEach(diff => {
    if (!diffsByRow.has(diff.row)) {
      diffsByRow.set(diff.row, []);
    }
    diffsByRow.get(diff.row)!.push(diff);
  });
  
  // 检查每一行是否整行都有差异
  for (let row = 0; row < maxRow; row++) {
    const rowDiffs = diffsByRow.get(row) || [];
    if (rowDiffs.length > 0) {
      // 如果该行有差异，标记为冲突行
      rowsWithConflicts.add(row);
    }
  }
  
  return rowsWithConflicts;
}
