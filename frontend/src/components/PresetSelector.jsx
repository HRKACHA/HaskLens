import React from 'react';
import { PRESETS } from '../data/presets';
import { Terminal } from 'lucide-react';

export default function PresetSelector({ activePresetId, onSelectPreset }) {
  return (
    <div style={{
      margin: '10px 20px 0 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '2px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-muted)',
        fontSize: '0.76rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginRight: '4px',
        whiteSpace: 'nowrap'
      }}>
        <Terminal size={13} color="#58a6ff" />
        Sample Programs:
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
        {PRESETS.map((p) => {
          const isActive = activePresetId === p.id;
          return (
            <button
              key={p.id}
              id={`btn-preset-${p.id}`}
              onClick={() => onSelectPreset(p)}
              style={{
                background: isActive ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
                border: isActive ? '1px solid #58a6ff' : '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '5px 11px',
                color: isActive ? '#f0f6fc' : '#8b949e',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.12s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#8b949e';
                  e.currentTarget.style.color = '#e6edf3';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = '#8b949e';
                }
              }}
            >
              <span>{p.title}</span>
              <span className={`badge badge-${p.tagColor}`} style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                {p.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
