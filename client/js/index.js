const ipServer = "172.20.10.7:8080";
const ipClient = "172.20.10.7:5500";

const titleElements = document.querySelectorAll('.title');
const contentElements = document.querySelectorAll('.content');
const tablesElement = document.getElementById('tables');

const fetchApi = (param) => {
  const produits = fetch('http://' + ipServer + '/foyerbdd/' + param)
    .then((res) => res.json())
    .then((json) => json)
    .catch(() => null);
  return produits;
};

titleElements.forEach((element, index) => {
  element.addEventListener('click', (e) => {
    contentElements[index].classList.toggle('hidden');
    element.classList.toggle('active');
  });
});

const tablesTemplate = (tables) => {
  const sortTables = tables.sort((a, b) => Number(a.numero) - Number(b.numero));

  const elements = sortTables.map((table) => {
    const element = document.createElement('div');
    element.innerHTML = '<i class="fa-solid fa-qrcode"></i> <h4>' + table.numero + '</h4>';

    element.addEventListener('click', (e) => {
      location.href = 'http://' + ipClient + '/client/pages/client.html?table=' + table.numero;
    });

    return element;
  });

  tablesElement.append(...elements);
};

const fetchTables = async () => {
  const tables = await fetchApi('getTables');

  if (tables == null) {
    return 0;
  }

  tablesTemplate(tables);
};

fetchTables();
