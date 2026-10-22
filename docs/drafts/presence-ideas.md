# Pousser la présence Discord plus loin — idées

Brouillon du 2026-10-22. À trancher par Lucas avant tout code.

## Ce qui existe aujourd'hui

- Une seule connexion Lanyard (WebSocket) pour tout le client : `components/presence/PresenceProvider.tsx`.
- `select-presence.ts` choisit : un jeu (activité de type 0), sinon Spotify, sinon le statut Discord. Tout le reste du payload est ignoré.
- Où ça se voit : l'anneau de statut de la tête chibi (carte joueur, barre mobile), le panneau d'amis (carte de 76px : jeu avec image + temps écoulé + pose LoL, Spotify avec pochette + égaliseur + pose music, statut avec une ligne rigolote, hors ligne avec la pose sleeping), et l'écran « ajouter en ami » de Contact qui réutilise la même carte.
- L'annonce lecteur d'écran trop bavarde signalée par l'audit est **déjà corrigée** (une ligne polie séparée, seulement les changements d'activité tenus 2 s, jamais le morceau ni le chrono).

## Ce que Lanyard expose vraiment pour ton compte

Relevé en direct sur `api.lanyard.rest/v1/users/127063570616811520` (tu écoutais « RACAILLE » d'Ino Casablanca) :

| Donnée | Utilisée ? | Remarque |
| --- | --- | --- |
| `discord_status` | oui | online / idle / dnd / offline |
| `active_on_discord_desktop / mobile / web` | non | desktop = true au relevé |
| `spotify` : `song`, `artist`, `album`, `album_art_url` | oui (sauf album) | |
| `spotify.timestamps.start / end` | **non** | de quoi faire une vraie barre de progression |
| `spotify.track_id` | **non** | lien `open.spotify.com/track/<id>` |
| `activities[]` type 0 (jeu) | oui | nom, details, state, images, `timestamps.start` |
| type 1 (stream), 3 (regarde), 4 (statut perso avec emoji), 5 (compétition) | **non** | le statut perso Discord passe par le type 4 |
| `discord_user` : décoration d'avatar, nameplate (drapeau France), tag de serveur `>DEV`, couleur du pseudo | non | |
| `kv` | non | vide : il faut lier une clé API Lanyard (`.apikey` en DM au bot) pour l'écrire |

Un point à corriger quoi qu'on choisisse : si tu as une extension de rich presence dans ton éditeur (vscord, Cursor, Zed…), elle arrive comme un « jeu » de type 0, donc le site affiche aujourd'hui « playing Visual Studio Code » avec la pose LoL.

Au-delà de Lanyard : Upstash Redis existe déjà pour l'arcade (adaptateur REST en `fetch`, Effect v4). Il permet de garder un historique, à condition que quelque chose relève Lanyard régulièrement (un workflow GitHub Actions planifié toutes les 5 min est gratuit, le dépôt est public ; un cron Vercel à la minute demande le plan Pro).

## Les idées, de la plus rentable à la moins rentable

Barème : plaisir pour le visiteur (★ à ★★★) contre effort (S, M, L).

### 1. Spotify « now playing » complet — ★★★ / S

**Ce que voit le visiteur :** dans la même carte de 76px, une fine barre de progression qui avance en direct sous le titre (temps écoulé / durée en Data au survol), et la carte devient un lien « écouter sur Spotify » vers le morceau. L'album en infobulle de la pochette.
**Données :** `spotify.timestamps`, `spotify.track_id`, `spotify.album`. Rien de nouveau côté serveur.
**Vie privée :** aucune de plus qu'aujourd'hui (le morceau est déjà affiché).
**Coût :** une règle pure `track-progress.ts` testée, une barre animée par une seule horloge (statique sous reduced motion : position mise à jour chaque seconde sans transition).

### 2. La pose du chibi suit ton activité, partout — ★★★ / S–M

**Ce que voit le visiteur :** le chibi du bandeau d'accueil et celui de Contact prennent la pose de ce que tu fais : coding quand tu codes, lol quand tu joues, music quand tu écoutes, series quand tu regardes quelque chose, coffee quand tu es « absent », sleeping hors ligne ou la nuit à Paris. Le boop continue de marcher par-dessus.
**Données :** l'activité déjà sélectionnée, plus les types 3 et l'éditeur de code (idée 3). Règle pure `activity-pose.ts`.
**Vie privée :** rien de nouveau.
**Coût :** petit ; attention au premier rendu (statique, donc la pose live arrive après connexion sans saut de mise en page).

### 3. Le mode « en train de coder » — ★★☆ / M

**Ce que voit le visiteur :** au lieu de « playing Visual Studio Code », une carte « coding » : l'icône du langage, « en TypeScript », depuis 1:24:10, la pose coding. Optionnellement le nom du projet.
**Données :** l'activité de l'éditeur (nom ou `application_id` de VS Code / Cursor / Zed / JetBrains), le langage dans `assets.large_text` ou `details`, l'espace de travail dans `state`. Il te faut une extension de rich presence (vscord par exemple) configurée.
**Vie privée :** **forte** pour le nom du projet ou du fichier (projets clients, Predi.GG pas encore annoncé…). Proposition : langage seulement, jamais de nom de fichier ni de dossier, et tu règles l'extension pour qu'elle n'envoie que ça.
**Coût :** moyen ; dépend de ce que ton extension envoie exactement, à relever en direct pendant que tu codes.

### 4. Ton message du jour depuis Discord — ★★☆ / S

**Ce que voit le visiteur :** quand tu n'es ni en jeu ni en musique, ta ligne de statut perso Discord (emoji compris) remplace la phrase rigolote générique (« probably shipping something »).
**Données :** l'activité de type 4 (`state` + `emoji`), ou une clé KV Lanyard `site_message` que tu écris d'un `.set site_message …` au bot depuis ton téléphone, sans déploiement.
**Vie privée :** ton statut perso est écrit pour tes amis, pas forcément pour un recruteur. La variante KV est un canal dédié au site, que tu contrôles seul.
**Coût :** petit ; le texte vient de toi, on le tronque à une ligne et on ne l'interprète jamais (pas de lien, pas de HTML).

### 5. L'appareil — ★☆☆ / XS

**Ce que voit le visiteur :** une petite icône à côté du statut : sur PC, sur mobile, sur le web (« sur son téléphone »).
**Données :** `active_on_discord_desktop / mobile / web`.
**Vie privée :** légère : ça dit quand tu n'es pas à ton bureau.
**Coût :** minime.

### 6. Une notification quand ton statut change pendant la visite — ★★☆ / M

**Ce que voit le visiteur :** le toast du menu rapide (pose + titre + une ligne) en bas à droite : « Lucas vient de se connecter », « Lucas lance League of Legends ». Au plus un par changement tenu, quelques-uns par visite, jamais au premier état.
**Données :** les transitions de `presenceActivity`, déjà calculées pour le lecteur d'écran.
**Vie privée :** aucune.
**Coût :** moyen. DESIGN.md dit aujourd'hui « la présence ne joue jamais de son » et « le son ne joue jamais sur un événement automatique » : je proposerais le toast **sans son**, sauf si tu veux revenir sur cette règle.

### 7. Des succès de visiteur liés à ta présence — ★★☆ / L

**Ce que voit le visiteur :** « Pris en ligne » (tu étais connecté pendant sa visite), « Même vibe » (il a cliqué sur « écouter » pendant que tu écoutais), « Oiseau de nuit » (visite pendant que tu dors), débloqués avec le toast et le son d'unlock (le son vient de son clic quand il y en a un).
**Données :** la présence live, gardée dans le `localStorage` du visiteur.
**Vie privée :** rien côté Lucas ; rien n'est envoyé.
**Coût :** grand, car il n'existe pas encore d'endroit où le visiteur voit ses propres succès (il faudrait une vitrine, par exemple dans le menu rapide ou une section du profil).

### 8. « Récemment » : l'historique — ★★★ / L

**Ce que voit le visiteur :** sous la carte de présence (ou sur Contact), les 3 à 5 dernières choses : « League of Legends · hier », « RACAILLE — Ino Casablanca · il y a 2 h », « codé 3 h en TypeScript · aujourd'hui ».
**Données :** un relevé de Lanyard toutes les 5 min (workflow GitHub Actions planifié qui appelle une route protégée par un secret), une liste bornée dans Upstash (les 20 dernières sessions), lue par le serveur. Le code serveur en Effect, comme l'arcade.
**Vie privée :** **la plus forte** : un historique horodaté dit quand tu dors, quand tu joues pendant les heures de travail, ce que tu écoutes en boucle. Garde-fous possibles : seulement les jeux et la musique, jamais les statuts ; des dates floues (« hier », « cette semaine ») ; une liste noire que tu remplis depuis l'Admin ; purge auto après 7 jours.
**Coût :** grand (route, secret, workflow, store, règles de session, rendu, page Admin éventuelle). Upstash gratuit suffit (≈ 9 000 relevés par mois).

### 9. Ton identité Discord réelle — ★☆☆ / S

**Ce que voit le visiteur :** dans la carte d'ami de Contact, ton tag de serveur `>DEV`, la couleur de ton pseudo Discord et ta nameplate aux couleurs de la France.
**Données :** `discord_user.primary_guild`, `display_name_styles`, `collectibles.nameplate` (pas dans les types de `react-use-lanyard`, à typer nous-mêmes).
**Vie privée :** faible.
**Coût :** petit, mais le chibi fait déjà l'identité ; ça ajoute du bruit visuel au monde Player Profile.

## Ma recommandation

Un premier lot cohérent et sans risque : **1 (Spotify complet) + 2 (pose qui suit l'activité) + 3 (mode coding, langage seulement)**, plus **4 (message du jour)** si tu veux un levier que tu pilotes depuis ton téléphone. L'historique (8) est la plus belle idée mais mérite sa propre PR et des choix de vie privée tranchés.

## Décision (2026-10-22)

Lucas a choisi **1, 2, 3, 4 et 5** : Spotify complet, la pose qui suit l'activité, le mode coding avec **langage et projet** publics (jamais le fichier), le message du jour depuis **la clé KV Lanyard `site_message`, sinon le statut perso Discord**, et l'appareil. Construits dans la même PR ; voir `docs/presence.md`. Restent ouvertes : 6 (toast), 7 (succès de visiteur), 8 (historique), 9 (identité Discord).
