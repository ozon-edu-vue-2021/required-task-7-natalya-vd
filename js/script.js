const API_USERS = 'http://localhost:3000/users';

/**
 * Получает данные из data.json
 * @returns Массив объектов, полученных из data.json
 */
async function makeRequest(api) {
  try {
    const res = await fetch(api);

    if(!res.ok) {
      throw new Error(`HTTP ERROR ${res.status}`);
    }

    const data = await res.json();

    return data;

  } catch(err) {
    console.error(err);
  }
};

/**
 * Отрисовывает список людей на главном экране
 * @param {Array{}} array 
 * @param {function} callback 
 * @returns HTML разметку
 */
function renderListNames(array, callback) {
  const elementWrapper = document.createElement('ul');
  elementWrapper.classList = 'view__list'

    array.forEach((item) => {
      const element = document.createElement('li');
      element.classList = 'view__item';
      element.setAttribute('id', `${item.id}`);
      element.innerText = `${item.name}`;
      element.addEventListener('click', callback);
      elementWrapper.appendChild(element);
    })
    return elementWrapper;
};


/**
 * Отрисовывает список пользователей в блоке details
 * @param {Array} users Список имен пользователей
 * @returns HTML разметку
 */
function renderDetailsUsers(users = []) {
  return users.map((item) => {
    return `
      <li class="view__details-people-item">
        <i class="fa fa-male"></i>
        <span>${ item }</span>
      </li>
    `
  }).join('')
};

/**
 * Преобразовывает исходные данные в объект. Считает количество людей в друзьях
 * @param {Array} array Массив исходных данных
 * @returns Возвращает объект и массив. Объект со всеми данными пользователей, где ключ это Id исходного массива, а значение объект с оставшимися данными. Массив это количество людей в друзьях у всех пользователей
 */
function prepareData(array) {
  const ObjectFriends = {};
  const objectData = {};
  let friendsList = [];

  array.forEach((item) => {
    objectData[item.id] = {
      name: item.name,
      friends: item.friends
    };

    item.friends.forEach((friend) => {
      if(!(friend in ObjectFriends)) {
        ObjectFriends[friend] = 1;
      } else {
        ObjectFriends[friend]++;
      }
    })
  })

  friendsList = Object.keys(ObjectFriends).map((item) => {
    return {id: +item, count: ObjectFriends[item], name: objectData[item].name};
  })

  return {
    objectData,
    friendsList
  }
};

/**
 * На вход принимает список людей по id, возвращает массив с именами этих людей
 * @param {Array} listName Список id друзей
 * @param {Object{}} objectData Объект всех людей, в качестве ключей id
 * @returns Массив имен
 */
function getListNames(listName = [], objectData) {
  return listName.map((item) => {
    return objectData[item].name;
  })
};

/**
 * Получает популярных пользователей
 * @param {Array{}} friendsList Упорядоченный по убыванию список популярных пользователей
 * @returns Возвращает 3-х популярных пользователей
 */
function getTopUsers(friendsList) {
  return friendsList.slice(0, 3).map((item) => {
    return item.name;
  })
};

/**
 * Сортирует по убыванию пользователей
 * @param {Array{}} array Неупорядоченный массив популярных пользователей
 * @returns Возвращает упорядоченный по убыванию список пользователей
 */
function sortData(array = []) {
  return array.sort((a, b) => {
    if(b.count === a.count) {
      if(a.name < b.name) {
        return -1;
      }
      if(a.name > b.name) {
        return 1;
      }
      return 0;
    }
    return b.count - a.count;
  })
};

/**
 * Получает список пользователей, которых нет в друзьях
 * @param {Array} listUsers Список пользователей, которые в друзьях
 * @param {Object{}} objectData  Объект всех пользователей
 * @param {Number} max Наибольшее число отрезка рандомных Id пользователей
 * @param {Number} min Наименьшее число отрезка рандомных Id пользователей
 * @returns Список имен пользователей, которые не в друзьях
 */
function getListNotFriends(listUsers, objectData, max, min) {
  const listIdNotFriends = [];
  const listNameNotFriends = [];

  while(listIdNotFriends.length < 3) {
    const randomNumber = Math.round(Math.random() * (max - min)) + min;

    if(listUsers.findIndex((item) => item === randomNumber) === -1 && listIdNotFriends.findIndex((item) => item === randomNumber) === -1) {
      listIdNotFriends.push(randomNumber);
      listNameNotFriends.push(objectData[randomNumber].name);
    }
  }

  return listNameNotFriends;
}

/**
 * Колбек, выводит имя пользователя, список друзей и не друзей в разделе details. Отображает раздел details
 * @param {Event} e 
 * @param {Object{}} objectData Объект данных пользователей
 * @param {Number} max Наибольшее число отрезка рандомных Id пользователей
 * @param {Number} min Наименьшее число отрезка рандомных Id пользователей
 */
function openToDetails(e, objectData = {}, max, min) {
  getElement('#name').innerText = objectData[e.target.id].name;

  getElement('#friends').innerHTML = renderDetailsUsers(getListNames(objectData[e.target.id].friends, objectData));

  getElement('#notFriends').innerHTML = renderDetailsUsers(getListNotFriends(objectData[e.target.id].friends, objectData, max, min));

  toggleDetails();
};

/**
 * Получает первый DOM элемент согласно переданному селектору
 * @param {String} selector Селектор элемента
 * @returns DOM элемент
 */
function getElement(selector) {
  return document.querySelector(selector);
};

/**
 * Добавляет/удаляет класс 'hide', по-которому элемент скрывается
 */
function toggleDetails() {
  const elementView = getElement('.view__list');
  const elementDetails = getElement('.view__details');

  elementView.classList.toggle('hide');
  elementDetails.classList.toggle('hide');
};

window.addEventListener('load', async () => {
  const data = await makeRequest(API_USERS);

  const element = getElement('#app');

  const prepareDataUsers = prepareData(data);

  getElement('#back').addEventListener('click', toggleDetails);

  element.insertBefore(renderListNames(data, (e) => {
    openToDetails(e, prepareDataUsers.objectData, data.length, 1);
  }), element.firstChild);

  getElement('#top').innerHTML = renderDetailsUsers(getTopUsers(sortData(prepareDataUsers.friendsList)));
});