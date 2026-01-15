import React from 'react';
import { ExcelData } from '../utils/types';
import './SheetSelector.css';

interface SheetSelectorProps {
  fileA: ExcelData | null;
  fileB: ExcelData | null;
  selectedSheet: string | null;
  onSelectSheet: (sheetName: string) => void;
}

export function SheetSelector({ fileA, fileB, selectedSheet, onSelectSheet }: SheetSelectorProps) {
  const allSheets = new Set<string>();
  if (fileA) fileA.sheets.forEach(s => allSheets.add(s.name));
  if (fileB) fileB.sheets.forEach(s => allSheets.add(s.name));

  const sheetNames = Array.from(allSheets);

  if (sheetNames.length === 0) return null;

  return (
    <div className="sheet-selector">
      <label className="sheet-selector-label">选择工作表：</label>
      <div className="sheet-selector-buttons">
        {sheetNames.map(sheetName => (
          <button
            key={sheetName}
            className={`sheet-btn ${selectedSheet === sheetName ? 'active' : ''}`}
            onClick={() => onSelectSheet(sheetName)}
          >
            {sheetName}
          </button>
        ))}
      </div>
    </div>
  );
}
