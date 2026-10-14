import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Layers,
  ShieldCheck,
  Sparkles,
  Cpu,
  ArrowRight,
  Play,
  Zap,
  Repeat,
  ExternalLink,
  Network,
} from 'lucide-react';

function GithubIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

const PIPELINE_STEPS = [
  { id: 'lex', label: '1. Lexer', detail: 'Tokenizes stream into typed symbols', icon: FileCode, color: '#bc8cff' },
  { id: 'parse', label: '2. Parser', detail: 'Builds hierarchical LALR(1) syntax tree', icon: Layers, color: '#58a6ff' },
  { id: 'type', label: '3. Type Checker', detail: 'Deduces Hindley-Milner type judgments', icon: ShieldCheck, color: '#3fb950' },
  { id: 'opt', label: '4. Optimizer', detail: 'Applies algebraic term rewrites & folding', icon: Sparkles, color: '#f0883e' },
  { id: 'eval', label: '5. Evaluator', detail: 'Executes bounded beta-reduction proof', icon: Cpu, color: '#58a6ff' },
];

const DEMO_TRANSFORMS = [
  {
    name: 'Algebraic Simplification',
    badge: 'Term Rewriting',
    badgeColor: 'blue',
    before: `(x * 1) + 0 + (12 * 4)`,
    after: `x + 48`,
    rules: 'x * 1 ➔ x  •  x + 0 ➔ x  •  12 * 4 ➔ 48',
  },
  {
    name: 'Recursion Loop',
    badge: 'Call Graph',
    badgeColor: 'green',
    before: `fact n = if n == 0 then 1 else n * fact (n - 1)`,
    after: `fact 5  ⟹  120`,
    rules: 'Self-recursion loop detected  •  Base case: n == 0',
  },
  {
    name: 'Dead Branch Pruning',
    badge: 'Control Flow',
    badgeColor: 'purple',
    before: `if True then x * 2 else x + 9999`,
    after: `x * 2`,
    rules: 'Static boolean evaluation  •  Unreachable branch pruned',
  },
];

