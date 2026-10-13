import React, { useState } from 'react';
import { ChevronRight, ChevronDown, GitFork, Info, Code, Maximize2, Minimize2 } from 'lucide-react';

// Recursive Tree Node Component
function TreeNode({ node, depth = 0, onSelect, selectedNode, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 5);

  if (!node || typeof node !== 'object') {
    return (
      <div style={{ paddingLeft: `${depth * 20}px`, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
        {String(node)}
      </div>
    );
  }

  const nodeType = node.node_type || (Array.isArray(node) ? 'Array' : 'Object');
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

  // Badge styling based on AST node type - clean engineering tones
  const getNodeColor = (type) => {
    switch (type) {
      case 'FunctionDef': return { bg: 'rgba(88, 166, 255, 0.12)', text: '#58a6ff', border: 'rgba(88, 166, 255, 0.3)' };
      case 'TypeSignature': return { bg: 'rgba(188, 140, 255, 0.12)', text: '#bc8cff', border: 'rgba(188, 140, 255, 0.3)' };
      case 'IfExpr': return { bg: 'rgba(210, 153, 34, 0.12)', text: '#d29922', border: 'rgba(210, 153, 34, 0.3)' };
      case 'BinaryOp': return { bg: 'rgba(56, 139, 253, 0.12)', text: '#388bfd', border: 'rgba(56, 139, 253, 0.3)' };
      case 'UnaryOp': return { bg: 'rgba(219, 97, 162, 0.12)', text: '#db61a2', border: 'rgba(219, 97, 162, 0.3)' };
      case 'FuncApp': return { bg: 'rgba(63, 185, 80, 0.12)', text: '#3fb950', border: 'rgba(63, 185, 80, 0.3)' };
      case 'IntLiteral':
      case 'BoolLiteral':
      case 'FloatLiteral': return { bg: 'rgba(248, 81, 73, 0.12)', text: '#f85149', border: 'rgba(248, 81, 73, 0.3)' };
      case 'Identifier': return { bg: 'rgba(88, 166, 255, 0.12)', text: '#58a6ff', border: 'rgba(88, 166, 255, 0.3)' };
      default: return { bg: 'rgba(110, 118, 129, 0.12)', text: '#8b949e', border: 'rgba(110, 118, 129, 0.3)' };
    }
  };

  const style = getNodeColor(nodeType);

  // Short preview description
  let summary = '';
  if (node.name) summary = ` (${node.name})`;
  else if (node.op) summary = ` [${node.op}]`;
  else if (node.value !== undefined) summary = ` = ${node.value}`;

  return (
    <div style={{ margin: '2px 0' }}>
      <div
        onClick={() => onSelect(node)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          paddingLeft: `${depth * 18 + 6}px`,
          borderRadius: '6px',
          background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
          cursor: 'pointer',
          userSelect: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          transition: 'background 0.1s ease'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'transparent';
        }}
      >
        {/* Toggle icon */}
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-dim)' }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span style={{ width: '14px', display: 'inline-block' }} />
        )}

        {/* Node Kind Badge */}
        <span style={{
          background: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
          borderRadius: '4px',
          padding: '1px 6px',
          fontWeight: 600,
          fontSize: '0.72rem'
        }}>
          {nodeType}
        </span>

        {/* Node detail preview */}
        <span style={{ color: '#fff', fontWeight: 500 }}>
          {summary}
        </span>

        {node.loc && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
            Ln {node.loc.line}:{node.loc.column}
          </span>
        )}
      </div>

      {/* Render children if expanded */}
      {expanded && hasChildren && (
        <div style={{ borderLeft: '1px dashed rgba(255, 255, 255, 0.1)', marginLeft: `${depth * 18 + 12}px` }}>
          {children.map((child, i) => (
            <div key={i}>
              <div style={{
                fontSize: '0.68rem',
                color: 'var(--text-dim)',
                paddingLeft: '14px',
                marginTop: '2px',
                fontFamily: 'var(--font-mono)'
              }}>
                ↳ {child.key}:
              </div>
              <TreeNode
                node={child.val}
                depth={1}
                onSelect={onSelect}
                selectedNode={selectedNode}
                defaultExpanded={defaultExpanded}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AstVisualizerView({ astData, optimizedAstData }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('original'); // 'original' or 'optimized'

  const currentAst = viewMode === 'optimized' && optimizedAstData ? optimizedAstData : astData;

  if (!currentAst) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No AST available. Compile a program to view its abstract syntax tree.
      </div>
    );
  }

  // Count total nodes recursively
  const countNodes = (n) => {
    if (!n || typeof n !== 'object') return 0;
    let count = 1;
    if (Array.isArray(n)) {
      return n.reduce((acc, item) => acc + countNodes(item), 0);
    }
    Object.values(n).forEach((v) => {
      if (v && typeof v === 'object') {
        count += countNodes(v);
      }
    });
    return count;
  };

  const totalOriginalNodes = countNodes(astData);
  const totalOptimizedNodes = optimizedAstData ? countNodes(optimizedAstData) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* AST Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-sm"
            onClick={() => setViewMode('original')}
            style={{
              background: viewMode === 'original' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
              borderColor: viewMode === 'original' ? 'var(--accent-primary)' : 'var(--border-subtle)',
              color: viewMode === 'original' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Original AST ({totalOriginalNodes} nodes)
          </button>

          {optimizedAstData && (
            <button
              className="btn btn-sm"
              onClick={() => setViewMode('optimized')}
              style={{
                background: viewMode === 'optimized' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: viewMode === 'optimized' ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                color: viewMode === 'optimized' ? '#0f172a' : 'var(--text-muted)',
                fontWeight: viewMode === 'optimized' ? 700 : 400
              }}
            >
              Optimized AST ({totalOptimizedNodes} nodes)
            </button>
          )}
        </div>

        {totalOptimizedNodes && totalOptimizedNodes < totalOriginalNodes && (
          <span className="badge badge-emerald">
            Reduced by {totalOriginalNodes - totalOptimizedNodes} nodes ({Math.round(((totalOriginalNodes - totalOptimizedNodes) / totalOriginalNodes) * 100)}%)
          </span>
        )}
      </div>

      {/* Main Split: Tree on left, Inspector on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', minHeight: '400px' }}>
        {/* Left Tree Explorer */}
        <div className="glass-panel" style={{ padding: '14px', background: 'var(--code-bg)', overflowY: 'auto', maxHeight: '550px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            HIERARCHICAL SYNTAX TREE:
          </div>
          <TreeNode
            node={currentAst}
            onSelect={setSelectedNode}
            selectedNode={selectedNode}
            defaultExpanded={true}
          />
        </div>

        {/* Right Node Inspector */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(15, 21, 35, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <Info size={16} color="#818cf8" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Node Property Inspector
            </span>
          </div>

          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Type: </span>
                <span className="badge badge-indigo">{selectedNode.node_type || 'Object'}</span>
              </div>

              {selectedNode.name && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Identifier / Name: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>{selectedNode.name}</span>
                </div>
              )}

              {selectedNode.op && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Operator: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fb923c' }}>{selectedNode.op}</span>
                </div>
              )}

              {selectedNode.value !== undefined && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Evaluated Value: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#34d399' }}>{String(selectedNode.value)}</span>
                </div>
              )}

              {selectedNode.loc && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Source Location: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Line {selectedNode.loc.line}, Column {selectedNode.loc.column}
                  </span>
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                  Raw Subtree JSON:
                </span>
                <pre className="code-box" style={{ maxHeight: '250px', fontSize: '0.75rem' }}>
                  {JSON.stringify(selectedNode, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Click any node in the tree to inspect its attributes, location, and child expressions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
