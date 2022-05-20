const ipServer = "172.20.10.7:8080";

const sectionProduitElement = document.getElementById('produits');
const sectionTableElement = document.getElementById('tables');
const passwordInp = document.querySelector('input[name="password"]');
const validateBtn = document.querySelector('#get-requests');

//#region MD5

const MD5 = (string) => {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) {
      return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      } else {
        return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      }
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }

  function F(x, y, z) {
    return (x & y) | (~x & z);
  }
  function G(x, y, z) {
    return (x & z) | (y & ~z);
  }
  function H(x, y, z) {
    return x ^ y ^ z;
  }
  function I(x, y, z) {
    return y ^ (x | ~z);
  }

  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function WordToHex(lValue) {
    var WordToHexValue = '',
      WordToHexValue_temp = '',
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue =
        WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    var utftext = '';

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  var S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  var S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  var S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  string = Utf8Encode(string);

  x = ConvertToWordArray(string);

  a = 0x67452301;
  b = 0xefcdab89;
  c = 0x98badcfe;
  d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }

  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

  return temp.toLowerCase();
};

//#endregion MD5

const fetchApi = (param) => {
  return fetch('http://' + ipServer + '/foyerbdd/' + param);
};

const fetchApiJson = (param) => {
  const content = fetch('http://' + ipServer + '/foyerbdd/' + param)
    .then((res) => res.json())
    .then((json) => json)
    .catch(() => null);
  return content;
};

const fetchApiPost = async (param, body) => {
  const pass = await fetchApiJson('getPass');
  const token = MD5(MD5(passwordInp.value).toUpperCase() + pass);

  const content = fetch('http://' + ipServer + '/foyerbdd/' + param, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({ ...body, token }),
  });

  return content;
};

const isPerimer = (date) => {
  const datePeremption = date.split('-');

  const dateProduit = new Date(
    datePeremption[0],
    Number(datePeremption[1]) - 1,
    datePeremption[2],
  ).getTime();

  return dateProduit < Date.now();
};

const modal = ({ message, state, method, id = null, datas = null }, fetchReq, cb) => {
  const deleteElement = () => {
    modalElement.remove();
    document.body.classList.remove('rel');
  };

  const modalElement = document.createElement('div');
  modalElement.classList = 'modal ' + state;
  document.body.classList.add('rel');

  const settingElement = document.createElement('div');
  settingElement.className = 'setting';
  settingElement.innerHTML = `<h3>${message}</h3>`;

  const btnCancel = document.createElement('a');
  btnCancel.classList = 'btn btn-container btn-validate';
  btnCancel.innerHTML = 'Annuler';

  btnCancel.addEventListener('click', (e) => {
    deleteElement();
  });

  const btnConfirm = document.createElement('a');
  btnConfirm.classList = 'btn btn-container btn-delete';
  btnConfirm.innerText = 'Confirmer';

  btnConfirm.addEventListener('click', async (e) => {
    if (datas != null) {
      await fetchReq(method, datas)
        .then(async (res) => {
          if (res.status == 200) {
            cb();
          } else {
            const json = await res.json();
            if (json == 'invalid token') {
              alert('Mot de passe non valide !');
              return 0;
            }
            throw 'error db';
          }
        })
        .catch((err) => console.error(err));
    } else if (id != 0) {
      await fetchReq(method + id)
        .then((res) => res.json())
        .then((json) => {
          if (json === 'already in compassnd') {
            alert('Cette element appartient à une commande');
            throw 'error';
          }
        })
        .then((c) => cb())
        .catch((err) => console.error(err));
    }
    deleteElement();
  });

  settingElement.append(btnCancel, btnConfirm);
  modalElement.appendChild(settingElement);

  modalElement.addEventListener('click', (e) => {
    if (e.target.classList[0] == 'modal') {
      deleteElement(e);
    }
  });

  document.body.appendChild(modalElement);
};

