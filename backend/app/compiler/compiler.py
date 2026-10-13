"""Main compiler orchestrator for HaskOpt.

Coordinates all compilation phases and produces a unified result.
"""

from __future__ import annotations
import time
from typing import Optional

from .lexer import Lexer
from .parser import Parser
from .type_checker import TypeChecker
from .semantic_analyzer import SemanticAnalyzer
from .optimizer import Optimizer
from .recursion_analyzer import RecursionAnalyzer
from .call_graph import CallGraphBuilder
from .pretty_printer import PrettyPrinter
from .evaluator import Evaluator
from .diagnostics import Diagnostic, DiagnosticsSummary


class Compiler:
    """HaskOpt compiler orchestrator."""

    def __init__(self):
        self.lexer = Lexer()
        self.parser = Parser()
        self.type_checker = TypeChecker()
        self.semantic_analyzer = SemanticAnalyzer()
        self.optimizer = Optimizer()
        self.recursion_analyzer = RecursionAnalyzer()
        self.call_graph_builder = CallGraphBuilder()
        self.pretty_printer = PrettyPrinter()
        self.evaluator = Evaluator()

    def compile(self, source: str, entry_function: Optional[str] = None,
                example_inputs: Optional[list] = None) -> dict:
        """Run the full compilation pipeline."""
        timings = {}
        all_diagnostics = DiagnosticsSummary()
        result = {
            "success": False,
            "status": "error",
            "source": source,
        }

        # --- Phase 1: Lexical Analysis ---
        t0 = time.perf_counter()
        lex_result = self.lexer.tokenize(source)
        timings["lexer"] = round((time.perf_counter() - t0) * 1000, 2)

        result["tokens"] = lex_result.to_dict()

        for err in lex_result.errors:
            all_diagnostics.add(Diagnostic(
                phase="lexer", severity="error",
                message=err.message, line=err.line, column=err.column,
            ))

        # --- Phase 2: Parsing ---
        t0 = time.perf_counter()
        parse_result = self.parser.parse(source)
        timings["parser"] = round((time.perf_counter() - t0) * 1000, 2)

        result["parse_errors"] = [e.to_dict() for e in parse_result.errors]

        for err in parse_result.errors:
            all_diagnostics.add(Diagnostic(
                phase="parser", severity="error",
                message=err.message, line=err.line, column=err.column,
            ))

        if not parse_result.success or parse_result.ast is None:
            result["diagnostics"] = all_diagnostics.to_dict()
            result["phase_timings"] = timings
            result["status"] = "parse_error"
            return result

        # --- Phase 3: AST Generation ---
        t0 = time.perf_counter()
        result["ast"] = parse_result.ast.to_dict()
        timings["ast_generation"] = round((time.perf_counter() - t0) * 1000, 2)

        # --- Phase 4: Type Checking ---
        t0 = time.perf_counter()
        type_result = self.type_checker.check(parse_result.ast)
        timings["type_checker"] = round((time.perf_counter() - t0) * 1000, 2)

        result["type_analysis"] = type_result.to_dict()

        for diag in type_result.diagnostics:
            all_diagnostics.add(Diagnostic(
                phase="type_checker", severity=diag.severity,
                message=diag.message, line=diag.line, column=diag.column,
                suggestion=diag.suggestion,
            ))

        # --- Phase 5: Semantic Analysis ---
        t0 = time.perf_counter()
        semantic_result = self.semantic_analyzer.analyze(parse_result.ast)
        timings["semantic_analyzer"] = round((time.perf_counter() - t0) * 1000, 2)

        result["semantic_analysis"] = semantic_result.to_dict()

        for diag in semantic_result.diagnostics:
            all_diagnostics.add(Diagnostic(
                phase="semantic", severity=diag.severity,
                message=diag.message, line=diag.line, column=diag.column,
                suggestion=diag.suggestion,
            ))

        # --- Phase 6: Recursion Analysis ---
        t0 = time.perf_counter()
        recursion_result = self.recursion_analyzer.analyze(parse_result.ast)
        timings["recursion_analyzer"] = round((time.perf_counter() - t0) * 1000, 2)

        result["recursion_analysis"] = recursion_result.to_dict()

        # --- Call Graph ---
        t0 = time.perf_counter()
        call_graph = self.call_graph_builder.build(parse_result.ast)
        timings["call_graph"] = round((time.perf_counter() - t0) * 1000, 2)

        result["call_graph"] = call_graph.to_dict()

        # --- Phase 7: Optimization ---
        t0 = time.perf_counter()
        opt_result = self.optimizer.optimize(parse_result.ast)
        timings["optimizer"] = round((time.perf_counter() - t0) * 1000, 2)

        result["optimized_ast"] = opt_result.optimized_ast.to_dict() if opt_result.optimized_ast else None
        result["optimization_log"] = [e.to_dict() for e in opt_result.log]
        result["optimization_count"] = opt_result.total_optimizations

        # --- Phase 8: Pretty Printing ---
        t0 = time.perf_counter()
        if opt_result.optimized_ast:
            result["optimized_source"] = self.pretty_printer.print_program(opt_result.optimized_ast)
        timings["pretty_printer"] = round((time.perf_counter() - t0) * 1000, 2)

        # --- Phase 9: Evaluation & Verification ---
        if entry_function and example_inputs is not None:
            t0 = time.perf_counter()
            try:
                # Evaluate with original
                eval_result = self.evaluator.evaluate_function(
                    parse_result.ast, entry_function, example_inputs
                )
                result["evaluation"] = eval_result.to_dict()

                # Verify optimization
                if opt_result.optimized_ast and opt_result.total_optimizations > 0:
                    test_cases = [example_inputs]  # Single test case from request
                    verification = self.evaluator.verify_optimization(
                        parse_result.ast, opt_result.optimized_ast,
                        entry_function, test_cases,
                    )
                    result["verification"] = verification.to_dict()
            except Exception as e:
                result["evaluation"] = {"success": False, "error": str(e)}
            timings["evaluator"] = round((time.perf_counter() - t0) * 1000, 2)

        # --- Finalize ---
        result["diagnostics"] = all_diagnostics.to_dict()
        result["phase_timings"] = timings

        has_errors = all_diagnostics.error_count > 0
        result["success"] = not has_errors
        result["status"] = "success" if not has_errors else "completed_with_errors"

        return result
