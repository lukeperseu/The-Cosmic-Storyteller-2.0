import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

injection = """
    // --- Chamada para a IA Executora (Background) ---
    if (char) {
      try {
        if ((window as any).showToast) (window as any).showToast("A Executora está analisando a cena...", "info");
        const execRes = await fetch('/api/executor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerMessage: message,
            narratorResponse: fullText,
            characterContext: charContext
          })
        });
        
        if (execRes.ok) {
          const mutations = await execRes.json();
          if (Array.isArray(mutations) && mutations.length > 0) {
            console.log("Mutações recebidas da Executora:", mutations);
            let toastLines: string[] = [];
            for (const mut of mutations) {
              if (mut.type === 'PV') {
                if (window.modifyCharacterStat) await window.modifyCharacterStat('pv', mut.amount);
                toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} PV`);
              } else if (mut.type === 'PM') {
                if (window.modifyCharacterStat) await window.modifyCharacterStat('pm', mut.amount);
                toastLines.push(`${mut.amount > 0 ? '+' : ''}${mut.amount} PM`);
              }
              // Ouro and items can be added here later
            }
            if (toastLines.length > 0) {
              if ((window as any).showToast) {
                (window as any).showToast(`A Executora (Íris/Aurora) ajustou: ${toastLines.join(', ')}`, "success");
              }
            }
          }
        }
      } catch (execErr) {
        console.error("Erro ao chamar Executora:", execErr);
      }
    }
    // ------------------------------------------------
"""

target = """    await sendSessionMessage({
      campaignId,
      senderUid: 'system_ai_narrator',
      senderName: 'Íris Arcádia',
      senderRole: 'narrator',
      type: 'narrative',
      content: fullText
    });"""

if target in content:
    content = content.replace(target, target + "\n" + injection)
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched auth-app.ts successfully")
else:
    print("Target string not found in auth-app.ts")
