import React, { useState, useRef, useEffect } from 'react';
import { PRESETS } from '../data/presets';
import { Terminal, ChevronDown, Check, Sparkles } from 'lucide-react';

export default function PresetSelector({ activePresetId, onSelectPreset }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activePreset = PRESETS.find((p) => p.id === activePresetId) || PRESETS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSelect = (preset) => {
    onSelectPreset(preset);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 100,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-dim)',
        fontSize: '0.74rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap'
      }}>
        <Terminal size={13} color="#58a6ff" />
        Sample Program:
      </div>

      {/* Dropdown Button */}
      <div style={{ position: 'relative' }}>
        <button
          id="btn-preset-dropdown"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'var(--bg-secondary)',
            border: isOpen ? '1px solid #58a6ff' : '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '4px 10px 4px 12px',
            color: '#f0f6fc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            transition: 'all 0.15s ease',
            boxShadow: isOpen ? '0 0 0 2px rgba(88, 166, 255, 0.15)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (!isOpen) e.currentTarget.style.borderColor = '#8b949e';
          }}
          onMouseLeave={(e) => {
            if (!isOpen) e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <span style={{ fontWeight: 600, color: '#f0f6fc' }}>{activePreset.title}</span>
          <span className={`badge badge-${activePreset.tagColor || 'blue'}`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
            {activePreset.tag}
          </span>
          <ChevronDown
            size={13}
            color="var(--text-dim)"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </button>

        {/* Dropdown Menu Popover */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '320px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
              padding: '6px',
              maxHeight: '380px',
              overflowY: 'auto',
              zIndex: 1000,
              animation: 'fadeIn 0.12s ease-out'
            }}
          >
            <div style={{ padding: '4px 8px 6px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Haskell Code Example ({PRESETS.length})
            </div>

            {PRESETS.map((p) => {
              const isSelected = p.id === activePresetId;
              return (
                <div
                  key={p.id}
                  id={`dropdown-preset-${p.id}`}
                  onClick={() => handleSelect(p)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    border: isSelected ? '1px solid #30363d' : '1px solid transparent',
                    transition: 'background 0.1s ease',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? '#58a6ff' : '#e6edf3' }}>
                        {p.title}
                      </span>
                      <span className={`badge badge-${p.tagColor || 'blue'}`} style={{ fontSize: '0.6rem', padding: '0 5px' }}>
                        {p.tag}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.35 }}>
                      {p.subtitle || p.description}
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={14} color="#58a6ff" style={{ marginTop: '2px', flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preset summary snippet next to dropdown */}
      <div style={{
        fontSize: '0.74rem',
        color: 'var(--text-dim)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1
      }}>
        {activePreset.description}
      </div>
    </div>
  );
}
