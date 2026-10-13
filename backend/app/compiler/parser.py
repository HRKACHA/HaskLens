"""Parser for HaskOpt compiler.

Uses Lark grammar-based parsing to produce a structured AST.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from pathlib import Path
from lark import Lark
from lark.exceptions import UnexpectedCharacters, UnexpectedToken, UnexpectedInput

from .ast_builder import ASTBuilder
from . import ast_nodes as ast


@dataclass
class ParseError:
    """A parse error with location information."""
    message: str
    line: int
    column: int
    context: Optional[str] = None

    def to_dict(self) -> dict:
        d = {"message": self.message, "line": self.line, "column": self.column}
        if self.context:
            d["context"] = self.context
        return d


@dataclass
class ParseResult:
    """Result of parsing."""
    ast: Optional[ast.Program] = None
    errors: list[ParseError] = field(default_factory=list)
    success: bool = False

    def to_dict(self) -> dict:
        return {
            "ast": self.ast.to_dict() if self.ast else None,
            "errors": [e.to_dict() for e in self.errors],
            "success": self.success,
        }


class Parser:
    """Parser for the HaskOpt Haskell subset."""

    def __init__(self):
        grammar_path = Path(__file__).parent / "grammar.lark"
        self._lark = Lark(
            grammar_path.read_text(encoding="utf-8"),
            parser="earley",
            propagate_positions=True,
            maybe_placeholders=False,
        )
        self._transformer = ASTBuilder()

    def parse(self, source: str) -> ParseResult:
        """Parse source code and return an AST."""
        errors: list[ParseError] = []

        # Ensure source ends with newline for grammar
        if source and not source.endswith("\n"):
            source = source + "\n"

        try:
            tree = self._lark.parse(source)
            program = self._transformer.transform(tree)

            # The transformer might return a single node if there's only one declaration
            if isinstance(program, ast.Program):
                return ParseResult(ast=program, success=True)
            elif isinstance(program, ast.ASTNode):
                return ParseResult(
                    ast=ast.Program(declarations=[program]),
                    success=True,
                )
            else:
                return ParseResult(
                    ast=ast.Program(declarations=[]),
                    success=True,
                )

        except UnexpectedCharacters as e:
            char = source[e.pos_in_stream] if e.pos_in_stream < len(source) else "EOF"
            context = self._get_source_context(source, e.line or 1)
            errors.append(ParseError(
                message=f"Syntax error: unexpected character '{char}'",
                line=e.line or 1,
                column=e.column or 1,
                context=context,
            ))
        except UnexpectedToken as e:
            expected = self._format_expected(e.expected) if e.expected else "valid expression"
            context = self._get_source_context(source, e.line or 1)
            errors.append(ParseError(
                message=f"Syntax error: unexpected '{e.token}', expected {expected}",
                line=e.line or 1,
                column=e.column or 1,
                context=context,
            ))
        except UnexpectedInput as e:
            line = getattr(e, 'line', 1) or 1
            column = getattr(e, 'column', 1) or 1
            errors.append(ParseError(
                message=f"Syntax error: unexpected input",
                line=line,
                column=column,
            ))
        except Exception as e:
            errors.append(ParseError(
                message=f"Parse error: {str(e)}",
                line=1,
                column=1,
            ))

        return ParseResult(errors=errors, success=False)

    def _get_source_context(self, source: str, line: int) -> str:
        """Get a few lines of source around the error for context."""
        lines = source.split("\n")
        start = max(0, line - 2)
        end = min(len(lines), line + 1)
        context_lines = []
        for i in range(start, end):
            prefix = ">> " if i == line - 1 else "   "
            context_lines.append(f"{prefix}{i + 1:3d} | {lines[i]}")
        return "\n".join(context_lines)

    def _format_expected(self, expected: set) -> str:
        """Format expected tokens into a readable string."""
        readable = []
        for exp in list(expected)[:5]:  # Limit to 5 suggestions
            exp = str(exp).strip("'\"")
            if exp.startswith("__ANON"):
                continue
            readable.append(exp)
        if not readable:
            return "valid expression"
        if len(readable) == 1:
            return readable[0]
        return ", ".join(readable[:-1]) + " or " + readable[-1]
