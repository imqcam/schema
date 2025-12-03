Handlebars.registerHelper('firstChar', function (str) {
    if (typeof str !== 'string' || str.length === 0) {
        return ''; // Return an empty string if the input is invalid
    }
    return str.charAt(0); // Return the first character of the string
});

Handlebars.registerHelper('charToOrd', function (char) {
    if (typeof char !== 'string' || char.length === 0) {
        return ''; // Return an empty string if the input is invalid
    }
    const capitalChar = char.toUpperCase(); // Ensure the character is uppercase
    const asciiCode = capitalChar.charCodeAt(0); // Get the ASCII code
    if (asciiCode >= 65 && asciiCode <= 90) { // Check if it's a capital letter (A-Z)
        return asciiCode - 64; // Return the position in the alphabet (A=1, B=2, ..., Z=26)
    }
    return ''; // Return an empty string if the character is not a capital letter
});
