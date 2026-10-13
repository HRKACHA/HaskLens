"""Tests for the HaskOpt semantic analyzer."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.compiler.parser import Parser
from app.compiler.semantic_analyzer import SemanticAnalyzer

parser = Parser()
analyzer = SemanticAnalyzer()


def analyze(source):
    result = parser.parse(source)
    assert result.success, f"Parse failed: {result.errors}"
    return analyzer.analyze(result.ast)


def test_defined_functions():
    """Test that defined functions are collected."""
    r = analyze("f x = x + 1\ng y = y * 2")
    assert "f" in r.defined_functions
    assert "g" in r.defined_functions


def test_undefined_identifier():
    """Test detection of undefined identifiers."""
    r = analyze("f x = x + y")
    assert not r.success
    msgs = [d.message for d in r.diagnostics if d.severity == "error"]
    assert any("y" in m for m in msgs)


def test_recursive_not_undefined():
    """Test that recursive self-references are not reported as undefined."""
    r = analyze("factorial n = if n == 0 then 1 else n * factorial (n - 1)")
    errors = [d for d in r.diagnostics if d.severity == "error"]
    # factorial should NOT be reported as undefined
    assert not any("factorial" in d.message and "Undefined" in d.message for d in errors)


def test_unused_parameter():
    """Test detection of unused parameters."""
    r = analyze("f x y = x + 1")
    warnings = [d for d in r.diagnostics if d.severity == "warning"]
    assert any("y" in d.message and "never used" in d.message for d in warnings)


def test_constant_condition_warning():
    """Test warning for constant conditions."""
    r = analyze("f x = if True then x else 0")
    warnings = [d for d in r.diagnostics if d.severity == "warning"]
    assert any("always" in d.message for d in warnings)


def test_function_arities():
    """Test function arity tracking."""
    r = analyze("f x y = x + y")
    assert r.function_arities.get("f") == 2


def test_type_sig_without_def():
    """Test warning for type sig without definition."""
    r = analyze("f :: Int -> Int")
    warnings = [d for d in r.diagnostics if d.severity == "warning"]
    assert any("no corresponding" in d.message for d in warnings)


def test_no_errors_for_valid_code():
    """Test that valid code produces no errors."""
    r = analyze("square x = x * x")
    errors = [d for d in r.diagnostics if d.severity == "error"]
    assert len(errors) == 0
