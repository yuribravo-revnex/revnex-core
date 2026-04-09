import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const API_URL = process.env.EVOLUTION_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

// ROOT
app.get("/", (req, res) => {
  res.send("Revnex Core OK 🚀");
});

// CREATE INSTANCE
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

// GET QR
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

app.listen(process.env.PORT || 3000, () => {
  console.log("Revnex Core rodando");
});
