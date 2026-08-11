import { useCallback, useEffect, useMemo, useState } from "react";
import { getIncidents } from "./api";
import "./index.css";

/* =========================================================
   OUTILS
========================================================= */

/**
 * Récupère la sévérité quel que soit le format retourné
 * par l'API / MongoDB / n8n.
 */
function getSeverity(incident) {
  const value =
    incident?.severity ??
    incident?.analysis?.severity ??
    incident?.result?.severity ??
    incident?.analysis_result?.severity ??
    "";

  return String(value).trim().toLowerCase();
}

/**
 * Affichage propre de la sévérité.
 */
function formatSeverity(incident) {
  const severity = getSeverity(incident);

  if (!severity) {
    return "Unknown";
  }

  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

/**
 * Récupération du nom de l'incident.
 */
function getIncidentName(incident) {
  return (
    incident?.incident ??
    incident?.title ??
    incident?.name ??
    incident?.incident_name ??
    incident?.analysis?.incident ??
    incident?.analysis?.title ??
    incident?.result?.incident ??
    incident?.description ??
    "Incident détecté"
  );
}

/**
 * Récupération de la description.
 */
function getDescription(incident) {
  return (
    incident?.description ??
    incident?.incident_description ??
    incident?.analysis?.description ??
    incident?.result?.description ??
    incident?.summary ??
    "Aucune description disponible."
  );
}

/**
 * Récupération de la cause.
 */
function getCause(incident) {
  return (
    incident?.cause ??
    incident?.probable_cause ??
    incident?.root_cause ??
    incident?.analysis?.cause ??
    incident?.analysis?.probable_cause ??
    incident?.result?.cause ??
    "Aucune cause probable disponible."
  );
}

/**
 * Récupération de la recommandation.
 */
function getRecommendation(incident) {
  return (
    incident?.recommendation ??
    incident?.recommendations ??
    incident?.solution ??
    incident?.analysis?.recommendation ??
    incident?.result?.recommendation ??
    "Aucune recommandation disponible."
  );
}

/**
 * Récupération de la source.
 */
function getSource(incident) {
  if (incident?.source) {
    return String(incident.source);
  }

  if (incident?.service) {
    return String(incident.service);
  }

  if (incident?.application) {
    return String(incident.application);
  }

  if (incident?.analysis?.source) {
    return String(incident.analysis.source);
  }

  if (incident?.result?.source) {
    return String(incident.result.source);
  }

  return "unknown";
}

/**
 * Récupération du log.
 */
function getLogs(incident) {
  if (incident?.incident_logs) {
    return incident.incident_logs;
  }

  if (incident?.logs) {
    return incident.logs;
  }

  if (incident?.log) {
    return incident.log;
  }

  if (incident?.message) {
    return incident.message;
  }

  if (incident?.analysis?.log) {
    return incident.analysis.log;
  }

  if (incident?.result?.log) {
    return incident.result.log;
  }

  return "Aucun log disponible.";
}

/**
 * Récupération de la date.
 */
function getDate(incident) {
  return (
    incident?.detected_at ??
    incident?.timestamp ??
    incident?.created_at ??
    incident?.createdAt ??
    incident?.date ??
    null
  );
}

/**
 * Format date française.
 */
function formatDate(date) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

/**
 * Récupère l'identifiant unique de l'incident.
 *
 * Le backend FastAPI doit maintenant transformer
 * MongoDB _id en id.
 */
function getIncidentId(incident, index = null) {
  if (incident?.id !== undefined && incident?.id !== null) {
    return String(incident.id);
  }

  /*
   * Compatibilité avec d'anciens documents
   * qui possèdent encore _id.
   */
  if (incident?._id !== undefined && incident?._id !== null) {
    if (typeof incident._id === "object" && incident._id.$oid) {
      return String(incident._id.$oid);
    }

    return String(incident._id);
  }

  /*
   * Dernier recours.
   */
  if (index !== null) {
    return `incident-${index}`;
  }

  return null;
}

/* =========================================================
   APPLICATION
========================================================= */

function App() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("ALL");

  /* =======================================================
     CHARGEMENT DES INCIDENTS
  ======================================================= */

  const loadIncidents = useCallback(async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getIncidents();

      /*
       * Sécurité :
       * si l'API retourne autre chose qu'un tableau.
       */
      const incidentsArray = Array.isArray(data) ? data : [];

      /*
       * Trie les incidents du plus récent
       * au plus ancien.
       */
      const sortedData = [...incidentsArray].sort((a, b) => {
        const dateA = new Date(getDate(a) || 0).getTime();
        const dateB = new Date(getDate(b) || 0).getTime();

        return dateB - dateA;
      });

      setIncidents(sortedData);

      /*
       * IMPORTANT :
       * On conserve l'incident actuellement sélectionné
       * après le refresh.
       */
      setSelectedIncident((current) => {
        /*
         * Aucun incident actuellement sélectionné :
         * on sélectionne le premier.
         */
        if (!current) {
          return sortedData.length > 0 ? sortedData[0] : null;
        }

        /*
         * Identifiant de l'incident actuellement sélectionné.
         */
        const currentId = getIncidentId(current);

        /*
         * Recherche du même incident dans les nouvelles données.
         */
        const updated = sortedData.find((item) => {
          const itemId = getIncidentId(item);

          return (
            itemId !== null &&
            currentId !== null &&
            itemId === currentId
          );
        });

        /*
         * Si l'incident existe toujours :
         * on prend sa nouvelle version.
         */
        if (updated) {
          return updated;
        }

        /*
         * Si l'ancien incident n'existe plus :
         * on sélectionne le premier incident disponible.
         */
        return sortedData.length > 0 ? sortedData[0] : null;
      });
    } catch (err) {
      console.error("Erreur dashboard :", err);

      setError(
        "Impossible de récupérer les incidents depuis l'API."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =======================================================
     CHARGEMENT INITIAL + ACTUALISATION 10 SECONDES
  ======================================================= */

  useEffect(() => {
    /*
     * Chargement immédiat.
     */
    loadIncidents();

    /*
     * Actualisation automatique toutes les 10 secondes.
     */
    const interval = setInterval(() => {
      loadIncidents();
    }, 10000);

    /*
     * Nettoyage.
     */
    return () => {
      clearInterval(interval);
    };
  }, [loadIncidents]);

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const statistics = useMemo(() => {
    return {
      total: incidents.length,

      critical: incidents.filter(
        (incident) =>
          getSeverity(incident) === "critical"
      ).length,

      high: incidents.filter(
        (incident) =>
          getSeverity(incident) === "high"
      ).length,

      medium: incidents.filter(
        (incident) =>
          getSeverity(incident) === "medium"
      ).length,

      low: incidents.filter(
        (incident) =>
          getSeverity(incident) === "low"
      ).length,
    };
  }, [incidents]);

  /* =======================================================
     FILTRAGE
  ======================================================= */

  const filteredIncidents = useMemo(() => {
    if (filter === "ALL") {
      return incidents;
    }

    return incidents.filter(
      (incident) =>
        getSeverity(incident) ===
        filter.toLowerCase()
    );
  }, [incidents, filter]);

  /* =======================================================
     INTERFACE
  ======================================================= */

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div>

          <h1>AI INCIDENT ANALYST</h1>

          <p>
            Security Operations Center
          </p>

          <span className="live-status">
            <span className="live-dot"></span>
            Analyse automatique active
          </span>

        </div>

        <div className="header-actions">

          <span className="refresh-info">
            Actualisation : 10 s
          </span>

          <button
            className="refresh-button"
            onClick={() => loadIncidents(true)}
            disabled={refreshing}
          >
            {refreshing
              ? "Actualisation..."
              : "↻ Actualiser"}
          </button>

        </div>

      </header>

      {/* =================================================
          STATISTIQUES
      ================================================= */}

      <section className="statistics">

        <button
          className={`stat-card total ${
            filter === "ALL" ? "active" : ""
          }`}
          onClick={() => setFilter("ALL")}
        >
          <span className="stat-label">
            TOTAL
          </span>

          <span className="stat-value">
            {statistics.total}
          </span>
        </button>

        <button
          className={`stat-card critical ${
            filter === "Critical" ? "active" : ""
          }`}
          onClick={() => setFilter("Critical")}
        >
          <span className="stat-label">
            CRITICAL
          </span>

          <span className="stat-value">
            {statistics.critical}
          </span>
        </button>

        <button
          className={`stat-card high ${
            filter === "High" ? "active" : ""
          }`}
          onClick={() => setFilter("High")}
        >
          <span className="stat-label">
            HIGH
          </span>

          <span className="stat-value">
            {statistics.high}
          </span>
        </button>

        <button
          className={`stat-card medium ${
            filter === "Medium" ? "active" : ""
          }`}
          onClick={() => setFilter("Medium")}
        >
          <span className="stat-label">
            MEDIUM
          </span>

          <span className="stat-value">
            {statistics.medium}
          </span>
        </button>

        <button
          className={`stat-card low ${
            filter === "Low" ? "active" : ""
          }`}
          onClick={() => setFilter("Low")}
        >
          <span className="stat-label">
            LOW
          </span>

          <span className="stat-value">
            {statistics.low}
          </span>
        </button>

      </section>

      {/* =================================================
          CONTENU PRINCIPAL
      ================================================= */}

      <main className="dashboard-grid">

        {/* =================================================
            LISTE DES INCIDENTS
        ================================================= */}

        <section className="panel incidents-panel">

          <div className="panel-header">

            <div>

              <h2>
                INCIDENTS
              </h2>

              <span className="panel-subtitle">
                {filteredIncidents.length} incident(s)
              </span>

            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
            >

              <option value="ALL">
                Tous
              </option>

              <option value="Critical">
                Critical
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>

            </select>

          </div>

          {/* Chargement */}

          {loading && (
            <div className="message">
              Chargement des incidents...
            </div>
          )}

          {/* Erreur */}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {/* Aucun résultat */}

          {!loading &&
            !error &&
            filteredIncidents.length === 0 && (
              <div className="message">
                Aucun incident trouvé.
              </div>
            )}

          {/* Tableau */}

          {!loading &&
            !error &&
            filteredIncidents.length > 0 && (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>
                      <th>Date</th>
                      <th>Incident</th>
                      <th>Sévérité</th>
                      <th>Source</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredIncidents.map(
                      (incident, index) => {

                        /*
                         * Identifiant unique.
                         */
                        const id =
                          getIncidentId(
                            incident,
                            index
                          );

                        const severity =
                          getSeverity(
                            incident
                          );

                        const selectedId =
                          getIncidentId(
                            selectedIncident
                          );

                        const isSelected =
                          selectedId !== null &&
                          id !== null &&
                          selectedId === id;

                        return (

                          <tr
                            key={id}
                            className={
                              isSelected
                                ? "selected-row"
                                : ""
                            }
                            onClick={() =>
                              setSelectedIncident(
                                incident
                              )
                            }
                          >

                            <td>
                              {formatDate(
                                getDate(
                                  incident
                                )
                              )}
                            </td>

                            <td className="incident-name">
                              {getIncidentName(
                                incident
                              )}
                            </td>

                            <td>

                              <span
                                className={`severity ${
                                  severity ||
                                  "unknown"
                                }`}
                              >
                                {formatSeverity(
                                  incident
                                )}
                              </span>

                            </td>

                            <td>

                              <span className="source">
                                {getSource(
                                  incident
                                )}
                              </span>

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

        {/* =================================================
            DETAILS INCIDENT
        ================================================= */}

        <section className="panel details-panel">

          <div className="panel-header">

            <div>

              <h2>
                INCIDENT DETAILS
              </h2>

              <span className="panel-subtitle">
                Analyse de l'incident sélectionné
              </span>

            </div>

          </div>

          {!selectedIncident ? (

            <div className="message">
              Sélectionnez un incident dans la liste.
            </div>

          ) : (

            <div className="details">

              {/* TITRE */}

              <div className="detail-title">

                <div>

                  <h3>
                    {getIncidentName(
                      selectedIncident
                    )}
                  </h3>

                  <span className="source">
                    {getSource(
                      selectedIncident
                    )}
                  </span>

                </div>

                <span
                  className={`severity ${
                    getSeverity(
                      selectedIncident
                    ) || "unknown"
                  }`}
                >
                  {formatSeverity(
                    selectedIncident
                  )}
                </span>

              </div>

              {/* ID INCIDENT */}

              <div className="detail-item">

                <span className="detail-label">
                  ID
                </span>

                <span>
                  {getIncidentId(
                    selectedIncident
                  ) || "-"}
                </span>

              </div>

              {/* DATE */}

              <div className="detail-item">

                <span className="detail-label">
                  DATE
                </span>

                <span>
                  {formatDate(
                    getDate(
                      selectedIncident
                    )
                  )}
                </span>

              </div>

              {/* SOURCE */}

              <div className="detail-item">

                <span className="detail-label">
                  SOURCE
                </span>

                <span className="source">
                  {getSource(
                    selectedIncident
                  )}
                </span>

              </div>

              {/* DESCRIPTION */}

              <div className="detail-section">

                <h4>
                  DESCRIPTION
                </h4>

                <p>
                  {getDescription(
                    selectedIncident
                  )}
                </p>

              </div>

              {/* CAUSE */}

              <div className="detail-section">

                <h4>
                  CAUSE PROBABLE
                </h4>

                <p>
                  {getCause(
                    selectedIncident
                  )}
                </p>

              </div>

              {/* RECOMMANDATION */}

              <div className="detail-section">

                <h4>
                  RECOMMANDATION
                </h4>

                <p>
                  {getRecommendation(
                    selectedIncident
                  )}
                </p>

              </div>

              {/* LOG ORIGINAL */}

              <div className="detail-section">

                <h4>
                  LOG CONCERNÉ
                </h4>

                <pre>
                  {getLogs(
                    selectedIncident
                  )}
                </pre>

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;