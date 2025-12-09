(async function () {
  const waitFor = (fn, interval = 50) => new Promise(res => {
    const t = setInterval(() => {
      if (fn()) { clearInterval(t); res(); }
    }, interval);
  });

  await waitFor(() => window.firebaseInitialized === true);
  firebase.auth().onAuthStateChanged(user => {
    if (!user) window.location.href = 'login.html';
    else {
      document.getElementById('userEmail').textContent = user.email || '';
      init();
    }
  });

  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get('date') || new Date().toISOString().slice(0,10);
  document.getElementById('dateInput').value = dateParam;
  document.getElementById('heading').textContent = `Analytics for ${new Date(dateParam).toLocaleDateString()}`;

  document.getElementById('goToTrack').href = `activity.html?date=${dateParam}`;

  document.getElementById('dateInput').addEventListener('change', () => {
    const d = document.getElementById('dateInput').value;
    window.location.search = `?date=${d}`;
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await firebase.auth().signOut();
    window.location.href = 'index.html';
  });

  let pieChart = null;
  let barChart = null;

  async function loadAnalytics() {
    const dateStr = document.getElementById('dateInput').value;
    const analytics = await window.dbHelpers.getAnalyticsForDate(dateStr);

    if (!analytics.hasData) {
      document.getElementById('noData').classList.remove('hidden');
      document.getElementById('analyticsContent').classList.add('hidden');
      return;
    }
    document.getElementById('noData').classList.add('hidden');
    document.getElementById('analyticsContent').classList.remove('hidden');

    document.getElementById('totalHours').textContent = `${analytics.totalHours}h`;
    document.getElementById('totalMinutes').textContent = `${analytics.totalMinutes} minutes`;
    document.getElementById('activityCount').textContent = `${analytics.activityCount}`;
    document.getElementById('categoryCount').textContent = `${Object.keys(analytics.categoryTotals || {}).length}`;

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieLabels = Object.keys(analytics.categoryTotals || {});
    const pieData = pieLabels.map(l => analytics.categoryTotals[l]);
    const pieColors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#f97316','#84cc16','#a855f7'];

    if (pieChart) pieChart.destroy();
    pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: pieLabels,
        datasets: [{ data: pieData, backgroundColor: pieColors.slice(0,pieData.length) }]
      },
      options: { responsive: true }
    });

    const barCtx = document.getElementById('barChart').getContext('2d');
    const barLabels = analytics.activities.map(a => a.title);
    const barDataVals = analytics.activities.map(a => Number(a.duration_minutes || 0));
    if (barChart) barChart.destroy();
    barChart = new Chart(barCtx, {
      type: 'bar',
      data: { labels: barLabels, datasets: [{ label: 'Minutes', data: barDataVals, backgroundColor: '#6366f1' }] },
      options: { responsive: true, scales: { x: { ticks: { maxRotation: 45, minRotation: 0 } }, y: { beginAtZero: true } } }
    });

    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    const sorted = analytics.activities.sort((a,b) => b.duration_minutes - a.duration_minutes);
    sorted.forEach((activity, idx) => {
      const percentage = (activity.duration_minutes / (analytics.totalMinutes || 1)) * 100;
      const el = document.createElement('div');
      el.className = 'flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100';
      el.innerHTML = `
        <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">${idx+1}</div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h4 class="font-semibold text-gray-800">${escapeHtml(activity.title)}</h4>
              <span class="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">${escapeHtml(activity.category)}</span>
            </div>
            <div class="text-right">
              <div class="font-semibold text-gray-800">${activity.duration_minutes} min</div>
              <div class="text-xs text-gray-500">${percentage.toFixed(1)}%</div>
            </div>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style="width:${percentage}%"></div>
          </div>
        </div>
      `;
      timeline.appendChild(el);
    });

  }

  function escapeHtml(unsafe) {
    return (unsafe + '').replace(/[&<"']/g, function (m) {
      return {'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;'}[m];
    });
  }

  async function init() {
    await loadAnalytics();
  }

  await init();

})();
