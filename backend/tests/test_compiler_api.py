"""Tests for the end-to-end compiler pipeline and API routes."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi.testclient import TestClient
from app.compiler.compiler import Compiler
from app.main import app

compiler = Compiler()
client = TestClient(app)


def test_full_compiler_pipeline():
    code = """
-- Test program
double x = x * 2
calc x = double x + (5 + 3) * 0 + x * 1
"""
    res = compiler.compile(code, entry_function="calc", example_inputs=[10])
    assert res["success"]
    assert res["status"] == "success"
    assert "tokens" in res
    assert "ast" in res
    assert "type_analysis" in res
    assert "semantic_analysis" in res
    assert "recursion_analysis" in res
    assert "call_graph" in res
    assert "optimized_source" in res
    assert "optimization_count" in res
    assert res["optimization_count"] > 0
    assert "evaluation" in res
    assert res["evaluation"]["success"]
    assert "verification" in res


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_api_compile_valid():
    response = client.post("/api/compile", json={
        "source": "fact n = if n == 0 then 1 else n * fact (n - 1)",
        "entry_function": "fact",
        "example_inputs": [4]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"]
    assert data["evaluation"]["value"] == 24


def test_api_compile_syntax_error():
    response = client.post("/api/compile", json={
        "source": "fact n = +",
    })
    assert response.status_code == 200
    data = response.json()
    assert not data["success"]
    assert data["status"] == "parse_error"
    assert data["diagnostics"]["error_count"] > 0


def test_api_compile_empty_source():
    response = client.post("/api/compile", json={
        "source": "   ",
    })
    assert response.status_code == 400
