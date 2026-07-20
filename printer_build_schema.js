Handlebars.registerHelper('replaceAll', function (string, search, replacement) {
    return (string !== undefined && string !== null) ? string.replaceAll(search, replacement) : '';
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

Handlebars.registerHelper('rawPowderMaterial', function (rawPowderID) {
    if (!rawPowderID) {
        return '';
    }

    const selected = Array.isArray(rawPowderID) ? rawPowderID[0] : rawPowderID;
    if (typeof selected !== 'string') {
        return '';
    }

    function materialFromPowderCode(value) {
        const parts = value.split('_');
        // Format expected: PWD_<material>_<supplier>_<location>_<id>
        if (parts.length > 1 && parts[0] === 'PWD') {
            return parts[1];
        }
        return '';
    }

    // Normal path: value is already PWD_... code.
    const directMaterial = materialFromPowderCode(selected);
    if (directMaterial) {
        return directMaterial;
    }

    // Fallback path: value is an internal entry ID; resolve from option label.
    if (typeof document !== 'undefined') {
        const options = document.querySelectorAll('option');
        for (const option of options) {
            if (option.value === selected) {
                const label = (option.textContent || '').trim();
                const labelMaterial = materialFromPowderCode(label);
                if (labelMaterial) {
                    return labelMaterial;
                }
            }
        }
    }

    return selected;
});
