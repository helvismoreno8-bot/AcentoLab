export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "Falta la variable ANTHROPIC_API_KEY en Netlify." }) };
  }
  try {
    const { system, messages, max_tokens } = JSON.parse(event.body || "{}");
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 1000,
        system,
        messages,
      }),
    });
    const data = await r.json();
    return { statusCode: r.status, headers: { "content-type": "application/json" }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
