// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

Notify.info('Too many matches found. Please enter a more specific name.');
function ifError() {
  Notify.failure('Oops, there is no country with that name.');
}
