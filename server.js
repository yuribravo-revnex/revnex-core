import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const EVOLUTION_URL = "https://evolution-api-production-a3c6.up.railway.app";
const EVOLUTION_API_KEY = "302b7b6bca698a46e7347ecc0a82adb7dcc3ce255936799f5f2f9ee2922f1ac6";

const INSTANCE_NAME = "cliente4";

// 🧠 MEMÓRIA TEMPORÁRIA (sessão)
const sessions = {};

// =============================
app.get("/", (req, res) => {
  res.send("🔥 Revnex Core rodando");
});

// =============================
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    const message = data?.data?.message;
    const from = data?.data?.key?.remoteJid;

    if (!message || !from) return res.sendStatus(200);
    if (from.includes("@g.us")) return res.sendStatus(200);

    const number = from.replace("@s.whatsapp.net", "");

    const text =
      message?.conversation ||
      message?.extendedTextMessage?.text ||
      "";

    if (!text) return res.sendStatus(200);

    console.log("👤", number, "→", text);

    // =============================
    // ESTADO ATUAL
    // =============================
    const state = sessions[number] || "inicio";

    let resposta = "";

    // =============================
    // FLUXO
    // =============================

    if (text.toLowerCase() === "oi" && state === "inicio") {
      resposta = `Olá! Aqui é a Vitrin Veículos.

1 - Comprar carro
2 - Vender carro`;

      sessions[number] = "menu";
    }

    else if (text === "1" && state === "menu") {
      resposta = "Qual faixa de valor você procura?";
      sessions[number] = "comprar_valor";
    }

    else if (text === "2" && state === "menu") {
      resposta = "Perfeito. Vamos anunciar seu veículo.";
      sessions[number] = "vender";
    }

    else if (state === "comprar_valor") {
      resposta = "Perfeito. Um consultor vai falar com você 🚗";
      sessions[number] = "finalizado";
    }

    else {
      resposta = "Digite 'oi' para começar.";
    }

    console.log("📤", resposta);

    await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number,
        text: resposta,
      }),
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ ERRO:", error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Revnex Core rodando na porta ${PORT}`);
});
