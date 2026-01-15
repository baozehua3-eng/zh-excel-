import React, { useCallback, useState } from 'react';
import { ExcelData } from '../utils/types';
import { parseExcelFile } from '../utils/excelParser';
import './FileUploader.css';

interface FileUploaderProps {
  label: string;
  onFileLoaded: (data: ExcelData | null) => void;
  fileData: ExcelData | null;
}

export function FileUploader({ label, onFileLoaded, fileData }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    // 验证文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('请上传Excel文件（.xlsx, .xls）');
      return;
    }

    // 验证文件大小（限制为50MB）
    if (file.size > 50 * 1024 * 1024) {
      setError('文件大小不能超过50MB');
      return;
    }

    try {
      const data = await parseExcelFile(file);
      onFileLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析文件失败');
    }
  }, [onFileLoaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="file-uploader">
      <label className="file-uploader-label">{label}</label>
      <div
        className={`file-uploader-dropzone ${isDragging ? 'dragging' : ''} ${fileData ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {fileData ? (
          <div className="file-uploader-success">
            <span className="file-icon">📄</span>
            <div className="file-info">
              <div className="file-name">{fileData.fileName}</div>
              <div className="file-sheets">{fileData.sheets.length} 个工作表</div>
            </div>
            <button
              className="file-remove-btn"
              onClick={() => onFileLoaded(null)}
              type="button"
            >
              移除
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              id={`file-input-${label}`}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <label htmlFor={`file-input-${label}`} className="file-uploader-content">
              <span className="upload-icon">📤</span>
              <div className="upload-text">
                <div>点击或拖拽文件到此处</div>
                <div className="upload-hint">支持 .xlsx, .xls 格式</div>
              </div>
            </label>
          </>
        )}
      </div>
      {error && <div className="file-uploader-error">{error}</div>}
    </div>
  );
}
