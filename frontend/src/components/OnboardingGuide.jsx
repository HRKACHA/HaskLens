import React from 'react';
import { Lightbulb, ArrowRight, X, Sparkles, GitBranch, ShieldCheck, Terminal, Compass } from 'lucide-react';

export default function OnboardingGuide({ onClose }) {
  return (
    <div className="glass-panel" style={{
      margin: '10px 20px 0 20px',
      padding: '16px 20px',
      background: 'var(--bg-secondary)',
      border: '1px solid #30363d',
      borderLeft: '4px solid #58a6ff',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Title & Dismiss Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="#58a6ff" />
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f0f6fc' }}>
            Welcome to HaskLens — What is this tool and how do you use it?
          </h2>
        </div>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{ padding: '2px 6px', color: 'var(--text-dim)' }}
          title="Dismiss guide"
        >
          <X size={15} />
        </button>
      </div>

      {/* Overview text */}
      <p style={{ fontSize: '0.82rem', color: '#8b949e', margin: 0, lineHeight: 1.55 }}>
        HaskLens is an <strong>educational compiler observatory</strong> for functional programming in Haskell.
        Traditional compilers are black boxes that take source code and produce binaries.
        HaskLens lets you <strong>look inside every compilation phase in real time</strong>: inspect lexical tokens, browse interactive syntax trees, observe Hindley-Milner type inference, detect recursive call cycles, and see algebraic optimizations with semantic proof.
      </p>

      {/* 3 Step Interactive Workflow */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '12px',
        marginTop: '2px'
      }}>
        {/* Step 1 */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid #21262d',
          borderRadius: '6px',
          padding: '10px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#58a6ff', marginBottom: '4px' }}>
            <span>STEP 1</span>
            <span>Pick an Example or Write Code</span>
          </div>
          <p style={{ fontSize: '0.77rem', color: '#8b949e', margin: 0 }}>
            Click any of the example chips above (like <em>Algebraic Simplification</em>, <em>Factorial</em>, or <em>Euclidean GCD</em>), or type Haskell directly in the editor.
          </p>
        </div>

        {/* Step 2 */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid #21262d',
          borderRadius: '6px',
          padding: '10px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#3fb950', marginBottom: '4px' }}>
            <span>STEP 2</span>
            <span>Compile & Optimize</span>
          </div>
          <p style={{ fontSize: '0.77rem', color: '#8b949e', margin: 0 }}>
            Press the blue <strong>Compile & Optimize</strong> button (or press <kbd style={{ background: '#30363d', padding: '1px 5px', borderRadius: '3px', color: '#e6edf3', fontSize: '0.72rem' }}>Ctrl + Enter</kbd>).
          </p>
        </div>

        {/* Step 3 */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid #21262d',
          borderRadius: '6px',
          padding: '10px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#bc8cff', marginBottom: '4px' }}>
            <span>STEP 3</span>
            <span>Explore the 7 Compiler Lenses</span>
          </div>
          <p style={{ fontSize: '0.77rem', color: '#8b949e', margin: 0 }}>
            Switch between the tabs on the right to see the AST tree, side-by-side optimization diffs, call graph topology, and bounded execution outputs!
          </p>
        </div>
      </div>

      {/* Dismiss confirmation row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
          Tip: You can re-open this guide anytime using the <strong>How It Works</strong> button in the header.
        </span>
        <button
          onClick={onClose}
          className="btn btn-sm"
          style={{ background: '#21262d', borderColor: '#30363d', fontSize: '0.75rem', padding: '4px 12px' }}
        >
          Got it, let's explore!
        </button>
      </div>
    </div>
  );
}
