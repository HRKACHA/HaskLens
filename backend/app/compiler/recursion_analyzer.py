"""Recursion analyzer for HaskOpt compiler.

Builds a function call graph from actual AST references and identifies
direct recursion and mutual recursion.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from . import ast_nodes as ast


@dataclass
class RecursionInfo:
    """Information about recursion in a function."""
    function_name: str
    is_recursive: bool = False
    is_tail_recursive: bool = False
    recursive_calls: list[str] = field(default_factory=list)
    base_cases: list[str] = field(default_factory=list)
    explanation: str = ""

    def to_dict(self) -> dict:
        return {
            "function_name": self.function_name,
            "is_recursive": self.is_recursive,
            "is_tail_recursive": self.is_tail_recursive,
            "recursive_calls": self.recursive_calls,
            "base_cases": self.base_cases,
            "explanation": self.explanation,
        }


@dataclass
class MutualRecursionGroup:
    """A group of mutually recursive functions."""
    functions: list[str]
    explanation: str

    def to_dict(self) -> dict:
        return {
            "functions": self.functions,
            "explanation": self.explanation,
        }


@dataclass
class RecursionResult:
    """Result of recursion analysis."""
    functions: list[RecursionInfo] = field(default_factory=list)
    mutual_recursion_groups: list[MutualRecursionGroup] = field(default_factory=list)
    has_recursion: bool = False

    def to_dict(self) -> dict:
        return {
            "functions": [f.to_dict() for f in self.functions],
            "mutual_recursion_groups": [g.to_dict() for g in self.mutual_recursion_groups],
            "has_recursion": self.has_recursion,
        }


class RecursionAnalyzer:
    """Analyzes recursion in HaskOpt programs."""

    def analyze(self, program: ast.Program) -> RecursionResult:
        """Analyze recursion in a program."""
        # Collect all function definitions
        functions: dict[str, ast.FunctionDef] = {}
        for decl in program.declarations:
            if isinstance(decl, ast.FunctionDef):
                functions[decl.name] = decl

        # Build call graph: function_name -> set of functions it calls
        call_graph: dict[str, set[str]] = {}
        for name, func in functions.items():
            called = set()
            if func.body:
                self._collect_calls(func.body, set(functions.keys()), called)
            call_graph[name] = called

        # Analyze each function
        results: list[RecursionInfo] = []
        for name, func in functions.items():
            info = self._analyze_function(name, func, call_graph, functions)
            results.append(info)

        # Detect mutual recursion
        mutual_groups = self._find_mutual_recursion(call_graph)

        has_recursion = any(f.is_recursive for f in results) or len(mutual_groups) > 0

        return RecursionResult(
            functions=results,
            mutual_recursion_groups=mutual_groups,
            has_recursion=has_recursion,
        )

    def _collect_calls(self, expr: ast.Expr, known_functions: set[str],
                       calls: set[str]):
        """Collect all function calls in an expression."""
        if isinstance(expr, ast.Identifier):
            if expr.name in known_functions:
                calls.add(expr.name)
        elif isinstance(expr, ast.BinaryOp):
            self._collect_calls(expr.left, known_functions, calls)
            self._collect_calls(expr.right, known_functions, calls)
        elif isinstance(expr, ast.UnaryOp):
            self._collect_calls(expr.operand, known_functions, calls)
        elif isinstance(expr, ast.IfExpr):
            self._collect_calls(expr.condition, known_functions, calls)
            self._collect_calls(expr.then_expr, known_functions, calls)
            self._collect_calls(expr.else_expr, known_functions, calls)
        elif isinstance(expr, ast.FuncApp):
            self._collect_calls(expr.func, known_functions, calls)
            self._collect_calls(expr.arg, known_functions, calls)
        elif isinstance(expr, ast.LetExpr):
            for b in expr.bindings:
                self._collect_calls(b.value, known_functions, calls)
            self._collect_calls(expr.body, known_functions, calls)

    def _analyze_function(self, name: str, func: ast.FunctionDef,
                          call_graph: dict[str, set[str]],
                          functions: dict[str, ast.FunctionDef]) -> RecursionInfo:
        """Analyze recursion for a single function."""
        calls = call_graph.get(name, set())
        is_recursive = name in calls

        info = RecursionInfo(function_name=name)

        if not is_recursive:
            called_funcs = [c for c in calls if c != name]
            if called_funcs:
                info.explanation = (
                    f"'{name}' is not recursive. It calls: {', '.join(called_funcs)}."
                )
            else:
                info.explanation = f"'{name}' is not recursive and does not call other defined functions."
            return info

        info.is_recursive = True
        info.recursive_calls = [name]

        # Detect base cases (heuristic: if-then-else with one non-recursive branch)
        if func.body:
            base_cases = self._find_base_cases(func.body, name)
            info.base_cases = base_cases

        # Check for tail recursion (heuristic)
        info.is_tail_recursive = self._is_tail_recursive(func.body, name) if func.body else False

        # Build explanation
        parts = [f"'{name}' is directly recursive — it calls itself."]
        if info.is_tail_recursive:
            parts.append("The recursive call appears to be in tail position (heuristic).")
        if info.base_cases:
            parts.append(f"Detected base case(s): {', '.join(info.base_cases)}.")
            parts.append("Note: Base case detection is a heuristic and does not prove termination.")
        else:
            parts.append("No obvious base case detected — this function may not terminate for some inputs.")

        info.explanation = " ".join(parts)
        return info

    def _find_base_cases(self, expr: ast.Expr, func_name: str) -> list[str]:
        """Find base cases in a recursive function (heuristic)."""
        cases = []

        if isinstance(expr, ast.IfExpr):
            # Check if then-branch or else-branch does NOT contain recursive call
            then_calls = set()
            else_calls = set()
            self._collect_calls(expr.then_expr, {func_name}, then_calls)
            self._collect_calls(expr.else_expr, {func_name}, else_calls)

            cond_str = self._expr_summary(expr.condition)

            if func_name not in then_calls:
                cases.append(f"when {cond_str} is True")
            if func_name not in else_calls:
                cases.append(f"when {cond_str} is False")

        return cases

    def _is_tail_recursive(self, expr: ast.Expr, func_name: str) -> bool:
        """Heuristic check for tail recursion."""
        if isinstance(expr, ast.IfExpr):
            return (self._is_tail_recursive(expr.then_expr, func_name) or
                    self._is_tail_recursive(expr.else_expr, func_name))
        elif isinstance(expr, ast.FuncApp):
            # Check if the outermost call is to the function itself
            func = expr.func
            while isinstance(func, ast.FuncApp):
                func = func.func
            if isinstance(func, ast.Identifier) and func.name == func_name:
                return True
        return False

    def _expr_summary(self, expr: ast.Expr) -> str:
        """Short human-readable summary of an expression."""
        if isinstance(expr, ast.BinaryOp):
            left = self._expr_summary(expr.left)
            right = self._expr_summary(expr.right)
            return f"{left} {expr.op} {right}"
        elif isinstance(expr, ast.Identifier):
            return expr.name
        elif isinstance(expr, ast.IntLiteral):
            return str(expr.value)
        elif isinstance(expr, ast.BoolLiteral):
            return "True" if expr.value else "False"
        elif isinstance(expr, ast.FuncApp):
            return f"{self._expr_summary(expr.func)} ..."
        return "..."

    def _find_mutual_recursion(self, call_graph: dict[str, set[str]]) -> list[MutualRecursionGroup]:
        """Find mutually recursive function groups using Tarjan's algorithm."""
        index_counter = [0]
        stack = []
        lowlink = {}
        index = {}
        on_stack = {}
        sccs = []

        def strongconnect(v):
            index[v] = index_counter[0]
            lowlink[v] = index_counter[0]
            index_counter[0] += 1
            on_stack[v] = True
            stack.append(v)

            for w in call_graph.get(v, set()):
                if w not in index:
                    strongconnect(w)
                    lowlink[v] = min(lowlink[v], lowlink[w])
                elif on_stack.get(w, False):
                    lowlink[v] = min(lowlink[v], index[w])

            if lowlink[v] == index[v]:
                scc = []
                while True:
                    w = stack.pop()
                    on_stack[w] = False
                    scc.append(w)
                    if w == v:
                        break
                if len(scc) > 1:
                    sccs.append(scc)

        for v in call_graph:
            if v not in index:
                strongconnect(v)

        groups = []
        for scc in sccs:
            scc.sort()
            groups.append(MutualRecursionGroup(
                functions=scc,
                explanation=f"Functions {', '.join(scc)} form a mutual recursion group — they call each other in a cycle.",
            ))

        return groups
