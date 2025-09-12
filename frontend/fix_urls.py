#!/usr/bin/env python3
import os
import re

def fix_api_urls(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace '${API_BASE_URL}...' with `${API_BASE_URL}...`
    original_content = content
    content = re.sub(r"'(\$\{API_BASE_URL\}[^']*)'", r'`\1`', content)
    
    # Check if we need to add import
    has_api_base_url = '${API_BASE_URL}' in content
    has_import = 'API_BASE_URL' in content and 'import' in content
    
    if has_api_base_url and not has_import:
        # Add import after existing imports
        lines = content.split('\n')
        import_added = False
        for i, line in enumerate(lines):
            if line.strip().startswith('import') and not import_added:
                # Find the last import line
                j = i
                while j < len(lines) and (lines[j].strip().startswith('import') or lines[j].strip() == ''):
                    j += 1
                # Insert import before the next non-import line
                lines.insert(j, "import { API_BASE_URL } from '../config/api.js';")
                import_added = True
                break
        if import_added:
            content = '\n'.join(lines)
    
    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {file_path}")

# Walk through the src directory
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            file_path = os.path.join(root, file)
            fix_api_urls(file_path)