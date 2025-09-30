window.initWasteMap = function initWasteMap() {
    var el = document.getElementById('gmap');
    if (!el || !window.google) return;

    var map = new google.maps.Map(el, {
        center: { lat: 28.6139, lng: 77.2090 }, // New Delhi region
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false
    });

    fetch('/api/pickups').then(function(r){ return r.json(); }).then(function(points){
        points.forEach(function(p){
            var color = p.type === 'Plastic' ? '#16a34a' : p.type === 'Paper' ? '#0ea5e9' : p.type === 'Metal' ? '#f59e0b' : '#64748b';
            var marker = new google.maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: color,
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
        });
    }).catch(function(){});
};


