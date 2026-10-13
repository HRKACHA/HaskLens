"""API routes for HaskOpt backend."""

from fastapi import APIRouter, HTTPException
from ..compiler.models import CompileRequest, CompileResponse, HealthResponse
from ..compiler.compiler import Compiler

router = APIRouter(prefix="/api")
compiler = Compiler()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health status."""
    return HealthResponse(
        status="healthy",
        service="HaskLens Compiler API",
        version="1.1.0",
    )


@router.post("/compile")
async def compile_source(request: CompileRequest):
    """Compile and analyze Haskell source code."""
    if not request.source or not request.source.strip():
        raise HTTPException(
            status_code=400,
            detail="Source code cannot be empty",
        )

    try:
        result = compiler.compile(
            source=request.source,
            entry_function=request.entry_function,
            example_inputs=request.example_inputs,
        )
        return result
    except Exception as e:
        # Don't return a 500 for user code errors — return structured error
        return {
            "success": False,
            "status": "internal_error",
            "source": request.source,
            "error": f"Internal compiler error: {str(e)}",
            "diagnostics": {
                "diagnostics": [{
                    "phase": "compiler",
                    "severity": "error",
                    "message": str(e),
                    "line": None,
                    "column": None,
                }],
                "error_count": 1,
                "warning_count": 0,
                "info_count": 0,
            },
        }
