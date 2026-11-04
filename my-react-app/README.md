# Sécura — Interface React

Interface React de démonstration pour l’API d’authentification Spring Boot du dépôt. Elle permet de créer un compte, de se connecter et de tester les routes API protégées par JWT.

## Captures d’écran

### Inscription et connexion

<p align="center">
  <img src="../screens/1.png" alt="Formulaire de création de compte" width="49%" />
  <img src="../screens/2.png" alt="Formulaire de connexion" width="49%" />
</p>

### Session connectée et routes API

<p align="center">
  <img src="../screens/3.png" alt="Espace sécurisé après connexion" width="49%" />
  <img src="../screens/4.png" alt="Résultats des appels aux routes hello et profile" width="49%" />
</p>

## Démarrage

Depuis ce dossier, installez les dépendances et démarrez Vite :

```bash
npm install
npm run dev
```

Le backend Spring Boot doit également être lancé sur `http://localhost:8081`. Consultez le [README principal](../readme.md) pour les instructions complètes.
