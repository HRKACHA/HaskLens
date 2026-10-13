import React from 'react';
import { Clock, Activity, CheckCircle2, Layers, Cpu, Code2, BarChart2 } from 'lucide-react';

export default function MetricsView({ timings = {}, diagnostics = {} }) {
  const timingEntries = Object.entries(timings);
  const totalTime = timingEntries.reduce((sum, [_, ms]) => sum + (typeof ms === 'number' ? ms : 0), 0);

  const phaseLabels = {
    lexer: 'Phase 1: Lexical Analysis',
    parser: 'Phase 2: Syntax Parsing',
    ast_generation: 'Phase 3: AST Construction',
    type_checker: 'Phase 4: Hindley-Milner Type Inference',
    semantic_analyzer: 'Phase 5: Scope & Semantic Validation',
    recursion_analyzer: 'Phase 6: Recursion & Cycle Detection',
    call_graph: 'Phase 7: Call Graph Construction',
    optimizer: 'Phase 8: Algebraic Rewriting & Optimization',
    pretty_printer: 'Phase 9: Pretty Printing & Code Gen',
    evaluator: 'Phase 10: Bounded Evaluator & Verification',
  };

  const phaseColors = {
    lexer: '#c084fc',
    parser: '#818cf8',
    ast_generation: '#6366f1',
    type_checker: '#38bdf8',
    semantic_analyzer: '#2dd4bf',
    recursion_analyzer: '#34d399',
    call_graph: '#a3e635',
    optimizer: '#facc15',
    pretty_printer: '#fb923c',
    evaluator: '#f43f5e',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Timing Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <Clock size={16} color="#818cf8" />
            Total Pipeline Duration
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#fff' }}>
            {totalTime.toFixed(2)} ms
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Synchronous in-memory AST pipeline
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <Activity size={16} color="#34d399" />
            Fastest Pass
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px', color: '#34d399' }}>
            {timingEntries.length > 0
              ? [...timingEntries].sort((a, b) => a[1] - b[1])[0][0]
              : 'N/A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Sub-millisecond processing
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <BarChart2 size={16} color="#fbbf24" />
            Pipeline Phases
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#fbbf24' }}>
            {timingEntries.length} Active Phases
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            100% deterministic compilation
          </div>
        </div>
      </div>

      {/* Phase Timing Breakdown Bars */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(10, 13, 20, 0.7)' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} color="#38bdf8" />
          Compilation Phase Execution Breakdown
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {timingEntries.map(([phase, ms]) => {
            const pct = totalTime > 0 ? ((ms / totalTime) * 100).toFixed(1) : 0;
            const label = phaseLabels[phase] || phase;
            const color = phaseColors[phase] || '#818cf8';

            return (
              <div key={phase} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {ms} ms <span style={{ opacity: 0.6 }}>({pct}%)</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.max(Number(pct), 2)}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture Reference */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 21, 35, 0.6)' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
          HaskOpt Architecture & Theoretical Guarantees
        </h4>
        <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: '1.7' }}>
          <li><strong>Pure Functional AST Rewriting:</strong> Optimizations operate as pure rewrite rules preserving referential transparency.</li>
          <li><strong>Zero Multiplicative Safety:</strong> Does not fold <code>x * 0</code> if evaluating <code>x</code> could cause non-termination or division by zero.</li>
          <li><strong>Strongly Connected Components:</strong> Mutual recursion is detected via Tarjan's algorithm in O(V + E) time complexity.</li>
          <li><strong>Bounded AST Execution:</strong> Evaluator runs directly on the AST with maximum step and depth limits, eliminating code injection risks.</li>
        </ul>
      </div>
    </div>
  );
}
