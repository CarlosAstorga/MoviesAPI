import { clean, createMessage, toggleClass } from "./utility.js";

let imdbID = "";
let favPage = false;
const body = document.querySelector("body");
const year = document.getElementById("yearInput");
const caret = document.querySelector(".type .btn i");
const modal = document.getElementById("modal");
const loader = document.getElementById("loader");
const navText = document.getElementById("navText");
const selector = document.querySelector(".select");
const container = document.querySelector(".movies");
const pagination = document.querySelector(".pagination");
const colorInput = document.getElementById("colorInput");
const searchInput = document.getElementById("searchInput");
const closeButton = document.getElementById("closeBtn");
const clearButton = document.getElementById("clearBtn");
const colorButton = document.getElementById("colorBtn");
const searchButton = document.getElementById("searchBtn");
const favoritesButton = document.getElementById("favoritesBtn");
const filters = {
	type: "all",
	year: "",
	title: "",
	page: 1,
	data: [],
	total: 0,
	render() {
		clean(container, pagination);
		container.innerHTML = containerTemplate(this.data);
		pagination.innerHTML = paginationTemplate(this.total, this.page);
	},
};
filters.populate = search;
const favorites = Object.assign({}, filters);
favorites.populate = filter;
favorites.storage = favorites.data = getFavorites();
favorites.total = favorites.data.length;
favorites.data = favorites.data.slice(
	favorites.page * 10 - 10,
	favorites.page * 10
);
const current = () => (favPage ? favorites : filters);
const baseUri = "http://www.omdbapi.com/?apikey=479403fc";
modal.addEventListener("scroll", handleScroll);
window.addEventListener("keyup", handleEscapeKey);
container.addEventListener("click", handleCard);
pagination.addEventListener("click", handlePagination);
closeButton.addEventListener("click", handleClose);
searchButton.addEventListener("click", handleSearch);
favoritesButton.addEventListener("click", handleFavorites);

function handleSearch() {
	keyup(true);
	clean("error");
	if (!validate() || (searchInput.value == current().title && !favPage)) return;
	searchInput.blur();
	current().page = 1;
	current().type = selector.value;
	current().year = year.value;
	current().title = searchInput.value;

	clean(container, pagination);
	current().populate();
}

function handleFavorites() {
	clean("error");
	favPage = !favPage;
	favoritesButton.classList.toggle("bg-secondary");

	year.value = current().year;
	searchInput.value = current().title;
	selector.value = current().type;
	favPage ? filter() : current().render();
}

function search() {
	loader.classList.add("show");
	request(filters)
		.then(({ Search: data, totalResults: total }) => {
			current().data = data;
			current().total = total;
			current().render();
		})
		.catch(({ message }) => {
			current().data = [];
			current().total = 0;
			createMessage(message, container);
		})
		.finally(loader.classList.remove("show"));
}

function filter() {
	const { title, year, type, page, storage } = favorites;
	let arr = storage.filter(({ Title }) => Title.toLowerCase().includes(title));
	if (year) arr = arr.filter(({ Year }) => Year.includes(year));
	if (type != "all") arr = arr.filter(({ Type }) => Type == type);
	favorites.total = arr.length;
	favorites.data = arr.slice(page * 10 - 10, page * 10);
	favorites.render();
}

function handleCard({ target: { tagName }, target }) {
	const id =
		target.id || target.previousElementSibling?.id || target.parentElement?.id;
	if (tagName == "IMG") {
		import("./modal.js").then(({ default: fillModal }) => {
			modal.classList.add("show");
			body.classList.add("modal-open");
			if (imdbID != id) {
				imdbID = id;
				loader.classList.add("show");
				modal.lastElementChild.innerHTML = "";
				request({ imdbID }).then((movie) => {
					fillModal(movie, () => {
						updateStorageArray(movie);
						return favPage ? favorites : "update";
					});
					loader.classList.remove("show");
				});
			}
		});
	}
	if (tagName == "SPAN" || tagName == "I") {
		import("./favorites.js").then(({ updatePoster, updateLocalStorage }) => {
			const movie = current().data.find(({ imdbID }) => id == imdbID);
			updateLocalStorage(movie);
			updateStorageArray(movie);
			if (favPage) {
				if (favorites.data.length == 1 && favorites.page > 1) favorites.page--;
				filter();
			} else updatePoster(movie.imdbID);
		});
	}
}

function handlePagination({ target: link, target: { className: cn } }) {
	if (cn == "fas fa-ellipsis-h" || current().page == link.textContent) return;
	if (cn == "prev" || cn == "fas fa-angle-left") current().page--;
	if (cn == "next" || cn == "fas fa-angle-right") current().page++;
	if (cn == "item") current().page = parseInt(link.textContent);
	current().populate();
}

