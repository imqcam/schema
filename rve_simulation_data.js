function formOnLoad(form) {
    const editors = form.editors;

    Object.entries(editors).forEach(([key, editor]) => {
        if (editor.schema && editor.schema.type === 'object' && editor.container) {
            const header = editor.container.querySelector(
                '.je-object__title, .card-header, .panel-title'
            );
            const body = editor.container.querySelector(
                '.je-object__container, .card-body, .panel-body'
            );

            if (header && body) {
                const toggleIcon = document.createElement('span');
                toggleIcon.textContent = '▶';
                toggleIcon.style.cursor = 'pointer';
                toggleIcon.style.marginRight = '6px';

                // Collapse the section by default
                body.style.display = 'none';

                toggleIcon.onclick = () => {
                    const isCollapsed = body.style.display === 'none';
                    body.style.display = isCollapsed ? 'block' : 'none';
                    toggleIcon.textContent = isCollapsed ? '▼' : '▶';
                };

                header.prepend(toggleIcon);
            }
        }
    });
}
