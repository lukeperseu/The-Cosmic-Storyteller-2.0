import sys

with open('src/auth-app.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
export function getRoleBadgeHtml(role: string, isMe = false, paddingX = 'px-1.5', paddingY = 'py-0.2', extraClasses = '') {
  let badgeClasses = 'bg-green-950/20 text-green-300 border-green-500/40';
  let badgeText = role;

  if (isMe) {
    badgeClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    badgeText = 'VOCÊ';
  } else if (role === 'OWNER') {
    badgeClasses = 'bg-[#483D8B]/40 text-purple-200 border-[#483D8B]';
  } else if (role === 'ADM') {
    badgeClasses = 'bg-red-950/80 text-red-300 border-red-500/40';
  } else if (role === 'STAFF') {
    badgeClasses = 'bg-blue-950/80 text-blue-300 border-blue-500/40';
  } else if (role === 'MESTRE' || role === 'GM') {
    badgeClasses = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    badgeText = 'GM';
  } else if (role === 'IA NARRADORA' || role === 'narrator' || role === 'NARRADORA') {
    badgeClasses = 'bg-[#1a112c] text-red-500 border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]';
    badgeText = 'IA NARRADORA';
  } else if (role === 'IA MEDIADORA' || role === 'aurora' || role === 'MEDIADORA') {
    badgeClasses = 'bg-[#0a1a10] text-[#39ff14] border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.5)]';
    badgeText = 'IA MEDIADORA';
  } else if (role === 'SISTEMA' || role === 'system') {
    badgeClasses = 'bg-cyan-950 text-cyan-300 border-cyan-500/40';
    badgeText = 'SISTEMA';
  } else if (role === 'CONVIDADO') {
    badgeClasses = 'bg-purple-950/80 text-purple-300 border-purple-500/30';
  }

  return `<span class="${badgeClasses} border ${paddingX} ${paddingY} text-[9px] sm:text-[10px] font-bold font-orbitron rounded tracking-wider shrink-0 uppercase ${extraClasses}">${badgeText}</span>`;
}
"""

# find start and end
start_str = "export function getRoleBadgeHtml"
end_str = "(window as any).getRoleBadgeHtml = getRoleBadgeHtml;"

idx_start = content.find(start_str)
idx_end = content.find(end_str)

if idx_start != -1 and idx_end != -1:
    new_content = content[:idx_start] + replacement.strip() + "\n" + content[idx_end:]
    with open('src/auth-app.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched getRoleBadgeHtml")
else:
    print("Could not find getRoleBadgeHtml bounds")
