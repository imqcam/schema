Handlebars.registerHelper("padNumber", function (number, width) {
    if (number === null || number === undefined || number === '') {
        return '';
    }
    let numStr = number.toString();
    return numStr.padStart(width, "0");
});
Handlebars.registerHelper('joinarray', function (a, sep, prefix=false) {
    if (!a || !Array.isArray(a) || a.length === 0) {
        // Handle empty or undefined array
        return '';
    }
    const result = a.join(sep);
    if (result !== '' && prefix) {
        return `${sep}${result}`;
    }
    return result;
});
