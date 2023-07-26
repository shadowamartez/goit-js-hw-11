import axios from 'axios';
import Notiflix from 'notiflix';

const BASE_KEY = "38476284-331f716b1abb5b5177c821f88";
const BASE_URL = "https://pixabay.com/api/";
const PER_PAGE = 40;
const LOCAL_STORAGE_KEY = 'showLoadMoreButton';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let searchQuery = '';

function shouldShowLoadMoreButton() {
    return localStorage.getItem(LOCAL_STORAGE_KEY) === 'true';
}

function setShowLoadMoreButton(value) {
    localStorage.setItem(LOCAL_STORAGE_KEY, value);
}

function showLoadMoreButton() {
    loadMoreBtn.style.display = 'block';
    setShowLoadMoreButton(true);
}

function hideLoadMoreButton() {
    loadMoreBtn.style.display = 'none';
    setShowLoadMoreButton(false);
}

async function fetchImages(query) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                key: BASE_KEY,
                q: query,
                image_type: "photo",
                orientation: "horizontal",
                safesearch: true,
                page: page,
                per_page: PER_PAGE,
        },
    });
        return response.data;
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
    }
}

function createImageCard(image) {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.classList.add('info');

    const likes = document.createElement('p');
    likes.classList.add('info-item');
    likes.innerHTML = `<b>Likes:</b> ${image.likes}`;

    const views = document.createElement('p');
    views.classList.add('info-item');
    views.innerHTML = `<b>Views:</b> ${image.views}`;

    const comments = document.createElement('p');
    comments.classList.add('info-item');
    comments.innerHTML = `<b>Comments:</b> ${image.comments}`;

    const downloads = document.createElement('p');
    downloads.classList.add('info-item');
    downloads.innerHTML = `<b>Downloads:</b> ${image.downloads}`;

    info.appendChild(likes);
    info.appendChild(views);
    info.appendChild(comments);
    info.appendChild(downloads);

    card.appendChild(img);
    card.appendChild(info);

    gallery.appendChild(card);
}

function clearGallery() {
    gallery.innerHTML = '';
}

async function searchImages(event) {
    event.preventDefault();
    searchQuery = event.target.searchQuery.value.trim();
    if (!searchQuery) {
        Notiflix.Notify.failure('Please enter a search query.');
        return;
    }

    page = 1;
    clearGallery();

    try {
        const data = await fetchImages(searchQuery);
        if (data.hits.length === 0) {
        hideLoadMoreButton();
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        } else {
        data.hits.forEach(createImageCard);
        if (data.totalHits <= page * PER_PAGE) {
            hideLoadMoreButton();
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        } else {
            showLoadMoreButton();
        }
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        }
    } catch (error) {
        Notiflix.Notify.failure('Error fetching images. Please try again later.');
    }
}

async function loadMoreImages() {
    page++;
    try {
        const data = await fetchImages(searchQuery);
        data.hits.forEach(createImageCard);
        if (data.totalHits <= page * PER_PAGE) {
        hideLoadMoreButton();
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
    } catch (error) {
        Notiflix.Notify.failure('Error fetching more images. Please try again later.');
    }
}

if (!shouldShowLoadMoreButton()) {
    hideLoadMoreButton();
}

searchForm.addEventListener('submit', searchImages);
loadMoreBtn.addEventListener('click', loadMoreImages);