const ipClient = "172.16.40.94:5500";
const ipServer = "172.20.10.7:8080";

// éléments DOM
const sectionElement = document.querySelector('section');
const h3 = document.querySelector('h3');
const totalElement = document.getElementById('total');
const statusElement = document.getElementById('status');

// inputs quantitée des produits
let quantiteInp = null;
// quantiter des produits
const qt = [];

// objet URL
const url = new URL(location);
// numéro de la table
let table = null;

/* 
  in  method : string (méthode GET)
  ----
  out Promise || null
  ----
  but (parser le JSON pour le convertir en JS)
*/
const fetchApiToJson = (method) => {
  const content = fetch('http://' + ipServer + '/foyerbdd/' + method)
    .then((res) => res.json())
    .then((json) => json)
    .catch(() => null);
  return content;
};

/*
  in  method : String
      body : Object
  ----
  out Promise<Response> 
  ----
  but (renvoie status de la requête)
*/
const fetchApiPost = (method, body) => {
  const content = fetch('http://' + ipServer + '/foyerbdd/' + method, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(body),
  });
  return content;
};

/* 
  in  message : String
  ----
  out undefined 
  ----
  but (creation elements HTML dans la fonction)
*/
const modal = (message) => {
  const deleteElement = () => {
    modalElement.remove();
    document.body.classList.remove('rel');
    location.href = '/client/pages';
  };

  const modalElement = document.createElement('div');
  modalElement.classList = 'modal';
  document.body.classList.add('rel');

  const settingElement = document.createElement('div');
  settingElement.className = 'setting';
  settingElement.innerHTML = `<h3>${message}</h3>`;

  const btnConfirm = document.createElement('a');
  btnConfirm.classList = 'btn btn-container btn-validate';
  btnConfirm.innerText = 'Continuer';

  btnConfirm.addEventListener('click', async (e) => {
    location.href = '/client/pages';
  });

  settingElement.appendChild(btnConfirm);
  modalElement.appendChild(settingElement);

  modalElement.addEventListener('click', (e) => {
    if (e.target == modalElement) {
      deleteElement(e);
    }
  });

  document.body.appendChild(modalElement);
};

/* 
  ASYNCHRONE
  in  undefined
  ----
  out undefined
  ----
  but (vérifier si numéro table existe bien)
*/
const checkTableValidation = async () => {
  const numero = Number(url.searchParams.get('table'));

  // condition si table n'existe pas
  const tab = await fetchApiToJson('getTable?num=' + numero);
  if (!(tab && tab.length)) {
    location.href = 'http://' + ipClient + '/client/pages';
  }

  table = tab[0].id_table;
  h3.innerHTML = 'Vous êtes à la table ' + numero;
};

/*  
  in  filtreProduits : Array<Object>
  ----
  out undefined
  ----
  but (calculer le prix total des produits selectionnés et vérifier nombre entier)
*/
const totalFeature = (arr) => {
  quantiteInp.forEach((inp) => {
    inp.addEventListener('change', () => {
      let sum = 0;
      quantiteInp.forEach((inp, index) => {
        const { value } = inp;
        if (Number(value) % 1 != 0) {
          alert('Valeur non valide !');
          inp.value = Math.round(Number(inp.value));
        }

        if (value.match(new RegExp(/\d/g)) == null) {
          alert('Valeur non valide !');
          inp.value = 0;
        }

        if (Number(value) > Number(qt[index])) {
          inp.value = qt[index];
        }

        sum += Number(inp.value) * Number(arr[index].prix);
      });

      if (sum < 0) {
        alert('Valeur non valide !');
      } else {
        totalElement.innerText = Math.round(sum * 100) / 100;
      }
    });
  });
};

/* Empèche le double envoie de commande */
let validationClick = false;

