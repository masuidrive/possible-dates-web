/*
https://css-tricks.com/snippets/javascript/lighten-darken-color/

Usage:
 // Lighten
var NewColor = LightenDarkenColor("#F06D06", 20); 

// Darken
var NewColor = LightenDarkenColor("#F06D06", -20); 
*/
export default function lightenDarkenColor(color, amt) {
	var usePound = false

	if (color[0] == "#") {
		color = color.slice(1)
		usePound = true
	}

	var num = parseInt(color, 16)

	var r = (num >> 16) + amt

	if (r > 255) r = 255
	else if (r < 0) r = 0

	var b = ((num >> 8) & 0x00ff) + amt

	if (b > 255) b = 255
	else if (b < 0) b = 0

	var g = (num & 0x0000ff) + amt

	if (g > 255) g = 255
	else if (g < 0) g = 0

	return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16)
}