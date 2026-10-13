import React from 'react';
import { CheckCircle2, XCircle, Gauge, Cpu, CheckCheck, AlertCircle } from 'lucide-react';

export default function VerificationView({
  evaluationData,
  verificationData,
  entryFunction,
  exampleInputs
}) {
  const evalSuccess = evaluationData?.success;
  const evalValue = evaluationData?.value;
  const evalType = evaluationData?.type;
  const evalSteps = evaluationData?.steps;
  const evalError = evaluationData?.error;

  const verMatch = verificationData?.all_match;
  const verResults = verificationData?.results || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Evaluation Result Card */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 21, 35, 0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#fff' }}>
              Bounded AST Evaluator Execution
            </h3>
          </div>
          {evalSuccess ? (
            <span className="badge badge-emerald">
              <CheckCircle2 size={12} /> Execution Successful
            </span>
          ) : (
            <span className="badge badge-rose">
              <XCircle size={12} /> {evalError ? 'Execution Failed' : 'Not Run'}
            </span>
          )}
        </div>

        {evalSuccess ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Target Function</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                {entryFunction || 'f'}
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Inputs Provided</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
                ({exampleInputs || 'none'})
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Computed Result</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                {String(evalValue)}
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Evaluation Steps</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#c084fc', marginTop: '2px' }}>
                {evalSteps} steps
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem' }}>
            {evalError ? (
              <div>Error: {evalError}</div>
            ) : (
              <div>Specify an Entry Function and Argument in the editor panel to run live bounded AST evaluation.</div>
            )}
          </div>
        )}
      </div>

      {/* Semantic Preservation Verification Matrix */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '14px 18px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCheck size={18} color="#34d399" />
            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              Semantic Preservation Equivalence Matrix (Original vs Optimized)
            </span>
          </div>

          {verMatch ? (
            <span className="badge badge-emerald">
              <CheckCircle2 size={12} /> 100% Equivalent
            </span>
          ) : (
            <span className="badge badge-amber">
              Verification Notice
            </span>
          )}
        </div>

        {verResults.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 16px' }}>Test Vector (Input)</th>
                <th style={{ padding: '10px 16px' }}>Original Result</th>
                <th style={{ padding: '10px 16px' }}>Optimized Result</th>
                <th style={{ padding: '10px 16px' }}>Step Reduction</th>
                <th style={{ padding: '10px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {verResults.map((r, i) => {
                const match = r.matches ?? (JSON.stringify(r.original_value) === JSON.stringify(r.optimized_value));
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                      {JSON.stringify(r.input)}
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>
                      {String(r.original_value)}
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 600 }}>
                      {String(r.optimized_value)}
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>
                      {r.original_steps && r.optimized_steps ? `${r.original_steps} → ${r.optimized_steps}` : 'Identical'}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      {match ? (
                        <span className="badge badge-emerald">Match</span>
                      ) : (
                        <span className="badge badge-rose">Mismatch</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Provide entry function and arguments to execute automated semantic preservation test vectors.
          </div>
        )}
      </div>
    </div>
  );
}
