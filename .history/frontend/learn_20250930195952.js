(function(){
    var listEl = document.getElementById('lessonList');
    var detailEl = document.getElementById('lessonDetail');
    var searchEl = document.getElementById('lessonSearch');
    var progressBar = document.getElementById('lessonProgressBar');
    var progressText = document.getElementById('lessonProgressText');
    var pointsBadge = document.getElementById('learnPoints');

    var lessons = [];
    var progress = { completedLessonIds: [], totalCompleted: 0, totalLessons: 0, points: 0 };

    function renderList(items){
        if (!listEl) return;
        listEl.innerHTML = '';
        items.forEach(function(ls){
            var row = document.createElement('div');
            row.className = 'card';
            row.style.padding = '12px';
            row.style.cursor = 'pointer';
            var done = progress.completedLessonIds.indexOf(ls.id) !== -1;
            row.innerHTML = '<div style="display:flex; align-items:center; justify-content:space-between">'
                + '<div>'
                + '<div style="font-weight:700">' + ls.title + '</div>'
                + '<div class="section-subtitle" style="text-align:left">' + ls.subtitle + '</div>'
                + '</div>'
                + '<span class="badge" style="' + (done ? 'background:#dcfce7;color:#166534' : '') + '">' + (done ? 'completed' : (ls.duration || '5 min')) + '</span>'
                + '</div>';
            row.addEventListener('click', function(){ renderDetail(ls); });
            listEl.appendChild(row);
        });
    }

    function renderDetail(ls){
        if (!detailEl) return;
        var done = progress.completedLessonIds.indexOf(ls.id) !== -1;
        var tags = (ls.tags || []).map(function(t){ return '<span class="badge">' + t + '</span>'; }).join(' ');
        var sectionsHtml = (ls.sections || []).map(function(s){
            return '<div class="card" style="margin-top:10px"><div style="font-weight:700">' + s.heading + '</div><div class="section-subtitle" style="text-align:left">' + s.text + '</div></div>';
        }).join('');
        var quizHtml = ls.quiz ? (
            '<div class="card" style="margin-top:12px">'
            + '<div style="font-weight:700">Quiz</div>'
            + '<div class="section-subtitle" style="text-align:left; margin-top:6px">' + ls.quiz.question + '</div>'
            + '<div id="quizOptions" class="list" style="margin-top:8px">'
            + ls.quiz.options.map(function(opt, i){ return '<label style="display:flex; align-items:center; gap:8px"><input type="radio" name="quizOpt" value="' + i + '" /> ' + opt + '</label>'; }).join('')
            + '</div>'
            + '<button id="btnSubmitQuiz" class="btn btn-primary" type="button" style="margin-top:10px">Submit Answer</button>'
            + '<div id="quizFeedback" class="section-subtitle" style="text-align:left; margin-top:8px"></div>'
            + '</div>'
        ) : '';
        detailEl.innerHTML = ''
            + (ls.image ? ('<div style="height:160px; background:url(' + ls.image + ') center/cover; border-radius:12px"></div>') : '')
            + '<div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px">'
            + '<div>'
            + '<h3 style="margin:0 0 4px">' + ls.title + '</h3>'
            + '<div class="section-subtitle" style="text-align:left">' + ls.subtitle + '</div>'
            + '</div>'
            + '<span class="badge">' + (ls.duration || '') + '</span>'
            + '</div>'
            + '<div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap">' + tags + '</div>'
            + sectionsHtml
            + quizHtml
            + '<div style="display:flex; gap:8px; margin-top:12px">'
            + '<button id="btnStartLesson" class="btn btn-primary" type="button">' + (done ? 'Review' : 'Start') + '</button>'
            + (done ? '' : '<button id="btnCompleteLesson" class="btn btn-light" type="button">Mark Complete</button>')
            + '</div>';

        var btnStart = document.getElementById('btnStartLesson');
        var btnComplete = document.getElementById('btnCompleteLesson');
        if (btnStart) btnStart.addEventListener('click', function(){ /* could jump to first section */ });
        if (btnComplete) btnComplete.addEventListener('click', function(){ completeLesson(ls.id); });
        var btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
        if (btnSubmitQuiz && ls.quiz) {
            btnSubmitQuiz.addEventListener('click', function(){
                var selected = document.querySelector('input[name="quizOpt"]:checked');
                var feedback = document.getElementById('quizFeedback');
                if (!selected) { if (feedback) feedback.textContent = 'Please select an answer.'; return; }
                var idx = parseInt(selected.value, 10);
                var correct = idx === ls.quiz.answerIndex;
                if (feedback) feedback.textContent = correct ? 'Correct! +10 pts' : 'Not quite. Try again!';
                if (correct) {
                    fetch('/api/learn/progress', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lessonId: ls.id, action: 'quiz' })
                    }).then(function(r){ return r.json(); }).then(function(p){ progress = p; updateProgressUI(); }).catch(function(){});
                }
            });
        }
    }

    function updateProgressUI(){
        if (progressBar) progressBar.style.width = (progress.totalLessons ? Math.round(progress.totalCompleted / progress.totalLessons * 100) : 0) + '%';
        if (progressText) progressText.textContent = (progress.totalCompleted || 0) + ' of ' + (progress.totalLessons || 0) + ' completed';
        if (pointsBadge) pointsBadge.textContent = (progress.points || 0) + ' pts';
    }

    function completeLesson(lessonId){
        fetch('/api/learn/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId: lessonId, action: 'complete' })
        }).then(function(r){ return r.json(); }).then(function(p){
            progress = p;
            updateProgressUI();
            renderList(filterLessons(lessons, searchEl && searchEl.value));
            var current = lessons.find(function(x){ return x.id === lessonId; });
            if (current) renderDetail(current);
        }).catch(function(){});
    }

    function filterLessons(items, q){
        if (!q) return items;
        q = q.toLowerCase();
        return items.filter(function(l){
            return (l.title || '').toLowerCase().indexOf(q) !== -1
                || (l.subtitle || '').toLowerCase().indexOf(q) !== -1
                || (l.content || '').toLowerCase().indexOf(q) !== -1;
        });
    }

    function load(){
        Promise.all([
            fetch('/api/lessons').then(function(r){ return r.json(); }),
            fetch('/api/learn/progress').then(function(r){ return r.json(); })
        ]).then(function(values){
            lessons = values[0] || [];
            progress = values[1] || progress;
            progress.totalLessons = lessons.length;
            updateProgressUI();
            renderList(lessons);
            if (lessons[0]) renderDetail(lessons[0]);
        }).catch(function(){});
    }

    if (searchEl) searchEl.addEventListener('input', function(){
        renderList(filterLessons(lessons, searchEl.value));
    });

    load();
})();


