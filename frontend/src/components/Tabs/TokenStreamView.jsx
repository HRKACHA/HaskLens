import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function TokenStreamView({ tokensData }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!tokensData || !tokensData.tokens) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No token data available. Compile a program to view lexical stream.
      </div>
    );
  }

  const { tokens, token_count } = tokensData;

  const categories = {
    KEYWORDS: ['KW_IF', 'KW_THEN', 'KW_ELSE', 'KW_LET', 'KW_IN', 'KW_TYPE'],
    IDENTIFIERS: ['IDENT'],
    OPERATORS: ['OP_PLUS', 'OP_MINUS', 'OP_STAR', 'OP_SLASH', 'OP_EQ', 'OP_NEQ', 'OP_LT', 'OP_LTE', 'OP_GT', 'OP_GTE', 'OP_AND', 'OP_OR', 'OP_NOT', 'OP_ASSIGN', 'OP_DCOLON', 'OP_ARROW'],
    LITERALS: ['LIT_INT', 'LIT_FLOAT', 'LIT_BOOL', 'LIT_STRING'],
  };

  const filteredTokens = tokens.filter((t) => {
    let matchesCat = true;
    if (filterType === 'KEYWORDS') matchesCat = categories.KEYWORDS.includes(t.type);
    else if (filterType === 'IDENTIFIERS') matchesCat = categories.IDENTIFIERS.includes(t.type);
    else if (filterType === 'OPERATORS') matchesCat = categories.OPERATORS.includes(t.type);
    else if (filterType === 'LITERALS') matchesCat = categories.LITERALS.includes(t.type);

    let matchesQuery = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesQuery = t.type.toLowerCase().includes(q) || String(t.value).toLowerCase().includes(q);
    }

    return matchesCat && matchesQuery;
  });

  const getBadgeStyle = (type) => {
    if (categories.KEYWORDS.includes(type)) return { bg: 'rgba(188, 140, 255, 0.1)', text: '#bc8cff', border: 'rgba(188, 140, 255, 0.25)' };
    if (categories.IDENTIFIERS.includes(type)) return { bg: 'rgba(88, 166, 255, 0.1)', text: '#58a6ff', border: 'rgba(88, 166, 255, 0.25)' };
    if (categories.OPERATORS.includes(type)) return { bg: 'rgba(210, 153, 34, 0.1)', text: '#d29922', border: 'rgba(210, 153, 34, 0.25)' };
    if (categories.LITERALS.includes(type)) return { bg: 'rgba(63, 185, 80, 0.1)', text: '#3fb950', border: 'rgba(63, 185, 80, 0.25)' };
    return { bg: 'rgba(110, 118, 129, 0.1)', text: '#8b949e', border: 'rgba(110, 118, 129, 0.25)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        <div className="glass-panel" style={{ padding: '10px 14px', background: 'var(--bg-tertiary)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Tokens</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{token_count}</div>
        </div>
        <div className="glass-panel" style={{ padding: '10px 14px', background: 'var(--bg-tertiary)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Keywords</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#bc8cff', marginTop: '2px' }}>
            {tokens.filter(t => categories.KEYWORDS.includes(t.type)).length}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '10px 14px', background: 'var(--bg-tertiary)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Identifiers</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#58a6ff', marginTop: '2px' }}>
            {tokens.filter(t => categories.IDENTIFIERS.includes(t.type)).length}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '10px 14px', background: 'var(--bg-tertiary)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Operators</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d29922', marginTop: '2px' }}>
            {tokens.filter(t => categories.OPERATORS.includes(t.type)).length}
          </div>
        </div>
      </div>

      {/* Lexical Controls / Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['ALL', 'KEYWORDS', 'IDENTIFIERS', 'OPERATORS', 'LITERALS'].map(cat => (
            <button
              key={cat}
              className="btn btn-sm"
              onClick={() => setFilterType(cat)}
              style={{
                background: filterType === cat ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                borderColor: filterType === cat ? 'var(--accent-primary)' : 'var(--border-subtle)',
                color: filterType === cat ? '#fff' : 'var(--text-muted)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '200px' }}>
          <Search size={13} style={{ position: 'absolute', left: '9px', top: '9px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '5px',
              padding: '5px 9px 5px 28px',
              color: '#f0f6fc',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Visual Token Stream */}
      <div className="glass-panel" style={{ padding: '12px', background: 'var(--bg-code)' }}>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
          TOKEN STREAM ({filteredTokens.length} tokens):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '170px', overflowY: 'auto' }}>
          {filteredTokens.map((t, idx) => {
            const style = getBadgeStyle(t.type);
            return (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  color: style.text,
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem'
                }}
                title={`${t.type} @ Ln ${t.line}, Col ${t.column}`}
              >
                <span style={{ fontWeight: 600 }}>{t.value}</span>
                <span style={{ fontSize: '0.62rem', opacity: 0.7 }}>{t.type}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Token Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '7px 12px' }}>#</th>
              <th style={{ padding: '7px 12px' }}>Token Type</th>
              <th style={{ padding: '7px 12px' }}>Value</th>
              <th style={{ padding: '7px 12px' }}>Position</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.slice(0, 80).map((t, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                }}
              >
                <td style={{ padding: '5px 12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{i + 1}</td>
                <td style={{ padding: '5px 12px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: getBadgeStyle(t.type).text }}>{t.type}</span>
                </td>
                <td style={{ padding: '5px 12px', fontFamily: 'var(--font-mono)', color: '#f0f6fc', fontWeight: 600 }}>
                  {JSON.stringify(t.value)}
                </td>
                <td style={{ padding: '5px 12px', color: 'var(--text-muted)' }}>
                  Line {t.line}, Col {t.column}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
