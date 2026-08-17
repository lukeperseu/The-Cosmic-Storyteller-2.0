import sys

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // Some proxies need padding to start streaming
      res.write(': padding\\n\\n');

      const sendStatus = (msg: string) => {
          res.write(`data: ${JSON.stringify({ status: msg })}\\n\\n`);
          if (typeof (res as any).flush === 'function') (res as any).flush();
      };
      const sendData = (obj: any) => {
          res.write(`data: ${JSON.stringify(obj)}\\n\\n`);
          if (typeof (res as any).flush === 'function') (res as any).flush();
      };
"""

content = content.replace("""
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const sendStatus = (msg: string) => res.write(`data: ${JSON.stringify({ status: msg })}\\n\\n`);
      const sendData = (obj: any) => res.write(`data: ${JSON.stringify(obj)}\\n\\n`);
""", replacement)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched server.ts SSE headers")
