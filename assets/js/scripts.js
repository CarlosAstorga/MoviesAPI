const baseUri = "http://www.omdbapi.com/?apikey=479403fc";
const yearInput = document.getElementById("yearInput");
const typeIcon = document.querySelector(".select-btn i");
const searchInput = document.getElementById("searchInput");
const typeSelector = document.querySelector(".select");
const searchButton = document.getElementById("searchBtn");
const moviesContainer = document.querySelector(".movies");
const pagination = document.querySelector(".pagination");
const favoritesButton = document.getElementById("favoritesBtn");
const modal = document.getElementById("modal");
const closeButton = document.getElementById("closeBtn");

const filters = {
	type: "",
	year: "",
	title: "",
	page: 1,
	imdbID: "",
	total: "",
	favorites: false,
	movies: [],
};

typeSelector.addEventListener("blur", handleSelectIcon);
typeSelector.addEventListener("focus", handleSelectIcon);
typeSelector.addEventListener("change", (e) => e.target.blur());

searchInput.addEventListener("keyup", (e) => {
	if (e.key === "Enter" || (filters.favorites && !e.target.value))
		searchButton.click();
});

searchButton.addEventListener("click", () => {
	if (validate()) {
		filters.type = typeSelector.value;
		filters.year = yearInput.value.trim();
		filters.title = searchInput.value.trim();
		filters.imdbID = "";

		if (filters.favorites) filter();
		else search();
	}
});

favoritesButton.addEventListener("click", (e) => {
	clean(yearInput, pagination, searchInput, moviesContainer);
	filters.page = 1;
	filters.favorites = !filters.favorites;
	favoritesButton.classList.toggle("bg-secondary");
	if (filters.favorites) searchButton.click();
});

closeButton.addEventListener("click", () => modal.classList.remove("show"));

window.addEventListener("keyup", (e) => {
	if (e.key === "Escape" && modal.classList.contains("show"))
		closeButton.click();
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
	if (searchInput.value.trim().length < 3 && !filters.favorites)
		createError("The title must have at least 3 letters", searchInput);

	const isValid = document.querySelector(".error");
	return !isValid;
}

/**
 * Removes elements, sets innerHTML and so on.
 * @param  {...any} any
 */
function clean(...any) {
	any.forEach((_) => {
		if (_ instanceof Element) {
			if (_.value === undefined) _.innerHTML = "";
			else _.value = "";
		} else
			document.querySelectorAll("." + _).forEach((error) => error.remove());
	});
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
			filters.total = res.total;
			moviesContainer.appendChild(res.movies);
		})
		.catch((error) => {
			filters.total = 0;
			createError(error, moviesContainer);
		})
		.finally(createPagination);
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
		if (filters.favorites) searchButton.click();
	});

	poster.addEventListener("click", (e) => {
		filters.imdbID = e.target.id;
		request()
			.then(createModal)
			.catch((error) => createError(error, moviesContainer));
	});

	return div;
}

/**
 * Creates the modal with the movie's data.
 * @param {Object} movie - The movie to be displayed
 */
