import sys
import re

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the call to `/api/narrator` with `/api/narrator-pipeline`
# and remove the subsequent call to `/api/executor` entirely, because it's handled in the pipeline.

call_logic = """
  try {
    const res = await fetch('/api/narrator-pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, message, history: history.slice(-10), characterContext: charContext })
    });
      
    if (!res.ok) throw new Error('Falha ao contactar a API da Pipeline.');
      
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let contentDiv = document.getElementById(`${loadingId}-content`);
    
    // Rotating funny timeout messages
    let loadingMsgs = [
      "Íris se distraiu com uma capivara pilotando um dragão de komodo... QUÊH!!???",
      "Íris e Aurora saíram na mão e esqueceram de narrar, jajá voltam...",
      "Aurora foi buscar café...",
      "Íris está escolhendo a cor do céu. Aurora mandou ela calar a boca e focar no trabalho...",
      "O Tomo da Executora caiu no chão e perdeu a página..."
    ];
    let lastEventTime = Date.now();
    let delayTimer = setInterval(() => {
       if (Date.now() - lastEventTime > 7000) {
          const msg = loadingMsgs[Math.floor(Math.random() * loadingMsgs.length)];
          if (contentDiv) contentDiv.innerHTML = `<span class="animate-pulse text-amber-300">${msg}</span>`;
          lastEventTime = Date.now(); // reset
       }
    }, 1000);

    let finalMutations = [];
    let auroraFinalComment = "";

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
          
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\\n');
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
              } else if (data.text) {
                fullText += data.text;
                if (contentDiv) {
                  const formattedContent = escapeHtml(fullText)
                    .replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-amber-200">$1</strong>')
                    .replace(/\\*(.*?)\\*/g, '<em class="text-indigo-200 italic">$1</em>')
                    .replace(/\\n/g, '<br>');
                  contentDiv.innerHTML = formattedContent;
                  feed.scrollTop = feed.scrollHeight;
                }
              } else if (data.mutations) {
                finalMutations = data.mutations;
              } else if (data.auroraComment) {
                auroraFinalComment = data.auroraComment;
              } else if (data.error) {
                fullText += "\\n\\n**Erro:** " + data.error;
              } else if (data.done) {
                break;
              }
            } catch (e) {}
          }
        }
      }
    }
    
    clearInterval(delayTimer);
      
    // Once done streaming, save to Firebase
    const el = document.getElementById(loadingId);
    if (el) el.remove(); 
      
    await sendSessionMessage({
      campaignId,
      senderUid: 'system_ai_narrator',
      senderName: 'Íris Arcádia',
      senderRole: 'narrator',
      type: 'narrative',
      content: fullText
    });

    // Apply mutations silently to UI/FB, and toast them
    if (finalMutations.length > 0) {
      console.log("Mutações da Pipeline:", finalMutations);
      let toastLines: string[] = [];
      for (const mut of finalMutations) {
        if (mut.type === 'PV') {
          if (window.modifyCharacterStat) await window.modifyCharacterStat('pv', mut.amount);
          toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} PV`);
        } else if (mut.type === 'PM') {
          if (window.modifyCharacterStat) await window.modifyCharacterStat('pm', mut.amount);
          toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} PM`);
        } else if (mut.type === 'OURO') {
          if (window.modifyCharacterGold) await window.modifyCharacterGold(mut.amount);
          toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} Ouro`);
        } else if (mut.type === 'ITEM_ADD') {
          if (window.modifyCharacterItem) await window.modifyCharacterItem('add', mut.itemName, mut.amount || 1);
          toastLines.push(`+${mut.amount || 1} ${mut.itemName}`);
        } else if (mut.type === 'ITEM_REMOVE') {
          if (window.modifyCharacterItem) await window.modifyCharacterItem('remove', mut.itemName, mut.amount || 1);
          toastLines.push(`-${mut.amount || 1} ${mut.itemName}`);
        }
      }
      if (toastLines.length > 0) {
        if ((window as any).showToast) {
          (window as any).showToast(`A Executora ajustou: ${toastLines.join(', ')}`, "success");
        }
      }
    }

    // Post Aurora's comment if she had something to say
    if (auroraFinalComment && auroraFinalComment.trim().length > 0) {
      await sendSessionMessage({
        campaignId,
        senderUid: 'system_ai_aurora',
        senderName: 'Aurora',
        senderRole: 'aurora',
        type: 'chat',
        content: auroraFinalComment
      });
    }

  } catch (err: any) {
    console.error(err);
    if ((window as any).showToast) (window as any).showToast("Erro na pipeline da IA.");
    const el = document.getElementById(loadingId);
    if (el) el.remove();
  } finally {
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
};
"""

# Find the block inside callNarratorAI that starts with `try {` after `feed.scrollTop = feed.scrollHeight;`
pattern = re.compile(r"try\s*\{\s*const res = await fetch\('/api/narrator'.*?btn\.classList\.remove\('opacity-50', 'cursor-not-allowed'\);\s*\}\s*\};", re.DOTALL)

if pattern.search(content):
    content = pattern.sub(call_logic.strip(), content)
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched callNarratorAI in auth-app.ts")
else:
    print("Pattern not found in auth-app.ts")
