function formOnLoad(form) {
    // Collapse all object fields by default
    const objectFields = document.querySelectorAll('.panel.panel-default');
    objectFields.forEach(field => {
        const body = field.querySelector('.panel-body');
        const toggle = field.querySelector('.panel-heading');

        if (body && toggle) {
            // Hide body initially
            body.style.display = 'none';

            // Toggle on click
            toggle.style.cursor = 'pointer';
            toggle.onclick = () => {
                body.style.display = body.style.display === 'none' ? 'block' : 'none';
            };
        }
    });
}
