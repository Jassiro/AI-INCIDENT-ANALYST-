require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ MongoDB :", err));

const incidentRoutes = require("./routes/incidents");

app.use("/api/incidents", incidentRoutes);

app.listen(5000, () => {
  console.log("🚀 API démarrée sur http://localhost:5000");
});