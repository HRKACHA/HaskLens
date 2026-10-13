import React from 'react';
import { Play, Download, CheckCircle2, AlertCircle, RefreshCw, Code2, HelpCircle, BookOpen } from 'lucide-react';

export default function Header({ 
  onCompile, 
  isCompiling, 
  hasResult, 
  compileSuccess, 
  onExportJson, 
  onExportHaskell,
  onResetCode,
  totalOptimizations,
  executionTime,
  onToggleGuide,
  showGuide,
  onGoHome
}) {
  return (
    <header style={{
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      flexShrink: 0
    }}>
      {/* Brand logo & title */}
      <div 
        onClick={onGoHome}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          cursor: onGoHome ? 'pointer' : 'default',
          userSelect: 'none'
        }}
        title={onGoHome ? "Back to Landing Page" : undefined}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          background: 'var(--bg-tertiary)',
          border: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <circle cx="14" cy="14" r="10" stroke="#58a6ff" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="14" y2="4" stroke="#58a6ff" strokeWidth="1.5" />
            <line x1="2" y1="14" x2="4" y2="14" stroke="#58a6ff" strokeWidth="1.5" />
            <line x1="14" y1="24" x2="14" y2="26" stroke="#58a6ff" strokeWidth="1.5" />
            <line x1="24" y1="14" x2="26" y2="14" stroke="#58a6ff" strokeWidth="1.5" />
            <line x1="21.5" y1="21.5" x2="29" y2="29" stroke="#8b949e" strokeWidth="3" strokeLinecap="round" />
            <text x="14" y="18" fill="#f0f6fc" fontSize="12" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">λ</text>
          </svg>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '-0.3px', margin: 0, color: 'var(--text-main)' }}>
              HaskLens
            </span>
            <span className="badge badge-blue" style={{ fontSize: '0.64rem', padding: '1px 5px' }}>
              Explorer
            </span>
            {onGoHome && (
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', opacity: 0.85, marginLeft: '2px' }}>
                ← Overview
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Compiler stats pill if compiled */}
      {hasResult && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-tertiary)',
          padding: '3px 10px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {compileSuccess ? (
              <span className="badge badge-green" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                <CheckCircle2 size={11} /> Ready
              </span>
            ) : (
              <span className="badge badge-red" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                <AlertCircle size={11} /> Errors
              </span>
            )}
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>
            Rewrites: <strong style={{ color: '#58a6ff' }}>{totalOptimizations || 0}</strong>
          </span>
          {executionTime && (
            <>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <span style={{ color: 'var(--text-muted)' }}>
                Pipeline: <strong style={{ color: '#e6edf3' }}>{executionTime}ms</strong>
              </span>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Help / Guide Button */}
        <button
          id="btn-toggle-guide"
          className="btn btn-ghost btn-sm"
          onClick={onToggleGuide}
          style={{
            background: showGuide ? 'rgba(88, 166, 255, 0.12)' : 'transparent',
            borderColor: showGuide ? '#58a6ff' : 'var(--border-subtle)',
            color: showGuide ? '#58a6ff' : 'var(--text-muted)',
            fontSize: '0.76rem',
            padding: '4px 9px'
          }}
          title="Open HaskLens Workflow Guide"
        >
          <BookOpen size={12} />
          <span>How It Works</span>
        </button>

        <button
          id="btn-reset-code"
          className="btn btn-ghost btn-sm"
          onClick={onResetCode}
          title="Reset to default code"
          style={{ fontSize: '0.76rem', padding: '4px 9px' }}
        >
          <RefreshCw size={12} /> Reset
        </button>

        {hasResult && (
          <>
            <button
              id="btn-export-ast"
              className="btn btn-ghost btn-sm"
              onClick={onExportJson}
              title="Download AST as JSON"
              style={{ fontSize: '0.76rem', padding: '4px 9px' }}
            >
              <Download size={12} /> AST
            </button>
            <button
              id="btn-export-haskell"
              className="btn btn-ghost btn-sm"
              onClick={onExportHaskell}
              title="Download Optimized Haskell source"
              style={{ fontSize: '0.76rem', padding: '4px 9px' }}
            >
              <Code2 size={12} /> Haskell
            </button>
          </>
        )}

        <button
          id="btn-compile-run"
          className="btn btn-primary btn-sm"
          onClick={onCompile}
          disabled={isCompiling}
          style={{
            padding: '5px 14px',
            fontSize: '0.8rem',
            fontWeight: 600,
            opacity: isCompiling ? 0.7 : 1
          }}
        >
          <Play size={13} fill="currentColor" />
          {isCompiling ? 'Compiling...' : 'Compile & Optimize'}
        </button>
      </div>
    </header>
  );
}
