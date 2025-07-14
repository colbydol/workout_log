// List of exercise options for the dropdown
export const exerciseOptions = [
  { value: 'bench-press', label: 'Bench Press', category: 'chest' },
  { value: 'incline-press', label: 'Incline Press', category: 'chest' },
  { value: 'chest-fly', label: 'Chest Fly', category: 'chest' },
  { value: 'push-up', label: 'Push Up', category: 'chest' },
  { value: 'squat', label: 'Squat', category: 'legs' },
  { value: 'deadlift', label: 'Deadlift', category: 'legs' },
  { value: 'leg-press', label: 'Leg Press', category: 'legs' },
  { value: 'leg-extension', label: 'Leg Extension', category: 'legs' },
  { value: 'leg-curl', label: 'Leg Curl', category: 'legs' },
  { value: 'calf-raise', label: 'Calf Raise', category: 'legs' },
  { value: 'overhead-press', label: 'Overhead Press', category: 'shoulders' },
  { value: 'lateral-raise', label: 'Lateral Raise', category: 'shoulders' },
  { value: 'front-raise', label: 'Front Raise', category: 'shoulders' },
  { value: 'barbell-row', label: 'Barbell Row', category: 'back' },
  { value: 'pull-up', label: 'Pull Up', category: 'back' },
  { value: 'lat-pulldown', label: 'Lat Pulldown', category: 'back' },
  { value: 'seated-row', label: 'Seated Row', category: 'back' },
  { value: 'bicep-curl', label: 'Bicep Curl', category: 'arms' },
  { value: 'hammer-curl', label: 'Hammer Curl', category: 'arms' },
  { value: 'tricep-extension', label: 'Tricep Extension', category: 'arms' },
  { value: 'tricep-pushdown', label: 'Tricep Pushdown', category: 'arms' },
  { value: 'plank', label: 'Plank', category: 'core' },
  { value: 'crunch', label: 'Crunch', category: 'core' },
  { value: 'russian-twist', label: 'Russian Twist', category: 'core' },
  { value: 'leg-raise', label: 'Leg Raise', category: 'core' },
  // CrossFit exercises
  { value: 'thruster', label: 'Thruster', category: 'crossfit' },
  { value: 'wall-ball', label: 'Wall Ball', category: 'crossfit' },
  { value: 'double-under', label: 'Double Under', category: 'crossfit' },
  { value: 'box-jump', label: 'Box Jump', category: 'crossfit' },
  { value: 'burpee', label: 'Burpee', category: 'crossfit' },
  { value: 'power-clean', label: 'Power Clean', category: 'crossfit' },
  { value: 'snatch', label: 'Snatch', category: 'crossfit' },
  { value: 'muscle-up', label: 'Muscle Up', category: 'crossfit' },
  { value: 'toes-to-bar', label: 'Toes to Bar', category: 'crossfit' },
  { value: 'kettlebell-swing', label: 'Kettlebell Swing', category: 'crossfit' },
  { value: 'rowing', label: 'Rowing', category: 'crossfit' },
  { value: 'handstand-push-up', label: 'Handstand Push Up', category: 'crossfit' },
  { value: 'sumo-deadlift-high-pull', label: 'Sumo Deadlift High Pull', category: 'crossfit' },
  { value: 'overhead-squat', label: 'Overhead Squat', category: 'crossfit' }
];

// Helper function to get exercise label by value
export const getExerciseLabel = (value) => {
  const exercise = exerciseOptions.find(option => option.value === value);
  return exercise ? exercise.label : value;
};

// Get exercises by category
export const getExercisesByCategory = (category) => {
  return exerciseOptions.filter(exercise => exercise.category === category);
};

// List of exercise categories
export const exerciseCategories = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'legs', label: 'Legs' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' }
];

// User info and logout button
<div style={{
  position: 'absolute',
  top: 20,
  right: 30,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: '#f5f5f5',
  padding: '8px 16px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.07)'
}}>
  <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
    {user?.email}
  </span>
  <button onClick={handleLogout} className="app-button" style={{marginBottom: 0, marginLeft: '8px'}}>Logout</button>
</div>
