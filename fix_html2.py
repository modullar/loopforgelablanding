import re
with open('index.html', 'r') as f:
    content = f.read()
content = content.replace("<-- Preferences", "<!--")
with open('index.html', 'w') as f:
    f.write(content)
