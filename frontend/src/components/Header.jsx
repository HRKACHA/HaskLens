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
  showGuide
}) {
  return (
    <header className="glass-panel" style={{
      margin: '14px 20px 0 20px',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '14px',
      background: 'var(--bg-secondary)',
      borderColor: 'var(--border-subtle)'
    }}>
      {/* Brand logo & title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* HaskLens Optical Logo: Lens aperture framing the lambda */}
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'var(--bg-tertiary)',
          border: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Lens outer ring */}
            <circle cx="14" cy="14" r="10" stroke="#58a6ff" strokeWidth="2.2" strokeLinecap="round" />
            {/* Optic focus ticks */}
            <line x1="14" y1="2" x2="14" y2="4" stroke="#58a6ff" strokeWidth="1.5" />
            <line x1="2" y1="14" x2="4" y2="14" stroke="#58a6ff" strokeWidth="1.5" />
            <line x1="14" y1="24" x2="14" y2="26" stroke="#58a6ff" strokeWidth="1.5" />
            <line x1="24" y1="14" x2="26" y2="14" stroke="#58a6ff" strokeWidth="1.5" />
            {/* Lens handle */}
            <line x1="21.5" y1="21.5" x2="29" y2="29" stroke="#8b949e" strokeWidth="3" strokeLinecap="round" />
            {/* Haskell Lambda symbol inside lens */}
            <text x="14" y="18" fill="#f0f6fc" fontSize="13" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">λ</text>
          </svg>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.3px', margin: 0, color: 'var(--text-main)' }}>
              HaskLens
            </h1>
            <span className="badge badge-blue" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
              Compiler Explorer
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Interactive Haskell Compiler & Optimization Observatory
          </p>
        </div>
      </div>

      {/* Compiler stats pill if compiled */}
      {hasResult && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-tertiary)',
          padding: '4px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {compileSuccess ? (
              <span className="badge badge-green" style={{ padding: '2px 7px' }}>
                <CheckCircle2 size={12} /> Ready
              </span>
            ) : (
              <span className="badge badge-red" style={{ padding: '2px 7px' }}>
                <AlertCircle size={12} /> Errors
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Help / First-timer Guide Button */}
        <button
          id="btn-toggle-guide"
          className="btn btn-ghost btn-sm"
          onClick={onToggleGuide}
          style={{
            background: showGuide ? 'rgba(88, 166, 255, 0.12)' : 'transparent',
            borderColor: showGuide ? '#58a6ff' : 'var(--border-subtle)',
            color: showGuide ? '#58a6ff' : 'var(--text-muted)',
            fontWeight: showGuide ? 600 : 500
          }}
          title="How does HaskLens work?"
        >
          <BookOpen size={13} />
          <span>{showGuide ? 'Hide Guide' : 'How It Works'}</span>
        </button>

        <button
          id="btn-reset-code"
          className="btn btn-ghost btn-sm"
          onClick={onResetCode}
          title="Reset to default code"
        >
          <RefreshCw size={13} /> Reset
        </button>

        {hasResult && (
          <>
            <button
              id="btn-export-ast"
              className="btn btn-ghost btn-sm"
              onClick={onExportJson}
              title="Download AST as JSON"
            >
              <Download size={13} /> AST JSON
            </button>
            <button
              id="btn-export-haskell"
              className="btn btn-ghost btn-sm"
              onClick={onExportHaskell}
              title="Download Optimized Haskell source"
            >
              <Code2 size={13} /> Opt Code
            </button>
          </>
        )}

        <button
          id="btn-compile-run"
          className="btn btn-primary"
          onClick={onCompile}
          disabled={isCompiling}
          style={{ opacity: isCompiling ? 0.7 : 1 }}
        >
          <Play size={14} fill="currentColor" />
          {isCompiling ? 'Compiling...' : 'Compile & Optimize'}
        </button>
      </div>
    </header>
  );
}
