"""Diagnostics module for HaskOpt compiler.

Centralizes diagnostic formatting and aggregation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Diagnostic:
    """A unified diagnostic entry."""
    phase: str          # "lexer", "parser", "type_checker", "semantic", "optimizer"
    severity: str       # "error", "warning", "info"
    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    suggestion: Optional[str] = None

    def to_dict(self) -> dict:
        d = {
            "phase": self.phase,
            "severity": self.severity,
            "message": self.message,
            "line": self.line,
            "column": self.column,
        }
        if self.suggestion:
            d["suggestion"] = self.suggestion
        return d


@dataclass
class DiagnosticsSummary:
    """Summary of all diagnostics."""
    diagnostics: list[Diagnostic] = field(default_factory=list)
    error_count: int = 0
    warning_count: int = 0
    info_count: int = 0

    def add(self, diag: Diagnostic):
        self.diagnostics.append(diag)
        if diag.severity == "error":
            self.error_count += 1
        elif diag.severity == "warning":
            self.warning_count += 1
        elif diag.severity == "info":
            self.info_count += 1

    def to_dict(self) -> dict:
        return {
            "diagnostics": [d.to_dict() for d in self.diagnostics],
            "error_count": self.error_count,
            "warning_count": self.warning_count,
            "info_count": self.info_count,
        }
