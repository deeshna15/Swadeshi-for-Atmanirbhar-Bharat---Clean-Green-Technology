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

    // If served from Node, fetch live rates
    try {
        if (location.origin.indexOf('http') === 0) {
            fetch('/api/rates').then(function(r){ return r.json(); }).then(function(data){
                var grid = document.getElementById('rates-grid');
                if (!grid) return;
                grid.innerHTML = '';
                data.forEach(function(item){
                    var trendCls = item.trendPct > 0 ? 'up' : (item.trendPct < 0 ? 'down' : '');
                    var div = document.createElement('div');
                    div.className = 'rate-card';
                    div.innerHTML = '<div class="rate-title">' + item.title + '</div>' +
                        '<div class="rate-price">₹' + item.pricePerKg + ' <span class="per">/kg</span></div>' +
                        '<div class="rate-trend ' + trendCls + '">' + (item.trendPct>0?'+':'') + item.trendPct + '% from last week</div>';
                    grid.appendChild(div);
                });
            }).catch(function(){});
        }
    } catch (e) {}
});



