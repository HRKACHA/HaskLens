"""Tests for the HaskOpt parser."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.compiler.parser import Parser
from app.compiler import ast_nodes as ast


def test_simple_function():
    """Test parsing a simple function definition."""
    parser = Parser()
    result = parser.parse("square x = x * x")
    assert result.success
    assert result.ast is not None
    assert len(result.ast.declarations) == 1
    func = result.ast.declarations[0]
    assert isinstance(func, ast.FunctionDef)
    assert func.name == "square"
    assert func.params == ["x"]


def test_binary_addition():
    """Test parsing addition."""
    parser = Parser()
    result = parser.parse("add x y = x + y")
    assert result.success
    func = result.ast.declarations[0]
    assert isinstance(func.body, ast.BinaryOp)
    assert func.body.op == "+"


def test_operator_precedence():
    """Test that * binds tighter than +."""
    parser = Parser()
    result = parser.parse("f x = x + 2 * 3")
    assert result.success
    func = result.ast.declarations[0]
    # Should be (x + (2 * 3))
    assert isinstance(func.body, ast.BinaryOp)
    assert func.body.op == "+"
    assert isinstance(func.body.right, ast.BinaryOp)
    assert func.body.right.op == "*"


def test_parentheses():
    """Test parsing parenthesized expressions."""
    parser = Parser()
    result = parser.parse("f x = (x + 2) * 3")
    assert result.success
    func = result.ast.declarations[0]
    assert isinstance(func.body, ast.BinaryOp)
    assert func.body.op == "*"
    assert isinstance(func.body.left, ast.BinaryOp)
    assert func.body.left.op == "+"


def test_if_expression():
    """Test parsing if-then-else."""
    parser = Parser()
    result = parser.parse("abs x = if x > 0 then x else 0")
    assert result.success
    func = result.ast.declarations[0]
    assert isinstance(func.body, ast.IfExpr)


def test_function_application():
    """Test parsing function application."""
    parser = Parser()
    result = parser.parse("f x = g x")
    assert result.success
    func = result.ast.declarations[0]
    assert isinstance(func.body, ast.FuncApp)


def test_type_signature():
    """Test parsing type signatures."""
    parser = Parser()
    result = parser.parse("square :: Int -> Int\nsquare x = x * x")
    assert result.success
    assert len(result.ast.declarations) == 2
    assert isinstance(result.ast.declarations[0], ast.TypeSignature)
    assert isinstance(result.ast.declarations[1], ast.FunctionDef)


def test_boolean_expression():
    """Test parsing boolean expressions."""
    parser = Parser()
    result = parser.parse("f x y = x > 0 && y < 10")
    assert result.success
    func = result.ast.declarations[0]
    assert isinstance(func.body, ast.BinaryOp)
    assert func.body.op == "&&"


def test_not_expression():
    """Test parsing not expressions."""
    parser = Parser()
    result = parser.parse("f x = not x")
    assert result.success
    func = result.ast.declarations[0]
    assert isinstance(func.body, ast.UnaryOp)
    assert func.body.op == "not"


def test_multiple_functions():
    """Test parsing multiple function definitions."""
    parser = Parser()
    source = """square x = x * x
add x y = x + y"""
    result = parser.parse(source)
    assert result.success
    assert len(result.ast.declarations) == 2


def test_recursive_function():
    """Test parsing a recursive function."""
    parser = Parser()
    source = """factorial n = if n == 0 then 1 else n * factorial (n - 1)"""
    result = parser.parse(source)
    assert result.success
    func = result.ast.declarations[0]
    assert func.name == "factorial"


def test_syntax_error():
    """Test that syntax errors are reported."""
    parser = Parser()
    result = parser.parse("f x = +")
    assert not result.success
    assert len(result.errors) > 0


def test_parse_error_has_location():
    """Test that parse errors have line and column info."""
    parser = Parser()
    result = parser.parse("f x = )")
    assert not result.success
    assert result.errors[0].line >= 1


def test_constant_definition():
    """Test parsing a constant (no arguments)."""
    parser = Parser()
    result = parser.parse("answer = 42")
    assert result.success
    func = result.ast.declarations[0]
    assert isinstance(func, ast.FunctionDef)
    assert func.name == "answer"
    assert func.params == []
    assert isinstance(func.body, ast.IntLiteral)
    assert func.body.value == 42


def test_nested_parens():
    """Test parsing nested parentheses."""
    parser = Parser()
    result = parser.parse("f x = ((x + 1) * (x - 1))")
    assert result.success


def test_ast_serialization():
    """Test that AST can be serialized to dict."""
    parser = Parser()
    result = parser.parse("f x = x + 1")
    assert result.success
    d = result.ast.to_dict()
    assert d["node_type"] == "Program"
    assert len(d["declarations"]) == 1
