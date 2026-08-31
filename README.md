# 🤖 AI Incident Analyst

### Plateforme intelligente d'analyse et de détection des incidents de sécurité

**AI Incident Analyst** est une plateforme d'automatisation et d'analyse de logs utilisant l'**Intelligence Artificielle** pour détecter et analyser automatiquement des événements de sécurité à partir des logs d'un serveur web.

Le projet combine **Docker, Nginx, Loki, Promtail, Grafana, n8n et des modèles d'IA** afin de construire une chaîne complète allant de la collecte des logs jusqu'à la génération d'une analyse d'incident structurée.

🔗 **Repository GitHub :**
https://github.com/Jassiro/AI-INCIDENT-ANALYST

---

## 🎯 Présentation du projet

Les serveurs Web génèrent continuellement des logs contenant des informations sur les requêtes HTTP, les adresses IP, les ressources demandées, les codes de réponse et les User-Agent.

L'analyse manuelle de ces données devient rapidement difficile lorsque le volume de logs augmente.

**AI Incident Analyst** a pour objectif d'automatiser ce processus en utilisant une architecture combinant :

* 📥 Collecte des logs
* 🗄️ Centralisation des logs
* 📊 Visualisation
* 🔄 Automatisation des workflows
* 🤖 Analyse par Intelligence Artificielle
* 🔐 Détection d'activités suspectes
* 🚨 Classification des incidents
* 📋 Génération de rapports structurés

---

# 🏗️ Architecture globale

```text
                         ┌──────────────────────┐
                         │       CLIENT         │
                         │ Navigateur / Requête │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP
                                    ▼
                         ┌──────────────────────┐
                         │        NGINX         │
                         │     Serveur Web      │
                         └──────────┬───────────┘
                                    │
                                    │ access.log
                                    ▼
                         ┌──────────────────────┐
                         │      PROMTAIL        │
                         │   Collecte des logs  │
                         └──────────┬───────────┘
                                    │
                                    │ Push
                                    ▼
                         ┌──────────────────────┐
                         │        LOKI          │
                         │ Centralisation logs  │
                         └───────┬───────┬──────┘
                                 │       │
                         ┌───────┘       └────────┐
                         ▼                         ▼
                ┌─────────────────┐       ┌─────────────────┐
                │     GRAFANA     │       │       n8n       │
                │  Visualisation  │       │  Automatisation │
                └─────────────────┘       └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Traitement des  │
                                          │      logs       │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Analyse par IA  │
                                          │ Gemini / Ollama │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Détection et    │
                                          │ classification  │
                                          │ de l'incident  │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Rapport de     │
                                          │ sécurité       │
                                          └─────────────────┘
```

---

# 🔄 Fonctionnement

Le système fonctionne selon plusieurs étapes.

## 1️⃣ Réception des requêtes

Le serveur **Nginx** reçoit les requêtes HTTP provenant des clients.

Chaque requête est enregistrée dans les logs d'accès.

Exemple :

```text
192.168.1.10 - - [31/Aug/2026:10:15:20 +0000] "GET /admin HTTP/1.1" 403 153 "-" "Mozilla/5.0"
```

Les informations disponibles peuvent inclure :

* Adresse IP
* Date et heure
* Méthode HTTP
* URL demandée
* Code HTTP
* Taille de la réponse
* User-Agent
* Referer

---

# 2️⃣ Collecte des logs avec Promtail

**Promtail** surveille les fichiers de logs générés par Nginx.

Il récupère les événements et les transmet à **Loki**.

```text
Nginx
  │
  │ access.log
  ▼
Promtail
  │
  │ Logs
  ▼
Loki
```

Cette étape permet d'automatiser la collecte des logs sans intervention manuelle.

---

# 3️⃣ Centralisation avec Loki

**Loki** constitue la couche de centralisation des logs.

Les logs provenant du serveur sont stockés et peuvent ensuite être interrogés à l'aide de **LogQL**.

Exemple :

```logql
{service_name="nginx"}
```

Recherche des événements contenant un code `403` :

```logql
{service_name="nginx"} |= "403"
```

Cette architecture permet de séparer la collecte des logs de leur analyse.

---

# 4️⃣ Visualisation avec Grafana

**Grafana** permet de visualiser les logs centralisés dans Loki.

Il peut être utilisé pour :

* Explorer les logs
* Rechercher une adresse IP
* Filtrer les requêtes
* Identifier les erreurs HTTP
* Observer les activités suspectes
* Analyser les comportements d'un utilisateur
* Effectuer une investigation manuelle

Grafana fournit ainsi une interface de supervision permettant à un analyste de comprendre rapidement l'activité du serveur.

---

# 5️⃣ Automatisation avec n8n

**n8n** constitue le moteur d'automatisation du projet.

Le workflow permet de récupérer les logs et de les transmettre progressivement aux différentes étapes de traitement.

```text
Loki
  ↓
Récupération des logs
  ↓
Filtrage
  ↓
Nettoyage
  ↓
Préparation des données
  ↓
Analyse IA
  ↓
Classification
  ↓
Rapport d'incident
```

