"""Type checker for HaskOpt compiler.

Implements basic type checking for the supported Haskell subset:
Int, Bool, Float, String, function types, and Unknown for unresolved types.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from . import ast_nodes as ast


# --- Type representations ---

@dataclass
class HaskType:
    """Base type."""
    def display(self) -> str:
        raise NotImplementedError


@dataclass
class IntType(HaskType):
    def display(self) -> str:
        return "Int"

@dataclass
class BoolType(HaskType):
    def display(self) -> str:
        return "Bool"

@dataclass
class FloatType(HaskType):
    def display(self) -> str:
        return "Float"

@dataclass
class StringType(HaskType):
    def display(self) -> str:
        return "String"

@dataclass
class FuncType(HaskType):
    arg: HaskType = None
    ret: HaskType = None
    def display(self) -> str:
        arg_str = self.arg.display() if self.arg else "?"
        ret_str = self.ret.display() if self.ret else "?"
        if isinstance(self.arg, FuncType):
            arg_str = f"({arg_str})"
        return f"{arg_str} -> {ret_str}"

@dataclass
class UnknownType(HaskType):
    reason: str = "type could not be inferred"
    def display(self) -> str:
        return "Unknown"


# --- Diagnostics ---

@dataclass
class TypeDiagnostic:
    """A type checking diagnostic."""
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
class TypeInfo:
    """Type information for a function or expression."""
    name: str
    inferred_type: str
    declared_type: Optional[str] = None
    match: Optional[bool] = None  # None if no declared type

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "inferred_type": self.inferred_type,
            "declared_type": self.declared_type,
            "match": self.match,
        }


@dataclass
class TypeCheckResult:
    """Result of type checking."""
    diagnostics: list[TypeDiagnostic] = field(default_factory=list)
    type_info: list[TypeInfo] = field(default_factory=list)
    success: bool = True

    def to_dict(self) -> dict:
        return {
            "diagnostics": [d.to_dict() for d in self.diagnostics],
            "type_info": [t.to_dict() for t in self.type_info],
            "success": self.success,
        }


# --- Arithmetic & comparison op type rules ---

ARITHMETIC_OPS = {"+", "-", "*", "/", "mod"}
COMPARISON_OPS = {"==", "/=", "<", "<=", ">", ">="}
BOOLEAN_OPS = {"&&", "||"}


def _type_expr_to_hask(te: ast.TypeExpr) -> HaskType:
    """Convert an AST TypeExpr to a HaskType."""
    if isinstance(te, ast.TypeName):
        if te.name == "Int":
            return IntType()
        elif te.name == "Bool":
            return BoolType()
        elif te.name == "Float":
            return FloatType()
        elif te.name == "String":
            return StringType()
        else:
            return UnknownType(reason=f"unknown type '{te.name}'")
    elif isinstance(te, ast.TypeArrow):
        return FuncType(
            arg=_type_expr_to_hask(te.arg_type),
            ret=_type_expr_to_hask(te.return_type),
        )
    return UnknownType()


class TypeChecker:
    """Type checker for HaskOpt programs."""

    def __init__(self):
        self.diagnostics: list[TypeDiagnostic] = []
        self.type_info: list[TypeInfo] = []
        self.env: dict[str, HaskType] = {}
        self.declared_types: dict[str, HaskType] = {}

    def check(self, program: ast.Program) -> TypeCheckResult:
        """Type-check a program."""
        self.diagnostics = []
        self.type_info = []
        self.env = {}
        self.declared_types = {}

        # First pass: collect type signatures
        for decl in program.declarations:
            if isinstance(decl, ast.TypeSignature):
                ht = _type_expr_to_hask(decl.type_expr)
                self.declared_types[decl.name] = ht
                self.env[decl.name] = ht

        # Second pass: collect function names with unknown types (for recursion)
        for decl in program.declarations:
            if isinstance(decl, ast.FunctionDef) and decl.name not in self.env:
                self.env[decl.name] = UnknownType(reason="type not yet inferred")

        # Third pass: check function definitions
        for decl in program.declarations:
            if isinstance(decl, ast.FunctionDef):
                self._check_function(decl)

        has_errors = any(d.severity == "error" for d in self.diagnostics)
        return TypeCheckResult(
            diagnostics=self.diagnostics,
            type_info=self.type_info,
            success=not has_errors,
        )

    def _check_function(self, func: ast.FunctionDef):
        """Type-check a function definition."""
        local_env = dict(self.env)

        # If we have a declared type, use it to type the parameters
        declared = self.declared_types.get(func.name)
        param_types: list[HaskType] = []

        if declared and isinstance(declared, FuncType):
            # Extract parameter types from function type
            current = declared
            for param in func.params:
                if isinstance(current, FuncType):
                    local_env[param] = current.arg
                    param_types.append(current.arg)
                    current = current.ret
                else:
                    local_env[param] = UnknownType()
                    param_types.append(UnknownType())
            expected_return = current
        else:
            # No type signature — all params are Unknown
            for param in func.params:
                local_env[param] = UnknownType(reason=f"no type annotation for '{param}'")
                param_types.append(UnknownType())
            expected_return = None

        # Type-check the body
        body_type = self._infer_expr(func.body, local_env) if func.body else UnknownType()

        # Build inferred function type
        if func.params:
            inferred = body_type
            for pt in reversed(param_types):
                inferred = FuncType(arg=pt, ret=inferred)
        else:
            inferred = body_type

        # Check declared vs inferred
        if declared:
            if not self._types_compatible(declared, inferred):
                loc = func.loc
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message=f"Function '{func.name}' declared as '{declared.display()}' but body infers '{inferred.display()}'",
                    line=loc.line if loc else None,
                    column=loc.column if loc else None,
                ))
            self.type_info.append(TypeInfo(
                name=func.name,
                inferred_type=inferred.display(),
                declared_type=declared.display(),
                match=self._types_compatible(declared, inferred),
            ))
        else:
            self.type_info.append(TypeInfo(
                name=func.name,
                inferred_type=inferred.display(),
            ))

        # Update environment
        self.env[func.name] = inferred

    def _infer_expr(self, expr: ast.Expr, env: dict[str, HaskType]) -> HaskType:
        """Infer the type of an expression."""
        if isinstance(expr, ast.IntLiteral):
            return IntType()
        elif isinstance(expr, ast.FloatLiteral):
            return FloatType()
        elif isinstance(expr, ast.BoolLiteral):
            return BoolType()
        elif isinstance(expr, ast.StringLiteral):
            return StringType()
        elif isinstance(expr, ast.Identifier):
            if expr.name in env:
                return env[expr.name]
            # Don't report here — semantic analyzer handles undefined refs
            return UnknownType(reason=f"'{expr.name}' not in scope")
        elif isinstance(expr, ast.BinaryOp):
            return self._check_binary_op(expr, env)
        elif isinstance(expr, ast.UnaryOp):
            return self._check_unary_op(expr, env)
        elif isinstance(expr, ast.IfExpr):
            return self._check_if_expr(expr, env)
        elif isinstance(expr, ast.FuncApp):
            return self._check_func_app(expr, env)
        elif isinstance(expr, ast.LetExpr):
            return self._check_let_expr(expr, env)
        else:
            return UnknownType(reason=f"unsupported expression type: {type(expr).__name__}")

    def _check_binary_op(self, expr: ast.BinaryOp, env: dict[str, HaskType]) -> HaskType:
        """Check types for binary operations."""
        left_type = self._infer_expr(expr.left, env)
        right_type = self._infer_expr(expr.right, env)

        if expr.op in ARITHMETIC_OPS:
            # Both operands must be numeric
            if isinstance(left_type, BoolType):
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message=f"Cannot use Bool in arithmetic operation '{expr.op}'",
                    line=expr.left.loc.line if expr.left and expr.left.loc else None,
                    column=expr.left.loc.column if expr.left and expr.left.loc else None,
                    suggestion="Use an Int or Float value instead",
                ))
            if isinstance(right_type, BoolType):
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message=f"Cannot use Bool in arithmetic operation '{expr.op}'",
                    line=expr.right.loc.line if expr.right and expr.right.loc else None,
                    column=expr.right.loc.column if expr.right and expr.right.loc else None,
                    suggestion="Use an Int or Float value instead",
                ))
            if isinstance(left_type, StringType) or isinstance(right_type, StringType):
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message=f"Cannot use String in arithmetic operation '{expr.op}'",
                ))
            # If either is Float, result is Float
            if isinstance(left_type, FloatType) or isinstance(right_type, FloatType):
                return FloatType()
            if isinstance(left_type, IntType) and isinstance(right_type, IntType):
                return IntType()
            if isinstance(left_type, UnknownType) or isinstance(right_type, UnknownType):
                return UnknownType()
            return IntType()

        elif expr.op in COMPARISON_OPS:
            # Comparison between compatible types returns Bool
            if not isinstance(left_type, UnknownType) and not isinstance(right_type, UnknownType):
                if type(left_type) != type(right_type):
                    self.diagnostics.append(TypeDiagnostic(
                        severity="warning",
                        message=f"Comparing {left_type.display()} with {right_type.display()} using '{expr.op}'",
                    ))
            return BoolType()

        elif expr.op in BOOLEAN_OPS:
            # Both must be Bool
            if not isinstance(left_type, (BoolType, UnknownType)):
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message=f"Left operand of '{expr.op}' must be Bool, got {left_type.display()}",
                ))
            if not isinstance(right_type, (BoolType, UnknownType)):
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message=f"Right operand of '{expr.op}' must be Bool, got {right_type.display()}",
                ))
            return BoolType()

        return UnknownType()

    def _check_unary_op(self, expr: ast.UnaryOp, env: dict[str, HaskType]) -> HaskType:
        """Check types for unary operations."""
        operand_type = self._infer_expr(expr.operand, env)

        if expr.op == "not":
            if not isinstance(operand_type, (BoolType, UnknownType)):
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message=f"'not' requires Bool, got {operand_type.display()}",
                ))
            return BoolType()
        elif expr.op == "-":
            if isinstance(operand_type, BoolType):
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message="Cannot negate a Bool value",
                ))
            return operand_type if isinstance(operand_type, (IntType, FloatType)) else IntType()

        return UnknownType()

    def _check_if_expr(self, expr: ast.IfExpr, env: dict[str, HaskType]) -> HaskType:
        """Check types for if-then-else expressions."""
        cond_type = self._infer_expr(expr.condition, env)
        then_type = self._infer_expr(expr.then_expr, env)
        else_type = self._infer_expr(expr.else_expr, env)

        # Condition must be Bool
        if not isinstance(cond_type, (BoolType, UnknownType)):
            self.diagnostics.append(TypeDiagnostic(
                severity="error",
                message=f"Condition must be Bool, got {cond_type.display()}",
                suggestion="Use a comparison or boolean expression as the condition",
            ))

        # Then and else branches should have the same type
        if (not isinstance(then_type, UnknownType) and
            not isinstance(else_type, UnknownType) and
            type(then_type) != type(else_type)):
            self.diagnostics.append(TypeDiagnostic(
                severity="warning",
                message=f"'then' branch has type {then_type.display()} but 'else' branch has type {else_type.display()}",
                suggestion="Both branches of an if expression should return the same type",
            ))

        # Return the type of the then branch (or else if then is unknown)
        if isinstance(then_type, UnknownType):
            return else_type
        return then_type

    def _check_func_app(self, expr: ast.FuncApp, env: dict[str, HaskType]) -> HaskType:
        """Check types for function application."""
        func_type = self._infer_expr(expr.func, env)
        arg_type = self._infer_expr(expr.arg, env)

        if isinstance(func_type, FuncType):
            # Check argument type
            if (not isinstance(func_type.arg, UnknownType) and
                not isinstance(arg_type, UnknownType) and
                type(func_type.arg) != type(arg_type)):
                func_name = expr.func.name if isinstance(expr.func, ast.Identifier) else "function"
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message=f"'{func_name}' expects {func_type.arg.display()} but got {arg_type.display()}",
                ))
            return func_type.ret if func_type.ret else UnknownType()
        elif isinstance(func_type, UnknownType):
            return UnknownType()
        else:
            # Trying to apply a non-function
            if isinstance(expr.func, ast.Identifier):
                self.diagnostics.append(TypeDiagnostic(
                    severity="error",
                    message=f"'{expr.func.name}' is not a function (type: {func_type.display()}), cannot apply arguments",
                ))
            return UnknownType()

    def _check_let_expr(self, expr: ast.LetExpr, env: dict[str, HaskType]) -> HaskType:
        """Check types for let expressions."""
        local_env = dict(env)
        for binding in expr.bindings:
            val_type = self._infer_expr(binding.value, local_env)
            local_env[binding.name] = val_type
        return self._infer_expr(expr.body, local_env)

    def _types_compatible(self, declared: HaskType, inferred: HaskType) -> bool:
        """Check if two types are compatible."""
        if isinstance(declared, UnknownType) or isinstance(inferred, UnknownType):
            return True  # Cannot refute compatibility with unknown types
        if type(declared) != type(inferred):
            return False
        if isinstance(declared, FuncType) and isinstance(inferred, FuncType):
            return (self._types_compatible(declared.arg, inferred.arg) and
                    self._types_compatible(declared.ret, inferred.ret))
        return True
