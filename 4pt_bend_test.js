window.JSONEditor.defaults.callbacks.autocomplete = {
    'search_deposition': function (editor, input) {
        if (input.length < 3) {
            return [];
        }

        return restRequest({
            url: 'deposition',
            method: 'GET',
            data: {
                q: input,
                limit: 10
            }
        })
    },
    'render_deposition': function (editor, result, props) {
        try {
          const localId = result.metadata.alternateIdentifiers.find(
              (id) => id.alternateIdentifierType.toLowerCase() === 'local'
          );
          return `<li ${props}> ${result.igsn} (localId: ${localId.alternateIdentifier})</li>`;
        } catch (e) {
          return `<li ${props}> ${result.igsn} (title: ${result.metadata.titles[0]['title']})</li>`;
        }
    },
    'get_deposition_value': function (editor, result) {
        try {
          const localId = result.metadata.alternateIdentifiers.find(
            (id) => id.alternateIdentifierType.toLowerCase() === 'local'
          );
          return `${result.igsn} - ${result._id} - ${localId.alternateIdentifier}`;
        } catch (e) {
          return `${result.igsn} - ${result._id} - no localId`;
        }
    }
};

Handlebars.registerHelper('split', function (string, separator, index) {
    try {
        return string.split(separator)[index].trim();
    } catch (e) {
        return '';
    }
});

Handlebars.registerHelper('load', function (b, d, l, sigma) {
    try {
        const load = (parseFloat(sigma) * 1e6) * (parseFloat(b) * 1e-3) * Math.pow(parseFloat(d) * 1e-3,  2) / (parseFloat(l) * 1e-3);
        return load.toFixed(0);
    } catch (e) {
        return -1;
    }
});

Handlebars.registerHelper('deltaSigma', function (rratio, sigma) {
    try {
        const deltaSigma = sigma - (sigma * rratio);
        return deltaSigma.toFixed(0);
    } catch (e) {
        return -1;
    }
});

Handlebars.registerHelper('multiply', function (a, b) {
  try {
    const result = parseFloat(a) * parseFloat(b);
    if (result > 50) {
      return result.toFixed(0);
    } else {
      return result.toFixed(2);
    }
  } catch (e) {
    return -1;
  }
});
