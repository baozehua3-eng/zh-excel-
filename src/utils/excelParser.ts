import * as XLSX from 'xlsx';
import { ExcelData, CellData } from './types';

export function parseExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: null,
            raw: false 
          });
          
          const cellData: CellData[][] = [];
          let rowCount = 0;
          let colCount = 0;
          
          // 转换为CellData格式
          jsonData.forEach((row: any[], rowIndex: number) => {
            const cellRow: CellData[] = [];
            row.forEach((cellValue: any, colIndex: number) => {
              if (cellValue !== null && cellValue !== undefined) {
                const cell: CellData = {
                  row: rowIndex,
                  col: colIndex,
                  value: cellValue,
                  type: typeof cellValue === 'number' ? 'number' : 'string'
                };
                cellRow.push(cell);
                colCount = Math.max(colCount, colIndex + 1);
              } else {
                const cell: CellData = {
                  row: rowIndex,
                  col: colIndex,
                  value: '',
                  type: 'empty'
                };
                cellRow.push(cell);
              }
            });
            if (cellRow.length > 0) {
              cellData.push(cellRow);
              rowCount = Math.max(rowCount, rowIndex + 1);
            }
          });
          
          // 处理空行和空列
          for (let i = 0; i < rowCount; i++) {
            if (!cellData[i]) {
              cellData[i] = [];
            }
            for (let j = 0; j < colCount; j++) {
              if (!cellData[i][j]) {
                cellData[i][j] = {
                  row: i,
                  col: j,
                  value: '',
                  type: 'empty'
                };
              }
            }
          }
          
          return {
            name: sheetName,
            data: cellData,
            rowCount,
            colCount
          };
        });
        
        resolve({
          fileName: file.name,
          sheets
        });
      } catch (error) {
        reject(new Error(`解析Excel文件失败: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function getCellValue(data: ExcelData, sheetName: string, row: number, col: number): any {
  const sheet = data.sheets.find(s => s.name === sheetName);
  if (!sheet) return null;
  
  if (row < sheet.data.length && col < sheet.data[row]?.length) {
    return sheet.data[row][col]?.value ?? '';
  }
  return '';
}
