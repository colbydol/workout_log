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
    date: '', exercise: '', sets: '', reps: '', weight: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setWorkouts([]);
      }
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

  const addWorkout = async (e) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, 'workouts'), {
      ...newWorkout,
      uid: user.uid,
    });
    setNewWorkout({ date: '', exercise: '', sets: '', reps: '', weight: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewWorkout({ ...newWorkout, [name]: value });
  };

  const exportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(workouts, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "workouts.json";
    link.click();
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
      <button onClick={exportData} style={{marginBottom: '20px', marginLeft: '10px'}}>Export Data</button>
      
      <form onSubmit={addWorkout} className="workout-form">
        <h2>Add New Workout</h2>
        <div className="form-group">
          <label>Date:</label>
          <input type="date" name="date" value={newWorkout.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Exercise:</label>
          <select name="exercise" value={newWorkout.exercise} onChange={handleChange} required className="exercise-dropdown">
            <option value="">Select an exercise</option>
            {exerciseOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Sets:</label>
            <input type="number" name="sets" value={newWorkout.sets} onChange={handleChange} min="1" required />
          </div>
          <div className="form-group">
            <label>Reps:</label>
            <input type="number" name="reps" value={newWorkout.reps} onChange={handleChange} min="1" required />
          </div>
          <div className="form-group">
            <label>Weight (lbs):</label>
            <input type="number" name="weight" value={newWorkout.weight} onChange={handleChange} min="0" step="5" required />
          </div>
        </div>
        <button type="submit" className="add-button">Add Workout</button>
      </form>
      
      <div className="workout-list">
        <h2>Your Workouts</h2>
        {workouts.length === 0 ? (
          <p className="no-workouts">No workouts logged yet. Add one to get started!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map(workout => (
                <tr key={workout.id}>
                  <td>{workout.date}</td>
                  <td>{getExerciseLabel(workout.exercise)}</td>
                  <td>{workout.sets}</td>
                  <td>{workout.reps}</td>
                  <td>{workout.weight} lbs</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;