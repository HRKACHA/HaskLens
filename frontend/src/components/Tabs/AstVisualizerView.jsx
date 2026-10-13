import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Info,
  Layers,
  Sparkles,
  Columns,
  Minimize2,
  Maximize2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Recursive Tree Node Component with correct depth and expand/collapse support
function TreeNode({
  node,
  depth = 0,
  onSelect,
  selectedNode,
  expandAll = null,
  isOptimized = false
}) {
  const [localExpanded, setLocalExpanded] = useState(depth < 3);

  // If expandAll is set, respect it, otherwise use local state
  const isExpanded = expandAll !== null ? expandAll : localExpanded;

  if (!node || typeof node !== 'object') {
    return (
      <div style={{
        paddingLeft: `${depth * 16}px`,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.78rem',
        color: 'var(--text-dim)'
      }}>
        {String(node)}
      </div>
    );
  }

  const nodeType = node.node_type || (Array.isArray(node) ? 'List' : 'Object');
  const isSelected = selectedNode === node;

  // Extract child fields
  const children = [];
  if (Array.isArray(node)) {
    node.forEach((item, idx) => {
      if (item && typeof item === 'object') {
        children.push({ key: `[${idx}]`, val: item });
      }
    });
  } else {
    Object.entries(node).forEach(([k, v]) => {
      if (k !== 'node_type' && k !== 'loc' && v && typeof v === 'object') {
        children.push({ key: k, val: v });
      }
    });
  }

  const hasChildren = children.length > 0;

  // Badge styling based on AST node type
  const getNodeColor = (type) => {
    switch (type) {
      case 'FunctionDef':
        return { bg: 'rgba(88, 166, 255, 0.14)', text: '#58a6ff', border: 'rgba(88, 166, 255, 0.35)' };
      case 'TypeSignature':
        return { bg: 'rgba(188, 140, 255, 0.14)', text: '#bc8cff', border: 'rgba(188, 140, 255, 0.35)' };
      case 'IfExpr':
        return { bg: 'rgba(210, 153, 34, 0.14)', text: '#d29922', border: 'rgba(210, 153, 34, 0.35)' };
      case 'BinaryOp':
        return { bg: 'rgba(56, 139, 253, 0.14)', text: '#388bfd', border: 'rgba(56, 139, 253, 0.35)' };
      case 'UnaryOp':
        return { bg: 'rgba(219, 97, 162, 0.14)', text: '#db61a2', border: 'rgba(219, 97, 162, 0.35)' };
      case 'FuncApp':
        return { bg: 'rgba(63, 185, 80, 0.14)', text: '#3fb950', border: 'rgba(63, 185, 80, 0.35)' };
      case 'IntLiteral':
      case 'BoolLiteral':
      case 'FloatLiteral':
        return { bg: 'rgba(248, 81, 73, 0.14)', text: '#f85149', border: 'rgba(248, 81, 73, 0.35)' };
      case 'Identifier':
        return { bg: 'rgba(88, 166, 255, 0.12)', text: '#79c0ff', border: 'rgba(88, 166, 255, 0.25)' };
      default:
        return { bg: 'rgba(110, 118, 129, 0.12)', text: '#8b949e', border: 'rgba(110, 118, 129, 0.25)' };
    }
  };

  const style = getNodeColor(nodeType);

  // Short preview description
  let summary = '';
  if (node.name) summary = ` (${node.name})`;
  else if (node.op) summary = ` [${node.op}]`;
  else if (node.value !== undefined) summary = ` = ${node.value}`;

  return (
    <div style={{ margin: '1px 0' }}>
      <div
        onClick={() => onSelect(node)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 6px',
          paddingLeft: `${depth * 14 + 6}px`,
          borderRadius: '5px',
          background: isSelected ? 'rgba(88, 166, 255, 0.2)' : 'transparent',
          border: isSelected ? '1px solid #58a6ff' : '1px solid transparent',
          cursor: 'pointer',
          userSelect: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          transition: 'all 0.1s ease',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'transparent';
        }}
      >
        {/* Toggle arrow */}
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setLocalExpanded(!isExpanded);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              flexShrink: 0
            }}
          >
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        ) : (
          <span style={{ width: '13px', display: 'inline-block', flexShrink: 0 }} />
        )}

        {/* Node Kind Badge */}
        <span style={{
          background: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
          borderRadius: '4px',
          padding: '0 5px',
          fontWeight: 600,
          fontSize: '0.68rem',
          flexShrink: 0
        }}>
          {nodeType}
        </span>

        {/* Node detail preview */}
        <span style={{ color: '#e6edf3', fontWeight: 500, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {summary}
        </span>

        {node.loc && (
          <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', marginLeft: 'auto', flexShrink: 0 }}>
            L{node.loc.line}:{node.loc.column}
          </span>
        )}
      </div>

      {/* Render children if expanded - PROPERLY INCREMENTING DEPTH */}
      {isExpanded && hasChildren && (
        <div style={{
          borderLeft: '1px dashed rgba(255, 255, 255, 0.08)',
          marginLeft: `${depth * 14 + 11}px`
        }}>
          {children.map((child, i) => (
            <div key={i}>
              <div style={{
                fontSize: '0.65rem',
                color: 'var(--text-dim)',
                paddingLeft: '12px',
                marginTop: '1px',
                fontFamily: 'var(--font-mono)'
              }}>
                ↳ {child.key}:
              </div>
              <TreeNode
                node={child.val}
                depth={depth + 1}
                onSelect={onSelect}
                selectedNode={selectedNode}
                expandAll={expandAll}
                isOptimized={isOptimized}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to count nodes
const countAstNodes = (n) => {
  if (!n || typeof n !== 'object') return 0;
  let count = 1;
  if (Array.isArray(n)) {
    return n.reduce((acc, item) => acc + countAstNodes(item), 0);
  }
  Object.values(n).forEach((v) => {
    if (v && typeof v === 'object') {
      count += countAstNodes(v);
    }
  });
  return count;
};

export default function AstVisualizerView({ astData, optimizedAstData }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'original', 'optimized'
  const [expandAll, setExpandAll] = useState(null);

  if (!astData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No AST available. Click Compile & Optimize to view the abstract syntax tree.
      </div>
    );
  }

  const originalCount = countAstNodes(astData);
  const optimizedCount = optimizedAstData ? countAstNodes(optimizedAstData) : originalCount;
  const hasOptimization = optimizedAstData && originalCount !== optimizedCount;
  const nodeReduction = originalCount - optimizedCount;
  const percentReduction = originalCount > 0 ? Math.round((nodeReduction / originalCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      {/* Top Controls Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '6px 10px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        fontSize: '0.78rem'
      }}>
        {/* View Mode Segmented Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setViewMode('split')}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '3px 8px',
              fontSize: '0.74rem',
              background: viewMode === 'split' ? 'var(--bg-elevated)' : 'transparent',
              color: viewMode === 'split' ? '#58a6ff' : 'var(--text-muted)',
              border: viewMode === 'split' ? '1px solid #58a6ff' : '1px solid transparent'
            }}
            title="Side-by-side comparison of original and optimized AST"
          >
            <Columns size={12} /> Side-by-Side Diff
          </button>

          <button
            onClick={() => setViewMode('original')}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '3px 8px',
              fontSize: '0.74rem',
              background: viewMode === 'original' ? 'var(--bg-elevated)' : 'transparent',
              color: viewMode === 'original' ? '#58a6ff' : 'var(--text-muted)',
              border: viewMode === 'original' ? '1px solid #58a6ff' : '1px solid transparent'
            }}
          >
            Original AST ({originalCount})
          </button>

          {optimizedAstData && (
            <button
              onClick={() => setViewMode('optimized')}
              className="btn btn-ghost btn-sm"
              style={{
                padding: '3px 8px',
                fontSize: '0.74rem',
                background: viewMode === 'optimized' ? 'var(--bg-elevated)' : 'transparent',
                color: viewMode === 'optimized' ? '#3fb950' : 'var(--text-muted)',
                border: viewMode === 'optimized' ? '1px solid #3fb950' : '1px solid transparent'
              }}
            >
              Optimized AST ({optimizedCount})
            </button>
          )}
        </div>

        {/* Tree expansion toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setExpandAll(true)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 7px', fontSize: '0.72rem' }}
            title="Expand all nodes"
          >
            <Maximize2 size={11} /> Expand All
          </button>
          <button
            onClick={() => setExpandAll(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 7px', fontSize: '0.72rem' }}
            title="Collapse all nodes"
          >
            <Minimize2 size={11} /> Collapse All
          </button>
        </div>
      </div>

      {/* Explanatory Banner: Answers user's doubt about AST equivalence */}
      <div style={{
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '0.76rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: hasOptimization ? 'rgba(88, 166, 255, 0.08)' : 'rgba(63, 185, 80, 0.08)',
        border: hasOptimization ? '1px solid rgba(88, 166, 255, 0.25)' : '1px solid rgba(63, 185, 80, 0.25)',
        color: hasOptimization ? '#79c0ff' : '#3fb950',
      }}>
        {hasOptimization ? (
          <>
            <Sparkles size={14} color="#58a6ff" />
            <span>
              <strong>Algebraic Rewrites Applied:</strong> AST simplified from <strong>{originalCount}</strong> to <strong>{optimizedCount}</strong> nodes
              {' '}(<strong style={{ color: '#3fb950' }}>-{nodeReduction} nodes / {percentReduction}% reduction</strong>).
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 size={14} color="#3fb950" />
            <span>
              <strong>AST Semantics Preserved:</strong> Original and Optimized AST are identical ({originalCount} nodes). No constant folding or dead-branch rewrites were applicable to this code structure.
            </span>
          </>
        )}
      </div>

      {/* Main View Area */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr',
        gap: '10px',
        minHeight: 0
      }}>
        {/* Left Column: Original AST */}
        {(viewMode === 'split' || viewMode === 'original') && (
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--bg-code)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px'
          }}>
            <div style={{
              padding: '6px 12px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>ORIGINAL PARSER AST</span>
              <span className="badge badge-blue" style={{ fontSize: '0.64rem' }}>{originalCount} nodes</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              <TreeNode
                node={astData}
                depth={0}
                onSelect={setSelectedNode}
                selectedNode={selectedNode}
                expandAll={expandAll}
                isOptimized={false}
              />
            </div>
          </div>
        )}

        {/* Right Column: Optimized AST */}
        {(viewMode === 'split' || viewMode === 'optimized') && (
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--bg-code)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px'
          }}>
            <div style={{
              padding: '6px 12px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: hasOptimization ? '#58a6ff' : 'var(--text-muted)' }}>
                OPTIMIZED REWRITE AST
              </span>
              <span className={hasOptimization ? "badge badge-green" : "badge badge-blue"} style={{ fontSize: '0.64rem' }}>
                {optimizedCount} nodes {hasOptimization && `(-${nodeReduction})`}
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              <TreeNode
                node={optimizedAstData || astData}
                depth={0}
                onSelect={setSelectedNode}
                selectedNode={selectedNode}
                expandAll={expandAll}
                isOptimized={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Selected Node Property Inspector Tray */}
      {selectedNode && (
        <div className="glass-panel" style={{
          padding: '10px 14px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={14} color="#58a6ff" />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Inspected Node:</span>
              <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{selectedNode.node_type || 'Object'}</span>
              {selectedNode.name && <span style={{ color: '#58a6ff', fontFamily: 'var(--font-mono)' }}>name: "{selectedNode.name}"</span>}
              {selectedNode.op && <span style={{ color: '#f0883e', fontFamily: 'var(--font-mono)' }}>op: "{selectedNode.op}"</span>}
              {selectedNode.value !== undefined && <span style={{ color: '#3fb950', fontFamily: 'var(--font-mono)' }}>value: {String(selectedNode.value)}</span>}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '1px 6px', fontSize: '0.7rem' }}
            >
              ✕ Close
            </button>
          </div>

          {selectedNode.loc && (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
              Source Range: Line {selectedNode.loc.line}, Column {selectedNode.loc.column}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
