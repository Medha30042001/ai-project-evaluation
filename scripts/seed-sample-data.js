(async () => {
  const date = new Date().toISOString().slice(0,10);
  const uid = firebase.auth().currentUser && firebase.auth().currentUser.uid;
  if (!uid) return alert('Sign in first');

  const activities = [
    { title: 'Sleep', category: 'Sleep', duration_minutes: 480 },
    { title: 'Work (morning)', category: 'Work', duration_minutes: 240 },
    { title: 'Lunch', category: 'Meals', duration_minutes: 60 },
    { title: 'Work (afternoon)', category: 'Work', duration_minutes: 240 },
    { title: 'Exercise', category: 'Exercise', duration_minutes: 60 },
    { title: 'Commute', category: 'Commute', duration_minutes: 60 },
    { title: 'Entertainment', category: 'Entertainment', duration_minutes: 60 },
    { title: 'Personal', category: 'Personal', duration_minutes: 60 },
    { title: 'Learning', category: 'Learning', duration_minutes: 75 }
  ];

  const col = firebase.firestore().collection('users').doc(uid).collection('days').doc(date).collection('activities');

  for (const a of activities) {
    await col.add({ ...a, activity_date: date, createdAt: Date.now() });
    console.log('Added', a.title);
  }
  alert('Seed data added — refresh page');
})();