L'utilisation de n8n permet d'éviter la réalisation manuelle de ces différentes opérations.

---

# 6️⃣ Analyse avec l'Intelligence Artificielle

Les événements considérés comme pertinents sont transmis à un modèle d'Intelligence Artificielle.

Le projet peut utiliser notamment :

* **Google Gemini**
* **Ollama**
* Des modèles LLM locaux

L'IA reçoit les informations issues des logs et tente de déterminer si elles correspondent à une activité suspecte.

---

# 🔐 Détection des incidents

Le système est conçu pour pouvoir identifier différentes catégories d'activités de sécurité.

## 🔑 Authentification

* Tentatives de connexion
* Tentatives répétées
* Brute-force
* Accès non autorisés

## 🔎 Reconnaissance

* Scan de répertoires
* Énumération de fichiers
* Recherche de ressources sensibles
* Recherche de panneaux d'administration
* Scan WordPress
* Activités de reconnaissance

## 💉 Attaques Web

* Injection SQL
* Cross-Site Scripting (XSS)
* Traversée de répertoires
* Injection de commandes
* Requêtes HTTP malveillantes

## ⚠️ Anomalies

* Nombre élevé de `403`
* Nombre élevé de `404`
* Nombre élevé de `500`
* User-Agent suspect
* Requêtes répétitives
* Activité anormale provenant d'une adresse IP

---

# 🧹 Filtrage des logs

L'un des objectifs du projet est d'éviter d'envoyer inutilement tous les logs à l'IA.

Les requêtes normales vers des ressources statiques peuvent par exemple être filtrées :

```text
.css
.js
.png
.jpg
.jpeg
.svg
.woff
favicon.ico
```

Cela permet de :

* Réduire le volume de données
* Réduire le nombre d'analyses IA
* Réduire le temps de traitement
* Concentrer l'analyse sur les événements importants

---

# 🚨 Classification des incidents

Lorsqu'un événement suspect est détecté, il peut être classifié selon son niveau de gravité.

```text
🟢 LOW
🟡 MEDIUM
🟠 HIGH
🔴 CRITICAL
```

Exemple de résultat :

```json
{
  "incident_detected": true,
  "incident_type": "Directory Enumeration",
  "severity": "MEDIUM",
  "source_ip": "192.168.1.10",
  "target": "/admin",
  "confidence": 0.91,
  "description": "Plusieurs requêtes ont ciblé des chemins sensibles.",
  "recommendation": [
    "Surveiller l'adresse IP",
    "Analyser les requêtes précédentes",
    "Mettre en place une limitation du nombre de requêtes"
  ]
}
```

---

# 📋 Rapport d'incident

L'objectif final est de transformer les logs bruts en informations directement exploitables.

Un rapport peut contenir :

| Élément         | Description                     |
| --------------- | ------------------------------- |
| Type d'incident | Nature de l'activité            |
| Gravité         | Niveau de criticité             |
| Adresse IP      | Source de l'activité            |
| Cible           | Ressource ciblée                |
| Preuves         | Éléments observés dans les logs |
| Confiance       | Niveau de confiance de l'IA     |
| Impact          | Conséquences potentielles       |
| Recommandations | Actions proposées               |

---

# 📂 Structure du repository

La structure actuelle du repository contient notamment les éléments suivants :

```text
AI-INCIDENT-ANALYST/
│
├── workflows/
│   └── ...
│
├── EXAMPLES.txt
│
├── STEPS.txt
│
├── Tutoriel_Agent_IA_Incident_Analyst.pdf
│
├── docker-compose.yml
│
└── README.md
```

Les fichiers `STEPS.txt`, `EXAMPLES.txt`, le tutoriel PDF et les workflows permettent de documenter le fonctionnement et les différentes étapes du projet.

---

# 🐳 Technologies utilisées

## DevOps

* Docker
* Docker Compose
* Linux
* Nginx
* Git
* GitHub

## Observabilité

* Grafana
* Loki
* Promtail
* LogQL

## Automatisation

* n8n
* REST API
* Webhooks
* JavaScript
* JSON

## Intelligence Artificielle

* Google Gemini
* Ollama
* LLM
* Prompt Engineering
* Analyse automatisée
* Sorties JSON structurées

## Sécurité

* Analyse des logs d'accès
* Détection d'activités suspectes
* Analyse des requêtes HTTP
* Détection d'attaques Web
* Classification des incidents

---

# 🚀 Installation

## Prérequis

Installer les outils suivants :

* Docker
* Docker Compose
* Git

---

## 1. Cloner le repository

```bash
git clone https://github.com/Jassiro/AI-INCIDENT-ANALYST.git
```

Entrer dans le projet :

```bash
cd AI-INCIDENT-ANALYST
```

---

## 2. Démarrer l'infrastructure

Lancer les services avec :

```bash
docker compose up -d
```

Vérifier les conteneurs :

```bash
docker ps
```

---

# 🧪 Tests

Pour générer des requêtes HTTP vers le serveur :

