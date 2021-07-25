/**
 * utility module.
 * @module utility
 */

/**
 * Removes HTMLElements by className, sets innerHTML or values.
 * @param  {...(HTMLElement|string)} elements - HTMLElement, className
 */
function clean(...elements) {
	elements.forEach((_) => {
		if (_ instanceof Element)
			_.value === undefined ? (_.innerHTML = "") : (_.value = "");
		else document.querySelectorAll(`.${_}`).forEach((error) => error.remove());
	});
}

/**
 * Toggle HTMLElement classList
 * @param {HTMLElement} element - The HTMLElement
 * @param  {...string} classNames - The classNames
 */
function toggleClass(element, ...classNames) {
	classNames.forEach((_) => element?.classList.toggle(_));
}

/**
 * Creates a message.
 * @param {string} message - Message to be displayed.
 * @param {HTMLElement} element - The element that caused the error.
 * @param {string} className - The class name
 */
function createMessage(message, element, className = "error") {
	const span = document.createElement("span");
	span.className = className;
	span.innerHTML = message;

	if (element.value === undefined) {
		element.appendChild(span);
	} else {
		element.parentElement.appendChild(span);
		element.focus();
	}
}

export { clean, toggleClass, createMessage };
