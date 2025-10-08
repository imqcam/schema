
// Autocomplete helpers
window.JSONEditor.defaults.callbacks.autocomplete = {
  'search_deposition': function (editor, input) {
    if (input.length < 3) return [];
    return restRequest({
      url: 'deposition',
      method: 'GET',
      data: { q: input, limit: 10 }
    });
  },
  'render_deposition': function (editor, result, props) {
    try {
      const localId = result.metadata.alternateIdentifiers.find(
        (id) => id.alternateIdentifierType.toLowerCase() === 'local'
      );
      return `<li ${props}>${result.igsn} (localId: ${localId.alternateIdentifier})</li>`;
    } catch (e) {
      return `<li ${props}>${result.igsn} (title: ${result.metadata.titles[0]['title']})</li>`;
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

// Handlebars helpers
Handlebars.registerHelper('sqrt', function (value) {
  try { 
     console.log(value);
     const num = parseFloat(value);
    return Math.sqrt(parseFloat(num)); // full numeric precision
  } 
  catch (e) { 
    return 0;
  }
});

Handlebars.registerHelper('equidiameter', function (area) {
  try { 
    console.log(area);
    return Math.sqrt((4 * parseFloat(area)) / Math.PI); // full numeric precision
  }
  catch (e) { 
    return 0; 
  }
});