import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
    let buffer = "";
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
            
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\\n');
        buffer = lines.pop() || "";
        
        for (let line of lines) {
          line = line.trim();
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              lastEventTime = Date.now(); // reset delay timer on any event

              if (data.status) {
                // Update UI with status from server
                if (contentDiv) {
                  let cl = 'text-slate-200';
                  if (data.status.includes('Aurora:')) cl = 'text-red-300 font-bold';
                  else if (data.status.includes('Tomo')) cl = 'text-cyan-300';
                  else if (data.status.includes('Íris')) cl = 'text-purple-300';
                  contentDiv.innerHTML = `<span class="animate-pulse ${cl}">${data.status}</span>`;
                }
"""

content = content.replace("""
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
            
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split(String.fromCharCode(10));
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              lastEventTime = Date.now(); // reset delay timer on any event

              if (data.status) {
                // Update UI with status from server
                if (contentDiv) {
                  let cl = 'text-slate-200';
                  if (data.status.includes('Aurora:')) cl = 'text-red-300 font-bold';
                  else if (data.status.includes('Tomo')) cl = 'text-cyan-300';
                  else if (data.status.includes('Íris')) cl = 'text-purple-300';
                  contentDiv.innerHTML = `<span class="animate-pulse ${cl}">${data.status}</span>`;
                }
""", replacement)

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched auth-app.ts SSE logic")
