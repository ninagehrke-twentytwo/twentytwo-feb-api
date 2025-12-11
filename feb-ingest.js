import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function runFebAgent(payload) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      input: `
        Du bist der FEB-Agent von twentytwo media house.

        Analysiere die folgenden Unternehmensdaten:

        ${JSON.stringify(payload, null, 2)}

        Erstelle:

        1. Zusammenfassung Status Quo
        2. Bias-/Equality-Check
        3. EVP Analyse
        4. Analyse der Recruiting-Prozesse
        5. Maßnahmenkatalog
        6. Roadmap in 6 Modulen
        7. Priorisierte Handlungsempfehlungen

        Ausgabeformat: JSON.
      `
    })
  });

  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    console.log("📥 Neue FEB Anfrage erhalten");

    const body = req.body;

    if (!body || !body.data || !body.client) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Agenten-Call
    const agentOutput = await runFebAgent(body);

    console.log("🤖 Agent-Auswertung abgeschlossen");

    return res.status(200).json({
      status: "success",
      request_id: body.request_id,
      report: agentOutput
    });

  } catch (error) {
    console.error("❌ FEB API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
}

