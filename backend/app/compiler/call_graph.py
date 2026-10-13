"""Call graph builder for HaskOpt compiler.

Produces a serializable call graph structure for frontend visualization.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from . import ast_nodes as ast


@dataclass
class CallGraphNode:
    """A node in the call graph (a function)."""
    name: str
    is_recursive: bool = False
    param_count: int = 0

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "is_recursive": self.is_recursive,
            "param_count": self.param_count,
        }


@dataclass
class CallGraphEdge:
    """An edge in the call graph (a function call)."""
    caller: str
    callee: str
    is_self_call: bool = False

    def to_dict(self) -> dict:
        return {
            "caller": self.caller,
            "callee": self.callee,
            "is_self_call": self.is_self_call,
        }


@dataclass
class CallGraph:
    """The complete function call graph."""
    nodes: list[CallGraphNode] = field(default_factory=list)
    edges: list[CallGraphEdge] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "nodes": [n.to_dict() for n in self.nodes],
            "edges": [e.to_dict() for e in self.edges],
        }


class CallGraphBuilder:
    """Builds a call graph from a program AST."""

    def build(self, program: ast.Program) -> CallGraph:
        """Build the call graph for a program."""
        functions: dict[str, ast.FunctionDef] = {}
        for decl in program.declarations:
            if isinstance(decl, ast.FunctionDef):
                functions[decl.name] = decl

        func_names = set(functions.keys())
        nodes = []
        edges = []
        seen_edges = set()

        for name, func in functions.items():
            calls = set()
            if func.body:
                self._collect_calls(func.body, func_names, calls)

            is_recursive = name in calls
            nodes.append(CallGraphNode(
                name=name,
                is_recursive=is_recursive,
                param_count=len(func.params),
            ))

            for callee in sorted(calls):
                edge_key = (name, callee)
                if edge_key not in seen_edges:
                    seen_edges.add(edge_key)
                    edges.append(CallGraphEdge(
                        caller=name,
                        callee=callee,
                        is_self_call=(name == callee),
                    ))

        return CallGraph(nodes=nodes, edges=edges)

    def _collect_calls(self, expr: ast.Expr, known: set[str], calls: set[str]):
        """Collect function calls in an expression."""
        if isinstance(expr, ast.Identifier):
            if expr.name in known:
                calls.add(expr.name)
        elif isinstance(expr, ast.BinaryOp):
            self._collect_calls(expr.left, known, calls)
            self._collect_calls(expr.right, known, calls)
        elif isinstance(expr, ast.UnaryOp):
            self._collect_calls(expr.operand, known, calls)
        elif isinstance(expr, ast.IfExpr):
            self._collect_calls(expr.condition, known, calls)
            self._collect_calls(expr.then_expr, known, calls)
            self._collect_calls(expr.else_expr, known, calls)
        elif isinstance(expr, ast.FuncApp):
            self._collect_calls(expr.func, known, calls)
            self._collect_calls(expr.arg, known, calls)
        elif isinstance(expr, ast.LetExpr):
            for b in expr.bindings:
                self._collect_calls(b.value, known, calls)
            self._collect_calls(expr.body, known, calls)
