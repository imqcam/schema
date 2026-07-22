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

// Small synchronous, deterministic hash (FNV-1a, 32-bit) rendered as base36.
// Used to guarantee ID uniqueness across the *full* parameter set while keeping
// the human-readable portion short. Web Crypto's digest is async and can't be
// used inside this synchronous template helper.
function shortHash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36).padStart(6, '0');
}

Handlebars.registerHelper('formatHTParamsShort', function (stress_relief, heat_treatment) {
    if (!stress_relief) {
        return '';
    }

    const cycles = (heat_treatment && Array.isArray(heat_treatment)) ? heat_treatment : [];

    const stageIsHipped = stage => stage && stage.HIP && typeof stage.HIP === 'object';

    const tempStr = value =>
        (value === undefined || value === null || value === '') ? '?' : `${value}`;

    // Human-readable part: the temperature profile, which is how a recipe is
    // actually recognized. SR temperature, then each subsequent cycle's peak
    // temperature. A HIPed stage carries a "+HIP" marker on its peak temp.
    let readable = `${tempStr(stress_relief.temperature_C)}SR`;

    if (cycles.length > 0) {
        const profile = cycles.map(ht => {
            let token = tempStr(ht.temperature_C);
            if (stageIsHipped(ht)) {
                token += '+HIP';
            }
            return token;
        });
        readable += `_${profile.join('-')}`;
    }

    // Hash part: covers every parameter of every stage (times, ramp rates,
    // cooling, environment, HIP pressure) so any difference anywhere produces a
    // distinct ID, even when two recipes share the same temperature profile.
    const canonStage = stage => [
        stage.time_hr,
        stage.temperature_C,
        stage.ramp_up_C_per_min,
        stage.cooling_method,
        stage.environment,
        stageIsHipped(stage) ? stage.HIP.pressure_MPa : 'noHIP'
    ].join('|');

    const canonical = [stress_relief].concat(cycles).map(canonStage).join('||');

    return `HT_${readable}_${shortHash(canonical)}`;
});

// Validator to prevent changing HeattreatmentID to a completely different value
JSONEditor.defaults.custom_validators.push(function (schema, value, path) {
  // Only validate HeattreatmentID field
  if (!schema.title || schema.title !== "Heat Treatment ID") {
    return [];
  }

  if (!value) {
    return [];
  }

  // Check if value starts with HT_ format
  if (typeof value === 'string' && !value.startsWith('HT_')) {
    // If someone tries to set it to something that doesn't look like the format, reject it
    return [{
      path: path,
      message: `Invalid Heat Treatment ID format. Format must be: HT_[parameters]_SR`
    }];
  }

  return [];
});