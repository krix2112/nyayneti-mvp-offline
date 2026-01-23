"""
NyayNeti Backend API Tests

Run with: pytest test_api.py -v
"""

import json
import os
import tempfile
from pathlib import Path

import pytest

from app import create_app


@pytest.fixture
def client():
    """Create test client with temporary directories."""
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def sample_pdf_content():
    """Create a minimal valid PDF for testing."""
    # Minimal valid PDF structure
    return b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 100 700 Td (IPC Section 420) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
300
%%EOF"""


class TestHealthEndpoints:
    """Test health and status endpoints."""

    def test_health_endpoint(self, client):
        """Test /api/health returns OK."""
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "ok"
        assert "NyayNeti" in data["message"]

    def test_status_endpoint(self, client):
        """Test /api/status returns model status."""
        resp = client.get("/api/status")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "ok"
        assert "model" in data
        assert "indexed_documents" in data["model"]


class TestQueryEndpoint:
    """Test query/QA endpoint."""

    def test_query_validation_empty(self, client):
        """Test /api/query rejects empty question."""
        resp = client.post("/api/query", json={})
        assert resp.status_code == 400
        data = resp.get_json()
        assert "error" in data

    def test_query_validation_blank(self, client):
        """Test /api/query rejects blank question."""
        resp = client.post("/api/query", json={"question": "   "})
        assert resp.status_code == 400

    def test_query_valid_question(self, client):
        """Test /api/query accepts valid question."""
        resp = client.post(
            "/api/query",
            json={"question": "What are the elements of IPC Section 420?"}
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "answer" in data
        assert "context_snippets" in data


class TestDocumentsEndpoint:
    """Test document listing endpoint."""

    def test_list_documents_empty(self, client):
        """Test /api/documents returns empty list initially."""
        resp = client.get("/api/documents")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "documents" in data
        assert "total" in data

    def test_get_document_not_found(self, client):
        """Test /api/documents/<id> returns 404 for missing doc."""
        resp = client.get("/api/documents/nonexistent.pdf")
        assert resp.status_code == 404


class TestSummaryEndpoint:
    """Test document summary endpoint."""

    def test_summary_validation_empty(self, client):
        """Test /api/summary rejects empty doc_id."""
        resp = client.post("/api/summary", json={})
        assert resp.status_code == 400
        data = resp.get_json()
        assert "error" in data

    def test_summary_not_found(self, client):
        """Test /api/summary returns error for non-indexed doc."""
        resp = client.post("/api/summary", json={"doc_id": "nonexistent.pdf"})
        assert resp.status_code == 404


class TestCitationsEndpoint:
    """Test citation extraction endpoint."""

    def test_citations_validation_empty(self, client):
        """Test /api/citations rejects empty text."""
        resp = client.post("/api/citations", json={})
        assert resp.status_code == 400

    def test_citations_extraction(self, client):
        """Test /api/citations extracts valid citations."""
        text = """
        The Supreme Court in AIR 1997 SC 3011 held that workplace safety
        is a fundamental right. This was further elaborated in (2020) 3 SCC 123.
        """
        resp = client.post("/api/citations", json={"text": text})
        assert resp.status_code == 200
        data = resp.get_json()
        assert "citations" in data
        assert "count" in data
        assert data["count"] >= 1

    def test_citations_no_matches(self, client):
        """Test /api/citations with no citations in text."""
        resp = client.post(
            "/api/citations",
            json={"text": "This text has no legal citations."}
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["count"] == 0


class TestUploadEndpoint:
    """Test PDF upload endpoint."""

    def test_upload_no_file(self, client):
        """Test /api/upload rejects request without file."""
        resp = client.post("/api/upload")
        assert resp.status_code == 400
        assert "error" in resp.get_json()

    def test_upload_empty_filename(self, client):
        """Test /api/upload rejects empty filename."""
        from io import BytesIO
        resp = client.post(
            "/api/upload",
            data={"file": (BytesIO(b"dummy"), "")},
            content_type="multipart/form-data"
        )
        assert resp.status_code == 400

    def test_upload_non_pdf(self, client):
        """Test /api/upload rejects non-PDF files."""
        from io import BytesIO
        resp = client.post(
            "/api/upload",
            data={"file": (BytesIO(b"not a pdf"), "test.txt")},
            content_type="multipart/form-data"
        )
        assert resp.status_code == 400
        assert "PDF" in resp.get_json()["error"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
