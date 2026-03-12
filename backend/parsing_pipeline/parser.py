import os
import pypdf
import docx
from docx.document import Document
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl
from docx.table import _Cell, Table
from docx.text.paragraph import Paragraph

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from PDF using layout mode to preserve column structure.
    This helps with tables that don't have borders.
    """
    text = ""
    try:
        with open(file_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for page in reader.pages:
                extracted = page.extract_text(extraction_mode="layout") 
                text += extracted + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")

        try:
             with open(file_path, "rb") as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        except:
            raise e
    return text

def iter_block_items(parent):
    """
    Yield each paragraph and table child within *parent*, in document order.
    Each returned value is an instance of either Table or Paragraph.
    """
    if isinstance(parent, Document):
        parent_elm = parent.element.body
    elif isinstance(parent, _Cell):
        parent_elm = parent._tc
    else:
        raise ValueError("something's not right")

    for child in parent_elm.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl):
            yield Table(child, parent)

def extract_text_from_docx(file_path: str) -> str:
    """
    Extracts text from DOCX, iterating over paragraphs AND tables in order.
    Tables are converted to a Markdown-like pipe format | Cell | Cell |.
    """
    text = ""
    try:
        doc = docx.Document(file_path)
        
        for block in iter_block_items(doc):
            if isinstance(block, Paragraph):
                text += block.text + "\n"
            elif isinstance(block, Table):

                text += "\n" # Spacing before table
                for row in block.rows:
                    row_data = []
                    for cell in row.cells:
                        cell_text = cell.text.strip().replace("\n", " ")
                        row_data.append(cell_text)
                    text += "| " + " | ".join(row_data) + " |\n"
                text += "\n" # Spacing after table
                
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        raise e
    return text

def extract_text(file_path: str, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif filename.lower().endswith(".docx"):
        return extract_text_from_docx(file_path)
    elif filename.lower().endswith(".txt"):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    else:
        raise ValueError("Unsupported file format")
