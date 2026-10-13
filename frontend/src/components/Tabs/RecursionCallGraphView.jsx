import React from 'react';
import { GitFork, Repeat, Network, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RecursionCallGraphView({ recursionData, callGraphData }) {
  const functions = recursionData?.functions || [];
  const mutualGroups = recursionData?.mutual_recursion_groups || [];
  const nodes = callGraphData?.nodes || [];
  const edges = callGraphData?.edges || [];

  // Generate SVG layout coordinates for nodes
  const nodeCount = nodes.length;
  const radius = Math.min(160, Math.max(80, nodeCount * 35));
  const centerX = 260;
  const centerY = 180;

  const nodePositions = {};
  nodes.forEach((n, idx) => {
    const angle = (2 * Math.PI * idx) / (nodeCount || 1) - Math.PI / 2;
    nodePositions[n.name] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  // Check if a node belongs to mutual recursion
  const isMutual = (name) => {
    return mutualGroups.some(g => g.functions.includes(name));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Recursion Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '14px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <Repeat size={16} color="#818cf8" />
            Direct Recursion
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: '#818cf8' }}>
            {functions.filter(f => f.is_recursive).length} Function(s)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <Network size={16} color="#c084fc" />
            Mutual Recursion (SCC)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: mutualGroups.length > 0 ? '#c084fc' : '#94a3b8' }}>
            {mutualGroups.length} Group(s)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <GitFork size={16} color="#34d399" />
            Call Graph Edges
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: '#34d399' }}>
            {edges.length} Dependencies
          </div>
        </div>
      </div>

      {/* Visual Interactive Call Graph (SVG) */}
      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(10, 13, 20, 0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
            <Network size={16} color="#38bdf8" />
            Function Call Graph Topology
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} /> Direct Recursive
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#c084fc', display: 'inline-block' }} /> Mutual Recursive
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} /> Standard
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', padding: '10px 0' }}>
          <svg width="520" height="360" style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="22"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#58a6ff" />
              </marker>
              <marker
                id="arrowhead-mutual"
                markerWidth="8"
                markerHeight="6"
                refX="22"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#bc8cff" />
              </marker>
            </defs>

            {/* Render Edges */}
            {edges.map((e, i) => {
              const fromPos = nodePositions[e.caller];
              const toPos = nodePositions[e.callee];
              if (!fromPos || !toPos) return null;

              const isMutualEdge = isMutual(e.caller) && isMutual(e.callee);

              if (e.is_self_call) {
                // Self-loop for recursion
                return (
                  <path
                    key={i}
                    d={`M ${fromPos.x - 15} ${fromPos.y - 15} C ${fromPos.x - 45} ${fromPos.y - 55}, ${fromPos.x + 45} ${fromPos.y - 55}, ${fromPos.x + 15} ${fromPos.y - 15}`}
                    fill="none"
                    stroke="#58a6ff"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              }

              return (
                <line
                  key={i}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isMutualEdge ? '#bc8cff' : '#484f58'}
                  strokeWidth={isMutualEdge ? '2' : '1.5'}
                  markerEnd={isMutualEdge ? 'url(#arrowhead-mutual)' : 'url(#arrowhead)'}
                />
              );
            })}

            {/* Render Nodes */}
            {nodes.map((n) => {
              const pos = nodePositions[n.name];
              if (!pos) return null;

              const mutual = isMutual(n.name);
              const nodeFill = mutual ? 'rgba(188, 140, 255, 0.15)' : n.is_recursive ? 'rgba(88, 166, 255, 0.15)' : 'rgba(110, 118, 129, 0.15)';
              const nodeStroke = mutual ? '#bc8cff' : n.is_recursive ? '#58a6ff' : '#8b949e';

              return (
                <g key={n.name} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r="24"
                    fill={nodeFill}
                    stroke={nodeStroke}
                    strokeWidth="2"
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#fff"
                    fontFamily="var(--font-mono)"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {n.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Recursion Details Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
          Detailed Function Recursion Analysis
        </div>

        {functions.map((fn, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '16px',
              background: 'rgba(15, 21, 35, 0.6)',
              borderLeft: fn.is_recursive ? '4px solid #818cf8' : '4px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                  {fn.function_name}
                </span>
                {fn.is_recursive ? (
                  <span className="badge badge-indigo">Direct Recursion</span>
                ) : (
                  <span className="badge badge-cyan">Non-Recursive</span>
                )}
                {fn.is_tail_recursive && (
                  <span className="badge badge-emerald">Tail Call Position</span>
                )}
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 10px 0' }}>
              {fn.explanation}
            </p>

            {fn.base_cases && fn.base_cases.length > 0 && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={14} />
                <span>Detected Base Case: {fn.base_cases.join(', ')}</span>
              </div>
            )}
          </div>
        ))}

        {/* Mutual Recursion Groups */}
        {mutualGroups.map((g, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '16px',
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-purple">Mutual Recursion SCC #{idx + 1}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#c084fc' }}>
                {g.functions.join(' ⇄ ')}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {g.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
