"""Pretty printer for HaskOpt compiler.

Generates readable Haskell-like source code from the AST.
Preserves necessary parentheses based on operator precedence.
"""

from __future__ import annotations
from . import ast_nodes as ast


# Operator precedence for correct parenthesization
OP_PRECEDENCE = {
    "||": 2,
    "&&": 3,
    "==": 4, "/=": 4, "<": 4, "<=": 4, ">": 4, ">=": 4,
    "+": 6, "-": 6,
    "*": 7, "/": 7, "mod": 7,
}


class PrettyPrinter:
    """Generates Haskell source from AST."""

    def print_program(self, program: ast.Program) -> str:
        """Print a complete program."""
        parts = []
        for decl in program.declarations:
            parts.append(self.print_declaration(decl))
        return "\n\n".join(parts)

    def print_declaration(self, decl: ast.ASTNode) -> str:
        """Print a single declaration."""
        if isinstance(decl, ast.TypeSignature):
            return self._print_type_sig(decl)
        elif isinstance(decl, ast.FunctionDef):
            return self._print_func_def(decl)
        return ""

    def _print_type_sig(self, sig: ast.TypeSignature) -> str:
        """Print a type signature."""
        return f"{sig.name} :: {self._print_type_expr(sig.type_expr)}"

    def _print_type_expr(self, te: ast.TypeExpr) -> str:
        """Print a type expression."""
        if isinstance(te, ast.TypeName):
            return te.name
        elif isinstance(te, ast.TypeArrow):
            arg = self._print_type_expr(te.arg_type)
            ret = self._print_type_expr(te.return_type)
            if isinstance(te.arg_type, ast.TypeArrow):
                arg = f"({arg})"
            return f"{arg} -> {ret}"
        return "?"

    def _print_func_def(self, func: ast.FunctionDef) -> str:
        """Print a function definition."""
        params = " ".join(func.params)
        if params:
            params = " " + params
        body = self.print_expr(func.body)

        # Check if body is multi-line (if expression)
        if isinstance(func.body, ast.IfExpr):
            body = self._print_if_multiline(func.body, indent=4)
            return f"{func.name}{params} =\n{body}"

        return f"{func.name}{params} = {body}"

    def print_expr(self, expr: ast.Expr, parent_prec: int = 0) -> str:
        """Print an expression with correct parenthesization."""
        if expr is None:
            return "<?>"

        if isinstance(expr, ast.IntLiteral):
            if expr.value < 0:
                return f"({expr.value})"
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
            return self._print_binary(expr, parent_prec)

        elif isinstance(expr, ast.UnaryOp):
            return self._print_unary(expr)

        elif isinstance(expr, ast.IfExpr):
            return self._print_if_inline(expr)

        elif isinstance(expr, ast.FuncApp):
            return self._print_func_app(expr, parent_prec)

        elif isinstance(expr, ast.LetExpr):
            return self._print_let(expr)

        return "<?>"

    def _print_binary(self, expr: ast.BinaryOp, parent_prec: int) -> str:
        """Print a binary operation with precedence-based parentheses."""
        prec = OP_PRECEDENCE.get(expr.op, 5)
        left = self.print_expr(expr.left, prec)
        right = self.print_expr(expr.right, prec + 1)  # Right-associative protection

        result = f"{left} {expr.op} {right}"
        if prec < parent_prec:
            result = f"({result})"
        return result

    def _print_unary(self, expr: ast.UnaryOp) -> str:
        """Print a unary operation."""
        operand = self.print_expr(expr.operand, 10)
        if expr.op == "not":
            return f"not {operand}"
        elif expr.op == "-":
            return f"(-{operand})"
        return f"{expr.op}{operand}"

    def _print_if_inline(self, expr: ast.IfExpr) -> str:
        """Print an inline if expression."""
        cond = self.print_expr(expr.condition)
        then = self.print_expr(expr.then_expr)
        else_ = self.print_expr(expr.else_expr)
        return f"if {cond} then {then} else {else_}"

    def _print_if_multiline(self, expr: ast.IfExpr, indent: int) -> str:
        """Print a multiline if expression."""
        pad = " " * indent
        cond = self.print_expr(expr.condition)
        then = self.print_expr(expr.then_expr)
        else_ = self.print_expr(expr.else_expr)

        # Handle nested if in else
        if isinstance(expr.else_expr, ast.IfExpr):
            else_str = self._print_if_multiline(expr.else_expr, indent)
            return f"{pad}if {cond}\n{pad}then {then}\n{pad}else {else_str.lstrip()}"

        return f"{pad}if {cond}\n{pad}then {then}\n{pad}else {else_}"

    def _print_func_app(self, expr: ast.FuncApp, parent_prec: int) -> str:
        """Print function application."""
        # Collect all arguments
        args = []
        func = expr
        while isinstance(func, ast.FuncApp):
            args.append(func.arg)
            func = func.func

        func_str = self.print_expr(func, 10)
        arg_strs = []
        for arg in reversed(args):
            s = self.print_expr(arg, 10)
            # Wrap complex arguments in parens
            if isinstance(arg, (ast.BinaryOp, ast.IfExpr, ast.FuncApp, ast.UnaryOp)):
                s = f"({s})"
            arg_strs.append(s)

        result = f"{func_str} {' '.join(arg_strs)}"
        return result

    def _print_let(self, expr: ast.LetExpr) -> str:
        """Print a let expression."""
        bindings = "; ".join(
            f"{b.name} = {self.print_expr(b.value)}"
            for b in expr.bindings
        )
        body = self.print_expr(expr.body)
        return f"let {bindings} in {body}"
