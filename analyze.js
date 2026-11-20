export async function onRequestPost({ request, env }) {
  const cors = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
  if (!env.OPENAI_API_KEY) return json({ error: "Falta configurar el secreto OPENAI_API_KEY en Cloudflare Pages." }, 503);
  let input;
  try { input = await request.json(); } catch { return json({ error: "Solicitud inválida." }, 400); }
  const { eventId, sport, league, away, home, eventDate } = input || {};
  if (!eventId || !sport || !league || !away || !home) return json({ error: "Faltan datos del partido." }, 400);
  const base = `https://site.api.espn.com/apis/site/v2/sports/${encodeURIComponent(sport)}/${encodeURIComponent(league)}`;
  let summary = null;
  try {
    const r = await fetch(`${base}/summary?event=${encodeURIComponent(eventId)}`, { headers: { "User-Agent": "DeibyPicks/1.0" } });
    if (r.ok) summary = await r.json();
  } catch (_) {}
  const dataText = summary ? JSON.stringify(summary).slice(0, 26000) : "ESPN no devolvió un resumen disponible para este evento.";
  const prompt = `Eres un analista deportivo prudente. Responde en español. Analiza este partido: ${away} (visitante) vs ${home} (local). Deporte=${sport}, liga=${league}, fecha=${eventDate || "no disponible"}, ID=${eventId}.\n\nDATOS DISPONIBLES DE ESPN (pueden estar incompletos):\n${dataText}\n\nInstrucciones estrictas:\n- Basa las afirmaciones únicamente en los datos suministrados. No inventes estadísticas, últimos 5-8 resultados, enfrentamientos directos, lesiones, ausencias ni alineaciones.\n- Si la información de forma reciente, H2H o lesiones no aparece, dilo claramente como "no disponible en los datos consultados".\n- No afirmes que revisaste internet en vivo ni fuentes que no se suministraron.\n- Evalúa localía, forma, ataque/defensa y contexto solo si existen datos suficientes.\n- Da hasta dos jugadas razonadas SOLO si los datos las respaldan; si no, indica "SIN JUGADA RECOMENDADA". Explica riesgos y qué dato falta.\n- No inventes cuotas. Las cuotas reales todavía no están conectadas. No uses como cuota real los valores objetivo -140, -125, -100, -130, -135, -115 o -120.\n- No prometas ganancias ni certeza. Termina con una nota breve de apuesta responsable.\n\nFormato: Resumen del partido; Datos confirmados; Datos faltantes; Jugada 1; Jugada 2; Riesgos. Si no hay base suficiente, dilo sin forzar picks.`;
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: env.OPENAI_MODEL || "gpt-5.5", input: prompt, max_output_tokens: 1000 })
    });
    const result = await response.json();
    if (!response.ok) return json({ error: result?.error?.message || "El servicio de IA rechazó la solicitud. Revisa el modelo y la clave configurados." }, 502);
    const text = (result.output || []).flatMap(x => x.content || []).filter(x => x.type === "output_text").map(x => x.text).join("\n");
    return json({ analysis: text || "La IA no devolvió texto. Intenta nuevamente." });
  } catch (e) { return json({ error: "No se pudo conectar con el servicio de análisis." }, 502); }
}
export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  if (context.request.method !== "POST") return new Response("Método no permitido", { status: 405 });
  return onRequestPost(context);
}
