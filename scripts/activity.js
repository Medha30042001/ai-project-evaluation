(async function () {
  const waitFor = (fn, interval = 50) => new Promise(res => {
    const t = setInterval(() => {
      if (fn()) { clearInterval(t); res(); }
    }, interval);
  });

  await waitFor(() => window.firebaseInitialized === true);
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      document.getElementById('userEmail').textContent = user.email || '';
      initApp();
    }
  });

  const dateInput = document.getElementById('dateInput');
  const totalLoggedEl = document.getElementById('totalLogged');
  const remainingEl = document.getElementById('remaining');
  const progressBar = document.getElementById('progressBar');
  const percentText = document.getElementById('percentText');
  const showAddBtn = document.getElementById('showAddBtn');
  const activityForm = document.getElementById('activityForm');
  const titleInput = document.getElementById('title');
  const categoryInput = document.getElementById('category');
  const durationInput = document.getElementById('duration');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const activitiesList = document.getElementById('activitiesList');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const unlockNote = document.getElementById('unlockNote');
  const logoutBtn = document.getElementById('logoutBtn');

  logoutBtn.addEventListener('click', async () => {
    await firebase.auth().signOut();
    window.location.href = 'index.html';
  });

  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = today;

  let editingId = null;

  showAddBtn.addEventListener('click', () => {
    activityForm.classList.remove('hidden');
    showAddBtn.classList.add('hidden');
    saveBtn.textContent = 'Add';
    editingId = null;
  });
  cancelBtn.addEventListener('click', () => {
    activityForm.classList.add('hidden');
    showAddBtn.classList.remove('hidden');
    titleInput.value = ''; categoryInput.value = ''; durationInput.value = '';
    editingId = null;
  });

  async function refresh() {
    const dateStr = dateInput.value;
    const items = await window.dbHelpers.fetchActivitiesForDate(dateStr);
    renderActivities(items);
    updateSummary(items);
  }

  dateInput.addEventListener('change', refresh);

  saveBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const duration = parseInt(durationInput.value);

    if (!title || !category || !duration || duration <= 0) {
      alert('Please fill all fields with valid values');
      return;
    }

    const dateStr = dateInput.value;
    const existing = await window.dbHelpers.fetchActivitiesForDate(dateStr);
    const totalSoFar = existing.reduce((s, a) => s + Number(a.duration_minutes || 0), 0);
    let newTotal = totalSoFar + duration;
    if (editingId) {
      const editing = existing.find(a => a.id === editingId);
      if (editing) newTotal = totalSoFar - Number(editing.duration_minutes || 0) + duration;
    }

    if (newTotal > 1440) {
      alert('This would exceed 1440 minutes for the day. Adjust duration.');
      return;
    }

    if (editingId) {
      await window.dbHelpers.updateActivity(dateStr, editingId, { title, category, duration_minutes: duration });
    } else {
      await window.dbHelpers.addActivity({ title, category, duration_minutes: duration, activity_date: dateStr});
    }

    activityForm.classList.add('hidden');
    showAddBtn.classList.remove('hidden');
    titleInput.value = ''; categoryInput.value = ''; durationInput.value = '';
    editingId = null;
    await refresh();
  });

  function renderActivities(items) {
    activitiesList.innerHTML = '';
    if (!items || items.length === 0) {
      activitiesList.innerHTML = `<div class="text-center py-12 text-gray-500"><svg class="w-12 h-12 mx-auto mb-3 opacity-50" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="#4F46E5" stroke-width="1.5"/></svg><p>No activities logged yet. Add your first activity above.</p></div>`;
      return;
    }

    items.forEach(it => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 mb-3';

      wrapper.innerHTML = `
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800">${escapeHtml(it.title)}</h3>
          <div class="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">${escapeHtml(it.category)}</span>
            <span class="font-medium">${it.duration_minutes} minutes</span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button data-edit="${it.id}" class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">Edit</button>
          <button data-delete="${it.id}" class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">Delete</button>
        </div>
      `;

      activitiesList.appendChild(wrapper);
    });

    activitiesList.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-edit');
        const dateStr = dateInput.value;
        const items = await window.dbHelpers.fetchActivitiesForDate(dateStr);
        const activity = items.find(a => a.id === id);
        if (!activity) return;
        editingId = id;
        titleInput.value = activity.title || '';
        categoryInput.value = activity.category || '';
        durationInput.value = activity.duration_minutes || '';
        activityForm.classList.remove('hidden');
        showAddBtn.classList.add('hidden');
        saveBtn.textContent = 'Update';
      });
    });

    activitiesList.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete');
        if (!confirm('Are you sure you want to delete this activity?')) return;
        const dateStr = dateInput.value;
        await window.dbHelpers.deleteActivity(dateStr, id);
        await refresh();
      });
    });
  }

  function updateSummary(items) {
    const total = items.reduce((s, a) => s + Number(a.duration_minutes || 0), 0);
    totalLoggedEl.textContent = `${total} min`;
    remainingEl.textContent = `${1440 - total} min`;
    const pct = Math.min(100, (total / 1440) * 100);
    progressBar.style.width = `${pct}%`;
    percentText.textContent = `${pct.toFixed(1)}% of day tracked`;

    if (total === 1440) {
      analyzeBtn.disabled = false;
      analyzeBtn.className = 'w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl';
      unlockNote.style.display = 'none';
      analyzeBtn.onclick = () => {
        const dateStr = dateInput.value;
        window.location.href = `analytics.html?date=${dateStr}`;
      };
    } else {
      analyzeBtn.disabled = true;
      analyzeBtn.className = 'w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-400 cursor-not-allowed';
      unlockNote.style.display = 'block';
      analyzeBtn.onclick = null;
    }
  }

  function escapeHtml(unsafe) {
    return (unsafe + '').replace(/[&<"']/g, function (m) {
      return {'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;'}[m];
    });
  }

  async function initApp() {
    await refresh();
  }

})();
