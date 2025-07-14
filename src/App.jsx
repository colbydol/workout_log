// src/App.jsx
import React, { useState, useEffect } from 'react';
import { exerciseOptions, getExerciseLabel } from './data/exercises';
import './App.css';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState({
    date: '',
    exercises: [
      {
        name: '',
        sets: [{ reps: '', weight: '' }]
      }
    ]
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setWorkouts([]);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'workouts'), where('uid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userWorkouts = [];
        querySnapshot.forEach((doc) => {
          userWorkouts.push({ ...doc.data(), id: doc.id });
        });
        setWorkouts(userWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date)));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Form handlers for nested structure
  const handleWorkoutChange = (e) => {
    setNewWorkout({ ...newWorkout, [e.target.name]: e.target.value });
  };

  const handleExerciseChange = (idx, e) => {
    const exercises = [...newWorkout.exercises];
    exercises[idx][e.target.name] = e.target.value;
    setNewWorkout({ ...newWorkout, exercises });
  };

  const handleSetChange = (exIdx, setIdx, e) => {
    const exercises = [...newWorkout.exercises];
    exercises[exIdx].sets[setIdx][e.target.name] = e.target.value;
    setNewWorkout({ ...newWorkout, exercises });
  };

  const addExercise = () => {
    setNewWorkout({
      ...newWorkout,
      exercises: [
        ...newWorkout.exercises,
        { name: '', sets: [{ reps: '', weight: '' }] }
      ]
    });
  };

  const addSet = (exIdx) => {
    const exercises = [...newWorkout.exercises];
    exercises[exIdx].sets.push({ reps: '', weight: '' });
    setNewWorkout({ ...newWorkout, exercises });
  };

  const deleteSet = (exIdx, setIdx) => {
    const exercises = [...newWorkout.exercises];
    exercises[exIdx].sets.splice(setIdx, 1);
    // Ensure at least one set remains for each exercise
    if (exercises[exIdx].sets.length === 0) {
      exercises[exIdx].sets.push({ reps: '', weight: '' });
    }
    setNewWorkout({ ...newWorkout, exercises });
  };

  const addWorkout = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Validate at least one exercise and one set
    if (
      !newWorkout.date ||
      newWorkout.exercises.length === 0 ||
      newWorkout.exercises.some(
        ex => !ex.name || ex.sets.length === 0 || ex.sets.some(set => !set.reps || !set.weight)
      )
    ) {
      alert('Please fill out all fields for each exercise and set.');
      return;
    }

    try {
      await addDoc(collection(db, 'workouts'), {
        ...newWorkout,
        uid: user.uid,
      });
      // Reset form
      setNewWorkout({
        date: '',
        exercises: [
          { name: '', sets: [{ reps: '', weight: '' }] }
        ]
      });
    } catch (error) {
      alert('Error adding workout: ' + error.message);
    }
  };

  const exportToCSV = () => {
    if (!workouts.length) return;

    // Prepare CSV header
    const header = [
      "Date",
      "Exercises"
    ];

    // Prepare CSV rows
    const rows = workouts.map(workout => {
      // Aggregate exercises and sets into a readable string
      const exercisesStr = workout.exercises.map(ex =>
        `${getExerciseLabel(ex.name)}: ` +
        ex.sets.map((set, idx) => `Set ${idx + 1} - ${set.reps} reps @ ${set.weight} lbs`).join("; ")
      ).join(" | ");
      return [
        workout.date,
        `"${exercisesStr}"`
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [header.join(","), ...rows].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workouts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="workout-container">
        <form onSubmit={handleAuth} className="workout-form">
          <h2>{isRegistering ? 'Register' : 'Login'}</h2>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="app-button">{isRegistering ? 'Register' : 'Login'}</button>
          <button type="button" className="app-button" onClick={() => setIsRegistering(!isRegistering)} style={{marginTop: '10px'}}>
            {isRegistering ? 'Have an account? Login' : 'Need an account? Register'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="workout-container">
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
      <h1>Workout Log</h1>
      <button onClick={handleLogout} className="app-button" style={{marginBottom: '20px'}}>Logout</button>
      <form onSubmit={addWorkout} className="workout-form">
        <h2>Add New Workout</h2>
        <div className="form-group">
          <label>Date:</label>
          <input type="date" name="date" value={newWorkout.date} onChange={handleWorkoutChange} required />
        </div>
        {newWorkout.exercises.map((exercise, exIdx) => (
          <div key={exIdx} className="exercise-block">
            <div className="form-group">
              <label>Exercise:</label>
              <select
                name="name"
                value={exercise.name}
                onChange={e => handleExerciseChange(exIdx, e)}
                required
                className="exercise-dropdown"
              >
                <option value="">Select an exercise</option>
                {exerciseOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            {exercise.sets.map((set, setIdx) => (
              <div key={setIdx} className="form-row">
                <div className="form-group">
                  <label>Reps:</label>
                  <input
                    type="number"
                    name="reps"
                    value={set.reps}
                    onChange={e => handleSetChange(exIdx, setIdx, e)}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Weight (lbs):</label>
                  <input
                    type="number"
                    name="weight"
                    value={set.weight}
                    onChange={e => handleSetChange(exIdx, setIdx, e)}
                    min="0"
                    step="5"
                    required
                  />
                </div>
                <button
                  type="button"
                  className="app-button"
                  style={{ marginLeft: '10px' }}
                  onClick={() => deleteSet(exIdx, setIdx)}
                  disabled={exercise.sets.length === 1}
                >
                  Delete Set
                </button>
              </div>
            ))}
            <button type="button" className="app-button" onClick={() => addSet(exIdx)} style={{marginBottom: '10px'}}>Add Set</button>
          </div>
        ))}
        <button type="button" className="app-button" onClick={addExercise} style={{marginBottom: '10px'}}>Add Exercise</button>
        <button type="submit" className="app-button">Add Workout</button>
      </form>

      {/* Aggregated sets and reps table for the current workout being entered */}
      {newWorkout.exercises.length > 0 && (
        <div style={{ margin: '30px 0' }}>
          <h2>Current Workout Details</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Exercise</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Set</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Reps</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Weight (lbs)</th>
              </tr>
            </thead>
            <tbody>
              {newWorkout.exercises.map((exercise, exIdx) =>
                exercise.sets.map((set, setIdx) => (
                  <tr key={`${exIdx}-${setIdx}`}>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {getExerciseLabel(exercise.name)}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {setIdx + 1}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {set.reps}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {set.weight}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="workout-list">
        <h2>Past Workouts</h2>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button className="app-button" onClick={exportToCSV}>Export to CSV</button>
        </div>
        {workouts.length === 0 ? (
          <p className="no-workouts">No workouts logged yet. Add one to get started!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Exercise</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Set</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Reps</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Weight (lbs)</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map(workout =>
                workout.exercises.map((exercise, exIdx) =>
                  exercise.sets.map((set, setIdx) => (
                    <tr key={`${workout.id}-${exIdx}-${setIdx}`}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{workout.date}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{getExerciseLabel(exercise.name)}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{setIdx + 1}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{set.reps}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{set.weight}</td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;