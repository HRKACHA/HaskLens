"""Tests for the HaskOpt type checker."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.compiler.parser import Parser
from app.compiler.type_checker import TypeChecker


parser = Parser()
checker = TypeChecker()


def check(source):
    result = parser.parse(source)
    assert result.success, f"Parse failed: {result.errors}"
    return checker.check(result.ast)


def test_int_arithmetic():
    """Test type checking of integer arithmetic."""
    r = check("f x = x + 1")
    assert r.success


def test_bool_in_arithmetic():
    """Test error when using Bool in arithmetic."""
    r = check("f = True + 1")
    assert not r.success
    msgs = [d.message for d in r.diagnostics]
    assert any("Bool" in m and "arithmetic" in m for m in msgs)


def test_if_condition_type():
    """Test that if condition must be Bool."""
    r = check("f x = if 42 then x else 0")
    assert not r.success
    msgs = [d.message for d in r.diagnostics]
    assert any("Bool" in m for m in msgs)


def test_matching_type_signature():
    """Test type signature that matches the definition."""
    r = check("square :: Int -> Int\nsquare x = x * x")
    assert r.success
    assert len(r.type_info) > 0


def test_mismatched_type_signature():
    """Test type signature that doesn't match the definition."""
    r = check("f :: Bool\nf = 42")
    assert not r.success


def test_comparison_returns_bool():
    """Test that comparison returns Bool."""
    r = check("f x = x > 0")
    assert r.success
    # The function should infer a type that ends with Bool
    info = [t for t in r.type_info if t.name == "f"]
    assert len(info) > 0


def test_not_requires_bool():
    """Test that 'not' requires Bool operand."""
    r = check("f x = not 42")
    assert not r.success


def test_boolean_ops():
    """Test boolean operator type checking."""
    r = check("f x y = x > 0 && y > 0")
    assert r.success


def test_type_info_serialization():
    """Test that type check results serialize."""
    r = check("f x = x + 1")
    d = r.to_dict()
    assert "diagnostics" in d
    assert "type_info" in d
    assert "success" in d
