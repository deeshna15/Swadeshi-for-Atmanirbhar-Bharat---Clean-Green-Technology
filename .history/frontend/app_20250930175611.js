document.addEventListener('DOMContentLoaded', function () {
    // Wire hero buttons on Home if present
    var scanBtns = document.querySelectorAll('[href="scan.html"].btn, .go-scan');
    scanBtns.forEach(function (b) { b.addEventListener('click', function (e) {}); });

    // Simple active nav highlight by pathname
    try {
        var path = location.pathname.split('/').pop() || 'index.html';
        var links = document.querySelectorAll('.nav-link');
        links.forEach(function (a) {
            if (a.getAttribute('href') === path) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });
    } catch (e) {}
});


