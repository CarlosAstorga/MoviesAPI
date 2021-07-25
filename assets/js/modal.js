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
	const bg = getIcon(movie.imdbID) == "fas" ? "bg-primary" : "bg-accent";
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
					? `<p class="rating"><span class="subheader">RATING:</span> ${movie.imdbRating} / 10<br />${stars}</p>`
					: null
			}
			${
				movie.Plot != "N/A"
					? `<p><span class="subheader">PLOT:</span><br />${movie.Plot}</p>`
					: null
			}
		</div>
		<div class="picture">
			<img
				src="${movie.Poster == "N/A" ? "assets/img/default.png" : movie.Poster}" 
			/>
		</div>
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
}

function setButtonContent(className) {
	return className == "bg-primary"
		? `Remove from favorites <i class="fas fa-star"></i>`
		: `Add to favorites <i class="far fa-star"></i>`;
}
