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
          return `${result.igsn}`;
        } catch (e) {
          return `${result.igsn}`;
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

Handlebars.registerHelper('formatBuildParams', function (params, mode) {
    if (!params || !Array.isArray(params) || params.length === 0) {
        return '';
    }

    const TYPE_ORDER = ['upskin', 'downskin', 'infill', 'contouring'];
    const TYPE_ABBR = { upskin: 'u', downskin: 'd', infill: 'i', contouring: 'c' };

    const normalize = (value) => (value === undefined || value === null || value === '' ? '' : value);
    const hasValue = (value) => !(value === undefined || value === null || value === '');
    const isPulsedMode = mode === 'pulsed' || (mode !== 'continuous' && params.some(p => hasValue(p.pulseDistance) || hasValue(p.exposureTime)));

    // Parameter signature of a region: mode + values, excluding the region type.
    const signature = (p) => (isPulsedMode
        ? ['P', normalize(p.pulseDistance), normalize(p.exposureTime), normalize(p.laserPower), normalize(p.layerThickness), normalize(p.hatchSpacing)]
        : ['C', normalize(p.laserSpeed), normalize(p.laserPower), normalize(p.layerThickness), normalize(p.hatchSpacing)]
    ).join(':');

    // Sort regions into canonical order so the same set always yields the same ID.
    const sorted = params.slice().sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));

    // Collapse regions sharing identical parameters: group their type initials in
    // front of a single shared token (e.g. all four identical regions -> "udic:C:...").
    const groups = [];
    const bySig = {};
    sorted.forEach(p => {
        const sig = signature(p);
        const abbr = TYPE_ABBR[p.type] || p.type;
        if (Object.prototype.hasOwnProperty.call(bySig, sig)) {
            bySig[sig].types += abbr;
        } else {
            const group = { types: abbr, sig };
            bySig[sig] = group;
            groups.push(group);
        }
    });

    return groups.map(g => `${g.types}:${g.sig}`).join('_');
});

JSONEditor.defaults.custom_validators.push(function (schema, value, path) {
  // Only validate the buildParameters array
  if (schema.title !== "Build Process Parameters") {
    return [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  const duplicates = new Set();

  value.forEach(item => {
    if (item && item.type) {
      if (seen.has(item.type)) {
        duplicates.add(item.type);
      }
      seen.add(item.type);
    }
  });

  if (duplicates.size > 0) {
    return [{
      path: path,
      property: 'type',
      message: `Duplicate build parameter type(s) not allowed: ${[...duplicates].join(', ')}.
Each type (upskin, downskin, infill, contouring) may only appear once.`
    }];
  }

  return [];
});


JSONEditor.defaults.custom_validators.push(function (schema, value, path) {
  // Only validate the IGSNs field
  if (schema.title !== "IGSNs") {
    return [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  const duplicates = new Set();

  value.forEach(v => {
    if (seen.has(v)) {
      duplicates.add(v);
    }
    seen.add(v);
  });

  if (duplicates.size > 0) {
    return [{
      path: path,
      message: `Duplicate IGSN(s) are not allowed: ${[...duplicates].join(', ')}`
    }];
  }

  return [];
});