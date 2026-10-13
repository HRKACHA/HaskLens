import React, { useState } from 'react';
import {
  FileCode,
  ShieldCheck,
  Network,
  ArrowRight,
  Zap,
  Play,
  Layers,
  Cpu,
  Terminal,
  ExternalLink,
  Code2,
  CheckCircle2,
  Info,
  GitBranch,
  BookOpen,
} from 'lucide-react';

function GithubIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

// 7 Compiler pipeline stages
const PIPELINE_STAGES = [
  {
    step: '01',
    name: 'Lexical Analysis',
    component: 'Lexer',
    tech: 'Lark Regex Engine',
    desc: 'Scans source characters into a stream of typed tokens with line/column coordinates.',
    sample: 'Tokens: [IDENT("fact"), IDENT("n"), EQUALS, IF, INT(0), ...]'
  },
  {
    step: '02',
    name: 'Syntax Analysis',
    component: 'LALR(1) Parser',
    tech: 'EBNF Grammar (grammar.lark)',
    desc: 'Builds an Abstract Syntax Tree (AST) representing function bindings, expressions, and operators.',
    sample: 'AST: FunctionDef(name="fact", params=["n"], body=IfExpr(...))'
  },
  {
    step: '03',
    name: 'Type Checking',
    component: 'Type Checker',
    tech: 'Hindley-Milner (Algorithm W)',
    desc: 'Infers types and validates binary operations, conditional branches, and function application.',
    sample: 'Inferred Type: fact :: Int -> Int (Unification verified)'
  },
  {
    step: '04',
    name: 'Semantic Analysis',
    component: 'Semantic Analyzer',
    tech: 'Symbol Table & AST Visitor',
    desc: 'Resolves identifier scoping, validates parameter arity, and catches undefined variables.',
    sample: 'Scope: 1 function, 1 param | Arity: fact/1 | Undefined: 0'
  },
  {
    step: '05',
    name: 'Call Graph & Cycles',
    component: 'Recursion Analyzer',
    tech: "Tarjan's SCC Algorithm",
    desc: 'Builds directed call graph, detects direct loops, identifies tail calls, and discovers mutual recursion.',
    sample: 'Topology: fact -> fact (Direct Loop) | Tail Position: False'
  },
  {
    step: '06',
    name: 'Algebraic Optimization',
    component: 'Optimizer',
    tech: 'Multi-Pass Term Rewriter',
    desc: 'Applies algebraic rewrite rules (x * 1 ➔ x, x + 0 ➔ x), constant folding, and dead branch pruning.',
    sample: 'Rewrites: Constant folding & identity rules applied'
  },
  {
    step: '07',
    name: 'Bounded Evaluation',
    component: 'Evaluator',
    tech: 'Step-Bounded AST Interpreter',
    desc: 'Evaluates original and optimized ASTs with sample inputs to prove semantic preservation.',
    sample: 'Execution: fact(5) = 120 | Equivalence: Semantics Preserved ✓'
  },
];