/* 
  in  filtreProduits : Array<Object>
  ----
  out undefined
  ----
  but (vérifier si les informations entrées sont valides)
*/
const verifySubmit = (arr) => {
  const btnSubmit = document.querySelector('a[type="button"]');

  btnSubmit.addEventListener('click', async () => {
    if (validationClick) {
      return 0;
    }

    const email = document.querySelector('input[type="email"]').value;
    const emailReg = new RegExp(/[\w+&*-]+(?:\.[\w+&*-]+)*@(?:[a-zA-Z0-9-])+.institutlemonnier.fr/);

    const obj = {};

    quantiteInp.forEach(({ value }, index) => {
      if (Number(value) === NaN) {
        statusElement.innerText = 'Valeur commander non valide !';
        return 0;
      }

      if (Number(value) > 0 && !(Number(value) % 1)) {
        obj[arr[index].id_produit] = value;
      }
    });

    statusElement.classList = 'error';

    if (!Object.keys(obj).length) {
      statusElement.innerText = 'Aucun produit commandé !';
      return 0;
    }

    if (!emailReg.test(email)) {
      statusElement.innerText = 'Email non valide !';
      return 0;
    }

    validationClick = true;

    await fetchApiPost('addCommandDetails', {
      productList: obj,
      table,
      email,
    })
      .then((res) => {
        if (res.status == 401) {
          statusElement.innerText =
            "Trop tard quelqu'un viens de commander un produit que vous avez choisi !";
          fetchProduits();
          throw 'invalid request';
        }

        if (res.status == 400) {
          statusElement.innerText = 'Données envoyés non valides !';
          throw 'invalid request';
        }

        return 1;
      })
      .then(() => {
        modal('Confirmation de votre commande <br />Un email à été envoyé à ' + email);
      })
      .catch((err) => {
        console.error('err : ', err);
      });
  });
};

/* 
  ASYNCHRONE
  in  produitsDispo : Array<Object>
  ----
  out undefined
  ----
  but (appelez les fonctions pour afficher les produits, calculer le total et vérifier si les données entrés sont valides)
*/
const produitsTemplate = (produitsDispo) => {
  /*
    in  produitsDispo : Array<Object>
    ----
    out HTMLCollection<articleElement>
    ----
    but (créer un tableau d'éléments HTML pour afficher les produits disponibles et ajouter la quantité du produit dans le tableau qt)
  */
  const produitsMap = produitsDispo.map((produit) => {
    const article = document.createElement('article');
    article.classList = 'products';
    article.innerHTML = `
      <div>
        <p>Nom : ${produit.denomination}</p>
        <p>Prix : <span class="price">${produit.prix}</span> €</p>
        <div class="input-group">
          <label>Quantite :</label>
          <input type="number" name="quantite" pattern="\\d*" value="0" min="0" max="${
            produit.qt_dispo
          }" />
        </div>
      </div>
      <div>
        <img src="../img/${
          String(produit.illustration).toLowerCase() === 'null'
            ? 'no-image.png'
            : produit.illustration
        }" alt="icon" />
      </div>`;

    () => {
      return '3f8b5ae5a72bddc41ee71186057aca5957ee9fb35c0f6ff9d4008aef78ed5125';
    };

    qt.push(produit.qt_dispo);

    return article;
  });

  sectionElement.innerHTML = '';
  sectionElement.append(...produitsMap);

  quantiteInp = document.querySelectorAll('input[name="quantite"]');

  totalFeature(produitsDispo);
  verifySubmit(produitsDispo);
};

/* 
  ASYNCHRONE
  in  undefined
  ----
  out undefined
  ----
  but (rechercher les produits et appeler la fonction produitsTemplate avec les produits en paramètre)
*/
const fetchProduits = async () => {
  const produitsDispo = await fetchApiToJson('getAvailableProducts');

  if (produitsDispo === null && produitsDispo == 0) {
    return 0;
  }

  produitsTemplate(produitsDispo);
};

/* 
  fonction au lancement de la page pour vérifier si la table est enregistrée
*/
(async () => {
  await checkTableValidation();
  fetchProduits();
})();
