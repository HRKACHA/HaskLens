import React from 'react';
import { Lightbulb, ArrowRight, X, Sparkles, GitBranch, ShieldCheck, Terminal, Compass } from 'lucide-react';

export default function OnboardingGuide({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(13, 17, 23, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px 28px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Title & Dismiss Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={22} color="#58a6ff" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f0f6fc' }}>
                Welcome to HaskLens
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Interactive Compiler Observatory & Optimization Explorer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px', color: 'var(--text-muted)' }}
            title="Close guide (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Overview text */}
        <p style={{ fontSize: '0.86rem', color: '#8b949e', margin: 0, lineHeight: 1.6 }}>
          HaskLens is an <strong>educational compiler observatory</strong> for Haskell.
          Traditional compilers are black boxes that take source code and produce machine binaries.
          HaskLens lets you <strong>look inside every compilation phase in real time</strong>: inspect lexical tokens, browse interactive syntax trees, observe Hindley-Milner type inference, detect recursive call cycles, and see algebraic optimizations with semantic proof.
        </p>

        {/* 3 Step Interactive Workflow */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '4px'
        }}>
          {/* Step 1 */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid #21262d',
            borderRadius: '8px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#58a6ff', marginBottom: '6px' }}>
              <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>1</span>
              <span>Pick Code</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#8b949e', margin: 0, lineHeight: 1.5 }}>
              Choose a sample program from the presets bar above or type your own Haskell directly in the editor.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid #21262d',
            borderRadius: '8px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#3fb950', marginBottom: '6px' }}>
              <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>2</span>
              <span>Compile & Optimize</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#8b949e', margin: 0, lineHeight: 1.5 }}>
              Click <strong>Compile & Optimize</strong> or hit <kbd style={{ background: '#30363d', padding: '1px 5px', borderRadius: '3px', color: '#e6edf3', fontSize: '0.72rem' }}>Ctrl+Enter</kbd> to run the pipeline.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid #21262d',
            borderRadius: '8px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#bc8cff', marginBottom: '6px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>3</span>
              <span>Explore Lenses</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#8b949e', margin: 0, lineHeight: 1.5 }}>
              Inspect the 7 visual tabs on the right: AST, rewrites, type inference, tokens, call graphs & metrics.
            </p>
          </div>
        </div>

        {/* Dismiss confirmation row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            Re-open anytime via the <strong>How It Works</strong> button.
          </span>
          <button
            onClick={onClose}
            className="btn btn-primary btn-sm"
            style={{ padding: '6px 18px', fontSize: '0.82rem' }}
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
