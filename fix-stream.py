import sys
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r"""
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        const contentDiv = replyDiv.querySelector('.message-content');
        contentDiv.innerHTML = "";
        
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop(); // keep incomplete chunk
          
          for (let line of lines) {
            if (line.startsWith('data: ')) {
               const dataStr = line.substring(6);
               if (dataStr.trim() === '[DONE]') continue;
               try {
                  const data = JSON.parse(dataStr);
                  if (data.text) {
                     fullText += data.text;
                     contentDiv.innerHTML = parseChatbotResponse(fullText);
                     feed.scrollTop = feed.scrollHeight;
                  } else if (data.done) {
                     // streaming complete
                  } else if (data.error) {
                     contentDiv.innerHTML = "Erro: " + data.error;
                  }
               } catch(e) {
                  console.error("Parse error on chunk:", dataStr);
               }
            }
          }
        }
        window.chatbotHistory.push({ role: 'model', text: fullText });
"""

old_regex = r"        const reader = res\.body\?\.getReader\(\);[\s\S]*?window\.chatbotHistory\.push\(\{ role: 'model', text: fullText \}\);"
content = re.sub(old_regex, replacement.strip(), content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed streaming parser")
