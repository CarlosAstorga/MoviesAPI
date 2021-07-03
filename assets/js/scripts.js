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
		.then((res) => {})
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