```bash
curl http://localhost/
```

Tester une page inexistante :

```bash
curl http://localhost/not-found
```

Tester une ressource administrative :

```bash
curl http://localhost/admin
```

Générer plusieurs requêtes :

```bash
for i in {1..20}; do curl http://localhost/admin; done
```

Le flux attendu est :

```text
Requête HTTP
     ↓
Nginx
     ↓
access.log
     ↓
Promtail
     ↓
Loki
     ↓
Grafana / n8n
     ↓
Analyse IA
     ↓
Incident
```

---

# 🔒 Sécurité du repository

Les informations sensibles ne doivent jamais être publiées sur GitHub.

Ne jamais publier :

* ❌ Clés API
* ❌ Tokens
* ❌ Mots de passe
* ❌ Identifiants
* ❌ Certificats privés
* ❌ Secrets
* ❌ Logs contenant des données personnelles ou sensibles

Utiliser des variables d'environnement pour les secrets.

Exemple de `.gitignore` :

```gitignore
.env
*.key
*.pem
secrets/
credentials/
*.log
node_modules/
__pycache__/
```

---

# 📚 Documentation

La documentation du projet est disponible directement dans le repository.

### Tutoriel

📄 `Tutoriel_Agent_IA_Incident_Analyst.pdf`

### Étapes du projet

📄 `STEPS.txt`

### Exemples

📄 `EXAMPLES.txt`

### Workflows

📁 `workflows/`

---

# 📈 Améliorations futures

Les prochaines versions du projet pourront intégrer :

* [ ] Détection automatique d'anomalies
* [ ] Alertes automatiques
* [ ] Notifications par e-mail
* [ ] Notifications Telegram / Discord
* [ ] Intégration Threat Intelligence
* [ ] Analyse de réputation des adresses IP
* [ ] Blocage automatique des IP malveillantes
* [ ] Détection avec Machine Learning
* [ ] Support de plusieurs serveurs
* [ ] Déploiement Kubernetes
* [ ] Intégration Prometheus
* [ ] Dashboards Grafana avancés
* [ ] Pipeline CI/CD
* [ ] Déploiement Cloud
* [ ] Réponse automatique aux incidents
* [ ] Classification MITRE ATT&CK

---

# 🎓 Compétences démontrées

Ce projet permet de mettre en pratique plusieurs compétences.

### ⚙️ DevOps

* Docker
* Docker Compose
* Linux
* Nginx
* Git
* GitHub
* Gestion de services

### 📊 Observabilité

* Collecte des logs
* Centralisation
* LogQL
* Grafana
* Loki
* Promtail

### 🔄 Automatisation

* n8n
* REST API
* Workflows
* Transformation de données
* Automatisation des tâches

### 🤖 IA / MLOps

* Intégration de LLM
* Gemini
* Ollama
* Prompt Engineering
* Analyse automatisée
* Sorties JSON structurées

### 🔐 Cybersécurité

* Analyse des logs
* Détection d'incidents
* Analyse des requêtes HTTP
* Détection d'activités suspectes
* Classification des événements

---

# 🌟 Pourquoi ce projet ?

Ce projet se situe à l'intersection de plusieurs domaines :

```text
             DevOps
                │
                ▼
        ┌───────────────┐
        │      AI       │
        │    Incident   │
        │    Analyst    │
        └───────────────┘
          ▲     ▲     ▲
          │     │     │
       MLOps  SecOps  Monitoring
```

Il permet de démontrer la capacité à construire une solution complète allant de **l'infrastructure jusqu'à l'analyse intelligente des événements**.

---

# 👨‍💻 Auteur

## Jasser Ayed

**Élève ingénieur en informatique**

### Domaines d'intérêt

* 🚀 DevOps
* 🤖 MLOps
* ☁️ Cloud Computing
* 🐳 Docker
* 🔄 CI/CD
* 📊 Monitoring & Observabilité
* 🤖 AI Automation
* 🔐 Cybersécurité

### 🔗 GitHub

👉 https://github.com/Jassiro

### 📦 Projet

👉 https://github.com/Jassiro/AI-INCIDENT-ANALYST

---

# ⭐ Conclusion

**AI Incident Analyst** vise à construire une plateforme intelligente capable de transformer des logs Web bruts en informations de sécurité exploitables.

La combinaison :

```text
       Nginx
         +
      Promtail
         +
        Loki
         +
      Grafana
         +
        n8n
         +
    Gemini / Ollama
         ↓
Analyse intelligente des incidents
```

permet de créer une architecture moderne combinant **DevOps, Observabilité, Automatisation, Intelligence Artificielle et Cybersécurité**.

---

## 🚀 Évolution du projet

Le projet est conçu pour évoluer progressivement vers une plateforme plus complète de **Security Operations automatisée**, capable d'assister un analyste dans :

```text
Collecte
   ↓
Détection
   ↓
Analyse
   ↓
Classification
   ↓
Investigation
   ↓
Recommandation
   ↓
Réponse
```

**Projet réalisé par Jasser Ayed — Tunisie 🇹🇳**