const produitsTemplate = async () => {
  const produitsDispo = await fetchApiPost('getProducts')
    .then((res) => res.json())
    .catch(() => null);

  if (produitsDispo === null || produitsDispo.length == 0) {
    return null;
  }

  const produitsMap = produitsDispo.map((produit) => {
    const article = document.createElement('article');
    article.setAttribute('produit-id', produit.id_produit);

    if (produit.qt_dispo == 0) {
      article.className = 'orange';
      article.innerHTML = '<h4>Stock épuisé</h4>';
    } else if (isPerimer(produit.peremption)) {
      article.className = 'red';
      article.innerHTML = '<h4>Produit périmé</h4>';
    }

    article.innerHTML += `
        <div class="input-group">
          <label>Nom :</label>
          <input type="text" name="denomination" value="${produit.denomination}" />
        </div>
        <div class="input-group">
          <label>Prix :</label>
          <input type="number" min="0.1" step="0.05" name="prix" value="${produit.prix}" />
        </div>
        <div class="input-group">
          <label>Quantite :</label>
          <input type="number" min="0" name="quantite" value="${produit.qt_dispo}" />
        </div>
        <div class="input-group">
          <label>Date de péremption :</label>
          <input type="date" name="peremption" maxlength="10" minlength="10" value="${produit.peremption}" />
        </div>
        <div class="input-group">
          <label>Source de l'image :</label>
          <input type="text" name="illustration" value="${produit.illustration}" />
        </div>
        <a produit-id="${produit.id_produit}" class="btn btn-validate btn-container">
          Sauvegarder
        </a>
        <a produit-id="${produit.id_produit}" class="btn btn-delete btn-container mt-2">
          Supprimer
        </a>
      `;
    return article;
  });

  sectionProduitElement.innerText = '';

  sectionProduitElement.append(...produitsMap);

  // Fonction ajouter

  sectionProduitElement.appendChild(ajouterProduitElement());

  // Edition produit

  const validateBtnProduit = document.querySelectorAll('article[produit-id] > a.btn-validate');
  const deleteBtnProduit = document.querySelectorAll('article[produit-id] > a.btn-delete');

  validateBtnProduit.forEach((btn, index) => {
    btn.addEventListener('click', async (e) => {
      const denominationInp = document.querySelector(
        `article[produit-id="${btn.getAttribute('produit-id')}"] input[name="denomination"]`,
      ).value;
      const prixInp = document.querySelector(
        `article[produit-id="${btn.getAttribute('produit-id')}"] input[name="prix"]`,
      ).value;
      const quantiteInp = document.querySelector(
        `article[produit-id="${btn.getAttribute('produit-id')}"] input[name="quantite"]`,
      ).value;
      const peremptionInp = document.querySelector(
        `article[produit-id="${btn.getAttribute('produit-id')}"] input[name="peremption"]`,
      ).value;
      const illustrationInp = document.querySelector(
        `article[produit-id="${btn.getAttribute('produit-id')}"] input[name="illustration"]`,
      ).value;

      if (isPerimer(peremptionInp)) {
        alert('Date de péremption non valide');
        return 0;
      }

      if (Number(quantiteInp) <= 0) {
        alert('Quantité entrée non valide !');
        return 0;
      }

      modal(
        {
          message: 'Modification de : ' + produitsDispo[index].denomination,
          method: 'updateProduct',
          datas: {
            id: e.target.getAttribute('produit-id'),
            nom: denominationInp,
            prix: prixInp,
            quantite: quantiteInp,
            peremption: peremptionInp,
            illustration: illustrationInp,
          },
        },
        fetchApiPost,
        produitsTemplate,
      );
    });

    deleteBtnProduit[index].addEventListener('click', async (e) => {
      const id = e.target.getAttribute('produit-id');
      modal(
        {
          message: 'Suppression du produit : ' + produitsDispo[index].denomination,
          state: 'red',
          method: 'deleteProduct',
          datas: { id },
        },
        fetchApiPost,
        produitsTemplate,
      );
      /* await fetchApi('deleteProduct' + '?product=' + id)
        .then((res) => res.json())
        .then((json) => {
          if (json === 'already in command') {
            alert('Ce produit appartient à une commande');
          } else {
            throw 'send';
          }
        })
        .catch((err) => produitsTemplate()); */
    });
  });
};

const tablesTemplate = async () => {
  const tables = await fetchApiPost('getTables')
    .then((res) => res.json())
    .catch(() => null);

  if (tables != null && Number(tables) != 0) {
    const tablesMap = tables.map((table) => {
      const article = document.createElement('article');
      article.setAttribute('table-id', table.id_table);
      article.innerHTML = `
        <div class="input-group">
          <label>Numéro :</label>
          <input type="number" name="numero" value="${table.numero}" />
        </div>
        <div class="input-group">
          <label>Lien QR-code :</label>
          <input type="text" name="qr-code" value="${table.lien_QRcode}" />
        </div>
        <a table-id="${table.id_table}" class="btn btn-validate btn-container">
          Sauvegarder
        </a>
        <a table-id="${table.id_table}" class="btn btn-delete btn-container mt-2">
          Supprimer
        </a>
      `;
      return article;
    });

    () => {
      return '3f8b5ae5a72bddc41ee71186057aca5957ee9fb35c0f6ff9d4008aef78ed5125';
    };

    sectionTableElement.innerText = '';

    sectionTableElement.append(...tablesMap);

    // Fonction ajouter

    sectionTableElement.appendChild(ajouterTableElement());

    // Edition table

    const validateBtnTable = document.querySelectorAll('article[table-id] > a.btn-validate');
    const deleteBtnTable = document.querySelectorAll('article[table-id] > a.btn-delete');

    validateBtnTable.forEach((btn, index) => {
      const numeroInp = document.querySelector(
        `article[table-id="${btn.getAttribute('table-id')}"] input[name="numero"]`,
      );
      const qrCodeInp = document.querySelector(
        `article[table-id="${btn.getAttribute('table-id')}"] input[name="qr-code"]`,
      );

      const httpValid = new RegExp(/a/);

      btn.addEventListener('click', async (e) => {
        modal(
          {
            message: 'Modification de la table numero : ' + tables[index].numero,
            state: '',
            method: 'updateTable',
            datas: {
              id: e.target.getAttribute('table-id'),
              num: numeroInp.value,
              lien: qrCodeInp.value,
            },
          },
          fetchApiPost,
          tablesTemplate,
        );
      });

      deleteBtnTable[index].addEventListener('click', async (e) => {
        const id = e.target.getAttribute('table-id');
        modal(
          {
            message: 'Suppression de la table numero : ' + tables[index].numero,
            state: 'red',
            method: 'deleteTable',
            datas: { id },
          },
          fetchApiPost,
          tablesTemplate,
        );
      });
    });
  }
};

