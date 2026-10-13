"""Tests for the HaskOpt optimizer."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.compiler.parser import Parser
from app.compiler.optimizer import Optimizer
from app.compiler.pretty_printer import PrettyPrinter
from app.compiler.evaluator import Evaluator
from app.compiler import ast_nodes as ast

parser = Parser()
optimizer = Optimizer()
printer = PrettyPrinter()
evaluator = Evaluator()


def optimize(source):
    result = parser.parse(source)
    assert result.success, f"Parse failed: {result.errors}"
    return optimizer.optimize(result.ast), result.ast


def test_constant_folding():
    """Test folding of constant arithmetic."""
    opt_result, _ = optimize("calculate = 10 + 20 * 2")
    assert opt_result.total_optimizations > 0
    source = printer.print_program(opt_result.optimized_ast)
    assert "50" in source


def test_identity_add_zero():
    """Test x + 0 = x simplification."""
    opt_result, _ = optimize("addZero x = x + 0")
    assert opt_result.total_optimizations > 0
    source = printer.print_program(opt_result.optimized_ast)
    # Should simplify to just x
    assert "addZero x = x" == source.strip()


def test_identity_mul_one():
    """Test x * 1 = x simplification."""
    opt_result, _ = optimize("mulOne x = x * 1")
    assert opt_result.total_optimizations > 0
    source = printer.print_program(opt_result.optimized_ast)
    assert "mulOne x = x" == source.strip()


def test_identity_sub_zero():
    """Test x - 0 = x simplification."""
    opt_result, _ = optimize("subZero x = x - 0")
    assert opt_result.total_optimizations > 0
    source = printer.print_program(opt_result.optimized_ast)
    assert "subZero x = x" == source.strip()


def test_dead_branch_true():
    """Test dead branch elimination with True condition."""
    opt_result, _ = optimize("f x = if True then x else 0")
    assert opt_result.total_optimizations > 0
    source = printer.print_program(opt_result.optimized_ast)
    # Should simplify to just x
    assert "f x = x" == source.strip()


def test_dead_branch_false():
    """Test dead branch elimination with False condition."""
    opt_result, _ = optimize("f x = if False then 0 else x")
    assert opt_result.total_optimizations > 0
    source = printer.print_program(opt_result.optimized_ast)
    assert "f x = x" == source.strip()


def test_boolean_simplification():
    """Test True && x = x."""
    opt_result, _ = optimize("f x = True && x")
    assert opt_result.total_optimizations > 0
    source = printer.print_program(opt_result.optimized_ast)
    assert "f x = x" == source.strip()


def test_no_unsafe_mul_zero():
    """Test that x * 0 is NOT simplified (unsafe in Haskell)."""
    opt_result, _ = optimize("f x = x * 0")
    source = printer.print_program(opt_result.optimized_ast)
    # Should NOT be simplified to 0
    assert "0" in source and "*" in source


def test_division_by_zero_not_folded():
    """Test that division by zero is not folded."""
    opt_result, _ = optimize("f = 10 / 0")
    # Should not crash and should not fold
    source = printer.print_program(opt_result.optimized_ast)
    assert "/" in source


def test_constant_comparison():
    """Test constant comparison folding."""
    opt_result, _ = optimize("f = 5 > 3")
    assert opt_result.total_optimizations > 0
    source = printer.print_program(opt_result.optimized_ast)
    assert "True" in source


def test_optimization_log():
    """Test that optimization log is populated."""
    opt_result, _ = optimize("f x = x + 0")
    assert len(opt_result.log) > 0
    entry = opt_result.log[0]
    d = entry.to_dict()
    assert "rule" in d
    assert "original_expr" in d
    assert "optimized_expr" in d
    assert "explanation" in d


def test_no_optimization_needed():
    """Test code that needs no optimization."""
    opt_result, _ = optimize("f x = x + 1")
    assert opt_result.total_optimizations == 0


def test_semantic_preservation_constant_fold():
    """Test that constant folding preserves semantics."""
    orig_result = parser.parse("calculate = 10 + 20 * 2")
    assert orig_result.success
    opt_result = optimizer.optimize(orig_result.ast)

    # Evaluate both
    orig_eval = evaluator.evaluate_function(orig_result.ast, "calculate", [])
    opt_eval = evaluator.evaluate_function(opt_result.optimized_ast, "calculate", [])
    assert orig_eval.success and opt_eval.success
    assert orig_eval.value == opt_eval.value == 50


def test_semantic_preservation_identity():
    """Test that identity simplification preserves semantics."""
    source = "addZero x = x + 0"
    orig_result = parser.parse(source)
    assert orig_result.success
    opt_result = optimizer.optimize(orig_result.ast)

    for val in [0, 1, -5, 100]:
        orig_eval = evaluator.evaluate_function(orig_result.ast, "addZero", [val])
        opt_eval = evaluator.evaluate_function(opt_result.optimized_ast, "addZero", [val])
        assert orig_eval.success and opt_eval.success
        assert orig_eval.value == opt_eval.value
