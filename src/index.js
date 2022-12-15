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

//глобальні змінні
let userQuery = '';
let items = [];
let page = 1;
let perPage = 40;
let total;

const PIXABAY_KEY = '31908525-c153f8ff1cbf36c0ec126789f';
const BASE_URL = 'https://pixabay.com/api/';

//лайтбокс для модального вікна з великим зображенням
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoom: false,
});

// ховаємо і вимикаємо кнопку "прогрузити ще"
refs.loadMoreBtnRef.setAttribute('disabled', true);
refs.loadMoreBtnRef.classList.toggle('visually-hidden');

// стрілочна функція для перезагрузки кнонтенту галереї
const render = () => {
  console.log(items);

  refs.galleryRef.innerHTML = '';
};

// оброблюємо і записуємо у змінну пошук користувача
const queryHandle = event => {
  userQuery = event.target.value.trim();
};

const getData = async () => {
  const { data } = await axios.get(
    `${BASE_URL}?key=${PIXABAY_KEY}&q=${userQuery}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`
  );
  const { hits, totalHits } = await data;
  total = totalHits;
  items = hits;
};

// посилаємо запит для отримання даних для галереї карток
const submitHandle = async event => {
  event.preventDefault();
  page = 1;

  // тут робиться весь запит користувача. Записуємо усі дані та
  // додатково записуємо кількість знайдених об'єктів у глобальну змінну
  await getData();

  if (refs.queryRef.value === '') {
    render();
    if (!refs.loadMoreBtnRef.classList.contains('visually-hidden')) {
      refs.loadMoreBtnRef.classList.toggle('visually-hidden');
    }
    if (!refs.loadMoreBtnRef.hasAttribute('disabled')) {
      refs.loadMoreBtnRef.setAttribute('disabled', true);
    }
    return Notify.failure(' WRONG query');
  }

  if (items.length === 0) {
    render();
    refs.formRef.reset();
    return ifError();
  }

  render();
  createGallery();
  lightbox.refresh();
  ifSuccess();
  refs.formRef.reset();
  if (total < 40) {
    userQuery = '';
    return;
  }

  if (refs.loadMoreBtnRef.classList.contains('visually-hidden')) {
    refs.loadMoreBtnRef.classList.toggle('visually-hidden');
  }
  if (refs.loadMoreBtnRef.hasAttribute('disabled')) {
    refs.loadMoreBtnRef.removeAttribute('disabled');
  }
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

// ф-ія для створення розмітки глаереї карток
function createGallery() {
  const markup = items.map(getItemTemplate);
  refs.galleryRef.insertAdjacentHTML('beforeend', markup.join(''));
}

// обробка запиту користувача для довантаження додаткових карток
const loadMoreHandle = async () => {
  // якщо нема даних для довантаження ховаэмо кнопку і виводимо повідомлення

  page += 1;
  await getData();
  console.log(items);

  // якщо запит успішний додаємо до розмітки карток без її очищення
  // скролимо до нових карток
  createGallery();
  lightbox.refresh();

  if (page >= total / 40) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    if (!refs.loadMoreBtnRef.hasAttribute('visually-hidden')) {
      refs.loadMoreBtnRef.classList.toggle('visually-hidden');
    }
    if (!refs.loadMoreBtnRef.hasAttribute('disabled')) {
      refs.loadMoreBtnRef.setAttribute('disabled', true);
    }
    userQuery = '';
  }

  refs.formRef.reset();
  await scroll();
};

// опрацьовуємо скрол при довантаженні карток
function scroll() {
  const { height: cardHeight } =
    refs.galleryRef.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

// підписуємось на слухача події інпуту, для опрацювання тексту користувача
// а також до кнопок, для опрацьовування їх подій
refs.queryRef.addEventListener('input', queryHandle);
refs.submitBtnRef.addEventListener('click', submitHandle);
refs.loadMoreBtnRef.addEventListener('click', loadMoreHandle);

// ці ф-ії виводять повідомлення про успіх чи невдачу
function ifSuccess() {
  Notify.success(`Hooray! We found ${total} images.`);
}

function ifError() {
  Notify.failure("We're sorry, but you've reached the end of search results.");
}
