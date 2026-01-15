import { ExcelData, DiffRecord } from './types';

/**
 * 分析哪些行和列是完全相同的（没有任何差异）
 */
export function analyzeIdenticalRowsAndCols(
  fileA: ExcelData,
  fileB: ExcelData,
  diffs: DiffRecord[],
  sheetName: string
): { identicalRows: Set<number>, identicalCols: Set<number> } {
  const identicalRows = new Set<number>();
  const identicalCols = new Set<number>();

  const sheetA = fileA.sheets.find(s => s.name === sheetName);
  const sheetB = fileB.sheets.find(s => s.name === sheetName);

  if (!sheetA || !sheetB) {
    return { identicalRows, identicalCols };
  }

  // 获取该工作表的所有差异
  const sheetDiffs = diffs.filter(d => d.sheetName === sheetName && d.row >= 0 && d.col >= 0);

  // 找出有差异的行和列
  const rowsWithDiff = new Set<number>();
  const colsWithDiff = new Set<number>();

  sheetDiffs.forEach(diff => {
    rowsWithDiff.add(diff.row);
    colsWithDiff.add(diff.col);
  });

  // 找出完全相同的行（整行都没有差异）
  const maxRow = Math.max(sheetA.rowCount, sheetB.rowCount);
  for (let row = 0; row < maxRow; row++) {
    if (!rowsWithDiff.has(row)) {
      identicalRows.add(row);
    }
  }

  // 找出完全相同的列（整列都没有差异）
  const maxCol = Math.max(sheetA.colCount, sheetB.colCount);
  for (let col = 0; col < maxCol; col++) {
    if (!colsWithDiff.has(col)) {
      identicalCols.add(col);
    }
  }

  return { identicalRows, identicalCols };
}
