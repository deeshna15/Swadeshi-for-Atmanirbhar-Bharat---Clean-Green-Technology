window.initWasteMap = function initWasteMap() {
    var el = document.getElementById('gmap');
    if (!el || !window.google) return;

    var map = new google.maps.Map(el, {
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false
    });

    var allPoints = [];
    var markers = [];
    var heatmap = null;

    function colorFor(type){
        return type === 'Plastic' ? '#16a34a' : type === 'Paper' ? '#0ea5e9' : type === 'Metal' ? '#f59e0b' : '#64748b';
    }

    function clearMarkers(){ markers.forEach(function(m){ m.setMap(null); }); markers = []; }

    function renderMarkers(filtered){
        clearMarkers();
        filtered.forEach(function(p){
            var marker = new google.maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: colorFor(p.type),
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: '#ffffff'
                },
                title: p.type + ' • ' + (p.weightKg || 0) + 'kg'
            });
            var info = new google.maps.InfoWindow({
                content: '<div style="min-width:180px"><strong>' + p.type + '</strong><br/>' + (p.weightKg||0) + ' kg • ' + (p.time||'') + '<br/>' + (p.location||'') + '</div>'
            });
            marker.addListener('click', function(){ info.open(map, marker); });
            markers.push(marker);
        });
    }

    function renderHeat(filtered){
        if (!google.maps.visualization) return;
        if (heatmap) { heatmap.setMap(null); heatmap = null; }
        var points = filtered.map(function(p){
            return { location: new google.maps.LatLng(p.lat, p.lng), weight: Math.max(1, p.weightKg || 1) };
        });
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: points,
            radius: 24,
            dissipating: true
        });
        heatmap.setMap(map);
    }

    function getActiveTypes(){
        var boxes = document.querySelectorAll('.map-filter');
        var active = [];
        boxes.forEach(function(b){ if (b.checked) active.push(b.value); });
        return active;
    }

    function applyFilters(){
        var active = getActiveTypes();
        var filtered = allPoints.filter(function(p){ return active.indexOf(p.type) !== -1; });
        renderMarkers(filtered);
        var heatToggle = document.getElementById('toggleHeat');
        if (heatToggle && heatToggle.checked) renderHeat(filtered); else if (heatmap) { heatmap.setMap(null); heatmap = null; }
    }

    // Load data and initialize
    fetch('/api/pickups').then(function(r){ return r.json(); }).then(function(points){
        allPoints = points;
        applyFilters();
    }).catch(function(){});

    // Wire filters
    document.querySelectorAll('.map-filter').forEach(function(b){ b.addEventListener('change', applyFilters); });
    var heatToggle = document.getElementById('toggleHeat');
    if (heatToggle) heatToggle.addEventListener('change', applyFilters);
};


