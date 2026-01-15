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
    
    // 找出需要插入的行（标记为 insertRow 的行）
    const rowsToInsert = new Set<number>();
    const sheetDiffs = diffs.filter(d => d.sheetName === sheetA.name && d.row >= 0 && d.col >= 0);
    sheetDiffs.forEach(diff => {
      if (diff.resolution?.strategy === 'insertRow') {
        rowsToInsert.add(diff.row);
      }
    });

    for (let row = 0; row < maxRow; row++) {
      // 先添加原行
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
          } else if (resolution.strategy === 'insertRow') {
            // 插入行：使用原行的值（文件A的值）
            cellValue = diff.oldValue ?? '';
            cellType = typeof diff.oldValue === 'number' ? 'number' : 'string';
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

      // 如果该行标记为插入，添加新行（使用文件B的值）
      if (rowsToInsert.has(row)) {
        const insertedRowData: CellData[] = [];
        for (let col = 0; col < maxCol; col++) {
          const diff = diffs.find(
            d => d.sheetName === sheetA.name && d.row === row && d.col === col
          );
          
          let cellValue: any = '';
          let cellType: 'number' | 'string' | 'formula' | 'empty' = 'empty';
          
          if (diff && diff.resolution?.strategy === 'insertRow') {
            // 插入行使用文件B的值
            cellValue = diff.newValue ?? '';
            cellType = typeof diff.newValue === 'number' ? 'number' : 'string';
          } else {
            // 没有差异的单元格，使用文件B的值
            const cellB = sheetB?.data[row]?.[col];
            if (cellB && cellB.value !== '' && cellB.value !== null && cellB.value !== undefined) {
              cellValue = cellB.value;
              cellType = cellB.type;
            } else {
              cellValue = '';
              cellType = 'empty';
            }
          }
          
          insertedRowData.push({
            row: row + 0.5, // 使用小数表示插入的行
            col,
            value: cellValue,
            type: cellType
          });
        }
        mergedData.push(insertedRowData);
      }
    }

    return {
      name: sheetA.name,
      data: mergedData,
      rowCount: mergedData.length, // 更新行数（包含插入的行）
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