export default function LandingPage({ onEnterApp }) {
  const [activeStep, setActiveStep] = useState(0);
  const [activeDemo, setActiveDemo] = useState(0);

  // Traveling pipeline light beam animation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const cur = DEMO_TRANSFORMS[activeDemo];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      color: '#f0f6fc',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* ===== FLOATING BACKGROUND LAMBDAS (ANIMATED PARTICLES) ===== */}
      <div className="bg-particle particle-1">λ</div>
      <div className="bg-particle particle-2">::</div>
      <div className="bg-particle particle-3">→</div>
      <div className="bg-particle particle-4">⟹</div>
      <div className="bg-particle particle-5">λ</div>
      <div className="bg-particle particle-6">∀</div>

      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '650px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(88, 166, 255, 0.15) 0%, transparent 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ===== NAVBAR ===== */}
      <nav style={{
        padding: '16px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
        borderBottom: '1px solid rgba(48, 54, 61, 0.6)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#161b22',
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
          <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.3px', color: '#f0f6fc' }}>
            HaskLens
          </span>
          <span className="badge badge-blue" style={{ fontSize: '0.64rem', padding: '1px 6px' }}>
            PCD Assignment
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a
            href="https://github.com/HRKACHA/HaskLens"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.8rem', gap: '5px', textDecoration: 'none' }}
          >
            <GithubIcon size={14} /> GitHub
          </a>
          <button
            onClick={onEnterApp}
            className="btn btn-primary btn-sm shimmery-btn"
            style={{ padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            Launch IDE <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <main style={{ maxWidth: '980px', margin: '0 auto', padding: '48px 24px 60px', position: 'relative', zIndex: 10 }}>
        {/* Main Pitch */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'rgba(22, 27, 34, 0.8)',
            border: '1px solid #30363d',
            borderRadius: '20px',
            fontSize: '0.74rem',
            color: '#8b949e',
            marginBottom: '16px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#58a6ff', display: 'inline-block', animation: 'pulsing 1.8s infinite' }} />
            <span>Interactive Haskell Compiler & Optimization Observatory</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.3rem, 5vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.2px',
            margin: '0 auto 14px',
            color: '#f0f6fc',
          }}>
            See Inside the Compiler.
          </h1>

          <p style={{
            fontSize: '1.02rem',
            lineHeight: 1.6,
            color: '#8b949e',
            maxWidth: '560px',
            margin: '0 auto 24px',
          }}>
            Traditional compilers are black boxes. <strong>HaskLens</strong> exposes every pass in real time — token streams, syntax trees, type inference, recursion cycles, and algebraic rewrites.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={onEnterApp}
              className="btn btn-primary shimmery-btn"
              style={{
                padding: '10px 24px',
                fontSize: '0.92rem',
                fontWeight: 600,
                borderRadius: '6px',
                boxShadow: '0 4px 18px rgba(31, 111, 235, 0.45)',
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
                padding: '10px 18px',
                fontSize: '0.92rem',
                borderRadius: '6px',
                border: '1px solid #30363d',
                textDecoration: 'none',
              }}
            >
              <GithubIcon size={15} /> View Source
            </a>
          </div>
        </div>

        {/* ===== ANIMATED PIPELINE TRACK ===== */}
        <div style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '32px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            {PIPELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = idx === activeStep;
              return (
                <React.Fragment key={step.id}>
                  <div
                    onClick={() => setActiveStep(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: isCurrent ? 'rgba(88, 166, 255, 0.14)' : 'transparent',
                      border: isCurrent ? '1px solid #58a6ff' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isCurrent ? 'scale(1.04)' : 'scale(1)',
                    }}
                  >
                    <Icon size={15} color={isCurrent ? '#58a6ff' : step.color} />
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? '#f0f6fc' : '#8b949e',
                      whiteSpace: 'nowrap'
                    }}>
                      {step.label}
                    </span>
                  </div>

                  {idx < PIPELINE_STEPS.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '2px',
                      background: idx < activeStep ? '#58a6ff' : '#21262d',
                      position: 'relative',
                      margin: '0 4px',
                      transition: 'background 0.3s ease',
                    }}>
                      {idx === activeStep && (
                        <div style={{
                          position: 'absolute',
                          top: '-3px',
                          left: '50%',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#58a6ff',
                          boxShadow: '0 0 8px #58a6ff',
                          animation: 'pulsing 0.8s infinite',
                        }} />
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div style={{
            fontSize: '0.74rem',
            color: '#8b949e',
            textAlign: 'center',
            marginTop: '8px',
            fontFamily: 'var(--font-mono)'
          }}>
            ↳ {PIPELINE_STEPS[activeStep].detail}
          </div>
        </div>

        {/* ===== ANIMATED INTERACTIVE TRANSFORMATION SHOWCASE ===== */}
        <div style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          marginBottom: '36px',
        }}>
          {/* Preset Buttons Header */}
          <div style={{
            padding: '8px 14px',
            background: '#21262d',
            borderBottom: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}>
            <div style={{ fontSize: '0.74rem', color: '#8b949e', fontWeight: 600 }}>
              Live AST Optimization Preview:
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {DEMO_TRANSFORMS.map((d, i) => (
                <button
                  key={d.name}
                  onClick={() => setActiveDemo(i)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    background: i === activeDemo ? '#30363d' : 'transparent',
                    border: i === activeDemo ? '1px solid #58a6ff' : '1px solid transparent',
                    color: i === activeDemo ? '#f0f6fc' : '#8b949e',
                    cursor: 'pointer',
                    fontWeight: i === activeDemo ? 600 : 400,
                  }}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {/* Transformation Visual (Before ➔ After) */}
          <div style={{
            padding: '20px 24px',
            background: '#0d1117',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '18px',
            alignItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.84rem',
          }}>
            {/* Before Box */}
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: '0.66rem', color: '#6e7681', marginBottom: '6px', textTransform: 'uppercase' }}>
                -- Original Expression
              </div>
              <div style={{ color: '#f0f6fc' }}>{cur.before}</div>
            </div>

            {/* Center Animated Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div className="arrow-pulse">
                <ArrowRight size={20} color="#58a6ff" />
              </div>
              <span className={`badge badge-${cur.badgeColor}`} style={{ fontSize: '0.62rem' }}>
                {cur.badge}
              </span>
            </div>

            {/* After Box */}
            <div style={{
              background: 'rgba(63, 185, 80, 0.08)',
              border: '1px solid rgba(63, 185, 80, 0.3)',
              borderRadius: '6px',
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: '0.66rem', color: '#3fb950', marginBottom: '6px', textTransform: 'uppercase' }}>
                ✓ Optimized Output
              </div>
              <div style={{ color: '#3fb950', fontWeight: 600 }}>{cur.after}</div>
            </div>
          </div>

          <div style={{
            padding: '8px 16px',
            background: '#161b22',
            borderTop: '1px solid #30363d',
            fontSize: '0.74rem',
            color: '#8b949e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)'
          }}>
            <span>Applied Rules: {cur.rules}</span>
            <button
              onClick={onEnterApp}
              style={{
                background: 'none', border: 'none', color: '#58a6ff',
                cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              Test in IDE <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* ===== 3 CLEAN CLASSIC CARDS (WHY & WHAT) ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
        }}>
          {/* Card 1 */}
          <div className="feature-hover-card" style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '18px 20px',
            transition: 'all 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Layers size={16} color="#58a6ff" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#f0f6fc' }}>
                Dual AST Visualizer
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#8b949e', lineHeight: 1.5, margin: 0 }}>
              Compare original parser AST and optimized rewrite tree side-by-side with collapsible nodes and location coordinates.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-hover-card" style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '18px 20px',
            transition: 'all 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={16} color="#3fb950" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#f0f6fc' }}>
                Algebraic Term Rewriting
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#8b949e', lineHeight: 1.5, margin: 0 }}>
              Constant folding, zero addition, unit multiplication, and dead-branch pruning executed with complete transformation logs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-hover-card" style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '18px 20px',
            transition: 'all 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Network size={16} color="#bc8cff" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#f0f6fc' }}>
                Call Graph & Cycle Detection
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#8b949e', lineHeight: 1.5, margin: 0 }}>
              Tarjan's algorithm visualizes direct recursion loops, mutual cycles, and verifies tail-call optimization positions.
            </p>
          </div>
        </div>
      </main>

      {/* ===== MINIMAL FOOTER ===== */}
      <footer style={{
        padding: '20px 32px',
        borderTop: '1px solid #21262d',
        background: '#161b22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.76rem',
        color: '#8b949e',
        position: 'relative',
        zIndex: 10,
      }}>
        <div>
          <strong style={{ color: '#f0f6fc' }}>HaskLens</strong> • Principles of Compiler Design Project
        </div>
        <div>
          <a
            href="https://github.com/HRKACHA/HaskLens"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#8b949e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <GithubIcon size={13} /> github.com/HRKACHA/HaskLens
          </a>
        </div>
      </footer>

      {/* ===== SLEEK MICRO-ANIMATIONS STYLES ===== */}
      <style>{`
        /* Floating background particles */
        .bg-particle {
          position: absolute;
          font-family: var(--font-mono);
          color: rgba(88, 166, 255, 0.08);
          font-size: 2.4rem;
          font-weight: 700;
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }
        .particle-1 { top: 12%; left: 8%; animation: floatSlow 14s infinite ease-in-out; }
        .particle-2 { top: 28%; right: 10%; animation: floatSlow 18s infinite ease-in-out reverse; }
        .particle-3 { top: 58%; left: 6%; animation: floatSlow 16s infinite ease-in-out; }
        .particle-4 { top: 72%; right: 8%; animation: floatSlow 20s infinite ease-in-out reverse; }
        .particle-5 { top: 85%; left: 18%; animation: floatSlow 15s infinite ease-in-out; }
        .particle-6 { top: 40%; left: 22%; animation: floatSlow 17s infinite ease-in-out reverse; }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-24px) rotate(8deg); }
        }

        @keyframes pulsing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
        }

        /* Subtle moving pulse for the transform arrow */
        .arrow-pulse {
          animation: pulseArrow 1.8s infinite ease-in-out;
        }
        @keyframes pulseArrow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }

        /* Shimmer effect on CTA button */
        .shimmery-btn {
          position: relative;
          overflow: hidden;
        }
        .shimmery-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.25) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: shimmerMove 3.5s infinite;
        }
        @keyframes shimmerMove {
          0% { left: -60%; }
          30%, 100% { left: 130%; }
        }

        /* Card hover micro-animations */
        .feature-hover-card:hover {
          border-color: #58a6ff !important;
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
}
