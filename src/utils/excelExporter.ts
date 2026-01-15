import * as XLSX from 'xlsx';
import { ExcelData, DiffRecord, ResolutionStrategy } from './types';

export function exportMergedExcel(
  fileA: ExcelData,
  fileB: ExcelData,
  diffs: DiffRecord[],
  defaultStrategy: 'fileA' | 'fileB' = 'fileB'
): Blob {
  // 创建新的工作簿
  const workbook = XLSX.utils.book_new();

  // 获取所有工作表名称
  const allSheetNames = new Set<string>();
  fileA.sheets.forEach(s => allSheetNames.add(s.name));
  fileB.sheets.forEach(s => allSheetNames.add(s.name));

  allSheetNames.forEach(sheetName => {
    const sheetA = fileA.sheets.find(s => s.name === sheetName);
    const sheetB = fileB.sheets.find(s => s.name === sheetName);

    // 确定使用哪个文件作为基础
    const baseSheet = defaultStrategy === 'fileA' ? sheetA : sheetB;
    const otherSheet = defaultStrategy === 'fileA' ? sheetB : sheetA;
    if (!baseSheet) return;

    // 使用两个文件中较大的尺寸，确保不丢失数据
    const maxRow = Math.max(
      baseSheet?.rowCount ?? 0,
      otherSheet?.rowCount ?? 0
    );
    const maxCol = Math.max(
      baseSheet?.colCount ?? 0,
      otherSheet?.colCount ?? 0
    );
    const data: any[][] = [];
    
    // 找出需要插入的行
    const rowsToInsert = new Set<number>();
    const sheetDiffs = diffs.filter(d => d.sheetName === sheetName && d.row >= 0 && d.col >= 0);
    sheetDiffs.forEach(diff => {
      if (diff.resolution?.strategy === 'insertRow') {
        rowsToInsert.add(diff.row);
      }
    });

    for (let row = 0; row < maxRow; row++) {
      // 先添加原行
      const rowData: any[] = [];
      for (let col = 0; col < maxCol; col++) {
        // 查找该单元格的差异记录
        const diff = diffs.find(
          d => d.sheetName === sheetName && d.row === row && d.col === col
        );

        let cellValue: any = '';

        if (diff && diff.resolution) {
          // 使用已解决的冲突值
          const resolution = diff.resolution;
          if (resolution.strategy === 'fileA') {
            cellValue = diff.oldValue ?? '';
          } else if (resolution.strategy === 'fileB') {
            cellValue = diff.newValue ?? '';
          } else if (resolution.strategy === 'insertRow') {
            // 插入行：使用原行的值（文件A的值）
            cellValue = diff.oldValue ?? '';
          } else if (resolution.strategy === 'custom' && resolution.resolvedValue !== undefined) {
            cellValue = resolution.resolvedValue;
          } else {
            // 未解决，使用默认策略
            cellValue = defaultStrategy === 'fileA' ? diff.oldValue : diff.newValue;
          }
        } else if (diff) {
          // 有差异但未解决，使用默认策略
          cellValue = defaultStrategy === 'fileA' ? diff.oldValue : diff.newValue;
        } else {
          // 无差异，使用基础文件的值
          const baseCell = baseSheet.data[row]?.[col];
          cellValue = baseCell?.value ?? '';
        }

        rowData.push(cellValue);
      }
      data.push(rowData);

      // 如果该行标记为插入，添加新行（使用文件B的值）
      if (rowsToInsert.has(row)) {
        const insertedRowData: any[] = [];
        for (let col = 0; col < maxCol; col++) {
          const diff = diffs.find(
            d => d.sheetName === sheetName && d.row === row && d.col === col
          );
          
          let cellValue: any = '';
          
          if (diff && diff.resolution?.strategy === 'insertRow') {
            // 插入行使用文件B的值
            cellValue = diff.newValue ?? '';
          } else {
            // 没有差异的单元格，使用文件B的值
            const otherCell = otherSheet?.data[row]?.[col];
            cellValue = otherCell?.value ?? '';
          }
          
          insertedRowData.push(cellValue);
        }
        data.push(insertedRowData);
      }
    }

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // 生成Excel文件
  const excelBuffer = XLSX.write(workbook, { 
    type: 'array', 
    bookType: 'xlsx' 
  });

  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
