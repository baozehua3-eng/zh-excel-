import React, { useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { ComparisonView } from './components/ComparisonView';
import { useExcelComparison } from './hooks/useExcelComparison';
import { DefaultResolutionStrategy } from './utils/types';
import './App.css';

function App() {
  const {
    fileA,
    fileB,
    setFileA,
    setFileB,
    diffs,
    compare,
    resolveDiff,
    defaultStrategy,
    setDefaultStrategy,
    applyDefaultStrategy,
    stats
  } = useExcelComparison();

  // 当两个文件都加载后自动对比
  useEffect(() => {
    if (fileA && fileB) {
      compare();
    }
  }, [fileA, fileB, compare]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Excel文件对比工具</h1>
        <p className="app-subtitle">对比两个Excel文件的差异，解决冲突并导出整合结果</p>
      </header>

      <main className="app-main">
        <div className="upload-section">
          <FileUploader
            label="文件A（左侧）"
            onFileLoaded={setFileA}
            fileData={fileA}
          />
          <FileUploader
            label="文件B（右侧）"
            onFileLoaded={setFileB}
            fileData={fileB}
          />
        </div>

        {fileA && fileB && (
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-label">总差异数:</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">新增:</span>
              <span className="stat-value added">{stats.added}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">删除:</span>
              <span className="stat-value deleted">{stats.deleted}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">修改:</span>
              <span className="stat-value modified">{stats.modified}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">结构:</span>
              <span className="stat-value structure">{stats.structure}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">已解决:</span>
              <span className="stat-value resolved">{stats.resolved}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">未解决:</span>
              <span className="stat-value unresolved">{stats.unresolved}</span>
            </div>
          </div>
        )}

        {fileA && fileB && (
          <ComparisonView
            fileA={fileA}
            fileB={fileB}
            diffs={diffs}
            onResolve={resolveDiff}
            defaultStrategy={defaultStrategy}
            onStrategyChange={setDefaultStrategy}
            onApplyDefault={applyDefaultStrategy}
            unresolvedCount={stats.unresolved}
          />
        )}
      </main>
    </div>
  );
}

export default App;
