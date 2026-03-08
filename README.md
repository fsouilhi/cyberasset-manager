# 🛡️ CyberAsset Manager

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow)
![CI](https://github.com/fsouilhi/cyberasset-manager/actions/workflows/ci.yml/badge.svg)

> Plateforme de gestion des actifs informatiques avec module d'analyse de risques **EBIOS Risk Manager** (méthode ANSSI).

## 🌍 Demo en ligne

- **Application** : https://cyberasset-manager.vercel.app
- **API** : https://cyberasset-backend.onrender.com
- Compte de démonstration : `fatima@test.com` / `password123`

> Note : le backend est hébergé sur un plan gratuit (Render Free). La première requête peut prendre 30-50 secondes si le service est en veille.

---

## 📋 Description

**CyberAsset Manager** est une application web full-stack permettant aux équipes sécurité de :

- **Inventorier** les actifs du SI (serveurs, postes, équipements réseau, applications)
- **Classifier** les actifs par criticité et sensibilité
- **Analyser les risques** selon la méthode **EBIOS RM** de l'ANSSI (5 ateliers)
- **Suivre** les mesures de sécurité associées
- **Générer** des rapports d'analyse de risques exportables

Ce projet s'inscrit dans une démarche de conformité **NIS2** et de bonnes pratiques de cybersécurité.

---

## 🏗️ Architecture

```
cyberasset-manager/
├── backend/                    # API REST — Node.js + Express
│   ├── src/
│   │   ├── controllers/        # Logique métier
│   │   ├── routes/             # Endpoints API
│   │   │   ├── auth.routes.js
│   │   │   ├── assets.routes.js
│   │   │   └── ebios.routes.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  # JWT verification
│   │   └── db/
│   │       ├── index.js           # Pool PostgreSQL
│   │       └── schema.sql         # Modèle de données
│   └── package.json
├── frontend/                   # SPA — React 18 + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Assets.jsx
│   │   │   └── EBIOS/
│   │   │       ├── Workshop1.jsx   # Valeurs métier & biens supports
│   │   │       ├── Workshop2.jsx   # Sources de risque
│   │   │       ├── Workshop3.jsx   # Scénarios stratégiques
│   │   │       ├── Workshop4.jsx   # Scénarios opérationnels
│   │   │       └── Workshop5.jsx   # Traitement du risque
│   │   ├── components/
│   │   └── services/
│   │       └── api.js
│   └── package.json
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
└── .env.example
```

---

## 🔐 Sécurité

| Mécanisme | Implémentation |
|-----------|---------------|
| Authentification | JWT (access token 15min + refresh token) |
| Hachage des mots de passe | bcrypt (salt rounds: 12) |
| Protection des routes | Middleware JWT sur toutes les routes privées |
| Variables sensibles | `.env` (jamais committé) |
| CORS | Configuré avec whitelist |

---

## 🎯 Module EBIOS Risk Manager

Implémentation des **5 ateliers** de la méthode EBIOS RM (ANSSI, 2018) :

| Atelier | Objectif | Entités modélisées |
|---------|----------|-------------------|
| **1** | Cadrage & socle de sécurité | Valeurs métier, biens supports, événements redoutés |
| **2** | Sources de risque | Acteurs menaçants, objectifs visés, pertinence |
| **3** | Scénarios stratégiques | Chemins d'attaque, niveau de vraisemblance |
| **4** | Scénarios opérationnels | Modes opératoires, cotation technique |
| **5** | Traitement du risque | Mesures de sécurité, risques résiduels |

---

## 🚀 Démarrage rapide

### Prérequis
- Docker & Docker Compose
- Node.js 18+

### Avec Docker (recommandé)

```bash
git clone https://github.com/fsouilhi/cyberasset-manager.git
cd cyberasset-manager
cp .env.example .env
# Éditer .env avec vos valeurs
docker-compose up -d
```

L'application sera accessible sur `http://localhost:3000`

### En développement local

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (dans un autre terminal)
cd frontend && npm install && npm run dev
```

---

## 🌐 Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, Vite, React Router v6, Axios, Recharts |
| Backend | Node.js 18, Express 4, Joi (validation) |
| Base de données | PostgreSQL 15, node-postgres (pg) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Conteneurisation | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Déploiement | Render (backend + DB), Vercel (frontend) |

---

## 📊 Endpoints API

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Connexion + JWT |
| POST | `/api/auth/refresh` | Rafraîchir le token |

### Actifs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/assets` | Lister tous les actifs |
| POST | `/api/assets` | Créer un actif |
| PUT | `/api/assets/:id` | Modifier un actif |
| DELETE | `/api/assets/:id` | Supprimer un actif |

### EBIOS RM
| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST | `/api/ebios/business-values` | Valeurs métier |
| GET/POST | `/api/ebios/risk-sources` | Sources de risque |
| GET/POST | `/api/ebios/scenarios/strategic` | Scénarios stratégiques |
| GET/POST | `/api/ebios/scenarios/operational` | Scénarios opérationnels |
| GET/POST | `/api/ebios/measures` | Mesures de sécurité |
| GET | `/api/ebios/report/:projectId` | Rapport complet |

---

## 📄 Licence

MIT © 2025 — Projet portfolio dans le cadre d'une démarche de formation en cybersécurité.
