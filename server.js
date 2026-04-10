import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const API_URL = process.env.EVOLUTION_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

/**
 * ✅ ROTA RAIZ
 */
app.get("/", (req, res) => {
  res.send("Revnex Core OK 🚀");
});

/**
 * ✅ CRIAR INSTÂNCIA
 */
app.post("/create-instance", async (req, res) => {
  try {
    const { name } = req.body;

    const response = await axios.post(
      `${API_URL}/instance/create`,
      {
        instanceName: name,
        integration: "WHATSAPP-BAILEYS",
        qrcode: true
      },
      {
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
});

/**
 * ✅ PEGAR QR CODE
 */
app.get("/qr/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const response = await axios.get(
      `${API_URL}/instance/connect/${name}`,
      {
        headers: {
          apikey: API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
});

/**
 * 🚀 WEBHOOK (O CORAÇÃO DO SISTEMA)
 */
app.post("/webhook", async (req, res) => {
  try {
    console.log("📩 WEBHOOK RECEBIDO:");
    console.log(JSON.stringify(req.body, null, 2));

    const event = req.body?.event;
    const data = req.body?.data;

    // 👉 Filtra só mensagens reais
    if (event === "messages.upsert") {
      const message = data?.messages?.[0];

      if (!message) {
        return res.sendStatus(200);
      }

      const from = message.key.remoteJid;
      const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text;

      console.log("👤 De:", from);
      console.log("💬 Mensagem:", text);

      // ⚡ RESPOSTA SIMPLES (TESTE)
      if (text) {
        await axios.post(
          `${API_URL}/message/sendText/${data.instanceName}`,
          {
            number: from,
            text: `Recebi sua mensagem: ${text}`
          },
          {
            headers: {
              apikey: API_KEY,
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Erro no webhook:", err.message);
    res.sendStatus(200);
  }
});

/**
 * 🚀 START SERVER
 */
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Revnex Core rodando");
});
