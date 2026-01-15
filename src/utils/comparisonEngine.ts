import { ExcelData, DiffRecord, DiffType } from './types';

export function compareExcelFiles(fileA: ExcelData, fileB: ExcelData): DiffRecord[] {
  const diffs: DiffRecord[] = [];
  let diffId = 0;

  // 获取所有工作表名称的并集
  const allSheetNames = new Set<string>();
  fileA.sheets.forEach(s => allSheetNames.add(s.name));
  fileB.sheets.forEach(s => allSheetNames.add(s.name));

  // 对比每个工作表
  allSheetNames.forEach(sheetName => {
    const sheetA = fileA.sheets.find(s => s.name === sheetName);
    const sheetB = fileB.sheets.find(s => s.name === sheetName);

    // 工作表存在性对比
    if (!sheetA && sheetB) {
      diffs.push({
        id: `diff-${diffId++}`,
        type: 'added',
        sheetName,
        row: -1,
        col: -1,
        oldValue: null,
        newValue: `工作表 "${sheetName}" 在文件B中存在`,
        category: 'structure'
      });
    } else if (sheetA && !sheetB) {
      diffs.push({
        id: `diff-${diffId++}`,
        type: 'deleted',
        sheetName,
        row: -1,
        col: -1,
        oldValue: `工作表 "${sheetName}" 在文件A中存在`,
        newValue: null,
        category: 'structure'
      });
    } else if (sheetA && sheetB) {
      // 对比表结构
      if (sheetA.rowCount !== sheetB.rowCount || sheetA.colCount !== sheetB.colCount) {
        diffs.push({
          id: `diff-${diffId++}`,
          type: 'structure',
          sheetName,
          row: -1,
          col: -1,
          oldValue: `${sheetA.rowCount}行 × ${sheetA.colCount}列`,
          newValue: `${sheetB.rowCount}行 × ${sheetB.colCount}列`,
          category: 'structure'
        });
      }

      // 对比单元格内容
      const maxRow = Math.max(sheetA.rowCount, sheetB.rowCount);
      const maxCol = Math.max(sheetA.colCount, sheetB.colCount);

      for (let row = 0; row < maxRow; row++) {
        for (let col = 0; col < maxCol; col++) {
          const cellA = sheetA.data[row]?.[col];
          const cellB = sheetB.data[row]?.[col];

          const valueA = cellA?.value ?? '';
          const valueB = cellB?.value ?? '';

          // 标准化值用于比较
          const normalizedA = normalizeValue(valueA);
          const normalizedB = normalizeValue(valueB);

          if (normalizedA !== normalizedB) {
            const diffType: DiffType = 
              !valueA && valueB ? 'added' :
              valueA && !valueB ? 'deleted' :
              'modified';

            const category = 
              typeof valueA === 'number' || typeof valueB === 'number' ? 'value' :
              'text';

            diffs.push({
              id: `diff-${diffId++}`,
              type: diffType,
              sheetName,
              row,
              col,
              oldValue: valueA,
              newValue: valueB,
              category
            });
          }
        }
      }
    }
  });

  return diffs;
}

function normalizeValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    // 处理数字精度问题
    return value.toString();
  }
  return String(value).trim();
}

export function getDiffStats(diffs: DiffRecord[]) {
  return {
    total: diffs.length,
    added: diffs.filter(d => d.type === 'added').length,
    deleted: diffs.filter(d => d.type === 'deleted').length,
    modified: diffs.filter(d => d.type === 'modified').length,
    structure: diffs.filter(d => d.type === 'structure').length,
    resolved: diffs.filter(d => d.resolution && d.resolution.strategy !== 'unresolved').length,
    unresolved: diffs.filter(d => !d.resolution || d.resolution.strategy === 'unresolved').length
  };
}
