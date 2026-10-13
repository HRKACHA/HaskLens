"""Tests for the HaskOpt bounded AST evaluator."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.compiler.parser import Parser
from app.compiler.optimizer import Optimizer
from app.compiler.evaluator import Evaluator

parser = Parser()
evaluator = Evaluator()
optimizer = Optimizer()


def test_eval_simple_addition():
    res = parser.parse("add x y = x + y")
    val = evaluator.evaluate_function(res.ast, "add", [3, 4])
    assert val.success
    assert val.value == 7


def test_eval_factorial_recursion():
    code = "fact n = if n == 0 then 1 else n * fact (n - 1)"
    res = parser.parse(code)
    val = evaluator.evaluate_function(res.ast, "fact", [5])
    assert val.success
    assert val.value == 120


def test_eval_boolean_logic():
    code = "check x = if x > 10 && x < 20 then True else False"
    res = parser.parse(code)
    assert evaluator.evaluate_function(res.ast, "check", [15]).value is True
    assert evaluator.evaluate_function(res.ast, "check", [5]).value is False


def test_eval_division_by_zero():
    code = "divZero x = x / 0"
    res = parser.parse(code)
    val = evaluator.evaluate_function(res.ast, "divZero", [10])
    assert not val.success
    assert "Division by zero" in val.error


def test_verify_optimization():
    code = "f x = x * 1 + 0"
    orig = parser.parse(code).ast
    opt = optimizer.optimize(orig).optimized_ast
    v = evaluator.verify_optimization(orig, opt, "f", [[0], [1], [5], [-3]])
    assert v.all_match
    assert v.could_verify
    assert len(v.results) == 4
