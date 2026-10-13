"""Semantic analyzer for HaskOpt compiler.

Analyzes the AST for:
- Undefined identifiers and function references
- Function argument usage
- Recursive references (correctly handled)
- Potentially unreachable branches
- Function arity issues
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from . import ast_nodes as ast


@dataclass
class SemanticDiagnostic:
    """A semantic analysis diagnostic."""
    severity: str  # "error", "warning", "info"
    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    suggestion: Optional[str] = None

    def to_dict(self) -> dict:
        d = {
            "severity": self.severity,
            "message": self.message,
            "line": self.line,
            "column": self.column,
        }
        if self.suggestion:
            d["suggestion"] = self.suggestion
        return d


@dataclass
class SemanticResult:
    """Result of semantic analysis."""
    diagnostics: list[SemanticDiagnostic] = field(default_factory=list)
    defined_functions: list[str] = field(default_factory=list)
    function_arities: dict[str, int] = field(default_factory=dict)
    success: bool = True

    def to_dict(self) -> dict:
        return {
            "diagnostics": [d.to_dict() for d in self.diagnostics],
            "defined_functions": self.defined_functions,
            "function_arities": self.function_arities,
            "success": self.success,
        }


class SemanticAnalyzer:
    """Semantic analyzer for HaskOpt programs."""

    def __init__(self):
        self.diagnostics: list[SemanticDiagnostic] = []
        self.defined_functions: dict[str, ast.FunctionDef] = {}
        self.function_arities: dict[str, int] = {}
        self.type_signatures: dict[str, ast.TypeSignature] = {}

    def analyze(self, program: ast.Program) -> SemanticResult:
        """Perform semantic analysis on a program."""
        self.diagnostics = []
        self.defined_functions = {}
        self.function_arities = {}
        self.type_signatures = {}

        # First pass: collect all function names and type signatures
        for decl in program.declarations:
            if isinstance(decl, ast.FunctionDef):
                if decl.name in self.defined_functions:
                    self.diagnostics.append(SemanticDiagnostic(
                        severity="warning",
                        message=f"Function '{decl.name}' is defined multiple times. Later definition will shadow earlier ones.",
                        line=decl.loc.line if decl.loc else None,
                        column=decl.loc.column if decl.loc else None,
                    ))
                self.defined_functions[decl.name] = decl
                self.function_arities[decl.name] = len(decl.params)
            elif isinstance(decl, ast.TypeSignature):
                self.type_signatures[decl.name] = decl

        # Check for type signatures without definitions
        for name, sig in self.type_signatures.items():
            if name not in self.defined_functions:
                self.diagnostics.append(SemanticDiagnostic(
                    severity="warning",
                    message=f"Type signature for '{name}' has no corresponding function definition",
                    line=sig.loc.line if sig.loc else None,
                    column=sig.loc.column if sig.loc else None,
                    suggestion=f"Add a definition: {name} = ...",
                ))

        # Second pass: analyze each function body
        for name, func in self.defined_functions.items():
            self._analyze_function(func)

        has_errors = any(d.severity == "error" for d in self.diagnostics)
        return SemanticResult(
            diagnostics=self.diagnostics,
            defined_functions=list(self.defined_functions.keys()),
            function_arities=self.function_arities,
            success=not has_errors,
        )

    def _analyze_function(self, func: ast.FunctionDef):
        """Analyze a single function definition."""
        # Build scope: function params + all defined functions (including self for recursion)
        scope = set(func.params) | set(self.defined_functions.keys())

        # Track which parameters are used
        used_params = set()

        # Analyze the body
        if func.body:
            self._analyze_expr(func.body, scope, func.name, used_params)

        # Check for unused parameters
        for param in func.params:
            if param not in used_params:
                self.diagnostics.append(SemanticDiagnostic(
                    severity="warning",
                    message=f"Parameter '{param}' in function '{func.name}' is never used",
                    line=func.loc.line if func.loc else None,
                    suggestion=f"Consider removing unused parameter or prefixing with underscore: _{param}",
                ))

    def _analyze_expr(self, expr: ast.Expr, scope: set[str],
                      current_func: str, used_params: set[str]):
        """Recursively analyze an expression."""
        if isinstance(expr, ast.Identifier):
            if expr.name in scope:
                used_params.add(expr.name)
            elif expr.name not in {"otherwise"}:  # Built-in names
                self.diagnostics.append(SemanticDiagnostic(
                    severity="error",
                    message=f"Undefined identifier '{expr.name}'",
                    line=expr.loc.line if expr.loc else None,
                    column=expr.loc.column if expr.loc else None,
                    suggestion=self._suggest_similar(expr.name, scope),
                ))

        elif isinstance(expr, ast.BinaryOp):
            self._analyze_expr(expr.left, scope, current_func, used_params)
            self._analyze_expr(expr.right, scope, current_func, used_params)

        elif isinstance(expr, ast.UnaryOp):
            self._analyze_expr(expr.operand, scope, current_func, used_params)

        elif isinstance(expr, ast.IfExpr):
            self._analyze_expr(expr.condition, scope, current_func, used_params)
            self._analyze_expr(expr.then_expr, scope, current_func, used_params)
            self._analyze_expr(expr.else_expr, scope, current_func, used_params)

            # Check for constant conditions
            if isinstance(expr.condition, ast.BoolLiteral):
                branch = "then" if expr.condition.value else "else"
                unreachable = "else" if expr.condition.value else "then"
                self.diagnostics.append(SemanticDiagnostic(
                    severity="warning",
                    message=f"Condition is always {expr.condition.value}; '{unreachable}' branch is unreachable",
                    line=expr.condition.loc.line if expr.condition.loc else None,
                    suggestion=f"Consider simplifying to just the '{branch}' expression",
                ))

        elif isinstance(expr, ast.FuncApp):
            self._analyze_expr(expr.func, scope, current_func, used_params)
            self._analyze_expr(expr.arg, scope, current_func, used_params)

            # Check arity for known functions
            if isinstance(expr.func, ast.Identifier):
                func_name = expr.func.name
                if func_name in self.function_arities:
                    # Count total arguments applied
                    args_count = self._count_applied_args(expr)
                    expected = self.function_arities[func_name]
                    if args_count > expected and expected > 0:
                        self.diagnostics.append(SemanticDiagnostic(
                            severity="warning",
                            message=f"Function '{func_name}' expects {expected} argument(s) but is applied to {args_count}",
                            line=expr.func.loc.line if expr.func.loc else None,
                        ))

        elif isinstance(expr, ast.LetExpr):
            local_scope = set(scope)
            for binding in expr.bindings:
                self._analyze_expr(binding.value, local_scope, current_func, used_params)
                local_scope.add(binding.name)
            self._analyze_expr(expr.body, local_scope, current_func, used_params)

    def _count_applied_args(self, expr: ast.FuncApp) -> int:
        """Count the number of arguments applied to a function."""
        count = 1
        current = expr.func
        while isinstance(current, ast.FuncApp):
            count += 1
            current = current.func
        return count

    def _suggest_similar(self, name: str, scope: set[str]) -> Optional[str]:
        """Suggest a similar name from scope."""
        best = None
        best_dist = float('inf')
        for candidate in scope:
            d = self._edit_distance(name.lower(), candidate.lower())
            if d < best_dist and d <= 2:
                best_dist = d
                best = candidate
        if best:
            return f"Did you mean '{best}'?"
        return None

    def _edit_distance(self, s1: str, s2: str) -> int:
        """Simple Levenshtein edit distance."""
        if len(s1) < len(s2):
            return self._edit_distance(s2, s1)
        if not s2:
            return len(s1)
        prev = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            curr = [i + 1]
            for j, c2 in enumerate(s2):
                curr.append(min(
                    prev[j + 1] + 1,
                    curr[j] + 1,
                    prev[j] + (0 if c1 == c2 else 1)
                ))
            prev = curr
        return prev[-1]
