"""Bounded evaluator for HaskOpt compiler.

Evaluates a subset of HaskOpt AST within strict bounds to compare
original and optimized programs for semantic preservation testing.

This evaluator operates on AST nodes — it does not use Python eval(),
shell commands, or dynamically generated Python code.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Optional
from . import ast_nodes as ast


MAX_RECURSION_DEPTH = 200
MAX_EVAL_STEPS = 10000


class EvalError(Exception):
    """Evaluation error."""
    pass


class EvalLimitExceeded(EvalError):
    """Evaluation limits exceeded."""
    pass


@dataclass
class EvalResult:
    """Result of evaluating an expression."""
    value: Any = None
    type_name: str = ""
    success: bool = True
    error: Optional[str] = None
    steps: int = 0

    def to_dict(self) -> dict:
        d = {
            "value": self.value if self.success else None,
            "type": self.type_name,
            "success": self.success,
            "steps": self.steps,
        }
        if self.error:
            d["error"] = self.error
        return d


@dataclass
class VerificationResult:
    """Result of verifying optimization correctness."""
    function_name: str = ""
    test_inputs: list = field(default_factory=list)
    results: list = field(default_factory=list)
    all_match: bool = True
    message: str = ""
    could_verify: bool = True

    def to_dict(self) -> dict:
        return {
            "function_name": self.function_name,
            "test_inputs": self.test_inputs,
            "results": self.results,
            "all_match": self.all_match,
            "message": self.message,
            "could_verify": self.could_verify,
        }


class Evaluator:
    """Bounded AST evaluator for HaskOpt programs."""

    def __init__(self):
        self._steps = 0
        self._depth = 0

    def evaluate_function(self, program: ast.Program, func_name: str,
                          args: list) -> EvalResult:
        """Evaluate a function with given arguments."""
        self._steps = 0
        self._depth = 0

        # Build environment with all function definitions
        env = {}
        target_func = None
        for decl in program.declarations:
            if isinstance(decl, ast.FunctionDef):
                env[decl.name] = decl
                if decl.name == func_name:
                    target_func = decl

        if target_func is None:
            return EvalResult(
                success=False,
                error=f"Function '{func_name}' not found",
            )

        if len(args) != len(target_func.params):
            return EvalResult(
                success=False,
                error=f"Function '{func_name}' expects {len(target_func.params)} argument(s), got {len(args)}",
            )

        # Bind arguments
        local_env = dict(env)
        for param, arg_val in zip(target_func.params, args):
            local_env[param] = arg_val

        try:
            value = self._eval(target_func.body, local_env)
            return EvalResult(
                value=value,
                type_name=type(value).__name__,
                success=True,
                steps=self._steps,
            )
        except EvalLimitExceeded as e:
            return EvalResult(
                success=False,
                error=str(e),
                steps=self._steps,
            )
        except EvalError as e:
            return EvalResult(
                success=False,
                error=str(e),
                steps=self._steps,
            )
        except Exception as e:
            return EvalResult(
                success=False,
                error=f"Evaluation error: {str(e)}",
                steps=self._steps,
            )

    def verify_optimization(self, original: ast.Program, optimized: ast.Program,
                            func_name: str, test_inputs: list[list]) -> VerificationResult:
        """Verify that original and optimized programs produce the same results."""
        result = VerificationResult(
            function_name=func_name,
            test_inputs=test_inputs,
        )

        if not test_inputs:
            result.could_verify = False
            result.message = "No test inputs provided for verification"
            return result

        all_match = True
        for inputs in test_inputs:
            orig_result = self.evaluate_function(original, func_name, inputs)
            opt_result = self.evaluate_function(optimized, func_name, inputs)

            match = False
            if orig_result.success and opt_result.success:
                match = orig_result.value == opt_result.value
            elif not orig_result.success and not opt_result.success:
                match = True  # Both fail — consistent behavior
            else:
                match = False

            if not match:
                all_match = False

            result.results.append({
                "inputs": inputs,
                "original": orig_result.to_dict(),
                "optimized": opt_result.to_dict(),
                "match": match,
            })

        result.all_match = all_match
        if all_match:
            result.message = f"All {len(test_inputs)} test case(s) produce matching results"
        else:
            result.message = "Some test cases produce different results between original and optimized versions"

        return result

    def _eval(self, expr: ast.Expr, env: dict) -> Any:
        """Evaluate an AST expression."""
        self._steps += 1
        if self._steps > MAX_EVAL_STEPS:
            raise EvalLimitExceeded(
                f"Evaluation exceeded {MAX_EVAL_STEPS} steps limit"
            )

        if isinstance(expr, ast.IntLiteral):
            return expr.value

        elif isinstance(expr, ast.FloatLiteral):
            return expr.value

        elif isinstance(expr, ast.BoolLiteral):
            return expr.value

        elif isinstance(expr, ast.StringLiteral):
            return expr.value

        elif isinstance(expr, ast.Identifier):
            if expr.name in env:
                val = env[expr.name]
                if isinstance(val, ast.FunctionDef):
                    # Return the function itself for partial application
                    return val
                return val
            raise EvalError(f"Undefined variable: '{expr.name}'")

        elif isinstance(expr, ast.BinaryOp):
            return self._eval_binop(expr, env)

        elif isinstance(expr, ast.UnaryOp):
            return self._eval_unary(expr, env)

        elif isinstance(expr, ast.IfExpr):
            cond = self._eval(expr.condition, env)
            if not isinstance(cond, bool):
                raise EvalError(f"Condition must be Bool, got {type(cond).__name__}")
            if cond:
                return self._eval(expr.then_expr, env)
            else:
                return self._eval(expr.else_expr, env)

        elif isinstance(expr, ast.FuncApp):
            return self._eval_app(expr, env)

        elif isinstance(expr, ast.LetExpr):
            local_env = dict(env)
            for binding in expr.bindings:
                local_env[binding.name] = self._eval(binding.value, local_env)
            return self._eval(expr.body, local_env)

        raise EvalError(f"Cannot evaluate: {type(expr).__name__}")

    def _eval_binop(self, expr: ast.BinaryOp, env: dict) -> Any:
        """Evaluate a binary operation."""
        left = self._eval(expr.left, env)
        right = self._eval(expr.right, env)

        try:
            if expr.op == "+":
                return left + right
            elif expr.op == "-":
                return left - right
            elif expr.op == "*":
                return left * right
            elif expr.op == "/":
                if right == 0:
                    raise EvalError("Division by zero")
                if isinstance(left, int) and isinstance(right, int):
                    return left // right
                return left / right
            elif expr.op == "mod":
                if right == 0:
                    raise EvalError("Modulo by zero")
                return left % right
            elif expr.op == "==":
                return left == right
            elif expr.op == "/=":
                return left != right
            elif expr.op == "<":
                return left < right
            elif expr.op == "<=":
                return left <= right
            elif expr.op == ">":
                return left > right
            elif expr.op == ">=":
                return left >= right
            elif expr.op == "&&":
                return left and right
            elif expr.op == "||":
                return left or right
        except TypeError as e:
            raise EvalError(f"Type error in '{expr.op}': {str(e)}")

        raise EvalError(f"Unknown operator: '{expr.op}'")

    def _eval_unary(self, expr: ast.UnaryOp, env: dict) -> Any:
        """Evaluate a unary operation."""
        operand = self._eval(expr.operand, env)
        if expr.op == "not":
            if not isinstance(operand, bool):
                raise EvalError(f"'not' requires Bool, got {type(operand).__name__}")
            return not operand
        elif expr.op == "-":
            return -operand
        raise EvalError(f"Unknown unary operator: '{expr.op}'")

    def _eval_app(self, expr: ast.FuncApp, env: dict) -> Any:
        """Evaluate function application."""
        # Collect all arguments
        args = []
        func_expr = expr
        while isinstance(func_expr, ast.FuncApp):
            args.append(func_expr.arg)
            func_expr = func_expr.func

        # Evaluate the function
        func = self._eval(func_expr, env)
        if not isinstance(func, ast.FunctionDef):
            raise EvalError(
                f"Cannot apply non-function value of type {type(func).__name__}"
            )

        # Evaluate arguments (in reverse since we collected them backwards)
        arg_vals = []
        for arg in reversed(args):
            arg_vals.append(self._eval(arg, env))

        if len(arg_vals) != len(func.params):
            raise EvalError(
                f"Function '{func.name}' expects {len(func.params)} argument(s), got {len(arg_vals)}"
            )

        # Check recursion depth
        self._depth += 1
        if self._depth > MAX_RECURSION_DEPTH:
            raise EvalLimitExceeded(
                f"Recursion depth exceeded {MAX_RECURSION_DEPTH}"
            )

        try:
            # Bind arguments and evaluate body
            local_env = dict(env)
            for param, val in zip(func.params, arg_vals):
                local_env[param] = val
            return self._eval(func.body, local_env)
        finally:
            self._depth -= 1
