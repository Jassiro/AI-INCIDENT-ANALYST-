const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    detected_at: {
      type: Date
    },

    incident: {
      type: String
    },

    severity: {
      type: String
    },

    cause: {
      type: String
    },

    recommendation: {
      type: String
    },

    incident_logs: {
      type: String
    }
  },
  {
    collection: "incidents"
  }
);

module.exports = mongoose.model("Incident", incidentSchema);