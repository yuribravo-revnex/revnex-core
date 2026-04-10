import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const API_URL = process.env.EVOLUTION_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

// 🔹 Rota raiz
app.get("/", (req, res) => {
  res.send("Revnex Core ONLINE 🚀");
});

// 🔹 Criar instância
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
    res.status(500).json(err.response?.data || err.message);
  }
});

// 🔹 Buscar QR
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
    res.status(500).json(err.response?.data || err.message);
  }
});

// 🔥 WEBHOOK (CÉREBRO DO BOT)
app.post("/webhook", async (req, res) => {
  try {
    console.log("📩 Evento recebido:", JSON.stringify(req.body, null, 2));

    const data = req.body;

    // 🔹 pega dados básicos
    const instance = data.instance;
    const message = data.data?.message?.conversation || data.data?.message?.extendedTextMessage?.text;
    const from = data.data?.key?.remoteJid;

    // 🔥 ignora mensagens inválidas
    if (!message || !from) {
      return res.sendStatus(200);
    }

    console.log(`📨 Mensagem de ${from}: ${message}`);

    // 🔥 RESPOSTA AUTOMÁTICA (primeira versão)
    await axios.post(
      `${API_URL}/message/sendText/${instance}`,
      {
        number: from,
        text: `Recebi sua mensagem: "${message}" 🚀`
      },
      {
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erro no webhook:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🔥 Revnex Core rodando");
});
