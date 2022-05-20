# ProjetBarFoyer

## Initialisation

Pour rendre le projet fonctionnel, assurez-vous

- d'exécuter le script SQL
- de changer la valeur des variables `ipClient` et `ipServer` avec l'adresse IP correspondante. (**fichiers dossier js** + **mailer.php**)
- de changer la valeur des variables `from` et `password` avec les valeurs correspondant à l'adresse gmail.
  > Possibilité de changer de serveur SMTP https://serversmtp.com/fr/liste-serveur-smtp/ (liste des différentes adresses selon le fournisseur)

## Installation des dépendances

> Assurez-vous d'avoir installé les gestionnaires de packets NPM et COMPOSER

### NPM

- `cd client`
- `npm i`
- `npm start`
- Sauvegarder un fichier dépendant des fichiers SCSS ex: **\_bases.scss**

### COMPOSER

- `cd server`
- `composer install`
