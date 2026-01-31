"""
Enhanced PDF Processor for NyayNeti

Provides PDF text extraction with optional coordinate extraction 
for citation highlighting in the PDF viewer.

Supports:
- Basic text extraction (pdfminer)
- Coordinate extraction for highlighting (PyMuPDF/fitz)
- Page-level text with bounding boxes
"""

from __future__ import annotations

import io
import logging
from typing import List, Dict, Any, Optional, Tuple

from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams

# Try to import PyMuPDF for coordinate extraction
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

logger = logging.getLogger("pdf_processor")


def extract_text_from_pdf(path: str) -> str:
    """
    Extract plain text from a PDF for downstream processing.

    This is intentionally simple and optimized for hackathon usage.
    """
    output = io.StringIO()
    laparams = LAParams()
    with open(path, "rb") as f:
        extract_text_to_fp(f, output, laparams=laparams, output_type="text", codec="utf-8")
    return output.getvalue()


def split_text_into_chunks(text: str, max_chars: int = 1500) -> List[str]:
    """
    Naive text chunking by characters with paragraph boundary awareness.
    """
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0

    for p in paragraphs:
        if current_len + len(p) > max_chars and current:
            chunks.append("\n\n".join(current))
            current = [p]
            current_len = len(p)
        else:
            current.append(p)
            current_len += len(p)

    if current:
        chunks.append("\n\n".join(current))

    return chunks


def extract_text_with_coordinates(pdf_path: str) -> List[Dict[str, Any]]:
    """
    Extract text along with bounding box coordinates for highlighting.
    
    Uses PyMuPDF (fitz) to get precise text positions.
    Falls back to basic extraction if PyMuPDF not available.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        List of dicts with:
        - page: Page number (1-indexed)
        - text: Text content
        - bbox: Bounding box {x, y, width, height}
    """
    if not PYMUPDF_AVAILABLE:
        logger.warning("PyMuPDF not available. Using basic extraction without coordinates.")
        text = extract_text_from_pdf(pdf_path)
        chunks = split_text_into_chunks(text)
        return [
            {
                "page": 1,
                "text": chunk,
                "bbox": None,
                "line_num": i
            }
            for i, chunk in enumerate(chunks)
        ]
    
    try:
        doc = fitz.open(pdf_path)
        chunks_with_coords = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Get text blocks with positions
            blocks = page.get_text("dict")["blocks"]
            
            for block_idx, block in enumerate(blocks):
                if block.get('type') == 0:  # Text block
                    block_text_parts = []
                    block_bbox = block.get('bbox', [0, 0, 0, 0])
                    
                    for line in block.get('lines', []):
                        line_text = ""
                        for span in line.get('spans', []):
                            line_text += span.get('text', '')
                        if line_text.strip():
                            block_text_parts.append(line_text.strip())
                    
                    if block_text_parts:
                        text = " ".join(block_text_parts)
                        
                        chunks_with_coords.append({
                            "page": page_num + 1,  # 1-indexed
                            "text": text,
                            "bbox": {
                                "x": block_bbox[0],
                                "y": block_bbox[1],
                                "width": block_bbox[2] - block_bbox[0],
                                "height": block_bbox[3] - block_bbox[1]
                            },
                            "block_idx": block_idx
                        })
        
        doc.close()
        logger.info(f"Extracted {len(chunks_with_coords)} text blocks with coordinates from {pdf_path}")
        return chunks_with_coords
        
    except Exception as e:
        logger.error(f"Error extracting coordinates: {e}")
        # Fallback to basic extraction
        text = extract_text_from_pdf(pdf_path)
        chunks = split_text_into_chunks(text)
        return [
            {
                "page": 1,
                "text": chunk,
                "bbox": None,
                "line_num": i
            }
            for i, chunk in enumerate(chunks)
        ]


