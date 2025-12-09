/* --------------------------
   Get Current User UID
---------------------------*/
async function getUserUid() {
  const user = firebase.auth().currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

/* --------------------------
   Normalize date → yyyy-mm-dd
---------------------------*/
function normalizeDate(dateStr) {
  // Example: "2025-12-08", "2025/12/08", Date object, anything → normalized
  return new Date(dateStr).toISOString().slice(0, 10);
}

/* --------------------------
   Fetch Activities for a Given Date
---------------------------*/
async function fetchActivitiesForDate(dateStr) {
  const uid = await getUserUid();
  const normalized = normalizeDate(dateStr);

  const col = firebase.firestore()
    .collection('users').doc(uid)
    .collection('days').doc(normalized)
    .collection('activities');

  const snapshot = await col.orderBy('createdAt', 'asc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/* --------------------------
   Add Activity
---------------------------*/
async function addActivity(data) {
  const uid = await getUserUid();

  // Ensure consistency
  const normalizedDate = normalizeDate(data.activity_date);

  const cleanData = {
    title: data.title || '',
    category: data.category || 'Other',
    duration_minutes: Number(data.duration_minutes || 0), // CONSISTENT FIELD
    activity_date: normalizedDate,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  const ref = firebase.firestore()
    .collection('users').doc(uid)
    .collection('days').doc(normalizedDate)
    .collection('activities');

  const added = await ref.add(cleanData);
  return added.id;
}

/* --------------------------
   Update Activity
---------------------------*/
async function updateActivity(dateStr, activityId, newData) {
  const uid = await getUserUid();
  const normalized = normalizeDate(dateStr);

  const cleanData = { ...newData };

  // Normalize duration & date fields if passed
  if (cleanData.duration_minutes !== undefined) {
    cleanData.duration_minutes = Number(cleanData.duration_minutes);
  }
  if (cleanData.activity_date) {
    cleanData.activity_date = normalizeDate(cleanData.activity_date);
  }

  const docRef = firebase.firestore()
    .collection('users').doc(uid)
    .collection('days').doc(normalized)
    .collection('activities').doc(activityId);

  await docRef.update(cleanData);
}

/* --------------------------
   Delete Activity
---------------------------*/
async function deleteActivity(dateStr, activityId) {
  const uid = await getUserUid();
  const normalized = normalizeDate(dateStr);

  const docRef = firebase.firestore()
    .collection('users').doc(uid)
    .collection('days').doc(normalized)
    .collection('activities').doc(activityId);

  await docRef.delete();
}

/* --------------------------
   Analytics for a Given Date
---------------------------*/
async function getAnalyticsForDate(dateStr) {
  const activities = await fetchActivitiesForDate(dateStr);

  const result = {
    hasData: activities.length > 0,
    activities,
    totalMinutes: 0,
    totalHours: 0,
    activityCount: activities.length,
    categoryTotals: {}
  };

  activities.forEach(a => {
    const mins = Number(a.duration_minutes || 0);
    result.totalMinutes += mins;

    const cat = a.category || 'Other';
    result.categoryTotals[cat] = (result.categoryTotals[cat] || 0) + mins;
  });

  result.totalHours = +(result.totalMinutes / 60).toFixed(2);

  return result;
}

/* --------------------------
   Export Globals
---------------------------*/
window.dbHelpers = {
  fetchActivitiesForDate,
  addActivity,
  updateActivity,
  deleteActivity,
  getAnalyticsForDate
};
