import './css/styles.css';
// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';
import axios from 'axios';

// імпорти

// посилання на елементи DOM
const refs = {
  formRef: document.querySelector('#search-form'),
  queryRef: document.querySelector('input'),
  submitBtnRef: document.querySelector('button[type="submit"]'),
  galleryRef: document.querySelector('.gallery'),
  loadMoreBtnRef: document.querySelector('.load-more'),
};

console.log(refs);

//глобальні змінні
let userQuery = '';
let items = [];
let page = 1;
let perPage = 16;

const PIXABAY_KEY = '31908525-c153f8ff1cbf36c0ec126789f';

const BASE_URL = 'https://pixabay.com/api/';
const PAGINATION = `page=${page}&per_page=${perPage}`;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoom: false,
});

refs.loadMoreBtnRef.setAttribute('disabled', true);

const render = () => {
  console.log(items);

  refs.galleryRef.innerHTML = '';
};

const queryHandle = event => {
  userQuery = event.target.value.trim();
};

const submitHandle = async event => {
  event.preventDefault();
  page = 1;

  await axios
    .get(
      `${BASE_URL}?key=${PIXABAY_KEY}&q=${userQuery}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`
    )
    .then(({ data }) => data)
    .then(({ hits }) => hits)
    .then(hits => {
      items = hits;
      render();

      if (userQuery === '' || items.length === 0) {
        render();
        return ifError();
      }

      createGallery();
      lightbox.refresh();
      refs.loadMoreBtnRef.removeAttribute('disabled');
      ifSuccess();
    });
};

// створення шаблону розмітки карток галереї
const getItemTemplate = ({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) =>
  `
  <div class="photo-card">
  <div class="wrapper">
  <a href="${largeImageURL}">
  <img class ="photo-image" src=${webformatURL} alt=${tags} loading="lazy" />
  </a>
  </div>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
</div>
`;

function createGallery() {
  const markup = items.map(getItemTemplate);
  refs.galleryRef.insertAdjacentHTML('beforeend', markup.join(''));
}

const loadMoreHandle = async () => {
  if (items.length === 0) {
    refs.loadMoreBtnRef.setAttribute('disabled', true);
    return ifError();
  }

  page += 1;
  await axios
    .get(
      `${BASE_URL}?key=${PIXABAY_KEY}&q=${userQuery}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`
    )
    .then(({ data }) => data)
    .then(({ hits }) => hits)
    .then(hits => {
      items = hits;
    });

  createGallery();
  await scroll();
};

function scroll() {
  const { height: cardHeight } =
    refs.galleryRef.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

// підписуємось на слухача події інпуту, для опрацювання тексту користувача
refs.queryRef.addEventListener('input', queryHandle);
refs.submitBtnRef.addEventListener('click', submitHandle);
refs.loadMoreBtnRef.addEventListener('click', loadMoreHandle);

function ifSuccess() {
  Notify.success('Success! Here the results of your query :');
}

function ifError() {
  Notify.failure('Oops, there are no images to search.');
}

// параметри для запиту до API

// key, // - твій унікальний ключ доступу до API.
// q, // - термін для пошуку. Те, що буде вводити користувач.
// image_type, // - тип зображення. На потрібні тільки фотографії, тому постав значення photo.
//  orientation, // - орієнтація фотографії. Постав значення horizontal.
// safesearch, // - фільтр за віком. Постав значення true.'
// page - параметр вказує на сторінку запитів,
// per_page - вказує на кількість запитів за сторінку
// {
//       webformatURL,
//       largeImageURL,
//       tags,
//       likes,
//       views,
//       comments,
//       downloads,
//     }

// У відповіді буде масив зображень, що задовольнили критерії параметрів запиту.
// Кожне зображення описується об'єктом, з якого тобі цікаві тільки наступні властивості:

// webformatURL - посилання на маленьке зображення для списку карток.
// largeImageURL - посилання на велике зображення.
// tags - рядок з описом зображення. Підійде для атрибуту alt.
// likes - кількість лайків.
// views - кількість переглядів.
// comments - кількість коментарів.
// downloads - кількість завантажень.

/*
import './css/styles.css';
import { fetchCountries } from './fetchCountries';
import debounce from 'lodash.debounce';


//глобальні змінні
const DEBOUNCE_DELAY = 300;
let userQuery = '';
let items = [];


// оновлює розмітку
const render = () => {
  console.log(items);

  refs.listRef.innerHTML = '';
  refs.infoRef.innerHTML = '';
};

// опрацьовуємо текст користувача і чистимо розмітку, якщо порожньо
const queryHandle = event => {
  userQuery = event.target.value.trim();
  if (userQuery === '') {
    render();
    return;
  }

  // опрацьовуємо запит, в залежності від розміру вхідних робимо розмітку інфо про одну країу, про список країн
  // викликаємо помилку, якщо запит повернув 404(якщо немає змінних для розмітки)
  fetchCountries(userQuery)
    .then(data => {
      items = data;
      render();

      if (!items[0].flags) {
        throw new Error();
      }

      if (items.length > 10) {
        return Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
      }

      if (items.length === 1) {
        createInfo();
      } else if (items.length >= 1 && items.length <= 10) {
        createList();
      }
    })
    .catch(ifError);
};

// підписуємось на слухача події інпуту, для опрацювання тексту користувача
refs.queryRef.addEventListener('input', debounce(queryHandle, DEBOUNCE_DELAY));

// створення шаблону розмітки списку країн
const getItemTemplate = ({ flags, name }) =>
  `
  <li style=" display: flex; margin: 5px;
}">
    <img src=${flags.svg} alt="flag" style=" width: 90px;" />
    <p style=" padding: 5px;">${name.official}</p>
  </li>
</ul>
`;

// створення шаблону розмітки контейнеру даних про одну країну
const getInfoTemplate = ({ name, population, capital, flags }) => {
  const lang = Object.values(items[0].languages).join(', ');
  return `
<div>
  <img src=${flags.svg} alt="flag" style=" width: 400px;"/>
  <h1>${name.official}</h1>
  <h2>Population: ${population}</h2>
  <h2>Capital: ${capital}</h2>
  <h2>Languages: ${lang}</h2>
</div>
`;
};

// створємо розмітку елементів списку країн на основі шаблону і виводимо на екран
function createList() {
  const markup = items.map(getItemTemplate);
  render();
  refs.listRef.insertAdjacentHTML('beforeend', markup.join(''));
}

// створємо розмітку контейнеру однієї  країни на основі шаблону і виводимо на екран цю країну
function createInfo() {
  const markup = items.map(getInfoTemplate);
  render();
  refs.infoRef.insertAdjacentHTML('beforeend', markup.join(''));
}

// якщо ми отримали помилку, виводимо повідомлення через бібліотеку Notify
function ifError() {
  render();
  Notify.failure('Oops, there is no country with that name.');
}

*/