def get_pdf_page_count(pdf_path: str) -> int:
    """Get the number of pages in a PDF."""
    if PYMUPDF_AVAILABLE:
        try:
            doc = fitz.open(pdf_path)
            count = len(doc)
            doc.close()
            return count
        except Exception as e:
            logger.error(f"Error getting page count: {e}")
            return 1
    return 1


def search_text_in_pdf(pdf_path: str, search_text: str) -> List[Dict[str, Any]]:
    """
    Search for text in PDF and return locations with bounding boxes.
    
    Args:
        pdf_path: Path to PDF file
        search_text: Text to search for
        
    Returns:
        List of matches with page, bbox, and context
    """
    if not PYMUPDF_AVAILABLE:
        logger.warning("PyMuPDF not available for text search")
        return []
    
    try:
        doc = fitz.open(pdf_path)
        matches = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Search for text
            text_instances = page.search_for(search_text)
            
            for inst in text_instances:
                matches.append({
                    "page": page_num + 1,
                    "bbox": {
                        "x": inst.x0,
                        "y": inst.y0,
                        "width": inst.x1 - inst.x0,
                        "height": inst.y1 - inst.y0
                    },
                    "text": search_text
                })
        
        doc.close()
        return matches
        
    except Exception as e:
        logger.error(f"Error searching PDF: {e}")
        return []


def get_page_text(pdf_path: str, page_num: int) -> str:
    """
    Get text from a specific page.
    
    Args:
        pdf_path: Path to PDF
        page_num: Page number (1-indexed)
        
    Returns:
        Text content of the page
    """
    if not PYMUPDF_AVAILABLE:
        # Fallback - return all text
        return extract_text_from_pdf(pdf_path)
    
    try:
        doc = fitz.open(pdf_path)
        if page_num < 1 or page_num > len(doc):
            doc.close()
            return ""
        
        page = doc[page_num - 1]
        text = page.get_text()
        doc.close()
        return text
        
    except Exception as e:
        logger.error(f"Error getting page text: {e}")
        return ""


def split_text_into_chunks_with_pages(
    pdf_path: str, 
    max_chars: int = 1500
) -> List[Dict[str, Any]]:
    """
    Split PDF text into chunks while preserving page information.
    
    Args:
        pdf_path: Path to PDF file
        max_chars: Maximum characters per chunk
        
    Returns:
        List of chunks with page numbers and optional bounding boxes
    """
    # Get text with coordinates
    raw_blocks = extract_text_with_coordinates(pdf_path)
    
    chunks = []
    current_chunk_text = []
    current_chunk_pages = set()
    current_chunk_bboxes = []
    current_len = 0
    
    for block in raw_blocks:
        text = block.get('text', '').strip()
        page = block.get('page', 1)
        bbox = block.get('bbox')
        
        if not text:
            continue
        
        if current_len + len(text) > max_chars and current_chunk_text:
            # Save current chunk
            chunks.append({
                "text": " ".join(current_chunk_text),
                "pages": sorted(list(current_chunk_pages)),
                "primary_page": min(current_chunk_pages) if current_chunk_pages else 1,
                "bboxes": current_chunk_bboxes[:5]  # Keep first 5 bboxes
            })
            
            # Start new chunk
            current_chunk_text = [text]
            current_chunk_pages = {page}
            current_chunk_bboxes = [bbox] if bbox else []
            current_len = len(text)
        else:
            current_chunk_text.append(text)
            current_chunk_pages.add(page)
            if bbox:
                current_chunk_bboxes.append(bbox)
            current_len += len(text)
    
    # Add last chunk
    if current_chunk_text:
        chunks.append({
            "text": " ".join(current_chunk_text),
            "pages": sorted(list(current_chunk_pages)),
            "primary_page": min(current_chunk_pages) if current_chunk_pages else 1,
            "bboxes": current_chunk_bboxes[:5]
        })
    
    logger.info(f"Split PDF into {len(chunks)} chunks with page info")
    return chunks

