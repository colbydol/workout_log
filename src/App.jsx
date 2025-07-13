import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { exerciseOptions, getExerciseLabel } from './data/exercises';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState({
    date: '',
    exercise: '',
    sets: '',
    reps: '',
    weight: ''
  });

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        fetchWorkouts(user.uid);
      } else {
        setWorkouts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch workouts for authenticated user
  const fetchWorkouts = async (userId) => {
    try {
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const userWorkouts = [];
      querySnapshot.forEach((doc) => {
        userWorkouts.push({ id: doc.id, ...doc.data() });
      });
      setWorkouts(userWorkouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  // Authentication handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
      } else {
        await createUserWithEmailAndPassword(auth, authData.email, authData.password);
      }
      setAuthData({ email: '', password: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthData({
      ...authData,
      [name]: value
    });
  };

  const addWorkout = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const workoutData = {
        ...newWorkout,
        userId: user.uid,
        timestamp: new Date()
      };
      
      await addDoc(collection(db, 'workouts'), workoutData);
      
      // Refresh workouts list
      await fetchWorkouts(user.uid);
      
      // Reset form
      setNewWorkout({
        date: '',
        exercise: '',
        sets: '',
        reps: '',
        weight: ''
      });
    } catch (error) {
      console.error('Error adding workout:', error);
      alert('Error adding workout. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewWorkout({
      ...newWorkout,
      [name]: value
    });
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="workout-container">
        <h1>Workout Log</h1>
        <p>Loading...</p>
      </div>
    );
  }

  // Show authentication form if not logged in
  if (!user) {
    return (
      <div className="workout-container">
        <h1>Workout Log</h1>
        
        <form onSubmit={handleAuth} className="workout-form">
          <h2>{authMode === 'login' ? 'Login' : 'Create Account'}</h2>
          
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              name="email" 
              value={authData.email} 
              onChange={handleAuthChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              name="password" 
              value={authData.password} 
              onChange={handleAuthChange}
              required
              minLength="6"
            />
          </div>
          
          <button type="submit" className="add-button">
            {authMode === 'login' ? 'Login' : 'Create Account'}
          </button>
          
          <p style={{ marginTop: '15px', textAlign: 'center' }}>
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {authMode === 'login' ? 'Create one' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="workout-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Workout Log</h1>
        <div>
          <span style={{ marginRight: '15px', color: '#666' }}>Welcome, {user.email}</span>
          <button onClick={handleLogout} className="add-button">Logout</button>
        </div>
      </div>
      
      {/* Workout Form */}
      <form onSubmit={addWorkout} className="workout-form">
        <h2>Add New Workout</h2>
        
        <div className="form-group">
          <label>Date:</label>
          <input 
            type="date" 
            name="date" 
            value={newWorkout.date} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Exercise:</label>
          {/* Dropdown instead of text input */}
          <select
            name="exercise"
            value={newWorkout.exercise}
            onChange={handleChange}
            required
            className="exercise-dropdown"
          >
            <option value="">Select an exercise</option>
            {exerciseOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Sets:</label>
            <input 
              type="number" 
              name="sets" 
              value={newWorkout.sets} 
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Reps:</label>
            <input 
              type="number" 
              name="reps" 
              value={newWorkout.reps} 
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Weight (lbs):</label>
            <input 
              type="number" 
              name="weight" 
              value={newWorkout.weight} 
              onChange={handleChange}
              min="0"
              step="5"
              required
            />
          </div>
        </div>
        
        <button type="submit" className="add-button">Add Workout</button>
      </form>
      
      {/* Workout List */}
      <div className="workout-list">
        <h2>Your Workouts</h2>
        
        {workouts.length === 0 ? (
          <p className="no-workouts">No workouts logged yet. Add one to get started!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Exercise</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Weight</th>
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
