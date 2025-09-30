document.addEventListener('DOMContentLoaded', function(){
    var el = document.getElementById('gmap');
    if (!el || !window.L) return;

    var map = L.map('gmap', { zoomControl: true }).setView([28.6139, 77.2090], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var allPoints = [];
    var markerLayer = L.layerGroup().addTo(map);
    var heatLayer = null;

    function colorFor(type){
        return type === 'Plastic' ? '#16a34a' : type === 'Paper' ? '#0ea5e9' : type === 'Metal' ? '#f59e0b' : '#64748b';
    }

    function renderMarkers(filtered){
        markerLayer.clearLayers();
        filtered.forEach(function(p){
            var marker = L.circleMarker([p.lat, p.lng], {
                radius: 6,
                color: '#ffffff',
                weight: 1,
                fillColor: colorFor(p.type),
                fillOpacity: 1
            }).addTo(markerLayer);
            marker.bindPopup('<div style="min-width:180px"><strong>' + p.type + '</strong><br/>' + (p.weightKg||0) + ' kg • ' + (p.time||'') + '<br/>' + (p.location||'') + '</div>');
        });
    }

    function renderHeat(filtered){
        if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
        var points = filtered.map(function(p){
            return [p.lat, p.lng, Math.max(0.2, (p.weightKg || 1) / 20)];
        });
        heatLayer = L.heatLayer(points, { radius: 25, blur: 20, maxZoom: 17 });
        heatLayer.addTo(map);
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
        if (heatToggle && heatToggle.checked) renderHeat(filtered); else if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
    }

    fetch('/api/pickups').then(function(r){ return r.json(); }).then(function(points){
        allPoints = points;
        applyFilters();
    }).catch(function(){});

    document.querySelectorAll('.map-filter').forEach(function(b){ b.addEventListener('change', applyFilters); });
    var heatToggle = document.getElementById('toggleHeat');
    if (heatToggle) heatToggle.addEventListener('change', applyFilters);
});


