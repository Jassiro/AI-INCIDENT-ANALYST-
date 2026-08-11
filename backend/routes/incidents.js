const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");

router.get("/", async (req, res) => {
  try {
    const incidents = await Incident
      .find()
      .sort({ detected_at: -1 });

    res.json(incidents);
  } catch (error) {
    console.error("Erreur récupération incidents :", error);
    res.status(500).json({
      error: "Impossible de récupérer les incidents"
    });
  }
});

module.exports = router;