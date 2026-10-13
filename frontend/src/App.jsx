import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import PresetSelector from './components/PresetSelector';
import OnboardingGuide from './components/OnboardingGuide';
import CodeEditor from './components/CodeEditor';
import TokenStreamView from './components/Tabs/TokenStreamView';
import AstVisualizerView from './components/Tabs/AstVisualizerView';
import SemanticAnalysisView from './components/Tabs/SemanticAnalysisView';
import OptimizerDiffView from './components/Tabs/OptimizerDiffView';
import RecursionCallGraphView from './components/Tabs/RecursionCallGraphView';
import VerificationView from './components/Tabs/VerificationView';
import MetricsView from './components/Tabs/MetricsView';
import { PRESETS } from './data/presets';
import { 
  FileCode, 
  GitBranch, 
  ShieldCheck, 
  Sparkles, 
  Network, 
  CheckCheck, 
  Activity,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'compiler'
  const defaultPreset = PRESETS[0];
  const [source, setSource] = useState(defaultPreset.code);
  const [entryFunction, setEntryFunction] = useState(defaultPreset.entryFunction);
  const [exampleInputs, setExampleInputs] = useState(defaultPreset.defaultArgs);
  const [activePresetId, setActivePresetId] = useState(defaultPreset.id);

  const [activeTab, setActiveTab] = useState('optimizer');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showGuide, setShowGuide] = useState(true);

  // Helper to parse comma separated arguments to primitives
  const parseArgs = (raw) => {
    if (!raw || !raw.trim()) return [];
    return raw.split(',').map((s) => {
      const trimmed = s.trim();
      if (trimmed === 'True') return true;
      if (trimmed === 'False') return false;
      if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
      if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
      return trimmed;
    });
  };

  // Compile function
  const runCompilation = async (codeToCompile, funcName, argsStr) => {
    setIsCompiling(true);
    setApiError(null);

    const args = parseArgs(argsStr !== undefined ? argsStr : exampleInputs);
    const targetFunc = funcName !== undefined ? funcName : entryFunction;

    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: codeToCompile !== undefined ? codeToCompile : source,
          entry_function: targetFunc || null,
          example_inputs: args.length > 0 ? args : null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setCompileResult(data);
    } catch (err) {
      console.error('Compilation error:', err);
      setApiError(err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  // Compile on initial mount
  useEffect(() => {
    runCompilation(defaultPreset.code, defaultPreset.entryFunction, defaultPreset.defaultArgs);
  }, []);

  // Handle Preset selection
  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setSource(preset.code);
    setEntryFunction(preset.entryFunction);
    setExampleInputs(preset.defaultArgs);
    runCompilation(preset.code, preset.entryFunction, preset.defaultArgs);
  };

  // Reset to default
  const handleResetCode = () => {
    handleSelectPreset(defaultPreset);
  };

  // Export AST as JSON
  const handleExportJson = () => {
    if (!compileResult?.ast) return;
    const blob = new Blob([JSON.stringify(compileResult.ast, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hasklens_ast.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Optimized Haskell
  const handleExportHaskell = () => {
    const code = compileResult?.optimized_source || source;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hasklens_optimized.hs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'optimizer', label: 'Optimizer & Diff', icon: Sparkles, badge: compileResult?.optimization_count != null ? `${compileResult.optimization_count} rewrites` : null, color: '#58a6ff' },
    { id: 'ast', label: 'AST Visualizer', icon: GitBranch, badge: compileResult?.ast ? 'Tree' : null, color: '#8b949e' },
    { id: 'tokens', label: 'Lexical Tokens', icon: FileCode, badge: compileResult?.tokens?.token_count ? `${compileResult.tokens.token_count}` : null, color: '#bc8cff' },
    { id: 'types', label: 'Types & Semantics', icon: ShieldCheck, badge: compileResult?.type_analysis ? 'Inferred' : null, color: '#3fb950' },
    { id: 'recursion', label: 'Call Graph & Cycles', icon: Network, badge: compileResult?.recursion_analysis?.has_recursion ? 'Recursive' : null, color: '#d29922' },
    { id: 'verification', label: 'Bounded Evaluation', icon: CheckCheck, badge: compileResult?.evaluation?.success ? 'Computed' : null, color: '#58a6ff' },
    { id: 'metrics', label: 'Compiler Metrics', icon: Activity, badge: compileResult?.phase_timings ? 'Timings' : null, color: '#8b949e' },
  ];

  const totalTime = compileResult?.phase_timings
    ? Object.values(compileResult.phase_timings).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0).toFixed(1)
    : null;

  // Handler to switch from landing to compiler
  const handleEnterApp = () => {
    setCurrentView('compiler');
    // Trigger initial compilation when entering the app
    runCompilation(defaultPreset.code, defaultPreset.entryFunction, defaultPreset.defaultArgs);
  };

  // Show landing page
  if (currentView === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <Header
        onCompile={() => runCompilation()}
        isCompiling={isCompiling}
        hasResult={!!compileResult}
        compileSuccess={compileResult?.success}
        onExportJson={handleExportJson}
        onExportHaskell={handleExportHaskell}
        onResetCode={handleResetCode}
        totalOptimizations={compileResult?.optimization_count}
        executionTime={totalTime}
        onToggleGuide={() => setShowGuide(!showGuide)}
        showGuide={showGuide}
        onGoHome={() => setCurrentView('landing')}
      />

      {/* Preset Examples Chips */}
      <PresetSelector
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
      />

      {/* First-timer Onboarding & Explainer Banner */}
      {showGuide && (
        <OnboardingGuide onClose={() => setShowGuide(false)} />
      )}

      {/* API Error Banner if offline */}
      {apiError && (
        <div style={{
          margin: '12px 20px 0 20px',
          padding: '12px 16px',
          background: 'rgba(248, 81, 73, 0.12)',
          border: '1px solid rgba(248, 81, 73, 0.3)',
          borderRadius: '6px',
          color: '#f85149',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.83rem'
        }}>
          <AlertCircle size={16} />
          <span>API Connection Error: {apiError}. Ensure backend server is running on port 8000.</span>
        </div>
      )}

      {/* Main Split Grid */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '440px 1fr',
        gap: '16px',
        padding: '12px 20px 20px 20px',
        minHeight: 0
      }}>
        {/* Left: Code Editor and inputs */}
        <section style={{ height: showGuide ? 'calc(100vh - 310px)' : 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
          <CodeEditor
            source={source}
            onChangeSource={(val) => {
              setSource(val);
              setActivePresetId(null);
            }}
            onCompile={() => runCompilation()}
            isCompiling={isCompiling}
            entryFunction={entryFunction}
            onChangeEntryFunction={setEntryFunction}
            exampleInputs={exampleInputs}
            onChangeExampleInputs={setExampleInputs}
            diagnostics={compileResult?.diagnostics}
          />
        </section>

        {/* Right: Visual Compiler Phase Tabs */}
        <section className="glass-panel" style={{
          height: showGuide ? 'calc(100vh - 310px)' : 'calc(100vh - 160px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-subtle)'
        }}>
          {/* Tabs Navigation Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '6px 10px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            overflowX: 'auto',
            flexShrink: 0
          }}>
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                    border: isActive ? '1px solid #30363d' : '1px solid transparent',
                    color: isActive ? '#f0f6fc' : '#8b949e',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.12s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#e6edf3';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#8b949e';
                  }}
                >
                  <Icon size={14} color={isActive ? t.color : 'currentColor'} />
                  <span>{t.label}</span>
                  {t.badge && (
                    <span style={{
                      fontSize: '0.62rem',
                      background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      color: isActive ? t.color : 'var(--text-dim)',
                      fontWeight: 600
                    }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px',
            background: 'var(--bg-secondary)'
          }}>
            {activeTab === 'optimizer' && (
              <OptimizerDiffView
                originalSource={source}
                optimizedSource={compileResult?.optimized_source}
                optimizationLog={compileResult?.optimization_log}
                optimizationCount={compileResult?.optimization_count}
              />
            )}

            {activeTab === 'ast' && (
              <AstVisualizerView
                astData={compileResult?.ast}
                optimizedAstData={compileResult?.optimized_ast}
              />
            )}

            {activeTab === 'tokens' && (
              <TokenStreamView
                tokensData={compileResult?.tokens}
              />
            )}

            {activeTab === 'types' && (
              <SemanticAnalysisView
                typeAnalysis={compileResult?.type_analysis}
                semanticAnalysis={compileResult?.semantic_analysis}
                diagnostics={compileResult?.diagnostics}
              />
            )}

            {activeTab === 'recursion' && (
              <RecursionCallGraphView
                recursionData={compileResult?.recursion_analysis}
                callGraphData={compileResult?.call_graph}
              />
            )}

            {activeTab === 'verification' && (
              <VerificationView
                evaluationData={compileResult?.evaluation}
                verificationData={compileResult?.verification}
                entryFunction={entryFunction}
                exampleInputs={exampleInputs}
              />
            )}

            {activeTab === 'metrics' && (
              <MetricsView
                timings={compileResult?.phase_timings}
                diagnostics={compileResult?.diagnostics}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
