import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  GitBranch,
  FileCode,
  ShieldCheck,
  Network,
  CheckCheck,
  Activity,
  ArrowRight,
  Zap,
  Eye,
  BookOpen,
  Code2,
  Layers,
  Target,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Puzzle,
  Search,
  Cpu,
} from 'lucide-react';

function GithubIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

const PIPELINE_STEPS = [
  { icon: FileCode, label: 'Lexer', desc: 'Tokenizes source into a stream of typed tokens', color: '#bc8cff' },
  { icon: Layers, label: 'Parser', desc: 'Builds an abstract syntax tree from tokens', color: '#58a6ff' },
  { icon: ShieldCheck, label: 'Type Checker', desc: 'Infers types and detects mismatches', color: '#3fb950' },
  { icon: Search, label: 'Semantic Analyzer', desc: 'Finds undefined vars, unused params, arity errors', color: '#d29922' },
  { icon: Network, label: 'Recursion Analyzer', desc: 'Detects direct/mutual recursion & tail calls', color: '#f0883e' },
  { icon: Sparkles, label: 'Optimizer', desc: 'Applies algebraic rewrites & constant folding', color: '#58a6ff' },
  { icon: Cpu, label: 'Evaluator', desc: 'Runs bounded evaluation & verifies optimizations', color: '#bc8cff' },
];

const FEATURES = [
  {
    icon: FileCode,
    title: 'Lexical Token Stream',
    desc: 'See every token the lexer produces — keywords, literals, operators — with line & column info.',
    color: '#bc8cff',
  },
  {
    icon: GitBranch,
    title: 'AST Visualizer',
    desc: 'Explore the full abstract syntax tree with collapsible nodes, both before and after optimization.',
    color: '#8b949e',
  },
  {
    icon: Sparkles,
    title: 'Optimizer & Diff View',
    desc: 'Watch algebraic rewrites happen in real-time: constant folding, identity elimination, dead-branch removal.',
    color: '#58a6ff',
  },
  {
    icon: ShieldCheck,
    title: 'Type Inference & Semantics',
    desc: 'Automatic Hindley-Milner style type inference with detailed diagnostics and suggestions.',
    color: '#3fb950',
  },
  {
    icon: Network,
    title: 'Call Graph & Recursion',
    desc: 'Visualize function call relationships, detect recursive cycles, and identify tail-call patterns.',
    color: '#d29922',
  },
  {
    icon: CheckCheck,
    title: 'Bounded Evaluation',
    desc: 'Execute functions with sample inputs and verify that optimized code produces identical results.',
    color: '#58a6ff',
  },
  {
    icon: Activity,
    title: 'Compiler Metrics',
    desc: 'Per-phase timing breakdowns, diagnostic counts, and performance analytics for every compilation.',
    color: '#8b949e',
  },
  {
    icon: Code2,
    title: 'Export & Share',
    desc: 'Download your AST as JSON or export optimized Haskell source code with a single click.',
    color: '#f0883e',
  },
];

const PROBLEMS = [
  {
    icon: Eye,
    problem: 'Compilers are invisible black boxes',
    solution: 'HaskLens makes every phase visible — from tokens to optimized output — in an interactive UI.',
  },
  {
    icon: GraduationCap,
    problem: 'Learning compiler design is abstract and hard',
    solution: 'Students can write real Haskell code and instantly see how the lexer, parser, type checker, and optimizer process it.',
  },
  {
    icon: Lightbulb,
    problem: 'Optimizations are difficult to understand',
    solution: 'A side-by-side diff view highlights every algebraic rewrite, so you can see exactly what changed and why.',
  },
  {
    icon: Puzzle,
    problem: 'No easy way to verify optimization correctness',
    solution: 'Built-in bounded evaluation runs your code before and after optimization to prove the transformation is safe.',
  },
];

