import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const API_URL = process.env.EVOLUTION_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

// memória temporária (depois vira DB)
const sessions = {};
const leads = [];

// ROOT
app.get("/", (req, res) => {
  res.send("Revnex Core OK 🚀");
});

// CRIAR INSTÂNCIA
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
          apikey: API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

// WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    if (!data?.data?.key?.remoteJid) {
      return res.sendStatus(200);
    }

    const number = data.data.key.remoteJid;
    const message = data.data.message?.conversation?.toLowerCase() || "";
    const instance = data.instance;

    console.log("📩", number, message);

    // iniciar sessão
    if (!sessions[number]) {
      sessions[number] = { step: "start" };
    }

    const state = sessions[number];
    let response = "";

    // FLUXO
    if (state.step === "start") {
      response = `Olá! Aqui é a Vitrin Veículos.

1 - Comprar carro
2 - Vender carro
3 - Atendente`;

      state.step = "menu";
    }

    else if (state.step === "menu") {
      if (message.includes("1")) {
        response = "Qual faixa de valor?";
        state.step = "buy";
      } 
      else if (message.includes("2")) {
        response = "Qual carro você quer vender?";
        state.step = "sell";
      } 
      else {
        response = "Escolha 1, 2 ou 3";
      }
    }

    else if (state.step === "buy") {
      leads.push({
        number,
        interest: "buy",
        message,
        instance
      });

      response = "Perfeito. Um consultor vai falar com você 🚗";
      state.step = "done";
    }

    else if (state.step === "sell") {
      leads.push({
        number,
        interest: "sell",
        message,
        instance
      });

      response = "Recebido. Vamos te ajudar a vender 🚗";
      state.step = "done";
    }

    // ENVIAR
    await axios.post(
      `${API_URL}/message/sendText/${instance}`,
      {
        number,
        text: response
      },
      {
        headers: {
          apikey: API_KEY
        }
      }
    );

    res.sendStatus(200);

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// LISTAR LEADS (já pronto pro dashboard)
app.get("/leads", (req, res) => {
  res.json(leads);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🔥 Revnex Core rodando");
});
