import React from 'react';
import { DefaultResolutionStrategy } from '../utils/types';
import './ResolutionSettings.css';

interface ResolutionSettingsProps {
  defaultStrategy: DefaultResolutionStrategy;
  onStrategyChange: (strategy: DefaultResolutionStrategy) => void;
  onApplyDefault: () => void;
  unresolvedCount: number;
}

export function ResolutionSettings({
  defaultStrategy,
  onStrategyChange,
  onApplyDefault,
  unresolvedCount
}: ResolutionSettingsProps) {
  return (
    <div className="resolution-settings">
      <h3>默认解决策略</h3>
      <div className="strategy-options">
        <label>
          <input
            type="radio"
            name="strategy"
            value="fileA"
            checked={defaultStrategy === 'fileA'}
            onChange={(e) => onStrategyChange(e.target.value as DefaultResolutionStrategy)}
          />
          <span>默认采用文件A（左侧文件）</span>
        </label>
        <label>
          <input
            type="radio"
            name="strategy"
            value="fileB"
            checked={defaultStrategy === 'fileB'}
            onChange={(e) => onStrategyChange(e.target.value as DefaultResolutionStrategy)}
          />
          <span>默认采用文件B（右侧文件）</span>
        </label>
        <label>
          <input
            type="radio"
            name="strategy"
            value="newValue"
            checked={defaultStrategy === 'newValue'}
            onChange={(e) => onStrategyChange(e.target.value as DefaultResolutionStrategy)}
          />
          <span>默认采用新值（文件B）</span>
        </label>
        <label>
          <input
            type="radio"
            name="strategy"
            value="oldValue"
            checked={defaultStrategy === 'oldValue'}
            onChange={(e) => onStrategyChange(e.target.value as DefaultResolutionStrategy)}
          />
          <span>默认采用旧值（文件A）</span>
        </label>
        <label>
          <input
            type="radio"
            name="strategy"
            value="manual"
            checked={defaultStrategy === 'manual'}
            onChange={(e) => onStrategyChange(e.target.value as DefaultResolutionStrategy)}
          />
          <span>手动处理（不自动解决）</span>
        </label>
      </div>
      <button
        className="apply-default-btn"
        onClick={onApplyDefault}
        disabled={unresolvedCount === 0 || defaultStrategy === 'manual'}
      >
        应用到所有未解决的冲突 ({unresolvedCount})
      </button>
    </div>
  );
}
