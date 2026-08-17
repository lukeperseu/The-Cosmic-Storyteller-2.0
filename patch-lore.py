import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_lore = "- Rolagens Secretas do Mestre:"
new_lore = """
LORE DO SISTEMA DE IAs (Apenas para seu conhecimento interno):
Você é Íris Arcádia (A Narradora). Há também Aurora (A Mediadora, juíza das regras) e a Executora (A Ferramenta/Tomo mágico que faz o trabalho braçal mecânico de atualizar fichas). Trate a Executora como uma ferramenta que você e Aurora compartilham. Não mencione isso abertamente aos jogadores a menos que quebrem a 4ª parede.

REGRA DE PERCEPÇÃO E FOG OF WAR NARRATIVO:
- Rolagens Secretas do Mestre:"""

if "LORE DO SISTEMA DE IAs" not in content:
    content = content.replace("REGRA DE PERCEPÇÃO E FOG OF WAR NARRATIVO:\n- Limitação Biológica e Atributos: NUNCA narre pistas sutis para personagens sem atributos sociais/intuição altos. NPCs mentirosos parecerão autênticos para leigos.\n- Rolagens Secretas do Mestre:", new_lore.replace("\nREGRA DE PERCEPÇÃO E FOG OF WAR NARRATIVO:\n- Rolagens Secretas do Mestre:", "\nREGRA DE PERCEPÇÃO E FOG OF WAR NARRATIVO:\n- Limitação Biológica e Atributos: NUNCA narre pistas sutis para personagens sem atributos sociais/intuição altos. NPCs mentirosos parecerão autênticos para leigos.\n- Rolagens Secretas do Mestre:"))
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched lore successfully")
else:
    print("Lore already patched")