export default function LandingPage({ onEnterApp }) {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [activePipelineStep, setActivePipelineStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Auto-cycle pipeline steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePipelineStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const isVisible = (id) => visibleSections.has(id);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      {/* ===== NAVIGATION BAR ===== */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrollY > 50 ? 'rgba(13, 17, 23, 0.85)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(16px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid var(--border-subtle)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'var(--bg-tertiary)', border: '1px solid #30363d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="14" cy="14" r="10" stroke="#58a6ff" strokeWidth="2.2" />
              <line x1="14" y1="2" x2="14" y2="4" stroke="#58a6ff" strokeWidth="1.5" />
              <line x1="2" y1="14" x2="4" y2="14" stroke="#58a6ff" strokeWidth="1.5" />
              <line x1="14" y1="24" x2="14" y2="26" stroke="#58a6ff" strokeWidth="1.5" />
              <line x1="24" y1="14" x2="26" y2="14" stroke="#58a6ff" strokeWidth="1.5" />
              <line x1="21.5" y1="21.5" x2="29" y2="29" stroke="#8b949e" strokeWidth="3" strokeLinecap="round" />
              <text x="14" y="18" fill="#f0f6fc" fontSize="13" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">λ</text>
            </svg>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.3px' }}>HaskLens</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#f0f6fc'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >Features</a>
          <a href="#why" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#f0f6fc'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >Why HaskLens</a>
          <a href="#pipeline" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#f0f6fc'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >Pipeline</a>
          <button onClick={onEnterApp} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.82rem' }}>
            Launch App <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 32px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background gradient orbs */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(31, 111, 235, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(188, 140, 255, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '20px',
          background: 'rgba(31, 111, 235, 0.1)',
          border: '1px solid rgba(88, 166, 255, 0.2)',
          marginBottom: '28px',
          animation: 'fadeInUp 0.6s ease-out',
        }}>
          <Zap size={14} color="#58a6ff" />
          <span style={{ fontSize: '0.82rem', color: '#58a6ff', fontWeight: 600 }}>
            Interactive Compiler Explorer
          </span>
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          maxWidth: '820px',
          margin: '0 0 20px 0',
          animation: 'fadeInUp 0.6s ease-out 0.1s both',
        }}>
          See Inside the{' '}
          <span style={{
            background: 'linear-gradient(135deg, #58a6ff, #bc8cff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Haskell Compiler
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-muted)',
          maxWidth: '620px',
          lineHeight: 1.6,
          margin: '0 0 40px 0',
          animation: 'fadeInUp 0.6s ease-out 0.2s both',
        }}>
          HaskLens is a visual compiler observatory that lets you write Haskell code and watch every
          compilation phase — lexing, parsing, type checking, optimization — unfold in real time.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 0.6s ease-out 0.3s both',
        }}>
          <button
            id="hero-launch-btn"
            onClick={onEnterApp}
            className="btn btn-primary"
            style={{
              padding: '12px 28px', fontSize: '1rem', fontWeight: 600,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1f6feb, #388bfd)',
              boxShadow: '0 4px 20px rgba(31, 111, 235, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(31, 111, 235, 0.45)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(31, 111, 235, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Sparkles size={18} /> Launch Compiler Explorer
          </button>
          <a
            href="https://github.com/HRKACHA/HaskLens"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              padding: '12px 24px', fontSize: '1rem', borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            <GithubIcon size={18} /> View on GitHub
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          animation: 'bounce 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase' }}>Scroll to explore</span>
          <ChevronDown size={18} color="var(--text-dim)" />
        </div>

        {/* Floating code snippet preview */}
        <div style={{
          position: 'absolute', bottom: '120px', right: '8%',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '16px 20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: '#e6edf3',
          boxShadow: 'var(--shadow-lg)',
          opacity: 0.7,
          transform: `translateY(${scrollY * 0.15}px)`,
          transition: 'opacity 0.3s',
          maxWidth: '280px',
          display: window.innerWidth > 1200 ? 'block' : 'none',
        }}>
          <div style={{ color: 'var(--text-dim)', marginBottom: '6px', fontSize: '0.68rem' }}>-- Haskell</div>
          <div><span style={{ color: '#bc8cff' }}>fact</span> n = <span style={{ color: '#d29922' }}>if</span> n == 0</div>
          <div style={{ paddingLeft: '16px' }}><span style={{ color: '#d29922' }}>then</span> <span style={{ color: '#58a6ff' }}>1</span></div>
          <div style={{ paddingLeft: '16px' }}><span style={{ color: '#d29922' }}>else</span> n * <span style={{ color: '#bc8cff' }}>fact</span> (n - <span style={{ color: '#58a6ff' }}>1</span>)</div>
        </div>
      </section>

      {/* ===== WHY HASKLENS SECTION ===== */}
      <section id="why" data-animate style={{
        padding: '100px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        opacity: isVisible('why') ? 1 : 0,
        transform: isVisible('why') ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.7s ease-out',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span className="badge badge-amber" style={{ marginBottom: '14px', display: 'inline-flex' }}>
            <Target size={12} /> The Problem
          </span>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 700,
            letterSpacing: '-0.8px',
            margin: '14px 0 16px',
          }}>
            Why We Built HaskLens
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
            Compilers are among the most fascinating yet least accessible pieces of software.
            We built HaskLens to tear open the black box and let everyone see the magic inside.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {PROBLEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '28px',
                transition: 'all 0.25s ease',
                cursor: 'default',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#388bfd';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 111, 235, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(248, 81, 73, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <Icon size={20} color="#f85149" />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px', color: '#f85149' }}>
                  ✗ {item.problem}
                </h3>
                <div style={{
                  width: '100%', height: '1px',
                  background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)',
                  margin: '14px 0',
                }} />
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(63, 185, 80, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  <CheckCheck size={20} color="#3fb950" />
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  ✓ {item.solution}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== COMPILER PIPELINE SECTION ===== */}
      <section id="pipeline" data-animate style={{
        padding: '100px 32px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        opacity: isVisible('pipeline') ? 1 : 0,
        transform: isVisible('pipeline') ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.7s ease-out',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="badge badge-purple" style={{ marginBottom: '14px', display: 'inline-flex' }}>
              <Cpu size={12} /> Architecture
            </span>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.8px',
              margin: '14px 0 16px',
            }}>
              The 7-Phase Compiler Pipeline
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
              Every compilation runs through a carefully orchestrated pipeline. HaskLens visualizes each phase so you can understand the full journey from source code to optimized output.
            </p>
          </div>

          {/* Pipeline visualization */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}>
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activePipelineStep;
              return (
                <React.Fragment key={i}>
                  <div
                    onClick={() => setActivePipelineStep(i)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '20px 18px',
                      borderRadius: '12px',
                      background: isActive ? 'rgba(88, 166, 255, 0.08)' : 'var(--bg-primary)',
                      border: isActive ? `1px solid ${step.color}40` : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minWidth: '110px',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: isActive ? `${step.color}18` : 'var(--bg-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}>
                      <Icon size={22} color={isActive ? step.color : 'var(--text-muted)'} />
                    </div>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? step.color : 'var(--text-muted)',
                      transition: 'color 0.3s',
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <ArrowRight
                      size={16}
                      color={i < activePipelineStep ? '#58a6ff' : 'var(--text-dim)'}
                      style={{ flexShrink: 0, transition: 'color 0.3s' }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Active step description */}
          <div style={{
            textAlign: 'center',
            padding: '24px 32px',
            background: 'var(--bg-primary)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.6,
            }}>
              <strong style={{ color: PIPELINE_STEPS[activePipelineStep].color }}>
                Phase {activePipelineStep + 1} — {PIPELINE_STEPS[activePipelineStep].label}:
              </strong>{' '}
              {PIPELINE_STEPS[activePipelineStep].desc}
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section id="features" data-animate style={{
        padding: '100px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
        opacity: isVisible('features') ? 1 : 0,
        transform: isVisible('features') ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.7s ease-out',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="badge badge-blue" style={{ marginBottom: '14px', display: 'inline-flex' }}>
            <Sparkles size={12} /> Capabilities
          </span>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 700,
            letterSpacing: '-0.8px',
            margin: '14px 0 16px',
          }}>
            Everything You Need to Understand a Compiler
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
            HaskLens gives you X-ray vision into every stage of the compilation pipeline, with rich visualizations and interactive exploration tools.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '16px',
        }}>
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '24px',
                transition: 'all 0.25s ease',
                cursor: 'default',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = feat.color + '60';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${feat.color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `${feat.color}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  <Icon size={20} color={feat.color} />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== TECH STACK STRIP ===== */}
      <section style={{
        padding: '48px 32px',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '40px', flexWrap: 'wrap',
        }}>
          {[
            { name: 'Python', detail: 'Backend' },
            { name: 'FastAPI', detail: 'REST API' },
            { name: 'Lark', detail: 'Parser Generator' },
            { name: 'React', detail: 'Frontend' },
            { name: 'Vite', detail: 'Build Tool' },
            { name: 'Pydantic', detail: 'Validation' },
          ].map((tech, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{tech.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>{tech.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section id="cta" data-animate style={{
        padding: '120px 32px',
        textAlign: 'center',
        position: 'relative',
        opacity: isVisible('cta') ? 1 : 0,
        transform: isVisible('cta') ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.7s ease-out',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(31, 111, 235, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 700,
          letterSpacing: '-0.8px',
          marginBottom: '16px',
        }}>
          Ready to Explore?
        </h2>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.1rem',
          maxWidth: '480px',
          margin: '0 auto 36px',
          lineHeight: 1.7,
        }}>
          Write Haskell code, hit compile, and watch the entire compiler pipeline
          come alive — right in your browser.
        </p>
        <button
          id="cta-launch-btn"
          onClick={onEnterApp}
          className="btn btn-primary"
          style={{
            padding: '14px 36px', fontSize: '1.05rem', fontWeight: 600,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1f6feb, #388bfd)',
            boxShadow: '0 4px 24px rgba(31, 111, 235, 0.35)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 32px rgba(31, 111, 235, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(31, 111, 235, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Sparkles size={18} /> Launch HaskLens Now <ArrowRight size={18} />
        </button>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: '32px',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <circle cx="14" cy="14" r="10" stroke="#58a6ff" strokeWidth="2.2" />
            <line x1="21.5" y1="21.5" x2="29" y2="29" stroke="#8b949e" strokeWidth="3" strokeLinecap="round" />
            <text x="14" y="18" fill="#f0f6fc" fontSize="13" fontFamily="sans-serif" fontWeight="700" textAnchor="middle">λ</text>
          </svg>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>HaskLens</span>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', margin: 0 }}>
          Built as a PCD Assignment — Interactive Haskell Compiler & Optimization Observatory
        </p>
        <a
          href="https://github.com/HRKACHA/HaskLens"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <GithubIcon size={14} /> github.com/HRKACHA/HaskLens <ExternalLink size={11} />
        </a>
      </footer>

      {/* ===== KEYFRAME ANIMATIONS ===== */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(15px); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }

        /* Smooth scroll */
        html { scroll-behavior: smooth; }

        /* Nav link hover */
        nav a:hover { color: var(--text-main) !important; }
      `}</style>
    </div>
  );
}
