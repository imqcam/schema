
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
    'get_pMax': function (editor, result) {
        try {
          const localId = result.metadata.attributes.alternateIdentifiers.find(
            (id) => id.alternateIdentifierType === 'local'
          );
          return `${result.igsn} - ${result._id} - ${localId.alternateIdentifier}`;
        } catch (e) {
          return `${result.igsn} - ${result._id} - no localId`;
        }
    },
        'get_pMin': function (editor, result) {
        try {
          const localId = result.metadata.attributes.alternateIdentifiers.find(
            (id) => id.alternateIdentifierType === 'local'
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
window.JSONEditor.defaults.callbacks.watch = function (editor) {
    editor.watch('root.tests', function () {
        const tests = editor.getEditor('root.tests');
        if (tests && Array.isArray(tests.rows)) {
            tests.rows.forEach(row => {
                const sigmaEditor = row.getEditor('sigmaMaxInitiation');
                const rRatioEditor = row.getEditor('rRatio');
                const deltaSigmaEditor = row.getEditor('deltaSigma');

                const sigma = sigmaEditor.getValue();
                const rRatio = rRatioEditor.getValue();

                if (typeof sigma === 'number' && typeof rRatio === 'number') {
                    const deltaSigma = sigma - (sigma * rRatio);
                    deltaSigmaEditor.setValue(deltaSigma);
                }
            });
        }
    });
};

