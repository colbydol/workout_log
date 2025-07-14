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

  const addWorkout = async (e) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, 'workouts'), {
      ...newWorkout,
      uid: user.uid,
    });
    setNewWorkout({
      date: '',
      exercises: [
        { name: '', sets: [{ reps: '', weight: '' }] }
      ]
    });
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
          <button type="submit" className="add-button">{isRegistering ? 'Register' : 'Login'}</button>
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} style={{marginTop: '10px', background: 'grey'}}>
            {isRegistering ? 'Have an account? Login' : 'Need an account? Register'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="workout-container">
      <h1>Workout Log</h1>
      <button onClick={handleLogout} style={{marginBottom: '20px'}}>Logout</button>
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
              </div>
            ))}
            <button type="button" onClick={() => addSet(exIdx)} style={{marginBottom: '10px'}}>Add Set</button>
          </div>
        ))}
        <button type="button" onClick={addExercise} style={{marginBottom: '10px'}}>Add Exercise</button>
        <button type="submit" className="add-button">Add Workout</button>
      </form>
      <div className="workout-list">
        <h2>Your Workouts</h2>
        {workouts.length === 0 ? (
          <p className="no-workouts">No workouts logged yet. Add one to get started!</p>
        ) : (
          <div>
            {workouts.map(workout => (
              <div key={workout.id} className="workout-entry">
                <h3>{workout.date}</h3>
                {workout.exercises.map((exercise, exIdx) => (
                  <div key={exIdx}>
                    <strong>{getExerciseLabel(exercise.name)}</strong>
                    <ul>
                      {exercise.sets.map((set, setIdx) => (
                        <li key={setIdx}>
                          Set {setIdx + 1}: {set.reps} reps @ {set.weight} lbs
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;