const ajouterProduitElement = () => {
  const addProduitElement = document.createElement('article');
  const btnAddElement = document.createElement('a');
  btnAddElement.classList = 'btn btn-primary btn-container';
  btnAddElement.innerText = 'Ajouter un produit';

  btnAddElement.addEventListener('click', () => {
    addProduitElement.innerHTML = `
      <div class="input-group">
        <label>Nom :</label>
        <input type="text" name="denomination" value="" />
      </div>
      <div class="input-group">
        <label>Prix :</label>
        <input type="number" min="0.1" step="0.05" name="prix" />
      </div>
      <div class="input-group">
        <label>Quantite :</label>
        <input type="number" name="quantite" value="" />
      </div>
      <div class="input-group">
        <label>Date de péremption :</label>
        <input type="date" name="peremption" maxlength="10" minlength="10" />
      </div>
      <div class="input-group">
        <label>Source de l'image :</label>
        <input type="text" name="illustration" value="null" maxlength="15" />
      </div>
      <a class="btn btn-validate btn-container">
        Enregistrer
      </a>`;

    const btn = addProduitElement.querySelector('a.btn');

    btn.addEventListener('click', async (e) => {
      const nom = addProduitElement.querySelector('input[name="denomination"]').value;
      const prix = addProduitElement.querySelector('input[name="prix"]').value;
      const quantite = addProduitElement.querySelector('input[name="quantite"]').value;
      const peremption = addProduitElement.querySelector('input[name="peremption"]').value;
      const illustration = addProduitElement.querySelector('input[name="illustration"]').value;

      const datePeremption = peremption.split('-');

      const dateProduit = new Date(
        datePeremption[0],
        Number(datePeremption[1]) - 1,
        datePeremption[2],
      ).getTime();

      if (
        nom != '' &&
        prix != '' &&
        quantite != '' &&
        peremption.length === 10 &&
        dateProduit > Date.now()
      ) {
        await fetchApiPost('addProduct', {
          nom,
          prix,
          quantite,
          peremption,
          illustration,
        })
          .then((res) => {
            if (res.status == 200) {
              produitsTemplate();
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        alert('Valeurs non valides !');
      }
    });
  });

  addProduitElement.appendChild(btnAddElement);
  return addProduitElement;
};

const ajouterTableElement = () => {
  const tableElement = document.createElement('article');
  const btnAddElement = document.createElement('a');
  btnAddElement.classList = 'btn btn-primary btn-container';
  btnAddElement.innerText = 'Ajouter une table';

  btnAddElement.addEventListener('click', () => {
    tableElement.innerHTML = `
      <div class="input-group">
        <label>Numéro :</label>
        <input type="number" name="numero" />
      </div>
      <div class="input-group">
        <label>Lien QR-code :</label>
        <input type="text" name="qr-code" />
      </div>
      <a class="btn btn-validate btn-container">
        Enregistrer
      </a>`;

    const btn = tableElement.querySelector('a.btn');

    // ajouter table
    btn.addEventListener('click', async () => {
      const num = tableElement.querySelector('input[name="numero"]').value;
      const lien = tableElement.querySelector('input[name="qr-code"]').value;

      if (num != '' && lien != '') {
        await fetchApiPost('addTable', {
          num,
          lien,
        })
          .then((res) => {
            if (res.status == 200) {
              tablesTemplate();
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        alert('Valeurs non valides !');
      }
    });
  });

  tableElement.appendChild(btnAddElement);
  return tableElement;
};

validateBtn.addEventListener('click', async (e) => {
  await produitsTemplate();
  await tablesTemplate();
});
