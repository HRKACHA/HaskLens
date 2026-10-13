"""AST builder — transforms Lark parse trees into HaskOpt AST nodes."""

from __future__ import annotations
from lark import Transformer, Token as LarkToken
from . import ast_nodes as ast


class ASTBuilder(Transformer):
    """Transforms a Lark parse tree into HaskOpt AST nodes."""

    def _loc(self, meta):
        """Extract source location from Lark tree metadata."""
        if meta and hasattr(meta, 'line'):
            return ast.SourceLocation(
                line=meta.line,
                column=meta.column,
                end_line=getattr(meta, 'end_line', None),
                end_column=getattr(meta, 'end_column', None),
            )
        return None

    def _tok_loc(self, token):
        """Extract source location from a Lark token."""
        if hasattr(token, 'line') and token.line:
            return ast.SourceLocation(
                line=token.line,
                column=token.column,
                end_line=getattr(token, 'end_line', None),
                end_column=getattr(token, 'end_column', None),
            )
        return None

    # --- Program ---
    def program(self, items):
        decls = [item for item in items if isinstance(item, ast.ASTNode)]
        return ast.Program(declarations=decls)

    # --- Type signatures ---
    def type_signature(self, items):
        first = items[0]
        if isinstance(first, ast.Identifier):
            name = first.name
            loc = first.loc
        else:
            name = str(first)
            loc = self._tok_loc(first) if hasattr(first, 'line') else None
        type_expr = items[1]
        return ast.TypeSignature(name=name, type_expr=type_expr, loc=loc)

    def type_arrow(self, items):
        return ast.TypeArrow(arg_type=items[0], return_type=items[1])

    def type_int(self, _items):
        return ast.TypeName(name="Int")

    def type_bool(self, _items):
        return ast.TypeName(name="Bool")

    def type_float(self, _items):
        return ast.TypeName(name="Float")

    def type_string(self, _items):
        return ast.TypeName(name="String")

    # --- Function definitions ---
    def function_def(self, items):
        first = items[0]
        # IDENT transformer returns an Identifier node; extract name from it
        if isinstance(first, ast.Identifier):
            name = first.name
            loc = first.loc
        else:
            name = str(first)
            loc = self._tok_loc(first) if hasattr(first, 'line') else None
        # Separate params from body (last item is the body expression)
        params = []
        body = None
        for item in items[1:]:
            if isinstance(item, str):
                params.append(item)
            elif isinstance(item, ast.Identifier):
                # This is a param that went through IDENT transformer
                params.append(item.name)
            else:
                body = item
        return ast.FunctionDef(
            name=name, params=params, body=body,
            loc=loc,
        )

    def params(self, items):
        first = items[0]
        if isinstance(first, ast.Identifier):
            return first.name
        return str(first)

    # --- Expressions ---
    def if_expr(self, items):
        return ast.IfExpr(
            condition=items[0], then_expr=items[1], else_expr=items[2],
        )

    def let_expr(self, items):
        bindings = items[0]
        body = items[1]
        return ast.LetExpr(bindings=bindings, body=body)

    def let_bindings(self, items):
        return list(items)

    def let_binding(self, items):
        first = items[0]
        name = first.name if isinstance(first, ast.Identifier) else str(first)
        return ast.LetBinding(name=name, value=items[1])

    # --- Binary operators ---
    def _binop(self, op, items):
        return ast.BinaryOp(op=op, left=items[0], right=items[1])

    def add(self, items):
        return self._binop("+", items)

    def sub(self, items):
        return self._binop("-", items)

    def mul(self, items):
        return self._binop("*", items)

    def div_op(self, items):
        return self._binop("/", items)

    def mod_op(self, items):
        return self._binop("mod", items)

    def eq(self, items):
        return self._binop("==", items)

    def neq(self, items):
        return self._binop("/=", items)

    def lt(self, items):
        return self._binop("<", items)

    def lte(self, items):
        return self._binop("<=", items)

    def gt(self, items):
        return self._binop(">", items)

    def gte(self, items):
        return self._binop(">=", items)

    def bool_or(self, items):
        return self._binop("||", items)

    def bool_and(self, items):
        return self._binop("&&", items)

    # --- Unary operators ---
    def not_op(self, items):
        return ast.UnaryOp(op="not", operand=items[0])

    def negate(self, items):
        return ast.UnaryOp(op="-", operand=items[0])

    # --- Function application ---
    def func_app(self, items):
        return ast.FuncApp(func=items[0], arg=items[1])

    # --- Atoms ---
    def paren_expr(self, items):
        return items[0]

    # --- Terminals ---
    def INT_LITERAL(self, token):
        return ast.IntLiteral(value=int(str(token)), loc=self._tok_loc(token))

    def FLOAT_LITERAL(self, token):
        return ast.FloatLiteral(value=float(str(token)), loc=self._tok_loc(token))

    def BOOL_LITERAL(self, token):
        val = str(token) == "True"
        return ast.BoolLiteral(value=val, loc=self._tok_loc(token))

    def STRING_LITERAL(self, token):
        # Strip quotes
        val = str(token)[1:-1]
        return ast.StringLiteral(value=val, loc=self._tok_loc(token))

    def IDENT(self, token):
        return ast.Identifier(name=str(token), loc=self._tok_loc(token))
