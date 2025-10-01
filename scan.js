(function(){
    var video = document.getElementById('camera');
    var canvas = document.getElementById('snapshot');
    var ctx = canvas ? canvas.getContext('2d') : null;
    var btnStart = document.getElementById('btnStartCam');
    var btnCapture = document.getElementById('btnCapture');
    var fileInput = document.getElementById('fileInput');
    var btnUpload = document.getElementById('btnUpload');
    var resultEl = document.getElementById('result');
    var valueEl = document.getElementById('value');
    var pointsBadge = document.getElementById('pointsBadge');
    var statScanned = document.getElementById('statScanned');
    var statPoints = document.getElementById('statPoints');
    var statUnique = document.getElementById('statUnique');
    var recentList = document.getElementById('recentList');
    var challengeBar = document.getElementById('challengeBar');
    var challengeText = document.getElementById('challengeText');
    var btnPickup = document.getElementById('btnPickup');

    function updateStats(data){
        if (!data) return;
        if (pointsBadge) pointsBadge.textContent = (data.pointsTotal || 0) + ' Green Points';
        if (statScanned) statScanned.textContent = data.itemsScanned || 0;
        if (statPoints) statPoints.textContent = data.pointsTotal || 0;
        if (statUnique) statUnique.textContent = data.uniqueTypesToday || 0;
        if (challengeBar) challengeBar.style.width = Math.min(100, Math.floor((data.uniqueTypesToday || 0) / 5 * 100)) + '%';
        if (challengeText) challengeText.textContent = (data.uniqueTypesToday || 0) + '/5 types scanned — +50 bonus points';
        if (Array.isArray(data.recent)) {
            recentList.innerHTML = '';
            data.recent.slice(0,6).forEach(function(item){
                var row = document.createElement('div');
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                row.innerHTML = '<span>' + item.label + '</span><span style="color:#16a34a">+' + item.points + '</span>';
                recentList.appendChild(row);
            });
        }
    }

    function showResult(r){
        if (!r) return;
        if (resultEl) resultEl.textContent = r.label + ' • ' + (r.recyclable ? 'Recyclable' : 'Not recyclable');
        if (valueEl) valueEl.textContent = r.estimatedValue ? ('~₹' + r.estimatedValue.toFixed(2) + ' value') : '';
        if (btnPickup) {
            var q = encodeURIComponent(r.label || '');
            btnPickup.href = 'marketplace.html?type=' + q;
        }
    }

    function dataUrlFromCanvas(){
        if (!canvas || !ctx) return null;
        return canvas.toDataURL('image/jpeg', 0.85);
    }

    function drawFromVideo(){
        if (!video || !canvas || !ctx) return;
        var w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0,0,w,h);
        try { ctx.drawImage(video, 0, 0, w, h); } catch(e) {}
    }

    function handleFile(file){
        if (!file || !canvas || !ctx) return;
        var img = new Image();
        img.onload = function(){
            var w = canvas.width, h = canvas.height;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0,0,w,h);
            var ratio = Math.min(w / img.width, h / img.height);
            var dw = img.width * ratio;
            var dh = img.height * ratio;
            var dx = (w - dw) / 2;
            var dy = (h - dh) / 2;
            ctx.drawImage(img, dx, dy, dw, dh);
        };
        img.src = URL.createObjectURL(file);
    }

    function callScanApi(imageData){
        if (!imageData) return;
        fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        }).then(function(r){ return r.json(); }).then(function(resp){
            showResult(resp.result);
            updateStats(resp.stats);
        }).catch(function(){
            // fallback demo
            var demo = { label: 'PET Bottle (PET)', recyclable: true, estimatedValue: 1.8 };
            showResult(demo);
        });
    }

    if (btnStart) btnStart.addEventListener('click', function(){
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream){
            if (video) video.srcObject = stream;
        }).catch(function(){});
    });

    if (btnCapture) btnCapture.addEventListener('click', function(){
        drawFromVideo();
        callScanApi(dataUrlFromCanvas());
    });

    if (btnUpload) btnUpload.addEventListener('click', function(){
        if (fileInput) fileInput.click();
    });

    if (fileInput) fileInput.addEventListener('change', function(ev){
        var f = ev.target.files && ev.target.files[0];
        if (!f) return;
        handleFile(f);
        setTimeout(function(){ callScanApi(dataUrlFromCanvas()); }, 150);
    });

    // Load initial stats
    fetch('/api/points').then(function(r){ return r.json(); }).then(function(s){ updateStats(s); }).catch(function(){});
})();


