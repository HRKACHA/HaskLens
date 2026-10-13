"""Pydantic models for HaskOpt API request/response validation."""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, Any


class CompileRequest(BaseModel):
    """Request to compile and analyze Haskell source code."""
    source: str = Field(..., description="Haskell source code to analyze")
    entry_function: Optional[str] = Field(None, description="Function to evaluate")
    example_inputs: Optional[list] = Field(None, description="Example inputs for evaluation")


class CompileResponse(BaseModel):
    """Full compilation response."""
    success: bool
    status: str
    source: str

    # Phase results
    tokens: Optional[Any] = None
    parse_errors: Optional[Any] = None
    ast: Optional[Any] = None
    optimized_ast: Optional[Any] = None
    optimized_source: Optional[str] = None

    # Analysis
    type_analysis: Optional[Any] = None
    semantic_analysis: Optional[Any] = None
    recursion_analysis: Optional[Any] = None
    call_graph: Optional[Any] = None
    optimization_log: Optional[Any] = None
    optimization_count: int = 0

    # Evaluation
    evaluation: Optional[Any] = None
    verification: Optional[Any] = None

    # Diagnostics
    diagnostics: Optional[Any] = None

    # Timing
    phase_timings: Optional[dict[str, float]] = None

    # Errors
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
