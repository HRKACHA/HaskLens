"""Optimizer for HaskOpt compiler.

Implements semantics-preserving AST transformations:
1. Constant folding (arithmetic and boolean)
2. Identity simplifications (x + 0, x * 1, etc.)
3. Boolean condition simplification
4. Dead branch elimination (when condition is statically known)
5. Double negation elimination
"""

from __future__ import annotations
import copy
from dataclasses import dataclass, field
from typing import Optional
from . import ast_nodes as ast


@dataclass
class OptimizationEntry:
    """Record of a single optimization applied."""
    rule: str
    original_expr: str
    optimized_expr: str
    explanation: str
    line: Optional[int] = None
    column: Optional[int] = None
    changed: bool = True

    def to_dict(self) -> dict:
        return {
            "rule": self.rule,
            "original_expr": self.original_expr,
            "optimized_expr": self.optimized_expr,
            "explanation": self.explanation,
            "line": self.line,
            "column": self.column,
            "changed": self.changed,
        }


@dataclass
class OptimizationResult:
    """Result of optimization."""
    optimized_ast: Optional[ast.Program] = None
    log: list[OptimizationEntry] = field(default_factory=list)
    total_optimizations: int = 0
    success: bool = True

    def to_dict(self) -> dict:
        return {
            "optimized_ast": self.optimized_ast.to_dict() if self.optimized_ast else None,
            "log": [e.to_dict() for e in self.log],
            "total_optimizations": self.total_optimizations,
            "success": self.success,
        }


def _expr_to_str(expr: ast.Expr) -> str:
    """Simple expression to string for optimization log."""
    if isinstance(expr, ast.IntLiteral):
        return str(expr.value)
    elif isinstance(expr, ast.FloatLiteral):
        return str(expr.value)
    elif isinstance(expr, ast.BoolLiteral):
        return "True" if expr.value else "False"
    elif isinstance(expr, ast.StringLiteral):
        return f'"{expr.value}"'
    elif isinstance(expr, ast.Identifier):
        return expr.name
    elif isinstance(expr, ast.BinaryOp):
        left = _expr_to_str(expr.left)
        right = _expr_to_str(expr.right)
        return f"({left} {expr.op} {right})"
    elif isinstance(expr, ast.UnaryOp):
        operand = _expr_to_str(expr.operand)
        return f"({expr.op} {operand})"
    elif isinstance(expr, ast.IfExpr):
        cond = _expr_to_str(expr.condition)
        then = _expr_to_str(expr.then_expr)
        else_ = _expr_to_str(expr.else_expr)
        return f"(if {cond} then {then} else {else_})"
    elif isinstance(expr, ast.FuncApp):
        func = _expr_to_str(expr.func)
        arg = _expr_to_str(expr.arg)
        return f"({func} {arg})"
    elif isinstance(expr, ast.LetExpr):
        bindings = "; ".join(f"{b.name} = {_expr_to_str(b.value)}" for b in expr.bindings)
        body = _expr_to_str(expr.body)
        return f"(let {bindings} in {body})"
    return "<?>"


