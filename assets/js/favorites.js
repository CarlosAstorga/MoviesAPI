/**
 * favorites module.
 * @module favorites
 */

import { toggleClass } from "./utility.js";

/**
 * Adds or removes the movie in the localStorage.
 * @param {Object} movie - The movie to be stored in the localStorage .
 */
function updateLocalStorage(movie) {
	getIcon(movie.imdbID) == "fas"
		? localStorage.removeItem(`${movie.imdbID}`)
		: localStorage.setItem(`${movie.imdbID}`, JSON.stringify(movie));
}

/**
 * Gets the star icon prefix
 * @param {string} imdbID - The movie's id.
 * @returns {string} - The icon prefix.
 */
function getIcon(imdbID) {
	return localStorage.getItem(imdbID) ? "fas" : "far";
}

/**
 * Updates the poster css.
 * @param {string} imdbID - Poster's id
 */
function updatePoster(imdbID) {
	const ribbon = document.getElementById(imdbID);
	if (ribbon) {
		toggleClass(ribbon, "favorite");
		toggleClass(ribbon.firstElementChild, "fas", "far");
	}
}

export { updateLocalStorage, getIcon, updatePoster };
