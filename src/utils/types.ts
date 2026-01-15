// 单元格数据
export interface CellData {
  row: number;
  col: number;
  value: any;
  type: 'number' | 'string' | 'formula' | 'empty';
}

// 差异类型
export type DiffType = 'added' | 'deleted' | 'modified' | 'structure';

// 解决方式
export type ResolutionStrategy = 'fileA' | 'fileB' | 'custom' | 'unresolved';

// 差异记录
export interface DiffRecord {
  id: string;
  type: DiffType;
  sheetName: string;
  row: number;
  col: number;
  oldValue?: any;
  newValue?: any;
  category: 'value' | 'text' | 'structure';
  resolution?: {
    strategy: ResolutionStrategy;
    resolvedValue?: any;
  };
}

// Excel文件数据
export interface ExcelData {
  fileName: string;
  sheets: {
    name: string;
    data: CellData[][];
    rowCount: number;
    colCount: number;
  }[];
}

// 默认解决策略
export type DefaultResolutionStrategy = 'fileA' | 'fileB' | 'newValue' | 'oldValue' | 'manual';
