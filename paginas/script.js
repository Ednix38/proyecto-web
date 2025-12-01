// Cargar el header desde header.html
fetch('header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    })
    .catch(err => console.error('Error cargando el header:', err));