function createModal(movie) {
	const container = modal.lastElementChild;
	const genres = movie.Genre.split(",").reduce((acc, current) => {
		return (acc += `<span class="tag">${current}</span>`);
	}, "");

	const stars = [...Array(10).keys()].reduce((acc, current) => {
		if (current < Math.round(movie.imdbRating))
			return (acc += `<i class="fas fa-star"></i>`);
		else return (acc += `<i class="far fa-star"></i>`);
	}, "");

	const attrs = ["Country", "Runtime", "Director", "Actors"];
	const data = attrs.reduce((acc, current) => {
		if (movie[current] != "N/A") {
			return (acc += ` <span class="subtitle">${current} </span> ${movie[current]}`);
		} else return acc;
	}, "");

	container.innerHTML = `
	<div class="genres">${genres}</div>
	<h1 class="header">${movie.Title}</h1>
	<div class="information">
		<div class="data">
			<p>
				${data}
			</p>
			${
				movie.imdbRating != "N/A"
					? `<p class="rating">
					<span class="subheader">RATING:</span> ${movie.imdbRating} / 10<br />
					${stars}
				</p>`
					: ""
			}
			${
				movie.Plot != "N/A"
					? `<p>
				<span class="subheader">PLOT:</span><br />
				${movie.Plot}
			</p>`
					: ""
			}
			
		</div>
		<div class="picture">
			<img
				src="${movie.Poster == "N/A" ? "assets/img/default.png" : movie.Poster}" 
			/>
		</div>
	</div>
	<button class="action"></button>`;

	const actionButton = container.lastElementChild;
	const backgroundColor =
		getIcon(movie.imdbID) == "fas" ? "bg-primary" : "bg-accent";
	actionButton.classList.add(backgroundColor);

	const serButtonContent = (favorite) => {
		if (favorite == "fas")
			actionButton.innerHTML = `Remove from favorites <i class="fas fa-star"></i>`;
		else
			actionButton.innerHTML = `Add to favorites <i class="far fa-star"></i>`;
	};

	serButtonContent(getIcon(movie.imdbID));
	actionButton.addEventListener("click", () => {
		toggleFavorite(movie);
		serButtonContent(getIcon(movie.imdbID));
		toggleElementClass(actionButton, "bg-primary", "bg-accent");

		if (filters.favorites) searchButton.click();
		else {
			const poster = document.getElementById(movie.imdbID);
			const ribbon = poster.previousElementSibling;
			const star = ribbon.firstElementChild;
			toggleElementClass(star, "fas", "far");
			toggleElementClass(ribbon, "favorite");
		}
	});
	modal.classList.add("show");
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

/**
 * Creates the pagination.
 */
function createPagination() {
	clean(pagination);

	const pages = Math.ceil(filters.total / 10);
	if (pages < 2) return;

	const beforePage = filters.page - 1;
	const afterPage = pages - filters.page;
	const fragment = document.createDocumentFragment();

	if (beforePage > 0) {
		fragment.appendChild(
			createPaginationItem("prev", '<i class="fas fa-angle-left"></i>')
		);

		if (beforePage < 4)
			for (let index = 1; index <= beforePage; index++)
				fragment.appendChild(createPaginationItem("item", index));
		else {
			fragment.appendChild(createPaginationItem("item", 1));
			fragment.appendChild(
				createPaginationItem("ellipsis", '<i class="fas fa-ellipsis-h"></i>')
			);
			fragment.appendChild(createPaginationItem("item", filters.page - 1));
		}
	}

	fragment.appendChild(createPaginationItem("item active", filters.page));

	if (afterPage > 0) {
		if (afterPage < 4)
			for (let index = 1; index <= afterPage; index++)
				fragment.appendChild(
					createPaginationItem("item", filters.page + index)
				);
		else {
			fragment.appendChild(createPaginationItem("item", filters.page + 1));
			fragment.appendChild(
				createPaginationItem("ellipsis", '<i class="fas fa-ellipsis-h"></i>')
			);
			fragment.appendChild(createPaginationItem("item", pages));
		}
		fragment.appendChild(
			createPaginationItem("next", '<i class="fas fa-angle-right"></i>')
		);
	}
	pagination.appendChild(fragment);
}

/**
 * Creates pagination item
 * @param {String} css - Class
 * @param {String} text - Text
 * @returns
 */
function createPaginationItem(css, text) {
	const item = document.createElement("a");

	item.classList = css;
	item.innerHTML = text;
	if (css != "ellipsis")
		item.addEventListener("click", (e) => {
			if (e.target.textContent == filters.page) return null;
			if (item.classList.contains("prev")) filters.page -= 1;
			if (item.classList.contains("next")) filters.page += 1;
			if (item.classList.contains("item"))
				filters.page = parseInt(item.textContent);

			searchButton.click();
		});

	return item;
}

/**
 * Filters favorites
 */
function filter() {
	clean(moviesContainer);
	filters.movies = getFavorites();
	filters.total = filters.movies.length;

	const fragment = document.createDocumentFragment();
	for (const movie of filters.movies.slice(
		filters.page * 10 - 10,
		filters.page * 10
	))
		moviesContainer.appendChild(fragment.appendChild(createCard(movie)));
	createPagination();
}

/**
 * Gets the favorites from the local storage
 * @returns {Array} - Favorites
 */
function getFavorites() {
	let favorites = [];
	const keys = Object.keys(localStorage);

	for (const x of keys) {
		if (x.includes("tt")) favorites.push(JSON.parse(localStorage.getItem(x)));
	}

	if (filters.type == "all" && !filters.title && !filters.year)
		return favorites;

	return favorites.filter((movie) => {
		if (
			(filters.title && movie.Title.toLowerCase().includes(filters.title)) ||
			(filters.type && filters.type != "all" && movie.Type == filters.type) ||
			(filters.year && movie.Year == filters.year)
		)
			return movie;
	});
}