class Optimizer:
    """AST optimizer for HaskOpt programs."""

    def __init__(self):
        self.log: list[OptimizationEntry] = []

    def optimize(self, program: ast.Program) -> OptimizationResult:
        """Optimize a program by applying safe transformations."""
        self.log = []

        # Deep copy the AST so we don't mutate the original
        optimized = copy.deepcopy(program)

        # Apply optimization passes (run multiple times until no more changes)
        max_passes = 10
        for _ in range(max_passes):
            changed = False
            new_decls = []
            for decl in optimized.declarations:
                if isinstance(decl, ast.FunctionDef):
                    new_body, did_change = self._optimize_expr(decl.body)
                    new_decl = ast.FunctionDef(
                        name=decl.name,
                        params=decl.params,
                        body=new_body,
                        loc=decl.loc,
                    )
                    new_decls.append(new_decl)
                    changed = changed or did_change
                else:
                    new_decls.append(decl)
            optimized.declarations = new_decls
            if not changed:
                break

        return OptimizationResult(
            optimized_ast=optimized,
            log=self.log,
            total_optimizations=len(self.log),
            success=True,
        )

    def _optimize_expr(self, expr: ast.Expr) -> tuple[ast.Expr, bool]:
        """Optimize an expression. Returns (optimized_expr, changed)."""
        if expr is None:
            return None, False

        changed = False

        # First, recursively optimize children
        if isinstance(expr, ast.BinaryOp):
            left, lc = self._optimize_expr(expr.left)
            right, rc = self._optimize_expr(expr.right)
            expr = ast.BinaryOp(op=expr.op, left=left, right=right, loc=expr.loc)
            changed = lc or rc

        elif isinstance(expr, ast.UnaryOp):
            operand, oc = self._optimize_expr(expr.operand)
            expr = ast.UnaryOp(op=expr.op, operand=operand, loc=expr.loc)
            changed = oc

        elif isinstance(expr, ast.IfExpr):
            cond, cc = self._optimize_expr(expr.condition)
            then_e, tc = self._optimize_expr(expr.then_expr)
            else_e, ec = self._optimize_expr(expr.else_expr)
            expr = ast.IfExpr(condition=cond, then_expr=then_e, else_expr=else_e, loc=expr.loc)
            changed = cc or tc or ec

        elif isinstance(expr, ast.FuncApp):
            func, fc = self._optimize_expr(expr.func)
            arg, ac = self._optimize_expr(expr.arg)
            expr = ast.FuncApp(func=func, arg=arg, loc=expr.loc)
            changed = fc or ac

        elif isinstance(expr, ast.LetExpr):
            new_bindings = []
            for b in expr.bindings:
                bv, bc = self._optimize_expr(b.value)
                new_bindings.append(ast.LetBinding(name=b.name, value=bv, loc=b.loc))
                changed = changed or bc
            body, bc = self._optimize_expr(expr.body)
            expr = ast.LetExpr(bindings=new_bindings, body=body, loc=expr.loc)
            changed = changed or bc

        # Now apply optimization rules on the current node
        result, rule_changed = self._apply_rules(expr)
        return result, changed or rule_changed

    def _apply_rules(self, expr: ast.Expr) -> tuple[ast.Expr, bool]:
        """Apply optimization rules to a single expression node."""
        # Rule 1: Constant folding - arithmetic
        result = self._constant_fold(expr)
        if result is not None:
            return result, True

        # Rule 2: Identity simplifications
        result = self._identity_simplify(expr)
        if result is not None:
            return result, True

        # Rule 3: Boolean condition simplification
        result = self._boolean_simplify(expr)
        if result is not None:
            return result, True

        # Rule 4: Dead branch elimination
        result = self._dead_branch_eliminate(expr)
        if result is not None:
            return result, True

        # Rule 5: Double negation elimination
        result = self._double_negation(expr)
        if result is not None:
            return result, True

        # Rule 6: Constant comparison folding
        result = self._constant_comparison(expr)
        if result is not None:
            return result, True

        return expr, False

    def _constant_fold(self, expr: ast.Expr) -> Optional[ast.Expr]:
        """Fold constant arithmetic expressions."""
        if not isinstance(expr, ast.BinaryOp):
            return None

        left, right = expr.left, expr.right
        if not isinstance(left, ast.IntLiteral) or not isinstance(right, ast.IntLiteral):
            return None

        original = _expr_to_str(expr)
        lv, rv = left.value, right.value

        if expr.op == "+":
            result = ast.IntLiteral(value=lv + rv, loc=expr.loc)
        elif expr.op == "-":
            result = ast.IntLiteral(value=lv - rv, loc=expr.loc)
        elif expr.op == "*":
            result = ast.IntLiteral(value=lv * rv, loc=expr.loc)
        elif expr.op == "/":
            if rv == 0:
                # Division by zero: do NOT fold, leave as-is
                return None
            result = ast.IntLiteral(value=lv // rv, loc=expr.loc)
        elif expr.op == "mod":
            if rv == 0:
                return None
            result = ast.IntLiteral(value=lv % rv, loc=expr.loc)
        else:
            return None

        optimized = _expr_to_str(result)
        self.log.append(OptimizationEntry(
            rule="Constant Folding",
            original_expr=original,
            optimized_expr=optimized,
            explanation=f"Evaluated constant expression {original} to {optimized} at compile time",
            line=expr.loc.line if expr.loc else None,
            column=expr.loc.column if expr.loc else None,
        ))
        return result

    def _identity_simplify(self, expr: ast.Expr) -> Optional[ast.Expr]:
        """Simplify identity operations like x + 0, x * 1, etc."""
        if not isinstance(expr, ast.BinaryOp):
            return None

        left, right = expr.left, expr.right
        original = _expr_to_str(expr)

        # x + 0 => x and 0 + x => x
        if expr.op == "+" and isinstance(right, ast.IntLiteral) and right.value == 0:
            self._log_identity(original, _expr_to_str(left), "x + 0 = x", expr)
            return left
        if expr.op == "+" and isinstance(left, ast.IntLiteral) and left.value == 0:
            self._log_identity(original, _expr_to_str(right), "0 + x = x", expr)
            return right

        # x - 0 => x
        if expr.op == "-" and isinstance(right, ast.IntLiteral) and right.value == 0:
            self._log_identity(original, _expr_to_str(left), "x - 0 = x", expr)
            return left

        # x * 1 => x and 1 * x => x
        if expr.op == "*" and isinstance(right, ast.IntLiteral) and right.value == 1:
            self._log_identity(original, _expr_to_str(left), "x * 1 = x", expr)
            return left
        if expr.op == "*" and isinstance(left, ast.IntLiteral) and left.value == 1:
            self._log_identity(original, _expr_to_str(right), "1 * x = x", expr)
            return right

        # x / 1 => x
        if expr.op == "/" and isinstance(right, ast.IntLiteral) and right.value == 1:
            self._log_identity(original, _expr_to_str(left), "x / 1 = x", expr)
            return left

        # Note: We do NOT simplify x * 0 => 0 because in Haskell, if x is undefined
        # (bottom), this changes evaluation behavior.

        return None

    def _boolean_simplify(self, expr: ast.Expr) -> Optional[ast.Expr]:
        """Simplify boolean expressions."""
        if not isinstance(expr, ast.BinaryOp):
            return None

        left, right = expr.left, expr.right
        original = _expr_to_str(expr)

        # True && x => x
        if expr.op == "&&" and isinstance(left, ast.BoolLiteral) and left.value:
            self._log_bool(original, _expr_to_str(right), "True && x = x", expr)
            return right

        # False && x => False
        if expr.op == "&&" and isinstance(left, ast.BoolLiteral) and not left.value:
            result = ast.BoolLiteral(value=False, loc=expr.loc)
            self._log_bool(original, "False", "False && x = False (short-circuit)", expr)
            return result

        # x && True => x
        if expr.op == "&&" and isinstance(right, ast.BoolLiteral) and right.value:
            self._log_bool(original, _expr_to_str(left), "x && True = x", expr)
            return left

        # True || x => True
        if expr.op == "||" and isinstance(left, ast.BoolLiteral) and left.value:
            result = ast.BoolLiteral(value=True, loc=expr.loc)
            self._log_bool(original, "True", "True || x = True (short-circuit)", expr)
            return result

        # False || x => x
        if expr.op == "||" and isinstance(left, ast.BoolLiteral) and not left.value:
            self._log_bool(original, _expr_to_str(right), "False || x = x", expr)
            return right

        # x || False => x
        if expr.op == "||" and isinstance(right, ast.BoolLiteral) and not right.value:
            self._log_bool(original, _expr_to_str(left), "x || False = x", expr)
            return left

        return None

    def _dead_branch_eliminate(self, expr: ast.Expr) -> Optional[ast.Expr]:
        """Eliminate dead branches when condition is known."""
        if not isinstance(expr, ast.IfExpr):
            return None

        if not isinstance(expr.condition, ast.BoolLiteral):
            return None

        original = _expr_to_str(expr)

        if expr.condition.value:
            result = expr.then_expr
            explanation = "Condition is always True, so 'else' branch is unreachable. Replaced with 'then' branch."
        else:
            result = expr.else_expr
            explanation = "Condition is always False, so 'then' branch is unreachable. Replaced with 'else' branch."

        self.log.append(OptimizationEntry(
            rule="Dead Branch Elimination",
            original_expr=original,
            optimized_expr=_expr_to_str(result),
            explanation=explanation,
            line=expr.loc.line if expr.loc else None,
            column=expr.loc.column if expr.loc else None,
        ))
        return result

    def _double_negation(self, expr: ast.Expr) -> Optional[ast.Expr]:
        """Eliminate double negation: not (not x) => x, -(-x) => x."""
        if not isinstance(expr, ast.UnaryOp):
            return None

        if expr.op == "not" and isinstance(expr.operand, ast.UnaryOp) and expr.operand.op == "not":
            original = _expr_to_str(expr)
            result = expr.operand.operand
            self.log.append(OptimizationEntry(
                rule="Double Negation Elimination",
                original_expr=original,
                optimized_expr=_expr_to_str(result),
                explanation="not (not x) = x: double boolean negation removed",
                line=expr.loc.line if expr.loc else None,
            ))
            return result

        if expr.op == "-" and isinstance(expr.operand, ast.UnaryOp) and expr.operand.op == "-":
            original = _expr_to_str(expr)
            result = expr.operand.operand
            self.log.append(OptimizationEntry(
                rule="Double Negation Elimination",
                original_expr=original,
                optimized_expr=_expr_to_str(result),
                explanation="-(-x) = x: double arithmetic negation removed",
                line=expr.loc.line if expr.loc else None,
            ))
            return result

        return None

    def _constant_comparison(self, expr: ast.Expr) -> Optional[ast.Expr]:
        """Fold constant comparison expressions."""
        if not isinstance(expr, ast.BinaryOp):
            return None

        left, right = expr.left, expr.right

        # Int comparisons
        if isinstance(left, ast.IntLiteral) and isinstance(right, ast.IntLiteral):
            lv, rv = left.value, right.value
            original = _expr_to_str(expr)
            result_val = None

            if expr.op == "==":
                result_val = lv == rv
            elif expr.op == "/=":
                result_val = lv != rv
            elif expr.op == "<":
                result_val = lv < rv
            elif expr.op == "<=":
                result_val = lv <= rv
            elif expr.op == ">":
                result_val = lv > rv
            elif expr.op == ">=":
                result_val = lv >= rv

            if result_val is not None:
                result = ast.BoolLiteral(value=result_val, loc=expr.loc)
                self.log.append(OptimizationEntry(
                    rule="Constant Comparison Folding",
                    original_expr=original,
                    optimized_expr=_expr_to_str(result),
                    explanation=f"Evaluated constant comparison {original} to {'True' if result_val else 'False'}",
                    line=expr.loc.line if expr.loc else None,
                ))
                return result

        # Bool comparisons
        if isinstance(left, ast.BoolLiteral) and isinstance(right, ast.BoolLiteral):
            original = _expr_to_str(expr)
            if expr.op == "==":
                result_val = left.value == right.value
            elif expr.op == "/=":
                result_val = left.value != right.value
            else:
                return None

            result = ast.BoolLiteral(value=result_val, loc=expr.loc)
            self.log.append(OptimizationEntry(
                rule="Constant Comparison Folding",
                original_expr=original,
                optimized_expr=_expr_to_str(result),
                explanation=f"Evaluated constant boolean comparison {original} to {'True' if result_val else 'False'}",
                line=expr.loc.line if expr.loc else None,
            ))
            return result

        return None

    def _log_identity(self, original: str, optimized: str, rule_desc: str, expr: ast.Expr):
        self.log.append(OptimizationEntry(
            rule="Identity Simplification",
            original_expr=original,
            optimized_expr=optimized,
            explanation=f"Applied identity rule: {rule_desc}",
            line=expr.loc.line if expr.loc else None,
            column=expr.loc.column if expr.loc else None,
        ))

    def _log_bool(self, original: str, optimized: str, rule_desc: str, expr: ast.Expr):
        self.log.append(OptimizationEntry(
            rule="Boolean Simplification",
            original_expr=original,
            optimized_expr=optimized,
            explanation=f"Applied boolean rule: {rule_desc}",
            line=expr.loc.line if expr.loc else None,
            column=expr.loc.column if expr.loc else None,
        ))
