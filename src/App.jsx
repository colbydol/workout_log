import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [workouts, setWorkouts] = useState([])
  const [newWorkout, setNewWorkout] = useState({
    date: '',
    exercise: '',
    sets: '',
    reps: '',
    weight: ''
  })

  // Example function to add a workout
  const addWorkout = (e) => {
    e.preventDefault()
    setWorkouts([...workouts, { ...newWorkout, id: Date.now() }])
    // Reset form
    setNewWorkout({
      date: '',
      exercise: '',
      sets: '',
      reps: '',
      weight: ''
    })
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setNewWorkout({
      ...newWorkout,
      [name]: value
    })
  }

  return (
    <div className="workout-container">
      <h1>Workout Log</h1>
      
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
          <input 
            type="text" 
            name="exercise" 
            value={newWorkout.exercise} 
            onChange={handleChange}
            placeholder="e.g., Bench Press" 
            required
          />
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
                  <td>{workout.exercise}</td>
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
  )
}

export default App
