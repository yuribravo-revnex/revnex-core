import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =============================
// CONFIG
// =============================
const EVOLUTION_URL = "https://evolution-api-production-a3c6.up.railway.app";
const EVOLUTION_API_KEY = "302b7b6bca698a46e7347ecc0a82adb7dcc3ce255936799f5f2f9ee2922f1ac6";

// =============================
// HEALTH CHECK
// =============================
app.get("/", (req, res) => {
  res.send("🔥 Revnex Core rodando");
});

// =============================
// WEBHOOK
// =============================
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 WEBHOOK RECEBIDO:");
    console.log(JSON.stringify(data, null, 2));

    const message = data?.data?.message;
    const from = data?.data?.key?.remoteJid;
    const instance = data?.instance?.instanceName;

    if (!message || !from) {
      console.log("⚠️ Dados inválidos");
      return res.sendStatus(200);
    }

    // ignora grupos
    if (from.includes("@g.us")) {
      console.log("⚠️ Grupo ignorado");
      return res.sendStatus(200);
    }

    const text =
      message?.conversation ||
      message?.extendedTextMessage?.text ||
      "";

    console.log("💬 Mensagem:", text);
    console.log("📱 De:", from);
    console.log("🔗 Instância:", instance);

    if (!text) return res.sendStatus(200);

    // =============================
    // RESPOSTA AUTOMÁTICA
    // =============================
    let resposta = "";

    if (text.toLowerCase() === "oi") {
      resposta = `Olá! Aqui é a Vitrin Veículos.

1 - Comprar carro
2 - Vender carro`;
    } else if (text === "1") {
      resposta = "Qual faixa de valor você procura?";
    } else if (text === "2") {
      resposta = "Perfeito. Vamos anunciar seu veículo.";
    } else {
      resposta = "Digite 1 para comprar ou 2 para vender.";
    }

    console.log("📤 Enviando resposta...");

    await fetch(`${EVOLUTION_URL}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: from.replace("@s.whatsapp.net", ""),
        text: resposta,
      }),
    });

    console.log("✅ Resposta enviada");

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ ERRO:", error);
    res.sendStatus(500);
  }
});

// =============================
app.listen(PORT, () => {
  console.log(`🔥 Revnex Core rodando na porta ${PORT}`);
});
