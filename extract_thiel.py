import PyPDF2
import os

pdf_path = r'c:\Users\Umesh Shinde\Desktop\Project Brain\zero to one.pdf'

def extract_text(path):
    try:
        with open(path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            # Extract first 60 pages to get the core logic
            for i in range(min(len(reader.pages), 60)):
                text += reader.pages[i].extract_text()
            return text
    except Exception as e:
        return str(e)

content = extract_text(pdf_path)
with open('thiel_principles.txt', 'w', encoding='utf-8') as f:
    f.write(content)

print("Text extracted to thiel_principles.txt")
