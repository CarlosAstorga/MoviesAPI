/**
 * color module.
 * @module color
 */

/**
 * Sets the theme color.
 * @param {string} hex - hex color.
 */
export default function setColorTheme(hex) {
	const r = parseInt(hex.substr(1, 2), 16);
	const g = parseInt(hex.substr(3, 2), 16);
	const b = parseInt(hex.substr(5, 2), 16);
	const hue = rgbToHsl(r, g, b)[0] * 360;

	document.documentElement.style.setProperty("--hue-color", hue);
	localStorage.setItem("themeColor", hue);
}

function rgbToHsl(r, g, b) {
	(r /= 255), (g /= 255), (b /= 255);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max == min) {
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return [h, s, l];
}
