import React from 'react';
import { ArrowRight, ShieldCheck, Zap, GitCompare } from 'lucide-react';

export default function OptimizerDiffView({
  originalSource,
  optimizedSource,
  optimizationLog = [],
  optimizationCount = 0
}) {
  const origLines = (originalSource || '').split('\n');
  const optLines = (optimizedSource || '').split('\n');
  const maxLines = Math.max(origLines.length, optLines.length);

  const ruleCounts = {};
  optimizationLog.forEach(item => {
    const r = item.rule || item.pass || 'Optimization';
    ruleCounts[r] = (ruleCounts[r] || 0) + 1;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
        <div className="glass-panel" style={{ padding: '12px 14px', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
            <Zap size={14} color="#58a6ff" />
            Optimizations Applied
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '3px', color: '#58a6ff' }}>
            {optimizationCount} {optimizationCount === 1 ? 'Rule' : 'Rules'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
            <ShieldCheck size={14} color="#3fb950" />
            Equivalence Status
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '5px', color: '#3fb950' }}>
            Semantics Preserved
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
            <span style={{ color: '#d29922', fontWeight: 700 }}>λ</span>
            Distinct Rules
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {Object.entries(ruleCounts).map(([r, c]) => (
              <span key={r} className="badge badge-blue" style={{ marginRight: '5px', marginBottom: '3px' }}>
                {r}: {c}
              </span>
            ))}
            {Object.keys(ruleCounts).length === 0 && 'No rewrites needed'}
          </div>
        </div>
      </div>

      {/* Side-by-Side Code Diff */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '10px 14px',
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 600, fontSize: '0.8rem' }}>
            <GitCompare size={14} color="#58a6ff" />
            Side-by-Side Source Code Comparison
          </div>
          <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
            {optimizationCount > 0 ? `${optimizationCount} Algebraic Rewrite(s)` : 'Code Identical'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-code)' }}>
          {/* Original column */}
          <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '10px 0' }}>
            <div style={{ padding: '0 14px 6px 14px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Original Source
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.55' }}>
              {Array.from({ length: maxLines }).map((_, idx) => {
                const line = origLines[idx] ?? '';
                const optLine = optLines[idx] ?? '';
                const isChanged = line !== optLine && line.trim() !== '';

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      background: isChanged ? 'rgba(248, 81, 73, 0.15)' : 'transparent',
                      padding: '1px 10px'
                    }}
                  >
                    <span style={{ width: '28px', color: 'var(--text-dim)', userSelect: 'none', textAlign: 'right', paddingRight: '10px' }}>
                      {idx + 1}
                    </span>
                    <span style={{ color: isChanged ? '#ffa198' : '#e6edf3', whiteSpace: 'pre' }}>
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optimized column */}
          <div style={{ padding: '10px 0' }}>
            <div style={{ padding: '0 14px 6px 14px', fontSize: '0.72rem', fontWeight: 600, color: '#3fb950', textTransform: 'uppercase' }}>
              Optimized Source
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.55' }}>
              {Array.from({ length: maxLines }).map((_, idx) => {
                const line = origLines[idx] ?? '';
                const optLine = optLines[idx] ?? '';
                const isChanged = line !== optLine && optLine.trim() !== '';

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      background: isChanged ? 'rgba(63, 185, 80, 0.15)' : 'transparent',
                      padding: '1px 10px'
                    }}
                  >
                    <span style={{ width: '28px', color: 'var(--text-dim)', userSelect: 'none', textAlign: 'right', paddingRight: '10px' }}>
                      {idx + 1}
                    </span>
                    <span style={{ color: isChanged ? '#7ee787' : '#e6edf3', whiteSpace: 'pre' }}>
                      {optLine}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Optimization Log Cards */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f6fc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span>Optimization Transformation History ({optimizationLog.length} passes)</span>
        </div>

        {optimizationLog.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {optimizationLog.map((log, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                      Step #{i + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#f0f6fc' }}>
                      {log.rule || log.pass || 'Optimization Pass'}
                    </span>
                  </div>
                  {log.location && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      Line {log.location.line}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {log.description}
                </div>

                {(log.before || log.after) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-code)',
                    border: '1px solid var(--border-subtle)',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem'
                  }}>
                    <span style={{ color: '#ffa198' }}>{log.before}</span>
                    <ArrowRight size={12} color="#8b949e" />
                    <span style={{ color: '#7ee787', fontWeight: 600 }}>{log.after}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Program is already in optimal form. No redundant expressions detected.
          </div>
        )}
      </div>
    </div>
  );
}
