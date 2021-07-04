const baseUri = "http://www.omdbapi.com/?apikey=479403fc";
const yearInput = document.getElementById("yearInput");
const typeIcon = document.querySelector(".select-btn i");
const searchInput = document.getElementById("searchInput");
const typeSelector = document.querySelector(".select");
const searchButton = document.getElementById("searchBtn");
const moviesContainer = document.querySelector(".movies");

const filters = {
	type: "",
	year: "",
	title: "",
	page: 1,
	imdbID: "",
};

typeSelector.addEventListener("blur", handleSelectIcon);
typeSelector.addEventListener("focus", handleSelectIcon);
typeSelector.addEventListener("change", (e) => e.target.blur());

searchInput.addEventListener("keyup", (e) => {
	if (e.key === "Enter") searchButton.click();
});

searchButton.addEventListener("click", () => {
	if (validate()) {
		filters.type = typeSelector.value;
		filters.year = yearInput.value.trim();
		filters.title = searchInput.value.trim();
		filters.imdbID = "";
		search();
	}
});

/**
 * Validates the form.
 * @returns {boolean} Wheter is valid or not.
 */
function validate() {
	clean("error");
	const numbers = /^[0-9]+$/;
	const options = ["all", "movie", "series", "episode"];

	if (yearInput.value && !yearInput.value.match(numbers))
		createError("Must be a number", yearInput);
	if (typeSelector.value && !options.includes(typeSelector.value))
		createError("type not available", typeSelector);
	if (searchInput.value.trim().length < 3)
		createError("The title must have at least 3 letters", searchInput);

	const isValid = document.querySelector(".error");
	return !isValid;
}

/**
 * Removes elements, sets innerHTML and so on.
 * @param {*} any
 */
function clean(any) {
	if (any instanceof Element) {
		if (any.value === undefined) any.innerHTML = "";
		else any.value = "";
	} else
		document.querySelectorAll("." + any).forEach((error) => error.remove());
}

/**
 * Creates a span tag to display the error.
 * @param {String} error - Message to be displayed.
 * @param {HTMLElement} element - The element that caused the error.
 */
function createError(error, element) {
	const span = document.createElement("span");
	span.classList = "error";
	span.textContent = error;
	element.parentElement.appendChild(span);

	element.focus();
}

/**
 * Handles the search.
 */
function search() {
	clean(moviesContainer);
	request()
		.then((res) => {
			const fragment = document.createDocumentFragment();
			for (const movie of res.Search) fragment.appendChild(createCard(movie));
			return { movies: fragment, total: res.totalResults };
		})
		.then((res) => {
			moviesContainer.appendChild(res.movies);
		})
		.catch((error) => {
			createError(error, moviesContainer);
		});
}

/**
 * Handles the select icon.
 */
function handleSelectIcon() {
	typeIcon.classList.toggle("fa-angle-down");
	typeIcon.classList.toggle("fa-angle-up");
}

/**
 * Generates the url using the filters.
 * @returns {String} - Url.
 */
function generateUrl() {
	if (filters.imdbID) return `${baseUri}&i=${filters.imdbID}&plot=full`;

	let url = baseUri + "&s=" + filters.title;
	if (filters.type != "all") url += `&type=${filters.type}`;
	if (filters.year) url += `&y=${filters.year}`;
	url += `&page=${filters.page}`;

	return url;
}

/**
 * Async fetch.
 * @returns {Promise}
 */
async function request() {
	const response = await fetch(generateUrl());
	const res = await response.json();
	if (res.Response == "False") throw Error(res.Error);

	return res;
}

/**
 * Creates a card with the movie information.
 * @param {Object} movie - The movie to be displayed.
 * @returns {HTMLElement} - The card element
 */
function createCard(movie) {
	const { Poster, Title, imdbID } = movie;
	const icon = getIcon(imdbID);

	const div = document.createElement("div");
	div.classList = "poster";
	div.innerHTML = `
        <div class="poster-container">
            <span class="ribbon">
                <i class="${icon} fa-star icon"></i>
            </span>
            <img 
                id="${imdbID}" 
                src="${Poster == "N/A" ? "assets/img/default.png" : Poster}" 
            />
        </div>
        <div class="title-container">
            <p class="title">${Title}</p>
        </div>
    `;

	const ribbon = div.firstElementChild.firstElementChild;
	const star = ribbon.firstElementChild;
	const poster = ribbon.nextElementSibling;
	if (icon == "fas") ribbon.classList.add("favorite");

	ribbon.addEventListener("click", (e) => {
		toggleFavorite(movie);
		toggleElementClass(star, "fas", "far");
		toggleElementClass(ribbon, "favorite");
	});

	poster.addEventListener("click", (e) => {
		filters.imdbID = e.target.id;
		request()
			.then((res) => {})
			.catch((error) => createError(error, moviesContainer));
	});

	return div;
}

/**
 * Gets the icon class
 * @param {Number} imdbID - Movie id.
 * @returns {String} - The icon class.
 */
function getIcon(imdbID) {
	return localStorage.getItem(imdbID) ? "fas" : "far";
}

/**
 * Toggle the movie in the localStorage.
 * @param {Object} movie - The movie to be stored in the localStorage .
 */
function toggleFavorite(movie) {
	getIcon(movie.imdbID) == "fas"
		? localStorage.removeItem(`${movie.imdbID}`)
		: localStorage.setItem(`${movie.imdbID}`, JSON.stringify(movie));
}

/**
 * Toggle element class
 * @param {HTMLElement} element - The DOM element
 * @param  {...String} classes - The css classes to toggle
 */
function toggleElementClass(element, ...classes) {
	classes.forEach((_) => element.classList.toggle(_));
}
