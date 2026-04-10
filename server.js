import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const API_URL = process.env.EVOLUTION_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

// =========================
// ROOT
// =========================
app.get("/", (req, res) => {
  res.send("Revnex Core OK 🚀");
});

// =========================
// CREATE INSTANCE
// =========================
app.post("/create-instance", async (req, res) => {
  try {
    const { instanceName } = req.body;

    if (!instanceName) {
      return res.status(400).json({ error: "instanceName is required" });
    }

    const response = await axios.post(
      `${API_URL}/instance/create`,
      {
        instanceName,
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

// =========================
// GET QR
// =========================
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

// =========================
// SEND MESSAGE
// =========================
app.post("/send-message", async (req, res) => {
  try {
    const { instanceName, number, text } = req.body;

    if (!instanceName || !number || !text) {
      return res.status(400).json({ error: "missing fields" });
    }

    const response = await axios.post(
      `${API_URL}/message/sendText/${instanceName}`,
      {
        number,
        text
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

// =========================
// SIMPLE CONVERSION ENGINE
// =========================
function generateReply(message) {
  const text = message.toLowerCase();

  if (text.includes("oi") || text.includes("olá")) {
    return `Olá! Aqui é o time Revnex.

Me diga o que você quer:
1 - Ver veículos disponíveis
2 - Falar com vendedor
3 - Saber preços`;
  }

  if (text === "1") {
    return `Perfeito.

Temos veículos disponíveis hoje.

Quer:
1 - Carros até 30k
2 - Carros até 60k
3 - Carros premium`;
  }

  if (text === "2") {
    return `Estou te conectando com um vendedor agora.`;
  }

  if (text === "3") {
    return `Temos opções a partir de R$29.900.

Quer ver modelos disponíveis?`;
  }

  return `Não entendi.

Digite:
1 - veículos
2 - vendedor
3 - preços`;
}

// =========================
// WEBHOOK (RECEBER MENSAGENS)
// =========================
app.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook recebido:", JSON.stringify(req.body, null, 2));

    const instanceName = req.body.instance;
    const message = req.body?.data?.message?.conversation;
    const number = req.body?.data?.key?.remoteJid;

    if (!message || !number) {
      return res.sendStatus(200);
    }

    const reply = generateReply(message);

    await axios.post(
      `${API_URL}/message/sendText/${instanceName}`,
      {
        number,
        text: reply
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
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Revnex Core rodando 🚀");
});