function handleEscapeKey({ key }) {
	if (key === "Escape" && modal.classList.contains("show")) handleClose();
}

function handleScroll({ target: { scrollTop } }) {
	const header = document.querySelector(".header");
	if (!header) return;

	const height = header.offsetHeight;
	const offset = header.offsetTop - 40;
	navText.textContent = scrollTop > offset + height ? header.textContent : "";
}

function handleClose() {
	navText.textContent = "";
	modal.classList.remove("show");
	body.classList.remove("modal-open");
}

function validate() {
	if (searchInput.value.trim().length < 3 && !favPage)
		createMessage("Minimum 3 characters", searchInput);
	return !document.querySelector(".error");
}

function getFavorites() {
	return [...Object.keys(localStorage)].reduce((acc, item) => {
		if (item.includes("tt")) acc.push(JSON.parse(localStorage.getItem(item)));
		return acc;
	}, []);
}

function clear() {
	clean(year, searchInput, container, pagination, "error");
	current().title = searchInput.value;
	selector.value = "all";
	if (favPage) handleSearch();
}

function containerTemplate(movies) {
	return movies.reduce((acc, movie) => (acc += cardTemplate(movie)), "");
}

function updateStorageArray(movie) {
	const index = favorites.storage.findIndex(
		({ imdbID }) => imdbID == movie.imdbID
	);
	if (index !== -1) favorites.storage.splice(index, 1);
	else favorites.storage.push(movie);
	favorites.total = favorites.storage.length;
}

function cardTemplate({ Poster, Title, imdbID }) {
	const icon = localStorage.getItem(imdbID) ? "fas" : "far";
	const ribbon = icon == "fas" ? "ribbon favorite" : "ribbon";
	const src = Poster == "N/A" ? "assets/img/default.png" : Poster;

	return `
    <div class="poster">
        <div class="poster-container">
            <span 
                class="${ribbon}" id="${imdbID}">
                <i class="${icon} fa-star icon"></i>
            </span>
            <img src="${src}" />
			<div class="backdrop" style="background-image: url(${src})"></div>
        </div>
        <div class="title-container">
            <p class="title">${Title}</p>
        </div>
    </div>`;
}

function paginationTemplate(total, page) {
	let string = "";
	const pages = Math.ceil(total / 10);
	if (pages < 2) return string;

	const beforePage = page - 1;
	const afterPage = pages - page;

	if (beforePage > 0) {
		string += `<a class="prev"><i class="fas fa-angle-left"></i></a>`;
		if (beforePage < 4)
			for (let index = 1; index <= beforePage; index++)
				string += `<a class="item">${index}</a>`;
		else {
			string += `<a class="item">1</a>`;
			string += `<a class="ellipsis"><i class="fas fa-ellipsis-h"></i></a>`;
			string += `<a class="item">${page - 1}</a>`;
		}
	}

	string += `<a class="item active">${page}</a>`;

	if (afterPage > 0) {
		if (afterPage < 4)
			for (let index = 1; index <= afterPage; index++)
				string += `<a class="item">${page + index}</a>`;
		else {
			string += `<a class="item">${page + 1}</a>`;
			string += `<a class="ellipsis"><i class="fas fa-ellipsis-h"></i></a>`;
			string += `<a class="item">${pages}</a>`;
		}
		string += `<a class="next"><i class="fas fa-angle-right"></i></a>`;
	}
	return string;
}

async function request(filters) {
	const response = await fetch(generateUrl(filters));
	const response_ = await response.json();
	if (response_.Response == "False") throw Error(response_.Error);
	return response_;
}

function generateUrl({ imdbID, type, year, title, page }) {
	if (imdbID) return `${baseUri}&i=${imdbID}&plot=full`;

	let url = `${baseUri}&s=${title}&page=${page}`;
	if (type != "all") url += `&type=${type}`;
	if (year) url += `&y=${year}`;
	return url;
}

function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => func.apply(this, args), timeout);
	};
}

const icon = () => toggleClass(caret, "fa-angle-down", "fa-angle-up");
const change = ({ target }) => target.blur();
const keypress = (e) => (!e.key.match(/^[0-9]+$/) ? e.preventDefault() : null);
const keyup = debounce((abort) => (abort ? null : handleSearch()), 1500);

selector.addEventListener("change", change);
selector.addEventListener("blur", icon);
selector.addEventListener("focus", icon);
year.addEventListener("keypress", keypress);
searchInput.addEventListener("keyup", ({ key }) => {
	let abort = key == "Enter" ? true : false;
	if (abort) handleSearch();
	keyup(abort);
});
clearButton.addEventListener("click", clear);
colorButton.addEventListener("click", () => colorInput.click());
colorInput.addEventListener("change", ({ target: { value } }) => {
	import("./color.js").then(({ default: setColorTheme }) => {
		setColorTheme(value);
	});
});
