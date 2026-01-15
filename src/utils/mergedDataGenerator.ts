import { ExcelData, DiffRecord } from './types';
import { CellData } from './types';

/**
 * 根据解决结果生成合并后的Excel数据（用于预览）
 */
export function generateMergedData(
  fileA: ExcelData,
  fileB: ExcelData,
  diffs: DiffRecord[],
  defaultStrategy: 'fileA' | 'fileB' = 'fileB'
): ExcelData {
  const mergedSheets = fileA.sheets.map(sheetA => {
    const sheetB = fileB.sheets.find(s => s.name === sheetA.name);
    
    // 使用两个文件中较大的尺寸
    const maxRow = Math.max(
      sheetA.rowCount,
      sheetB?.rowCount ?? 0
    );
    const maxCol = Math.max(
      sheetA.colCount,
      sheetB?.colCount ?? 0
    );

    const mergedData: CellData[][] = [];

    for (let row = 0; row < maxRow; row++) {
      const rowData: CellData[] = [];
      for (let col = 0; col < maxCol; col++) {
        // 查找该单元格的差异记录
        const diff = diffs.find(
          d => d.sheetName === sheetA.name && d.row === row && d.col === col
        );

        let cellValue: any = '';
        let cellType: 'number' | 'string' | 'formula' | 'empty' = 'empty';

        if (diff && diff.resolution) {
          // 使用已解决的冲突值
          const resolution = diff.resolution;
          if (resolution.strategy === 'fileA') {
            cellValue = diff.oldValue ?? '';
            cellType = typeof diff.oldValue === 'number' ? 'number' : 'string';
          } else if (resolution.strategy === 'fileB') {
            cellValue = diff.newValue ?? '';
            cellType = typeof diff.newValue === 'number' ? 'number' : 'string';
          } else if (resolution.strategy === 'custom' && resolution.resolvedValue !== undefined) {
            cellValue = resolution.resolvedValue;
            cellType = typeof resolution.resolvedValue === 'number' ? 'number' : 'string';
          } else {
            // 未解决，使用默认策略
            cellValue = defaultStrategy === 'fileA' ? diff.oldValue : diff.newValue;
            cellType = typeof cellValue === 'number' ? 'number' : 'string';
          }
        } else if (diff) {
          // 有差异但未解决，使用默认策略
          cellValue = defaultStrategy === 'fileA' ? diff.oldValue : diff.newValue;
          cellType = typeof cellValue === 'number' ? 'number' : 'string';
        } else {
          // 无差异，优先使用文件A的值，如果文件A没有则使用文件B
          const cellA = sheetA.data[row]?.[col];
          const cellB = sheetB?.data[row]?.[col];
          
          if (cellA && cellA.value !== '' && cellA.value !== null && cellA.value !== undefined) {
            cellValue = cellA.value;
            cellType = cellA.type;
          } else if (cellB && cellB.value !== '' && cellB.value !== null && cellB.value !== undefined) {
            cellValue = cellB.value;
            cellType = cellB.type;
          } else {
            cellValue = '';
            cellType = 'empty';
          }
        }

        rowData.push({
          row,
          col,
          value: cellValue,
          type: cellType
        });
      }
      mergedData.push(rowData);
    }

    return {
      name: sheetA.name,
      data: mergedData,
      rowCount: maxRow,
      colCount: maxCol
    };
  });

  // 处理文件B中独有的工作表
  fileB.sheets.forEach(sheetB => {
    if (!fileA.sheets.find(s => s.name === sheetB.name)) {
      mergedSheets.push({
        name: sheetB.name,
        data: sheetB.data,
        rowCount: sheetB.rowCount,
        colCount: sheetB.colCount
      });
    }
  });

  return {
    fileName: `合并结果_${new Date().toISOString().slice(0, 10)}.xlsx`,
    sheets: mergedSheets
  };
}
