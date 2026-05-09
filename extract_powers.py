import zipfile
import re
import os

epub_path = r'c:\Users\Umesh Shinde\Desktop\Project Brain\7 Powers_ The Foundations of Business Strategy -- Hamilton Helmer -- United States, 2017 -- Deep Strategy LLC -- isbn13 9780998116327 -- c31f5cef53a5ccd51e3d8ca8963ce2e9 -- Anna’s Archive.epub'
output_path = 'powers_principles.txt'

def extract_epub_text(path):
    text = ""
    try:
        with zipfile.ZipFile(path, 'r') as zip_ref:
            # Find all html/xhtml files
            files = [f for f in zip_ref.namelist() if f.endswith(('.html', '.xhtml'))]
            # Sort them (usually helps with order)
            files.sort()
            
            for file in files:
                with zip_ref.open(file) as f:
                    content = f.read().decode('utf-8', errors='ignore')
                    # Very basic HTML stripping
                    # Remove script/style tags first
                    content = re.sub(r'<(script|style).*?>.*?</\1>', '', content, flags=re.DOTALL | re.IGNORECASE)
                    # Strip other tags
                    clean_text = re.sub(r'<[^>]+>', ' ', content)
                    # Normalize whitespace
                    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                    text += clean_text + "\n\n"
        return text
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    print(f"Extracting text from {epub_path}...")
    content = extract_epub_text(epub_path)
    if content.startswith("Error:"):
        print(content)
    else:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Text extracted to {output_path} ({len(content)} characters)")
