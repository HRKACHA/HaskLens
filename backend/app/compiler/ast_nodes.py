"""AST node definitions for HaskOpt compiler."""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SourceLocation:
    """Source code location for diagnostics."""
    line: int
    column: int
    end_line: Optional[int] = None
    end_column: Optional[int] = None

    def to_dict(self) -> dict:
        d = {"line": self.line, "column": self.column}
        if self.end_line is not None:
            d["end_line"] = self.end_line
        if self.end_column is not None:
            d["end_column"] = self.end_column
        return d


class ASTNode:
    """Base AST node."""
    loc: Optional[SourceLocation] = None

    def to_dict(self) -> dict:
        raise NotImplementedError

    def children(self) -> list[ASTNode]:
        """Return child AST nodes for traversal."""
        return []


@dataclass
class Program(ASTNode):
    """Top-level program: a list of declarations."""
    declarations: list[ASTNode] = field(default_factory=list)
    loc: Optional[SourceLocation] = None

    def to_dict(self) -> dict:
        return {
            "node_type": "Program",
            "declarations": [d.to_dict() for d in self.declarations],
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        return list(self.declarations)


@dataclass
class TypeSignature(ASTNode):
    """Type signature declaration: name :: type"""
    name: str = ""
    type_expr: TypeExpr = None
    loc: Optional[SourceLocation] = None

    def to_dict(self) -> dict:
        return {
            "node_type": "TypeSignature",
            "name": self.name,
            "type_expr": self.type_expr.to_dict() if self.type_expr else None,
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        return [self.type_expr] if self.type_expr else []


@dataclass
class TypeExpr(ASTNode):
    """Base class for type expressions."""
    loc: Optional[SourceLocation] = None


@dataclass
class TypeName(TypeExpr):
    """Simple type name: Int, Bool, etc."""
    name: str = ""

    def to_dict(self) -> dict:
        return {
            "node_type": "TypeName",
            "name": self.name,
            "loc": self.loc.to_dict() if self.loc else None,
        }


@dataclass
class TypeArrow(TypeExpr):
    """Function type: a -> b"""
    arg_type: TypeExpr = None
    return_type: TypeExpr = None

    def to_dict(self) -> dict:
        return {
            "node_type": "TypeArrow",
            "arg_type": self.arg_type.to_dict() if self.arg_type else None,
            "return_type": self.return_type.to_dict() if self.return_type else None,
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        result = []
        if self.arg_type:
            result.append(self.arg_type)
        if self.return_type:
            result.append(self.return_type)
        return result


@dataclass
class FunctionDef(ASTNode):
    """Function definition: name params = body"""
    name: str = ""
    params: list[str] = field(default_factory=list)
    body: Expr = None
    loc: Optional[SourceLocation] = None

    def to_dict(self) -> dict:
        return {
            "node_type": "FunctionDef",
            "name": self.name,
            "params": self.params,
            "body": self.body.to_dict() if self.body else None,
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        return [self.body] if self.body else []


@dataclass
class Expr(ASTNode):
    """Base class for expressions."""
    loc: Optional[SourceLocation] = None


@dataclass
class IntLiteral(Expr):
    """Integer literal."""
    value: int = 0

    def to_dict(self) -> dict:
        return {
            "node_type": "IntLiteral",
            "value": self.value,
            "loc": self.loc.to_dict() if self.loc else None,
        }


@dataclass
class FloatLiteral(Expr):
    """Float literal."""
    value: float = 0.0

    def to_dict(self) -> dict:
        return {
            "node_type": "FloatLiteral",
            "value": self.value,
            "loc": self.loc.to_dict() if self.loc else None,
        }


@dataclass
class BoolLiteral(Expr):
    """Boolean literal."""
    value: bool = False

    def to_dict(self) -> dict:
        return {
            "node_type": "BoolLiteral",
            "value": self.value,
            "loc": self.loc.to_dict() if self.loc else None,
        }


@dataclass
class StringLiteral(Expr):
    """String literal."""
    value: str = ""

    def to_dict(self) -> dict:
        return {
            "node_type": "StringLiteral",
            "value": self.value,
            "loc": self.loc.to_dict() if self.loc else None,
        }


@dataclass
class Identifier(Expr):
    """Variable or function reference."""
    name: str = ""

    def to_dict(self) -> dict:
        return {
            "node_type": "Identifier",
            "name": self.name,
            "loc": self.loc.to_dict() if self.loc else None,
        }


@dataclass
class BinaryOp(Expr):
    """Binary operation: left op right"""
    op: str = ""
    left: Expr = None
    right: Expr = None

    def to_dict(self) -> dict:
        return {
            "node_type": "BinaryOp",
            "op": self.op,
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None,
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        result = []
        if self.left:
            result.append(self.left)
        if self.right:
            result.append(self.right)
        return result


@dataclass
class UnaryOp(Expr):
    """Unary operation: op operand"""
    op: str = ""
    operand: Expr = None

    def to_dict(self) -> dict:
        return {
            "node_type": "UnaryOp",
            "op": self.op,
            "operand": self.operand.to_dict() if self.operand else None,
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        return [self.operand] if self.operand else []


@dataclass
class IfExpr(Expr):
    """Conditional expression: if cond then true_branch else false_branch"""
    condition: Expr = None
    then_expr: Expr = None
    else_expr: Expr = None

    def to_dict(self) -> dict:
        return {
            "node_type": "IfExpr",
            "condition": self.condition.to_dict() if self.condition else None,
            "then_expr": self.then_expr.to_dict() if self.then_expr else None,
            "else_expr": self.else_expr.to_dict() if self.else_expr else None,
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        result = []
        if self.condition:
            result.append(self.condition)
        if self.then_expr:
            result.append(self.then_expr)
        if self.else_expr:
            result.append(self.else_expr)
        return result


@dataclass
class FuncApp(Expr):
    """Function application: func arg"""
    func: Expr = None
    arg: Expr = None

    def to_dict(self) -> dict:
        return {
            "node_type": "FuncApp",
            "func": self.func.to_dict() if self.func else None,
            "arg": self.arg.to_dict() if self.arg else None,
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        result = []
        if self.func:
            result.append(self.func)
        if self.arg:
            result.append(self.arg)
        return result


@dataclass
class LetExpr(Expr):
    """Let expression: let bindings in body"""
    bindings: list[LetBinding] = field(default_factory=list)
    body: Expr = None

    def to_dict(self) -> dict:
        return {
            "node_type": "LetExpr",
            "bindings": [b.to_dict() for b in self.bindings],
            "body": self.body.to_dict() if self.body else None,
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        result = list(self.bindings)
        if self.body:
            result.append(self.body)
        return result


@dataclass
class LetBinding(ASTNode):
    """A single let binding: name = expr"""
    name: str = ""
    value: Expr = None
    loc: Optional[SourceLocation] = None

    def to_dict(self) -> dict:
        return {
            "node_type": "LetBinding",
            "name": self.name,
            "value": self.value.to_dict() if self.value else None,
            "loc": self.loc.to_dict() if self.loc else None,
        }

    def children(self) -> list[ASTNode]:
        return [self.value] if self.value else []
