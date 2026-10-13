import React, { useRef, useState } from 'react';
import { Copy, Check, Trash2, Settings2 } from 'lucide-react';

export default function CodeEditor({
  source,
  onChangeSource,
  onCompile,
  isCompiling,
  entryFunction,
  onChangeEntryFunction,
  exampleInputs,
  onChangeExampleInputs,
  diagnostics
}) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const lines = source.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Sync scroll between textarea and line numbers
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleCursorUpdate = (e) => {
    const val = e.target.value;
    const selStart = e.target.selectionStart;
    const linesUpToCursor = val.substring(0, selStart).split('\n');
    setCursorPos({
      line: linesUpToCursor.length,
      col: linesUpToCursor[linesUpToCursor.length - 1].length + 1
    });
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onCompile();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newSource = source.substring(0, start) + '  ' + source.substring(end);
      onChangeSource(newSource);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const errorLines = new Set(
    (diagnostics?.diagnostics || [])
      .filter((d) => d.severity === 'error' && d.line != null)
      .map((d) => d.line)
  );

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      background: 'var(--bg-secondary)',
      borderColor: 'var(--border-subtle)'
    }}>
      {/* Editor toolbar */}
      <div style={{
        padding: '9px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)'
          }}>
            Haskell Source Code
          </span>
          <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
            Editor
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleCopy}
            title="Copy Haskell source"
          >
            {copied ? <Check size={12} color="#3fb950" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onChangeSource('')}
            title="Clear editor"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Editor Canvas: Line numbers + Textarea */}
      <div style={{
        position: 'relative',
        flex: 1,
        minHeight: '260px',
        display: 'flex',
        background: 'var(--bg-code)'
      }}>
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          style={{
            width: '44px',
            padding: '12px 6px 12px 0',
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            lineHeight: '1.6',
            color: 'var(--text-dim)',
            userSelect: 'none',
            borderRight: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            overflowY: 'hidden'
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).map((num) => {
            const hasError = errorLines.has(num);
            return (
              <div
                key={num}
                style={{
                  color: hasError ? '#f85149' : undefined,
                  fontWeight: hasError ? 700 : 400,
                  backgroundColor: hasError ? 'rgba(248, 81, 73, 0.15)' : 'transparent',
                  paddingRight: '6px'
                }}
              >
                {num}
              </div>
            );
          })}
        </div>

        {/* Textarea */}
        <textarea
          id="haskell-code-input"
          ref={textareaRef}
          value={source}
          onChange={(e) => onChangeSource(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleCursorUpdate}
          onClick={handleCursorUpdate}
          onScroll={handleScroll}
          spellCheck={false}
          placeholder="-- Enter Haskell code here...&#10;fact :: Int -> Int&#10;fact n = if n == 0 then 1 else n * fact (n - 1)"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#e6edf3',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.83rem',
            lineHeight: '1.6',
            padding: '12px 14px',
            resize: 'none',
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflowX: 'auto',
            tabSize: 2
          }}
        />
      </div>

      {/* Editor Status Bar */}
      <div style={{
        padding: '5px 14px',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        fontSize: '0.73rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{lineCount} lines</span>
          <span>Haskell 98/2010</span>
        </div>
        <div>
          <span>Press <kbd style={{ background: '#30363d', padding: '1px 5px', borderRadius: '3px', color: '#e6edf3' }}>Ctrl+Enter</kbd> to compile</span>
        </div>
      </div>

      {/* Execution / Evaluation Settings footer */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '9px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Settings2 size={13} color="#58a6ff" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Execution & Evaluation Settings
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-dim)', marginBottom: '3px' }}>
              Entry Function
            </label>
            <input
              id="input-entry-func"
              type="text"
              value={entryFunction}
              onChange={(e) => onChangeEntryFunction(e.target.value)}
              placeholder="e.g. fact"
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '5px',
                padding: '5px 9px',
                color: '#f0f6fc',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-dim)', marginBottom: '3px' }}>
              Test Inputs (comma separated)
            </label>
            <input
              id="input-example-args"
              type="text"
              value={exampleInputs}
              onChange={(e) => onChangeExampleInputs(e.target.value)}
              placeholder="e.g. 5 or 2, 8, 1"
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '5px',
                padding: '5px 9px',
                color: '#f0f6fc',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
