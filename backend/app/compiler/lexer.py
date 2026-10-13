"""Lexical analyzer for HaskOpt compiler.

Wraps Lark's lexer to produce structured token information with
line numbers and column positions.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from pathlib import Path
from lark import Lark
from lark.exceptions import UnexpectedCharacters, UnexpectedToken


# Map Lark terminal names to human-readable token types
TOKEN_TYPE_MAP = {
    "IDENT": "IDENTIFIER",
    "INT_LITERAL": "INTEGER",
    "FLOAT_LITERAL": "FLOAT",
    "BOOL_LITERAL": "BOOLEAN",
    "STRING_LITERAL": "STRING",
    "COMMENT": "COMMENT",
    "__ANON_0": "DOUBLE_COLON",    # ::
    "__ANON_1": "ARROW",           # ->
    "__ANON_2": "EQUALS",          # =
    "__ANON_3": "OR",              # ||
    "__ANON_4": "AND",             # &&
    "__ANON_5": "DOUBLE_EQUALS",   # ==
    "__ANON_6": "NOT_EQUALS",      # /=
    "__ANON_7": "LESS_THAN",       # <
    "__ANON_8": "LESS_EQUAL",      # <=
    "__ANON_9": "GREATER_THAN",    # >
    "__ANON_10": "GREATER_EQUAL",  # >=
    "__ANON_11": "PLUS",           # +
    "__ANON_12": "MINUS",          # -
    "__ANON_13": "STAR",           # *
    "__ANON_14": "SLASH",          # /
    "PLUS": "PLUS",
    "MINUS": "MINUS",
    "STAR": "STAR",
    "SLASH": "SLASH",
    "LPAR": "LEFT_PAREN",
    "RPAR": "RIGHT_PAREN",
    "_NL": "NEWLINE",
}

# Keywords in our Haskell subset
KEYWORDS = {
    "if", "then", "else", "let", "in", "where",
    "not", "True", "False", "Int", "Bool", "Float", "String",
    "mod",
}


@dataclass
class Token:
    """A single lexical token."""
    type: str
    value: str
    line: int
    column: int
    end_line: Optional[int] = None
    end_column: Optional[int] = None

    def to_dict(self) -> dict:
        return {
            "type": self.type,
            "value": self.value,
            "line": self.line,
            "column": self.column,
            "end_line": self.end_line,
            "end_column": self.end_column,
        }


@dataclass
class LexerError:
    """A lexer error."""
    message: str
    line: int
    column: int

    def to_dict(self) -> dict:
        return {
            "message": self.message,
            "line": self.line,
            "column": self.column,
        }


@dataclass
class LexResult:
    """Result of lexical analysis."""
    tokens: list[Token]
    errors: list[LexerError]
    success: bool

    def to_dict(self) -> dict:
        return {
            "tokens": [t.to_dict() for t in self.tokens],
            "errors": [e.to_dict() for e in self.errors],
            "success": self.success,
        }


class Lexer:
    """Lexical analyzer for the HaskOpt Haskell subset."""

    def __init__(self):
        grammar_path = Path(__file__).parent / "grammar.lark"
        # Create a Lark parser just to use its lexer
        self._lark = Lark(
            grammar_path.read_text(encoding="utf-8"),
            parser="earley",
            propagate_positions=True,
            maybe_placeholders=False,
        )

    def tokenize(self, source: str) -> LexResult:
        """Tokenize source code and return structured tokens."""
        tokens: list[Token] = []
        errors: list[LexerError] = []

        try:
            # Use Lark's internal lexer
            lexer_state = self._lark.lex(source)
            for tok in lexer_state:
                token_type = self._classify_token(tok)
                if token_type == "NEWLINE":
                    continue  # Skip newlines in token output

                token = Token(
                    type=token_type,
                    value=str(tok),
                    line=tok.line if hasattr(tok, 'line') and tok.line else 1,
                    column=tok.column if hasattr(tok, 'column') and tok.column else 1,
                    end_line=tok.end_line if hasattr(tok, 'end_line') else None,
                    end_column=tok.end_column if hasattr(tok, 'end_column') else None,
                )
                tokens.append(token)

        except UnexpectedCharacters as e:
            errors.append(LexerError(
                message=f"Unexpected character '{source[e.pos_in_stream] if e.pos_in_stream < len(source) else '?'}' at line {e.line}, column {e.column}",
                line=e.line or 1,
                column=e.column or 1,
            ))
        except UnexpectedToken as e:
            errors.append(LexerError(
                message=f"Unexpected token '{e.token}' at line {e.line}, column {e.column}",
                line=e.line or 1,
                column=e.column or 1,
            ))
        except Exception as e:
            errors.append(LexerError(
                message=f"Lexer error: {str(e)}",
                line=1,
                column=1,
            ))

        return LexResult(
            tokens=tokens,
            errors=errors,
            success=len(errors) == 0,
        )

    def _classify_token(self, tok) -> str:
        """Map a Lark token to a human-readable type."""
        tok_type = str(tok.type)

        # Check if it's a keyword
        if tok_type == "IDENT" and str(tok) in KEYWORDS:
            return "KEYWORD"

        # Check if it's a boolean literal
        if tok_type == "BOOL_LITERAL":
            return "BOOLEAN"

        # Map known types
        if tok_type in TOKEN_TYPE_MAP:
            return TOKEN_TYPE_MAP[tok_type]

        # For operator tokens, try to identify by value
        value = str(tok)
        op_map = {
            "+": "PLUS", "-": "MINUS", "*": "STAR", "/": "SLASH",
            "==": "DOUBLE_EQUALS", "/=": "NOT_EQUALS",
            "<": "LESS_THAN", "<=": "LESS_EQUAL",
            ">": "GREATER_THAN", ">=": "GREATER_EQUAL",
            "&&": "AND", "||": "OR",
            "::": "DOUBLE_COLON", "->": "ARROW",
            "=": "EQUALS", "(": "LEFT_PAREN", ")": "RIGHT_PAREN",
            ";": "SEMICOLON",
        }
        if value in op_map:
            return op_map[value]

        return tok_type
