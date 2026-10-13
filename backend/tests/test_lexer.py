"""Tests for the HaskOpt lexer."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.compiler.lexer import Lexer


def test_simple_tokens():
    """Test tokenizing a simple function definition."""
    lexer = Lexer()
    result = lexer.tokenize("square x = x * x")
    assert result.success
    assert len(result.tokens) > 0
    # Should have: square, x, =, x, *, x
    names = [t.value for t in result.tokens]
    assert "square" in names
    assert "x" in names
    assert "=" in names
    assert "*" in names


def test_integer_literals():
    """Test tokenizing integer literals."""
    lexer = Lexer()
    result = lexer.tokenize("f x = 42")
    assert result.success
    values = [t.value for t in result.tokens]
    assert "42" in values


def test_boolean_literals():
    """Test tokenizing boolean literals."""
    lexer = Lexer()
    result = lexer.tokenize("f = True")
    assert result.success
    values = [t.value for t in result.tokens]
    assert "True" in values


def test_operators():
    """Test tokenizing various operators."""
    lexer = Lexer()
    result = lexer.tokenize("f x y = x + y - z * w / v")
    assert result.success
    values = [t.value for t in result.tokens]
    assert "+" in values
    assert "-" in values
    assert "*" in values
    assert "/" in values


def test_comparison_operators():
    """Test tokenizing comparison operators."""
    lexer = Lexer()
    result = lexer.tokenize("f x = x == 0")
    assert result.success


def test_type_signature():
    """Test tokenizing type signatures."""
    lexer = Lexer()
    result = lexer.tokenize("square :: Int -> Int")
    assert result.success


def test_if_expression():
    """Test tokenizing if-then-else."""
    lexer = Lexer()
    result = lexer.tokenize("f x = if x > 0 then x else 0")
    assert result.success


def test_comments():
    """Test that comments are ignored."""
    lexer = Lexer()
    result = lexer.tokenize("-- this is a comment\nf x = x")
    assert result.success
    # Comment should not appear in tokens
    values = [t.value for t in result.tokens]
    assert "-- this is a comment" not in values


def test_line_numbers():
    """Test that tokens have line number information."""
    lexer = Lexer()
    result = lexer.tokenize("f x = x\ng y = y")
    assert result.success
    assert len(result.tokens) > 0
    # Check that line info exists
    for tok in result.tokens:
        assert tok.line >= 1


def test_invalid_character():
    """Test handling of invalid characters."""
    lexer = Lexer()
    result = lexer.tokenize("f x = x @ y")
    # Should produce an error
    assert not result.success or len(result.errors) > 0


def test_empty_input():
    """Test tokenizing empty input."""
    lexer = Lexer()
    result = lexer.tokenize("")
    assert result.success
    assert len(result.tokens) == 0


def test_token_dict():
    """Test token serialization."""
    lexer = Lexer()
    result = lexer.tokenize("x = 5")
    assert result.success
    d = result.to_dict()
    assert "tokens" in d
    assert "errors" in d
    assert "success" in d
