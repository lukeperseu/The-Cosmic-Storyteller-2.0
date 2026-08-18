import sys
import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Make `app` global to the file so we can export it synchronously
content = content.replace("async function startServer() {\n  const app = express();", "const app = express();\n\nasync function startServer() {")

# Remove the inner module.exports
content = content.replace("  // Export for Vercel\n  module.exports = app;\n}", "}\n\n// Export for Vercel\nmodule.exports = app;")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
