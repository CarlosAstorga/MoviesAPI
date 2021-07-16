if (localStorage.getItem("themeColor")) {
	document.documentElement.style.setProperty(
		"--hue-color",
		localStorage.getItem("themeColor")
	);
}
