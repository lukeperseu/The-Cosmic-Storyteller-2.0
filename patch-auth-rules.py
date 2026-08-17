import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

types_to_add = """
    executeRulesSearch: (e: Event) => Promise<void>;
"""

if "executeRulesSearch:" not in content:
    content = content.replace("filterRulesSearch: (query: string) => void;", "filterRulesSearch: (query: string) => void;\n    executeRulesSearch: (e: Event) => Promise<void>;")

func_impl = """
window.executeRulesSearch = async function(e: Event) {
  e.preventDefault();
  const input = document.getElementById('rules-search-input') as HTMLInputElement;
  const q = input?.value.trim();
  if (!q) return;

  const resultsDiv = document.getElementById('rules-search-results');
  if (resultsDiv) {
    resultsDiv.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8 space-y-4">
        <i data-lucide="loader-2" class="w-8 h-8 text-amber-400 animate-spin"></i>
        <div class="text-center text-amber-300/80 animate-pulse font-rajdhani text-sm">Consultando o oráculo (Google)...</div>
      </div>
    `;
    if ((window as any).lucide) (window as any).lucide.createIcons();
  }
  
  try {
     const res = await fetch('/api/rules-search', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ query: q })
     });
     if (!res.ok) throw new Error("Erro na API.");
     
     const data = await res.json();
     if (resultsDiv) {
        let formatted = escapeHtml(data.answer || "")
          .replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-amber-200">$1</strong>')
          .replace(/\\*(.*?)\\*/g, '<em class="text-amber-100/70 italic">$1</em>')
          .replace(/\\n/g, '<br>');
          
        resultsDiv.innerHTML = `<div class="bg-[#0b0f19] border border-amber-500/30 p-5 rounded-xl text-slate-200 text-sm leading-relaxed shadow-lg">${formatted}</div>`;
     }
  } catch (err) {
     if (resultsDiv) resultsDiv.innerHTML = '<div class="text-red-400 text-center p-4 bg-red-950/20 border border-red-500/30 rounded-xl">Erro ao buscar regra. Tente novamente ou verifique sua conexão/chave de API.</div>';
  }
};
"""

if "window.executeRulesSearch =" not in content:
    content = content.replace("window.filterRulesSearch = function", func_impl + "\n\nwindow.filterRulesSearch = function")

with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched auth-app.ts with executeRulesSearch")
