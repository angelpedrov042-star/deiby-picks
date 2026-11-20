# DEIBY PICKS — Cloudflare Pages

Proyecto preparado para desplegarse mediante **Cloudflare Pages con integración GitHub**.

## Archivos
- `index.html`: interfaz en español, calendario/resultados consultados desde ESPN y botón de análisis.
- `functions/api/analyze.js`: función de servidor para consultar el resumen ESPN del evento y solicitar análisis a OpenAI. La clave nunca se incluye en el navegador ni en GitHub.

## Configuración en Cloudflare Pages
1. Conecta el repositorio `deiby-picks` a Cloudflare Pages.
2. En la configuración de compilación, deja el comando de compilación vacío y usa `.` como directorio de salida (si el panel no acepta `.`, usa el directorio raíz indicado por Cloudflare para un sitio sin framework).
3. Después del primer despliegue, abre Settings → Variables and Secrets (o Variables de entorno) y crea un **secret** llamado `OPENAI_API_KEY` con tu clave de OpenAI API.
4. Opcional: crea `OPENAI_MODEL` con un modelo disponible en tu cuenta. El valor predeterminado en el código es `gpt-5.5`; cámbialo si tu cuenta no tiene acceso a ese modelo.
5. Guarda y vuelve a desplegar.

## Límites importantes
- ESPN se consulta mediante endpoints públicos no documentados; su disponibilidad y los campos pueden cambiar. El resumen de un evento no siempre incluye lesiones, forma reciente o enfrentamientos directos. El analizador debe reconocer datos faltantes y no inventarlos.
- Las cuotas deportivas reales **no están conectadas**. Los valores de cuotas que el usuario había mencionado son referencias objetivo, no precios de casas de apuestas. No se muestran como cuotas actuales.
- El uso de OpenAI API se factura por separado de ChatGPT y requiere una cuenta/API key con facturación habilitada.
- No compartas la clave API en GitHub, en el chat ni en el código del navegador. Configúrala como Secret en Cloudflare.
- Las recomendaciones deportivas no garantizan resultados. Apuesta responsablemente y conforme a la ley local.
