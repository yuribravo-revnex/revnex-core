import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const API_URL = process.env.EVOLUTION_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

// 🔥 SIMULAÇÃO DE BANCO (depois vira Supabase)
const flows = {
  vitrin: {
    start: {
      message: `Olá! Aqui é a Vitrin Veículos.

1 - Comprar carro
2 - Vender carro`,
      options: {
        "1": "buy",
        "2": "sell"
      }
    },
    buy: {
      message: "Qual faixa de valor você procura?",
      next: "lead"
    },
    sell: {
      message: "Qual carro você quer vender?",
      next: "lead"
    },
    lead: {
      message: "Perfeito. Um consultor vai falar com você 🚗",
      next: null
    }
  }
};

// sessões (depois vira banco)
const sessions = {};

// ROOT
app.get("/", (req, res) => {
  res.send("Revnex Engine ON 🚀");
});

// WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    if (!data?.data?.key?.remoteJid) {
      return res.sendStatus(200);
    }

    const instance = data.instance;
    const from = data.data.key.remoteJid;
    const number = from.replace("@s.whatsapp.net", "");
    const message =
      data.data.message?.conversation?.toLowerCase() || "";

    console.log("📩", number, message);

    // inicia sessão
    if (!sessions[number]) {
      sessions[number] = { step: "start" };
    }

    const state = sessions[number];
    const flow = flows.vitrin;
    let step = flow[state.step];

    let nextStep = null;

    // 🔹 verifica opções
    if (step.options && step.options[message]) {
      nextStep = step.options[message];
    }

    // 🔹 fallback para next automático
    else if (step.next) {
      nextStep = step.next;
    }

    // 🔹 se nada casar
    else {
      nextStep = "start";
    }

    const next = flow[nextStep];

    // atualiza estado
    state.step = nextStep;

    // envia resposta
    await axios.post(
      `${API_URL}/message/sendText/${instance}`,
      {
        number,
        text: next.message
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

app.listen(process.env.PORT || 3000, () => {
  console.log("🔥 Revnex Engine rodando");
});
