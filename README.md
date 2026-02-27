# OpenBook Studio

Application web (single-page) au style inspiré **OpenAI + Apple 2024** pour écrire et organiser des livres.

## Fonctionnalités

- Connexion simulée via **Email / Google / WattPad**.
- Tableau de bord "Home" avec tes livres:
  - couverture,
  - nombre de mots écrits aujourd'hui,
  - nombre de chapitres.
- Éditeur complet pour chaque livre:
  - chapitres,
  - description,
  - personnages,
  - trame,
  - idées,
  - images/moodboard,
  - storyboard,
  - zone d'écriture avec compteur de mots en direct.
- Objectifs personnalisés:
  - mots par jour,
  - objectif hebdomadaire (ex: "Écrire 1 chapitre").
- Partage d'un livre en mode **lecture seule** dans la bibliothèque publique.
- Export "rétrocompatible WattPad" (JSON prêt à transformer/importer).
- Sauvegarde locale automatique dans `localStorage`.

## Lancer le site

Tu peux ouvrir `index.html` directement, ou lancer un serveur local:

```bash
python3 -m http.server 4173
```

Puis ouvre `http://localhost:4173`.
