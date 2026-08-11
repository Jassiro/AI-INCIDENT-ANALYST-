from fastapi import FastAPI
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os

load_dotenv()

app = FastAPI(
    title="AI Incident Analyst API",
    description="API for AI security incident analysis",
    version="1.0.0"
)

# =========================
# MongoDB configuration
# =========================

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://mongodb:27017"
)

MONGO_DATABASE = os.getenv(
    "MONGO_DATABASE",
    "ai_incident_analyst"
)

MONGO_COLLECTION = os.getenv(
    "MONGO_COLLECTION",
    "incidents"
)

# =========================
# MongoDB connection
# =========================

client = MongoClient(MONGO_URI)

db = client[MONGO_DATABASE]

incidents_collection = db[MONGO_COLLECTION]


# =========================
# Routes
# =========================

@app.get("/")
def root():
    return {
        "message": "AI Incident Analyst API",
        "status": "running"
    }


@app.get("/health")
def health():

    try:

        client.admin.command("ping")

        return {
            "status": "healthy",
            "mongodb": "connected"
        }

    except Exception as e:

        return {
            "status": "unhealthy",
            "mongodb": "disconnected",
            "error": str(e)
        }


@app.get("/api/incidents")
def get_incidents():

    incidents = list(
        incidents_collection.find({}).sort(
            "timestamp",
            -1
        )
    )

    # Convertit ObjectId MongoDB en string
    for incident in incidents:

        if "_id" in incident:
            incident["id"] = str(incident["_id"])
            del incident["_id"]

    return {
        "count": len(incidents),
        "incidents": incidents
    }