// Interactive live code examples in the studio preview
const WORKBENCH_EXAMPLES = [
  {
    id: 'algebraic',
    name: 'Algebraic Rewrite',
    source: `optimizeMe :: Int -> Int
optimizeMe x = (x * 1) + 0 + (12 * 4) + (2 + 3 * 2) * 0`,
    passOutputs: {
      type: 'optimizeMe :: Int -> Int',
      ast: 'FunctionDef(name="optimizeMe", params=["x"], body=BinaryOp("+", ...))',
      rewrites: [
        'x * 1 ⟹ x  [Identity Multiplicaton]',
        'x + 0 ⟹ x  [Identity Addition]',
        '12 * 4 ⟹ 48  [Constant Folding]',
        '3 * 2 ⟹ 6  [Constant Folding]',
        '2 + 6 ⟹ 8  [Constant Folding]',
        '8 * 0 ⟹ 0  [Zero Multiplication]',
      ],
      result: 'optimizeMe x = x + 48  (Reduced 34 ➔ 12 nodes, -65%)',
      evaluation: 'optimizeMe(8) = 56 (Semantics Preserved ✓)'
    }
  },
  {
    id: 'factorial',
    name: 'Factorial Recursion',
    source: `fact :: Int -> Int
fact n = if n == 0 then 1 else n * fact (n - 1)`,
    passOutputs: {
      type: 'fact :: Int -> Int',
      ast: 'FunctionDef(name="fact", params=["n"], body=IfExpr(...))',
      rewrites: [
        'No algebraic rewrites applicable (Expression is in minimal canonical form)'
      ],
      result: 'Direct recursion loop detected | Base case: n == 0',
      evaluation: 'fact(5) = 120 (5 recursive stack frames evaluated)'
    }
  },
  {
    id: 'mutual',
    name: 'Mutual Recursion',
    source: `isEven :: Int -> Bool
isEven n = if n == 0 then True else isOdd (n - 1)

isOdd :: Int -> Bool
isOdd n = if n == 0 then False else isEven (n - 1)`,
    passOutputs: {
      type: 'isEven :: Int -> Bool, isOdd :: Int -> Bool',
      ast: 'Program(declarations=[FunctionDef("isEven"), FunctionDef("isOdd")])',
      rewrites: [
        'Mutual call cycle: isEven ⇄ isOdd'
      ],
      result: 'Strongly Connected Component #1: [isEven, isOdd]',
      evaluation: 'isEven(6) = True (Evaluated across mutual call cycle)'
    }
  }
];

