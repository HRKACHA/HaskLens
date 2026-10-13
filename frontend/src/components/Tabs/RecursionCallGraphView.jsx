import React, { useState } from 'react';
import {
  Network,
  Repeat,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Zap,
  Info,
  Maximize2
} from 'lucide-react';

export default function RecursionCallGraphView({ recursionData, callGraphData }) {
  const functions = recursionData?.functions || [];
  const mutualGroups = recursionData?.mutual_recursion_groups || [];
  const rawNodes = callGraphData?.nodes || [];
  const edges = callGraphData?.edges || [];

  // If callGraphData is missing or empty, synthesize from recursionData
  const nodes = rawNodes.length > 0
    ? rawNodes
    : functions.map((f) => ({
        name: f.function_name,
        is_recursive: f.is_recursive,
        param_count: 1
      }));

  const [selectedNodeName, setSelectedNodeName] = useState(
    nodes.length > 0 ? nodes[0].name : null
  );

  // Check if a function is in a mutual recursion group
  const getMutualGroup = (name) => {
    return mutualGroups.find((g) => g.functions.includes(name));
  };

  // Check if edge is part of mutual recursion
  const isMutualEdge = (caller, callee) => {
    return mutualGroups.some(
      (g) => g.functions.includes(caller) && g.functions.includes(callee)
    );
  };

  // --- TOPOLOGICAL / HIERARCHICAL LAYOUT COMPUTATION ---
  const nodePositions = {};
  const NODE_WIDTH = 136;
  const NODE_HEIGHT = 48;
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 360;

  if (nodes.length === 1) {
    // Single node: Center
    nodePositions[nodes[0].name] = { x: CANVAS_WIDTH / 2, y: 190 };
  } else if (nodes.length === 2) {
    const isMutualPair = mutualGroups.length > 0 && mutualGroups[0].functions.length >= 2;
    if (isMutualPair) {
      // Horizontal side-by-side for mutual recursion
      nodePositions[nodes[0].name] = { x: 200, y: 180 };
      nodePositions[nodes[1].name] = { x: 440, y: 180 };
    } else {
      // Caller -> Callee vertical
      const isFirstCaller = edges.some(e => e.caller === nodes[0].name && e.callee === nodes[1].name);
      if (isFirstCaller) {
        nodePositions[nodes[0].name] = { x: CANVAS_WIDTH / 2, y: 100 };
        nodePositions[nodes[1].name] = { x: CANVAS_WIDTH / 2, y: 250 };
      } else {
        nodePositions[nodes[0].name] = { x: 220, y: 180 };
        nodePositions[nodes[1].name] = { x: 420, y: 180 };
      }
    }
  } else {
    // 3+ nodes: Layered DAG by in-degree / out-degree
    const inDegree = {};
    const outDegree = {};
    nodes.forEach(n => {
      inDegree[n.name] = 0;
      outDegree[n.name] = 0;
    });
    edges.forEach(e => {
      if (!e.is_self_call) {
        if (inDegree[e.callee] !== undefined) inDegree[e.callee]++;
        if (outDegree[e.caller] !== undefined) outDegree[e.caller]++;
      }
    });

    // Bucket into 3 layers: Top (Roots), Middle, Bottom (Leaves)
    const layers = [[], [], []];
    nodes.forEach(n => {
      const inc = inDegree[n.name] || 0;
      const out = outDegree[n.name] || 0;
      if (inc === 0) {
        layers[0].push(n); // Top entry
      } else if (out === 0) {
        layers[2].push(n); // Leaf helper
      } else {
        layers[1].push(n); // Mid intermediate
      }
    });

    // If middle is empty and both 0 and 2 have items, redistribute
    if (layers[1].length === 0 && (layers[0].length > 2 || layers[2].length > 2)) {
      // Balance layers
      if (layers[0].length > 2) {
        layers[1].push(layers[0].pop());
      }
    }
    // If all ended up in one layer, split evenly
    const nonEmptyLayers = layers.filter(l => l.length > 0);
    if (nonEmptyLayers.length === 1) {
      const all = nonEmptyLayers[0];
      const count = all.length;
      all.forEach((n, idx) => {
        const angle = (2 * Math.PI * idx) / count - Math.PI / 2;
        const radius = Math.min(130, Math.max(90, count * 24));
        nodePositions[n.name] = {
          x: CANVAS_WIDTH / 2 + radius * Math.cos(angle),
          y: CANVAS_HEIGHT / 2 + radius * Math.sin(angle),
        };
      });
    } else {
      const layerY = [80, 180, 280];
      layers.forEach((layerNodes, lIdx) => {
        const lCount = layerNodes.length;
        layerNodes.forEach((n, idx) => {
          const spacing = CANVAS_WIDTH / (lCount + 1);
          nodePositions[n.name] = {
            x: spacing * (idx + 1),
            y: layerY[lIdx],
          };
        });
      });
    }
  }

  // Selected node details
  const selectedNode = nodes.find(n => n.name === selectedNodeName) || nodes[0];
  const selectedFuncInfo = functions.find(f => f.function_name === selectedNodeName);
  const selectedMutualGroup = selectedNodeName ? getMutualGroup(selectedNodeName) : null;
  const callers = edges.filter(e => e.callee === selectedNodeName && !e.is_self_call).map(e => e.caller);
  const callees = edges.filter(e => e.caller === selectedNodeName && !e.is_self_call).map(e => e.callee);
  const isDirectRecursive = edges.some(e => e.caller === selectedNodeName && e.is_self_call) || selectedFuncInfo?.is_recursive;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Top Metrics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        flexShrink: 0
      }}>
        <div className="glass-panel" style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <Network size={13} color="#58a6ff" />
            Functions
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#58a6ff', marginTop: '2px' }}>
            {nodes.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <Repeat size={13} color="#818cf8" />
            Direct Recursion
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#818cf8', marginTop: '2px' }}>
            {functions.filter(f => f.is_recursive).length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <GitFork size={13} color="#bc8cff" />
            Mutual Groups (SCC)
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: mutualGroups.length > 0 ? '#bc8cff' : 'var(--text-dim)', marginTop: '2px' }}>
            {mutualGroups.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <Zap size={13} color="#3fb950" />
            Call Edges
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#3fb950', marginTop: '2px' }}>
            {edges.length}
          </div>
        </div>
      </div>

      {/* Main Interactive Topology Visualizer */}
      <div className="glass-panel" style={{
        flex: 1,
        minHeight: '260px',
        maxHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg-code)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        position: 'relative'
      }}>
        {/* Visualizer header & legend */}
        <div style={{
          padding: '8px 14px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 600, color: 'var(--text-main)' }}>
            <Network size={14} color="#58a6ff" />
            Function Call Graph Topology
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} /> Direct Recursive
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#bc8cff', display: 'inline-block' }} /> Mutual Cycle (SCC)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} /> Standard
            </span>
          </div>
        </div>

        {/* SVG Canvas */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '10px' }}>
          <svg
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            style={{
              width: '100%',
              maxHeight: '100%',
              minHeight: '260px',
              userSelect: 'none'
            }}
          >
            <defs>
              {/* Directed Standard Arrowhead: Clean, properly anchored */}
              <marker
                id="arrowhead-std"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill="#58a6ff" />
              </marker>

              {/* Mutual Cycle Arrowhead */}
              <marker
                id="arrowhead-mutual"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill="#bc8cff" />
              </marker>

              {/* Self Loop Arrowhead: Anchored to touch node top exactly */}
              <marker
                id="arrowhead-loop"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill="#818cf8" />
              </marker>

              {/* Grid pattern */}
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.04)" />
              </pattern>
            </defs>

            {/* Subtle grid background */}
            <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#grid)" />

            {/* RENDER EDGES */}
            {edges.map((e, idx) => {
              const fromPos = nodePositions[e.caller];
              const toPos = nodePositions[e.callee];
              if (!fromPos || !toPos) return null;

              const isMutual = isMutualEdge(e.caller, e.callee);

              if (e.is_self_call) {
                // Self-loop for recursion: Loops gracefully over the top of the node card
                const x0 = fromPos.x + 28;
                const y0 = fromPos.y - NODE_HEIGHT / 2;
                const x1 = fromPos.x - 28;
                const y1 = fromPos.y - NODE_HEIGHT / 2;
                const loopHeight = 52;

                return (
                  <g key={`self-${idx}`}>
                    {/* Background glow path */}
                    <path
                      d={`M ${x0} ${y0} C ${x0 + 40} ${y0 - loopHeight}, ${x1 - 40} ${y0 - loopHeight}, ${x1} ${y0}`}
                      fill="none"
                      stroke="rgba(129, 140, 248, 0.2)"
                      strokeWidth="5"
                    />
                    {/* Main loop path */}
                    <path
                      d={`M ${x0} ${y0} C ${x0 + 40} ${y0 - loopHeight}, ${x1 - 40} ${y0 - loopHeight}, ${x1} ${y0}`}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.2"
                      strokeDasharray="4 3"
                      markerEnd="url(#arrowhead-loop)"
                    />
                    {/* Loop text badge */}
                    <rect
                      x={fromPos.x - 46}
                      y={y0 - loopHeight - 10}
                      width="92"
                      height="16"
                      rx="8"
                      fill="#161b22"
                      stroke="#30363d"
                    />
                    <text
                      x={fromPos.x}
                      y={y0 - loopHeight + 2}
                      textAnchor="middle"
                      fill="#818cf8"
                      fontSize="9.5"
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                    >
                      ↻ Self Recursive
                    </text>
                  </g>
                );
              }

              // Mutual recursion bidirectional arches
              if (isMutual) {
                const isLeftToRight = fromPos.x < toPos.x;
                const startX = isLeftToRight ? fromPos.x + NODE_WIDTH / 2 : fromPos.x - NODE_WIDTH / 2;
                const endX = isLeftToRight ? toPos.x - NODE_WIDTH / 2 : toPos.x + NODE_WIDTH / 2;
                const yOffset = isLeftToRight ? -10 : 10;
                const controlY = isLeftToRight ? fromPos.y - 40 : fromPos.y + 40;

                return (
                  <g key={`mutual-${idx}`}>
                    <path
                      d={`M ${startX} ${fromPos.y + yOffset} Q ${(startX + endX) / 2} ${controlY} ${endX} ${toPos.y + yOffset}`}
                      fill="none"
                      stroke="#bc8cff"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                      markerEnd="url(#arrowhead-mutual)"
                    />
                  </g>
                );
              }

              // Standard directed edge between nodes
              const isVertical = Math.abs(fromPos.y - toPos.y) > 50;
              let startX = fromPos.x;
              let startY = fromPos.y + NODE_HEIGHT / 2;
              let endX = toPos.x;
              let endY = toPos.y - NODE_HEIGHT / 2;

              if (!isVertical) {
                startX = fromPos.x < toPos.x ? fromPos.x + NODE_WIDTH / 2 : fromPos.x - NODE_WIDTH / 2;
                endX = fromPos.x < toPos.x ? toPos.x - NODE_WIDTH / 2 : toPos.x + NODE_WIDTH / 2;
                startY = fromPos.y;
                endY = toPos.y;
              }

              return (
                <path
                  key={`std-${idx}`}
                  d={`M ${startX} ${startY} C ${startX} ${(startY + endY) / 2}, ${endX} ${(startY + endY) / 2}, ${endX} ${endY}`}
                  fill="none"
                  stroke="#58a6ff"
                  strokeWidth="1.8"
                  markerEnd="url(#arrowhead-std)"
                />
              );
            })}

            {/* RENDER NODES AS SLEEK CARDS */}
            {nodes.map((n) => {
              const pos = nodePositions[n.name];
              if (!pos) return null;

              const isSelected = selectedNodeName === n.name;
              const mutual = getMutualGroup(n.name);
              const funcInfo = functions.find(f => f.function_name === n.name);
              const isRecursive = n.is_recursive || funcInfo?.is_recursive;

              // Border and accent color
              const strokeColor = mutual
                ? '#bc8cff'
                : isRecursive
                ? '#818cf8'
                : '#58a6ff';

              const glowFill = isSelected
                ? 'rgba(88, 166, 255, 0.22)'
                : 'rgba(22, 27, 34, 0.92)';

              return (
                <g
                  key={n.name}
                  transform={`translate(${pos.x - NODE_WIDTH / 2}, ${pos.y - NODE_HEIGHT / 2})`}
                  onClick={() => setSelectedNodeName(n.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Selection glow */}
                  {isSelected && (
                    <rect
                      x="-3"
                      y="-3"
                      width={NODE_WIDTH + 6}
                      height={NODE_HEIGHT + 6}
                      rx="10"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  )}

                  {/* Card Background */}
                  <rect
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx="8"
                    fill={glowFill}
                    stroke={isSelected ? strokeColor : 'var(--border-subtle)'}
                    strokeWidth={isSelected ? '2' : '1.2'}
                  />

                  {/* Left Accent Strip */}
                  <rect
                    width="4"
                    height={NODE_HEIGHT}
                    rx="2"
                    fill={strokeColor}
                  />

                  {/* Function Lambda icon */}
                  <circle
                    cx="18"
                    cy="24"
                    r="9"
                    fill="rgba(255, 255, 255, 0.05)"
                  />
                  <text
                    x="18"
                    y="27"
                    textAnchor="middle"
                    fill={strokeColor}
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight="700"
                  >
                    λ
                  </text>

                  {/* Function Name */}
                  <text
                    x="34"
                    y="21"
                    fill="#f0f6fc"
                    fontFamily="var(--font-mono)"
                    fontSize="12.5"
                    fontWeight="700"
                  >
                    {n.name}
                  </text>

                  {/* Badge Label at bottom of card */}
                  <text
                    x="34"
                    y="36"
                    fill={strokeColor}
                    fontSize="9.5"
                    fontFamily="var(--font-sans)"
                    fontWeight="600"
                  >
                    {mutual ? 'Mutual SCC' : isRecursive ? 'Recursive' : 'Standard'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Function Deep-Dive Inspector */}
      {selectedNode && (
        <div className="glass-panel" style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          fontSize: '0.78rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f0f6fc' }}>
                Function: {selectedNode.name}
              </span>
              {isDirectRecursive ? (
                <span className="badge badge-indigo">Direct Recursion</span>
              ) : selectedMutualGroup ? (
                <span className="badge badge-purple">Mutual Recursion SCC</span>
              ) : (
                <span className="badge badge-blue">Non-Recursive</span>
              )}
              {selectedFuncInfo?.is_tail_recursive && (
                <span className="badge badge-green">Tail Call Optimized</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '14px', color: 'var(--text-dim)', fontSize: '0.74rem' }}>
              <span>Callers: <strong style={{ color: '#58a6ff' }}>{callers.length}</strong></span>
              <span>Callees: <strong style={{ color: '#3fb950' }}>{callees.length}</strong></span>
            </div>
          </div>

          {/* Explanation text */}
          {selectedFuncInfo?.explanation && (
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.5, fontSize: '0.78rem' }}>
              {selectedFuncInfo.explanation}
            </p>
          )}

          {/* Base cases if any */}
          {selectedFuncInfo?.base_cases && selectedFuncInfo.base_cases.length > 0 && (
            <div style={{
              background: 'rgba(63, 185, 80, 0.08)',
              border: '1px solid rgba(63, 185, 80, 0.25)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.75rem',
              color: '#3fb950',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={13} />
              <span>Detected Base Termination Condition: <strong>{selectedFuncInfo.base_cases.join(', ')}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Mutual Recursion Group Callouts */}
      {mutualGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mutualGroups.map((g, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '10px 14px',
                background: 'rgba(188, 140, 255, 0.06)',
                border: '1px solid rgba(188, 140, 255, 0.25)',
                borderRadius: '6px',
                fontSize: '0.76rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-purple">SCC #{idx + 1}</span>
                <strong style={{ color: '#bc8cff', fontFamily: 'var(--font-mono)' }}>
                  {g.functions.join(' ⇄ ')}
                </strong>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                {g.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
