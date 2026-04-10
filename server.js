import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const SUPABASE_URL = "https://sqiavxkqjalxeifxzsie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaWF2eGtxamFseGVpZnh6c2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjUxNDMsImV4cCI6MjA5MTQwMTE0M30.VTw0xeMueBbS1ZIPF_TZjcuqLLefhKy6L_aIRtuu2qQ";

const EVOLUTION_URL = "https://evolution-api-production-a3c6.up.railway.app";
const EVOLUTION_API_KEY = "302b7b6bca698a46e7347ecc0a82adb7dcc3ce255936799f5f2f9ee2922f1ac6";

// 🔥 Webhook principal
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    const instance = data.instance || "default";
    const messageData = data.data?.messages?.[0];

    if (!messageData) return res.sendStatus(200);

    const from = messageData.key.remoteJid;
    const message = messageData.message?.conversation || "";

    console.log("📩 Nova mensagem:", from, message);

    // 🔹 1. Criar contato se não existir
    let contact = await fetch(`${SUPABASE_URL}/rest/v1/contacts?phone=eq.${from}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }).then(r => r.json());

    if (!contact.length) {
      contact = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: from,
          tenant_id: null,
        }),
      }).then(r => r.json());
    }

    const contact_id = contact[0]?.id;

    // 🔹 2. Salvar mensagem
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_id,
        tenant_id: null,
        message,
        direction: "in",
      }),
    });

    // 🔥 3. Resposta dinâmica simples (base IA futura)
    let reply = "Recebi sua mensagem 🚀";

    if (message.toLowerCase().includes("oi")) {
      reply = "Olá! Aqui é a Vitrin Veículos.\n\n1 - Comprar carro\n2 - Vender carro";
    }

    if (message === "1") {
      reply = "Qual faixa de valor você procura?";
    }

    if (message.match(/\d/)) {
      reply = "Perfeito. Um consultor vai falar com você 🚗";
    }

    // 🔹 4. Enviar resposta
    await fetch(`${EVOLUTION_URL}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        apikey: EVOLUTION_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: from,
        text: reply,
      }),
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro:", err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("🔥 Revnex Core rodando");
});