export default function LandingPage({ onEnterApp }) {
  const [selectedEx, setSelectedEx] = useState(WORKBENCH_EXAMPLES[0]);
  const [selectedStageIdx, setSelectedStageIdx] = useState(5); // Optimizer default
  const [activeOutputTab, setActiveOutputTab] = useState('rewrites'); // 'rewrites', 'type', 'evaluation'

  const activeStage = PIPELINE_STAGES[selectedStageIdx];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      color: '#f0f6fc',
      fontFamily: 'var(--font-sans)',
      lineHeight: 1.5,
    }}>
      {/* ===== HEADER NAVIGATION ===== */}
      <header style={{
        borderBottom: '1px solid #30363d',
        background: '#161b22',
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#21262d',
            border: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <circle cx="14" cy="14" r="10" stroke="#58a6ff" strokeWidth="2.2" />
              <line x1="21.5" y1="21.5" x2="29" y2="29" stroke="#8b949e" strokeWidth="3" strokeLinecap="round" />
              <text x="14" y="18" fill="#f0f6fc" fontSize="12" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">λ</text>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f0f6fc', letterSpacing: '-0.3px' }}>
              HaskLens
            </span>
            <span style={{ fontSize: '0.74rem', color: '#8b949e', marginLeft: '10px' }}>
              Principles of Compiler Design Project
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="#architecture"
            style={{ color: '#8b949e', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}
            onMouseEnter={(e) => e.target.style.color = '#f0f6fc'}
            onMouseLeave={(e) => e.target.style.color = '#8b949e'}
          >
            Architecture
          </a>
          <a
            href="#rationale"
            style={{ color: '#8b949e', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}
            onMouseEnter={(e) => e.target.style.color = '#f0f6fc'}
            onMouseLeave={(e) => e.target.style.color = '#8b949e'}
          >
            Why HaskLens
          </a>
          <a
            href="https://github.com/HRKACHA/HaskLens"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#8b949e', textDecoration: 'none', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseEnter={(e) => e.target.style.color = '#f0f6fc'}
            onMouseLeave={(e) => e.target.style.color = '#8b949e'}
          >
            <GithubIcon size={15} /> GitHub
          </a>
          <button
            onClick={onEnterApp}
            className="btn btn-primary btn-sm"
            style={{
              padding: '6px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: '#238636',
              borderColor: 'rgba(240, 246, 252, 0.1)',
            }}
          >
            Launch Compiler <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* ===== HERO: TECHNICAL WORKBENCH ===== */}
      <section style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '48px 24px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1.25fr',
        gap: '36px',
        alignItems: 'start',
      }}>
        {/* Left Column: Authentic Project Thesis */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '3px 10px',
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '4px',
            fontSize: '0.74rem',
            color: '#58a6ff',
            marginBottom: '16px',
            fontFamily: 'var(--font-mono)'
          }}>
            <span>PCD Assignment // Course Project</span>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.8px',
            margin: '0 0 14px 0',
            color: '#f0f6fc',
          }}>
            HaskLens: An Interactive Compiler Observatory for Haskell
          </h1>

          <p style={{
            fontSize: '0.96rem',
            lineHeight: 1.6,
            color: '#8b949e',
            margin: '0 0 22px 0',
          }}>
            Traditional functional language compilers are black boxes that take source text and emit binaries.
            <strong> HaskLens</strong> exposes every internal pass in real time — token streams, LALR(1) abstract syntax trees, Hindley-Milner type inference, recursion cycles, algebraic term rewriting, and bounded evaluation proofs.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <button
              onClick={onEnterApp}
              className="btn btn-primary"
              style={{
                padding: '9px 20px',
                fontSize: '0.88rem',
                fontWeight: 600,
                borderRadius: '6px',
                background: '#1f6feb',
              }}
            >
              <Play size={14} fill="currentColor" /> Open Compiler Studio
            </button>
            <a
              href="https://github.com/HRKACHA/HaskLens"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{
                padding: '9px 18px',
                fontSize: '0.88rem',
                borderRadius: '6px',
                border: '1px solid #30363d',
                textDecoration: 'none',
              }}
            >
              <GithubIcon size={15} /> View Source Code
            </a>
          </div>

          {/* Technical Specifications Summary Box */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '14px 18px',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Compiler Technical Specifications
            </div>
            <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '5px 0', color: '#8b949e' }}>Source Grammar:</td>
                  <td style={{ padding: '5px 0', color: '#f0f6fc', fontFamily: 'var(--font-mono)' }}>Haskell 98/2010 Core Subset</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '5px 0', color: '#8b949e' }}>Parser Engine:</td>
                  <td style={{ padding: '5px 0', color: '#f0f6fc', fontFamily: 'var(--font-mono)' }}>LALR(1) Table Driven (Lark)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '5px 0', color: '#8b949e' }}>Type Inference:</td>
                  <td style={{ padding: '5px 0', color: '#f0f6fc', fontFamily: 'var(--font-mono)' }}>Hindley-Milner (Algorithm W)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '5px 0', color: '#8b949e' }}>Graph Analysis:</td>
                  <td style={{ padding: '5px 0', color: '#f0f6fc', fontFamily: 'var(--font-mono)' }}>Tarjan SCC Cycle Detection</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', color: '#8b949e' }}>Optimizer:</td>
                  <td style={{ padding: '5px 0', color: '#f0f6fc', fontFamily: 'var(--font-mono)' }}>Algebraic Term Rewriting Pass</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Interactive Compiler Workbench */}
        <div style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Top Bar with example switches */}
          <div style={{
            padding: '10px 14px',
            background: '#21262d',
            borderBottom: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={14} color="#58a6ff" />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f0f6fc' }}>
                Live Compilation Inspector
              </span>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {WORKBENCH_EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedEx(ex)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    background: selectedEx.id === ex.id ? '#30363d' : 'transparent',
                    border: selectedEx.id === ex.id ? '1px solid #58a6ff' : '1px solid transparent',
                    color: selectedEx.id === ex.id ? '#f0f6fc' : '#8b949e',
                    cursor: 'pointer',
                    fontWeight: selectedEx.id === ex.id ? 600 : 400
                  }}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          {/* Haskell Source Code Section */}
          <div style={{
            padding: '14px 16px',
            background: '#0d1117',
            borderBottom: '1px solid #30363d',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            lineHeight: 1.5,
          }}>
            <div style={{ fontSize: '0.68rem', color: '#6e7681', marginBottom: '6px', textTransform: 'uppercase' }}>
              Input Source Code
            </div>
            <pre style={{ margin: 0, color: '#e6edf3', whiteSpace: 'pre-wrap' }}>
              <code>{selectedEx.source}</code>
            </pre>
          </div>

          {/* Output Inspector Tabs */}
          <div style={{
            padding: '6px 14px',
            background: '#161b22',
            borderBottom: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.74rem'
          }}>
            <button
              onClick={() => setActiveOutputTab('rewrites')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeOutputTab === 'rewrites' ? '#58a6ff' : '#8b949e',
                fontWeight: activeOutputTab === 'rewrites' ? 600 : 400,
                padding: '3px 0',
                borderBottom: activeOutputTab === 'rewrites' ? '2px solid #58a6ff' : '2px solid transparent'
              }}
            >
              Optimization Passes
            </button>
            <button
              onClick={() => setActiveOutputTab('type')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeOutputTab === 'type' ? '#58a6ff' : '#8b949e',
                fontWeight: activeOutputTab === 'type' ? 600 : 400,
                padding: '3px 0',
                borderBottom: activeOutputTab === 'type' ? '2px solid #58a6ff' : '2px solid transparent'
              }}
            >
              Type Inference
            </button>
            <button
              onClick={() => setActiveOutputTab('evaluation')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeOutputTab === 'evaluation' ? '#58a6ff' : '#8b949e',
                fontWeight: activeOutputTab === 'evaluation' ? 600 : 400,
                padding: '3px 0',
                borderBottom: activeOutputTab === 'evaluation' ? '2px solid #58a6ff' : '2px solid transparent'
              }}
            >
              Evaluation Proof
            </button>
          </div>

          {/* Output Content */}
          <div style={{
            padding: '14px 16px',
            background: '#0d1117',
            minHeight: '140px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            lineHeight: 1.5,
          }}>
            {activeOutputTab === 'rewrites' && (
              <div>
                <div style={{ color: '#6e7681', fontSize: '0.68rem', marginBottom: '6px' }}>
                  -- TRANSFORMATION RULES EXECUTED
                </div>
                {selectedEx.passOutputs.rewrites.map((r, i) => (
                  <div key={i} style={{ color: '#58a6ff', marginBottom: '3px' }}>
                    {r}
                  </div>
                ))}
                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #21262d', color: '#3fb950', fontWeight: 600 }}>
                  {selectedEx.passOutputs.result}
                </div>
              </div>
            )}

            {activeOutputTab === 'type' && (
              <div>
                <div style={{ color: '#6e7681', fontSize: '0.68rem', marginBottom: '6px' }}>
                  -- HINDLEY-MILNER TYPE JUDGMENT
                </div>
                <div style={{ color: '#bc8cff', fontWeight: 600 }}>
                  {selectedEx.passOutputs.type}
                </div>
                <div style={{ color: '#8b949e', marginTop: '6px', fontSize: '0.74rem' }}>
                  Unification: Robinson algorithm verified 0 type clashes.
                </div>
              </div>
            )}

            {activeOutputTab === 'evaluation' && (
              <div>
                <div style={{ color: '#6e7681', fontSize: '0.68rem', marginBottom: '6px' }}>
                  -- STEP-BOUNDED INTERPRETER PROOF
                </div>
                <div style={{ color: '#3fb950', fontWeight: 600 }}>
                  {selectedEx.passOutputs.evaluation}
                </div>
                <div style={{ color: '#8b949e', marginTop: '6px', fontSize: '0.74rem' }}>
                  Evaluated with step limit of 1,000 beta-reductions.
                </div>
              </div>
            )}
          </div>

          {/* Bottom quick CTA */}
          <div style={{
            padding: '8px 16px',
            background: '#161b22',
            borderTop: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem'
          }}>
            <span style={{ color: '#8b949e' }}>Ready to write custom Haskell?</span>
            <button
              onClick={onEnterApp}
              style={{
                background: 'none', border: 'none', color: '#58a6ff',
                cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              Open in Studio <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: 7-PHASE PIPELINE ARCHITECTURE ===== */}
      <section id="architecture" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '60px 24px',
        borderTop: '1px solid #30363d',
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '0.74rem', color: '#58a6ff', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            System Architecture
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#f0f6fc' }}>
            The 7-Phase Compilation Pipeline
          </h2>
          <p style={{ color: '#8b949e', fontSize: '0.88rem', margin: '6px 0 0', maxWidth: '650px' }}>
            HaskLens decomposes functional compilation into seven distinct, observable stages. Click any pass below to inspect its operational model and representations.
          </p>
        </div>

        {/* Pipeline Stage Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '8px',
          marginBottom: '20px'
        }}>
          {PIPELINE_STAGES.map((stg, i) => {
            const isSelected = i === selectedStageIdx;
            return (
              <button
                key={stg.step}
                onClick={() => setSelectedStageIdx(i)}
                style={{
                  padding: '10px 12px',
                  background: isSelected ? '#21262d' : '#161b22',
                  border: isSelected ? '1px solid #58a6ff' : '1px solid #30363d',
                  borderRadius: '6px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  transition: 'border-color 0.1s ease',
                }}
              >
                <span style={{ fontSize: '0.65rem', color: isSelected ? '#58a6ff' : '#6e7681', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  STAGE {stg.step}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? '#f0f6fc' : '#c9d1d9' }}>
                  {stg.component}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Inspector Box */}
        <div style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '6px',
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-blue">Stage {activeStage.step}</span>
              <span style={{ fontSize: '0.78rem', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                {activeStage.tech}
              </span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#f0f6fc' }}>
              {activeStage.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#8b949e', lineHeight: 1.6, margin: 0 }}>
              {activeStage.desc}
            </p>
          </div>

          <div style={{
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '12px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            color: '#79c0ff',
            lineHeight: 1.5,
          }}>
            <div style={{ fontSize: '0.66rem', color: '#6e7681', marginBottom: '4px', textTransform: 'uppercase' }}>
              Pass Representation
            </div>
            {activeStage.sample}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: PCD COURSE PROBLEM CONTEXT ===== */}
      <section id="rationale" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '60px 24px',
        borderTop: '1px solid #30363d',
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '0.74rem', color: '#d29922', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
            Pedagogical Motivation
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#f0f6fc' }}>
            Why We Built HaskLens for Compiler Design
          </h2>
          <p style={{ color: '#8b949e', fontSize: '0.88rem', margin: '6px 0 0', maxWidth: '650px' }}>
            Principles of Compiler Design coursework deals with challenging functional semantics. HaskLens addresses four core dilemmas.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {/* Card 1 */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f85149', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              DILEMMA 01
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 8px', color: '#f0f6fc' }}>
              The Compiler Opacity Problem
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.55, margin: 0 }}>
              Standard compilers jump directly from source to machine binaries or massive intermediate IRs. Students cannot observe how individual AST nodes are processed. HaskLens renders every pass distinctly.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#d29922', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              DILEMMA 02
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 8px', color: '#f0f6fc' }}>
              Understanding Algebraic Rewrites
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.55, margin: 0 }}>
              Textbooks describe rules like <code>x * 1 → x</code> and constant folding in isolation, but tracing how these rules interact across multiple passes is difficult. HaskLens logs every rule application step-by-step.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#bc8cff', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              DILEMMA 03
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 8px', color: '#f0f6fc' }}>
              Recursion Topology & Mutual Cycles
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.55, margin: 0 }}>
              Functional languages possess no <code>while</code> loops; all iteration occurs through recursion. HaskLens identifies direct recursion loops, flags tail calls, and runs Tarjan's SCC algorithm for mutual recursion.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3fb950', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              DILEMMA 04
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 8px', color: '#f0f6fc' }}>
              Proving Semantic Preservation
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.55, margin: 0 }}>
              An aggressive optimization pass can inadvertently alter runtime behavior. HaskLens runs a bounded AST interpreter against sample inputs before and after optimization to prove semantic equivalence.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER CALL TO ACTION ===== */}
      <footer style={{
        background: '#161b22',
        borderTop: '1px solid #30363d',
        padding: '36px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '0.8rem',
        color: '#8b949e',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <strong style={{ color: '#f0f6fc' }}>HaskLens</strong>
          <span>•</span>
          <span>Principles of Compiler Design (PCD) Assignment</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="https://github.com/HRKACHA/HaskLens"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#8b949e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <GithubIcon size={14} /> github.com/HRKACHA/HaskLens
          </a>
          <button
            onClick={onEnterApp}
            className="btn btn-primary btn-sm"
            style={{ padding: '5px 14px', fontSize: '0.78rem' }}
          >
            Launch IDE <ArrowRight size={12} />
          </button>
        </div>
      </footer>
    </div>
  );
}
