import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, Tag, Variable, Compass } from 'lucide-react';

export default function SemanticAnalysisView({ typeAnalysis, semanticAnalysis, diagnostics }) {
  const types = typeAnalysis?.inferred_types || {};
  const symbols = semanticAnalysis?.symbols || [];
  const diags = diagnostics?.diagnostics || [];

  const errorCount = diags.filter(d => d.severity === 'error').length;
  const warningCount = diags.filter(d => d.severity === 'warning').length;
  const infoCount = diags.filter(d => d.severity === 'info').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '14px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <ShieldCheck size={16} color="#34d399" />
            Type Checking
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: errorCount === 0 ? '#34d399' : '#fb7185' }}>
            {errorCount === 0 ? 'Passed (Type Safe)' : `${errorCount} Type Error(s)`}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <Tag size={16} color="#818cf8" />
            Signatures Inferred
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>
            {Object.keys(types).length} Functions
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <AlertTriangle size={16} color="#fbbf24" />
            Warnings & Hints
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: warningCount > 0 ? '#fbbf24' : '#94a3b8' }}>
            {warningCount} Warnings
          </div>
        </div>
      </div>

      {/* Diagnostics List (if any errors or warnings exist) */}
      {diags.length > 0 && (
        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(15, 21, 35, 0.7)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={16} color="#ec4899" />
            Compiler Diagnostics & Feedback ({diags.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {diags.map((d, i) => {
              const isErr = d.severity === 'error';
              const isWarn = d.severity === 'warning';
              const border = isErr ? 'rgba(244, 63, 94, 0.4)' : isWarn ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.4)';
              const bg = isErr ? 'rgba(244, 63, 94, 0.1)' : isWarn ? 'rgba(245, 158, 11, 0.08)' : 'rgba(56, 189, 248, 0.08)';

              return (
                <div
                  key={i}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: bg,
                    border: `1px solid ${border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isErr ? (
                        <span className="badge badge-rose">{d.severity}</span>
                      ) : isWarn ? (
                        <span className="badge badge-amber">{d.severity}</span>
                      ) : (
                        <span className="badge badge-cyan">{d.severity}</span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        Phase: {d.phase}
                      </span>
                    </div>

                    {d.line && (
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        Line {d.line}{d.column ? `, Col ${d.column}` : ''}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '4px' }}>
                    {d.message}
                  </div>

                  {d.suggestion && (
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '4px', fontStyle: 'italic' }}>
                      💡 Suggestion: {d.suggestion}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inferred Types Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.85rem' }}>
          Function Signatures & Inferred Hindley-Milner Types
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 16px' }}>Function Name</th>
              <th style={{ padding: '10px 16px' }}>Inferred / Declared Type Signature</th>
              <th style={{ padding: '10px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(types).length > 0 ? (
              Object.entries(types).map(([fnName, typeSig], i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 600 }}>
                    {fnName}
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>
                    {typeSig}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className="badge badge-emerald">Verified</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No function signatures found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Symbol Table */}
      {symbols.length > 0 && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.85rem' }}>
            Symbol Table & Scope Registry
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 16px' }}>Identifier</th>
                <th style={{ padding: '10px 16px' }}>Scope</th>
                <th style={{ padding: '10px 16px' }}>Kind</th>
                <th style={{ padding: '10px 16px' }}>Arity</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((sym, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 600 }}>
                    {sym.name}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>
                    {sym.scope || 'global'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className="badge badge-indigo">{sym.kind || (sym.is_function ? 'function' : 'parameter')}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                    {sym.arity !== undefined ? sym.arity : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
