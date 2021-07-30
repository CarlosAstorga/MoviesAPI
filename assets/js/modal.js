/**
 * Modal module.
 * @module modal
 */

import { toggleClass } from "./utility.js";
import { updatePoster, getIcon, updateLocalStorage } from "./favorites.js";

/**
 * Callback for updating the posters.
 * @callback updatePostersCallback
 */

/**
 * Fills the modal with the movie's data
 * @param {Object} movie - The movie to be displayed.
 * @param {updatePostersCallback} callback - A callback to be executed.
 */
export default function fillModal(movie, callback) {
	const container = modal.lastElementChild;
	container.style.visibility = "hidden";
	const bg = getIcon(movie.imdbID) == "fas" ? "bg-primary" : "bg-accent";

	const valid = (value) => value && value != "N/A";
	const star = (acc, key) =>
		(acc += `<i class="${
			key < Math.round(movie.imdbRating) ? "fas" : "far"
		} fa-star"></i>`);
	const tag = (acc, tag) => (acc += `<span class="tag">${tag}</span>`);
	const source = (src) => src != `${window.location}assets/img/default.png`;

	const genres = valid(movie.Genre)
		? `<div class="genres">${movie.Genre.split(",").reduce(tag, "")}</div>`
		: "";

	const data = `<p>${[
		"Country",
		"Runtime",
		"Director",
		"Actors",
		"Year",
	].reduce(
		(acc, current) =>
			valid(movie[current])
				? (acc += ` <span class="subtitle">${current} </span> ${movie[current]}`)
				: acc,
		""
	)}</p>`;

	const imdbRating = valid(movie.imdbRating)
		? `<p class="rating">
			<span class="subheader">RATING:</span> ${movie.imdbRating} / 10<br />
			${[...Array(10).keys()].reduce(star, "")}</p>`
		: "";

	const plot = valid(movie.Plot)
		? `<div class="plot"><span class="subheader">PLOT:</span><br /><p>${movie.Plot}</p></div>`
		: "";

	const src = document.getElementById(movie.imdbID).nextElementSibling.src;
	const poster = source(src)
		? `<div class="picture"><img src="${src}" />
		<div class="backdrop" style="background-image: url(${src})"></div>
		</div>`
		: "";

	container.innerHTML = `
	${genres}
	<h1 class="header">${movie.Title}</h1>
	<div class="information">
		<div class="data">
		${data}
		${imdbRating}
		${plot}
		</div>
		${poster}
	</div>
	<button class="action ${bg}">${setButtonContent(bg)}</button>`;
	const actionButton = container.lastElementChild;
	actionButton.addEventListener("click", () => {
		updateLocalStorage(movie);
		const res = callback();
		if (typeof res === "object") {
			const index = res.storage.findIndex(
				({ imdbID }) => imdbID == movie.imdbID
			);
			if (index === -1) if (res.data.length == 1 && res.page > 1) res.page--;
			if (index > 9)
				res.page = parseInt(index.toString().split("").shift()) + 1;
			res.populate();
		} else updatePoster(movie.imdbID);
		toggleClass(actionButton, "bg-primary", "bg-accent");
		actionButton.innerHTML = setButtonContent(actionButton.classList[1]);
	});

	const plotElement = document.querySelector(".plot");
	const imageElement = document.querySelector(".picture img");
	if (!plotElement || !imageElement) {
		container.removeAttribute("style");
		return;
	}

	imageElement.addEventListener("load", () => {
		const dataElement = document.querySelector(".data");
		const paragraph = plotElement.lastElementChild;
		let height = 0;
		const children = dataElement.children;
		for (const child of children) {
			if (child === plotElement) break;
			height += child.clientHeight + 22.4;
		}

		if (Math.round((imageElement.clientHeight - height) / 25) > 2) {
			if (window.innerHeight < 768) {
				plotElement.style.maxHeight = "173px";
				paragraph.style.maxHeight = "150px";
			} else {
				plotElement.style.height = `${imageElement.clientHeight - height}px`;
				paragraph.style.height = `${imageElement.clientHeight - height - 23}px`;
			}
		} else {
			imageElement.parentElement.style.display = "flex";
		}
		container.removeAttribute("style");
	});
}

function setButtonContent(className) {
	return className == "bg-primary"
		? `Remove from favorites <i class="fas fa-star"></i>`
		: `Add to favorites <i class="far fa-star"></i>`;
}
