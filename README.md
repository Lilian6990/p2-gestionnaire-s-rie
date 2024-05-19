# Gestionnaire de Séries et Films

Ce projet est une application web permettant de gérer vos séries et films préférés. Vous pouvez ajouter, modifier et supprimer des entrées, ainsi que les filtrer et les trier en fonction de différents critères.

## Fonctionnalités

- Ajouter, modifier et supprimer des films et des séries.
- Filtrer les entrées par statut.
- Trier les entrées par nom, type, statut et note.
- Marquer des entrées comme favoris.
- Visualiser les détails des entrées via une boîte modale.

## Technologies Utilisées

- HTML
- CSS
- JavaScript
- PHP
- SQLite

## Installation

### Prérequis

- Serveur web (ex: Apache, Nginx)
- PHP
- SQLite

### Étapes d'Installation

1. Clonez le dépôt GitHub.

    ```bash
    git clone https://github.com/Lilian6990/p2-gestionnaire-s-rie.git
    cd p2-gestionnaire-s-rie
    ```

2. Assurez-vous que les permissions sur le dossier `images` permettent l'écriture par le serveur web.

    ```bash
    mkdir images
    chmod 777 images
    ```

3. Créez la base de données SQLite (si vous n'utilisez pas la bd fournie dans le dépôt).

    ```bash
    touch data.db
    ```

4. Créez la table `entries` dans la base de données.

    ```sql
    CREATE TABLE entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        season INTEGER,
        episode INTEGER,
        comment TEXT,
        rating INTEGER,
        imagePath TEXT,
        favori INTEGER DEFAULT 0
    );
    ```

5. Placez les fichiers `index.html`, `style.css`, `script.js`, `api.php` et `favicon.png` dans le répertoire racine de votre serveur web.

## Utilisation

1. Accédez à l'application via votre navigateur à l'adresse `http://localhost/gestionnaire-series-films`.

2. Utilisez le formulaire pour ajouter ou modifier des entrées.

3. Utilisez les filtres et les options de tri pour organiser vos séries et films.

4. Cliquez sur le bouton "Détails" pour voir plus d'informations sur chaque entrée dans une boîte modale.

## Aperçu

![image](https://github.com/Lilian6990/p2-gestionnaire-s-rie/assets/75953570/e86c9540-31da-4e09-8632-7213be431e44)
![image](https://github.com/Lilian6990/p2-gestionnaire-s-rie/assets/75953570/833138ef-8db8-4e63-b673-a42f71f44141)
![image](https://github.com/Lilian6990/p2-gestionnaire-s-rie/assets/75953570/09192eed-91b4-47ff-aa2b-ed812ff4ffdc)

## Contribuer

Les contributions sont les bienvenues ! Si vous souhaitez améliorer ce projet, veuillez suivre ces étapes :

1. Forkez le projet.
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/NouvelleFonctionnalite`).
3. Commitez vos modifications (`git commit -am 'Ajout d'une nouvelle fonctionnalité'`).
4. Poussez votre branche (`git push origin feature/NouvelleFonctionnalite`).
5. Ouvrez une Pull Request.

---

**Remarque:** Cette application est un premier test et n'est pas du tout terminée mais fonctionnelle.
