import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
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

// перевіряє, чи кнопка прихована. Якщо ні - ховає
const hideLoadMore = () => {
  if (!refs.loadMoreBtnRef.classList.contains('visually-hidden')) {
    refs.loadMoreBtnRef.classList.toggle('visually-hidden');
  }
  if (!refs.loadMoreBtnRef.hasAttribute('disabled')) {
    refs.loadMoreBtnRef.setAttribute('disabled', true);
  }
};

// стрілочна функція для перезагрузки кнонтенту галереї
const render = () => {
  console.log(items);
  refs.galleryRef.innerHTML = '';
};

// оброблюємо і записуємо у змінну пошук користувача
const queryHandle = event => {
  userQuery = event.target.value.trim();
};

// робить запит на сервер з потрібними параметрами, отримує масив об'єктів для наших карток
// додатково записуємо кількість знайдених об'єктів у глобальну змінну
const getData = async () => {
  const { data } = await axios.get(
    `${BASE_URL}?key=${PIXABAY_KEY}&q=${userQuery}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`
  );
  const { hits, totalHits } = await data;
  total = totalHits;
  items = hits;
};

// ці ф-ії виводять повідомлення про успіх чи невдачу
const ifSuccess = () => {
  Notify.success(`Hooray! We found ${total} images.`);
};

const ifError = () => {
  Notify.failure("We're sorry, but you've reached the end of search results.");
};

// при сабміті форми викликаємо getData()
const submitHandle = async event => {
  event.preventDefault();
  page = 1;

  // перевірка на валідність запиту
  if (refs.queryRef.value.trim() === '') {
    render();
    refs.formRef.reset();
    hideLoadMore();
    return Notify.failure(' WRONG query');
  }

  await getData();
  if (items.length === 0) {
    render();
    refs.formRef.reset();
    hideLoadMore();
    return ifError();
  }

  //
  render();
  createGallery();
  lightbox.refresh();
  refs.formRef.reset();
  ifSuccess();

  // якщо запит успішний, але колекція повністю поміщується на одній сторінці код нище не виконується
  if (total <= perPage) {
    return;
  }
  // перестаємо ховати кнопку LoadMore
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

// опрацьовуємо скрол при довантаженні карток
scroll = () => {
  const { height: cardHeight } =
    refs.galleryRef.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

// обробка запиту користувача для довантаження додаткових карток
const loadMoreHandle = async () => {
  page += 1;
  await getData();
  console.log(items);

  // якщо запит успішний додаємо до розмітки карток без її очищення

  createGallery();
  lightbox.refresh();
  refs.formRef.reset();

  // якщо дійшли до кінця колекції ховаємо кнопку loadMore
  if (page >= total / perPage) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    hideLoadMore();
  }

  // скролимо до нових карток
  await scroll();
};

// підписуємось на слухача події інпуту, для опрацювання тексту користувача
// а також до кнопок, для опрацьовування їх подій
refs.queryRef.addEventListener('input', queryHandle);
refs.submitBtnRef.addEventListener('click', submitHandle);
refs.loadMoreBtnRef.addEventListener('click', loadMoreHandle);
