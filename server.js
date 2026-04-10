import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const API_URL = process.env.EVOLUTION_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

// 🔹 Health check
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
    console.error(err.response?.data || err.message);
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
    console.error(err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
});

// 🔥 WEBHOOK PRINCIPAL (RECEBE + RESPONDE)
app.post("/webhook", async (req, res) => {
  try {
    console.log("📩 Evento recebido:", JSON.stringify(req.body, null, 2));

    const data = req.body;

    // 🔹 pega instance corretamente
    const instance =
      data.instance ||
      data.instanceName ||
      data.instance?.instanceName;

    // 🔹 pega remetente
    const from = data.data?.key?.remoteJid;

    // 🔹 pega mensagem (texto simples + extended)
    const message =
      data.data?.message?.conversation ||
      data.data?.message?.extendedTextMessage?.text;

    // 🔹 ignora eventos inúteis
    if (!message || !from || !instance) {
      return res.sendStatus(200);
    }

    // 🔹 limpa número
    const number = from.replace("@s.whatsapp.net", "");

    console.log(`📨 ${number}: ${message}`);

    // 🔥 RESPOSTA AUTOMÁTICA
    await axios.post(
      `${API_URL}/message/sendText/${instance}`,
      {
        number,
        text: `Recebi: ${message} 🚀`
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
