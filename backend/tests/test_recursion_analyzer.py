"""Tests for recursion analyzer and call graph."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.compiler.parser import Parser
from app.compiler.recursion_analyzer import RecursionAnalyzer
from app.compiler.call_graph import CallGraphBuilder

parser = Parser()
rec_analyzer = RecursionAnalyzer()
cg_builder = CallGraphBuilder()


def test_direct_recursion():
    code = "fact n = if n == 0 then 1 else n * fact (n - 1)"
    prog = parser.parse(code).ast
    res = rec_analyzer.analyze(prog)
    assert res.has_recursion
    assert len(res.functions) == 1
    info = res.functions[0]
    assert info.function_name == "fact"
    assert info.is_recursive
    assert len(info.base_cases) > 0


def test_mutual_recursion():
    code = """
isEven n = if n == 0 then True else isOdd (n - 1)
isOdd n = if n == 0 then False else isEven (n - 1)
"""
    prog = parser.parse(code).ast
    res = rec_analyzer.analyze(prog)
    assert res.has_recursion
    assert len(res.mutual_recursion_groups) == 1
    assert set(res.mutual_recursion_groups[0].functions) == {"isEven", "isOdd"}


def test_call_graph_structure():
    code = """
f x = g x + h x
g x = x + 1
h x = g x * 2
"""
    prog = parser.parse(code).ast
    cg = cg_builder.build(prog)
    node_names = {n.name for n in cg.nodes}
    assert node_names == {"f", "g", "h"}
    edges = {(e.caller, e.callee) for e in cg.edges}
    assert ("f", "g") in edges
    assert ("f", "h") in edges
    assert ("h", "g") in edges
