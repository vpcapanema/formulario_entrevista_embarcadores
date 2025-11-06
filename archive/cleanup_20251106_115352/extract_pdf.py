import PyPDF2
import sys


def extract_text_from_pdf(pdf_path):
    """Extrai todo o texto de um arquivo PDF."""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)

            print("=== DOCUMENTO PDF ===")
            print(f"Número de páginas: {num_pages}\n")
            print("=" * 80)

            full_text = []

            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()

                print(f"\n--- PÁGINA {page_num + 1} ---\n")
                print(text)
                print("\n" + "=" * 80)

                full_text.append(text)

            return "\n\n".join(full_text)

    except Exception as e:
        print(f"Erro ao ler o PDF: {e}", file=sys.stderr)
        return None


if __name__ == "__main__":
    pdf_file = (
        r"d:\SISTEMA_FORMULARIOS_ENTREVISTA\assets"
        r"\Entrevistas embarcadores - Rev02 1.pdf"
    )
    extract_text_from_pdf(pdf_file)
