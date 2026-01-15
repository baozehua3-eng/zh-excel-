import React, { useState, useEffect } from 'react';
import { DiffRecord, ResolutionStrategy } from '../utils/types';
import './DiffList.css';

interface DiffListProps {
  diffs: DiffRecord[];
  onResolve: (diffId: string, strategy: ResolutionStrategy, customValue?: any) => void;
  onCellClick?: (diff: DiffRecord) => void;
  selectedDiffId?: string | null;
  onSelectedDiffChange?: (diffId: string | null) => void;
}

export function DiffList({ diffs, onResolve, onCellClick, selectedDiffId, onSelectedDiffChange }: DiffListProps) {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [internalSelectedDiff, setInternalSelectedDiff] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState<string>('');

  // 使用外部传入的selectedDiffId，如果没有则使用内部状态
  const selectedDiff = selectedDiffId !== undefined ? selectedDiffId : internalSelectedDiff;
  
  const setSelectedDiff = (id: string | null) => {
    if (onSelectedDiffChange) {
      onSelectedDiffChange(id);
    } else {
      setInternalSelectedDiff(id);
    }
  };

  // 当外部传入selectedDiffId时，自动滚动到该差异
  useEffect(() => {
    if (selectedDiffId) {
      const element = document.getElementById(`diff-item-${selectedDiffId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedDiffId]);

  const filteredDiffs = diffs.filter(diff => {
    if (filter === 'unresolved') {
      return !diff.resolution || diff.resolution.strategy === 'unresolved';
    }
    if (filter === 'resolved') {
      return diff.resolution && diff.resolution.strategy !== 'unresolved';
    }
    return true;
  });

  const handleResolve = (diffId: string, strategy: ResolutionStrategy) => {
    if (strategy === 'custom') {
      if (!customValue.trim()) {
        alert('请输入自定义值');
        return;
      }
      onResolve(diffId, strategy, customValue);
      setCustomValue('');
    } else {
      onResolve(diffId, strategy);
    }
    setSelectedDiff(null);
  };

  const getDiffTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      added: '新增',
      deleted: '删除',
      modified: '修改',
      structure: '结构'
    };
    return labels[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      value: '数值',
      text: '文本',
      structure: '结构'
    };
    return labels[category] || category;
  };

  return (
    <div className="diff-list">
      <div className="diff-list-header">
        <h3>差异清单 ({filteredDiffs.length})</h3>
        <div className="diff-list-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={filter === 'unresolved' ? 'active' : ''}
            onClick={() => setFilter('unresolved')}
          >
            未解决
          </button>
          <button
            className={filter === 'resolved' ? 'active' : ''}
            onClick={() => setFilter('resolved')}
          >
            已解决
          </button>
        </div>
      </div>

      <div className="diff-list-content">
        {filteredDiffs.length === 0 ? (
          <div className="diff-list-empty">暂无差异</div>
        ) : (
          filteredDiffs.map(diff => (
            <div
              key={diff.id}
              id={`diff-item-${diff.id}`}
              className={`diff-item ${diff.resolution ? 'resolved' : ''} ${selectedDiff === diff.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedDiff(diff.id);
                onCellClick?.(diff);
              }}
            >
              <div className="diff-item-header">
                <span className="diff-type">{getDiffTypeLabel(diff.type)}</span>
                <span className="diff-category">{getCategoryLabel(diff.category)}</span>
                <span className="diff-location">
                  {diff.sheetName} - 行{diff.row + 1} 列{diff.col + 1}
                </span>
                {diff.resolution && (
                  <span className="diff-resolved-badge">✓ 已解决</span>
                )}
              </div>
              <div className="diff-item-content">
                <div className="diff-value old">
                  <span className="diff-value-label">文件A:</span>
                  <span className="diff-value-text">{String(diff.oldValue ?? '')}</span>
                </div>
                <div className="diff-arrow">→</div>
                <div className="diff-value new">
                  <span className="diff-value-label">文件B:</span>
                  <span className="diff-value-text">{String(diff.newValue ?? '')}</span>
                </div>
              </div>

              {selectedDiff === diff.id && (
                <div className="diff-resolve-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="resolve-options">
                    <button onClick={() => handleResolve(diff.id, 'fileA')}>
                      采用文件A
                    </button>
                    <button onClick={() => handleResolve(diff.id, 'fileB')}>
                      采用文件B
                    </button>
                    <div className="custom-resolve">
                      <input
                        type="text"
                        placeholder="输入自定义值"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button onClick={() => handleResolve(diff.id, 'custom')}>
                        使用自定义值
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
