import React, { useState } from 'react';
import { exerciseOptions, getExerciseLabel } from './data/exercises';
import './App.css';

function App() {
  // Hierarchical data structure: { "2024-01-01": { exercises: [{ name: "bench-press", sets: [{reps: 10, weight: 135}] }] } }
  const [workouts, setWorkouts] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [newExercise, setNewExercise] = useState('');

  // Add a new exercise to the selected date
  const addExercise = () => {
    if (!selectedDate || !newExercise) return;
    
    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        exercises: [
          ...(prev[selectedDate]?.exercises || []),
          {
            id: Date.now(),
            name: newExercise,
            sets: []
          }
        ]
      }
    }));
    setNewExercise('');
  };

  // Remove an exercise
  const removeExercise = (exerciseId) => {
    if (!selectedDate) return;
    
    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        exercises: prev[selectedDate]?.exercises?.filter(ex => ex.id !== exerciseId) || []
      }
    }));
  };

  // Add a new set to an exercise
  const addSet = (exerciseId) => {
    if (!selectedDate) return;
    
    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        exercises: prev[selectedDate]?.exercises?.map(ex => 
          ex.id === exerciseId 
            ? { ...ex, sets: [...ex.sets, { id: Date.now(), reps: '', weight: '' }] }
            : ex
        ) || []
      }
    }));
  };

  // Remove a set from an exercise
  const removeSet = (exerciseId, setId) => {
    if (!selectedDate) return;
    
    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        exercises: prev[selectedDate]?.exercises?.map(ex => 
          ex.id === exerciseId 
            ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
            : ex
        ) || []
      }
    }));
  };

  // Update set data (reps or weight)
  const updateSet = (exerciseId, setId, field, value) => {
    if (!selectedDate) return;
    
    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        exercises: prev[selectedDate]?.exercises?.map(ex => 
          ex.id === exerciseId 
            ? { 
                ...ex, 
                sets: ex.sets.map(set => 
                  set.id === setId 
                    ? { ...set, [field]: value }
                    : set
                )
              }
            : ex
        ) || []
      }
    }));
  };

  // Calculate totals for the selected workout
  const calculateTotals = () => {
    if (!selectedDate || !workouts[selectedDate]) {
      return { totalSets: 0, totalReps: 0, totalWeight: 0 };
    }

    const exercises = workouts[selectedDate].exercises || [];
    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;

    exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.reps && set.weight) {
          totalSets++;
          totalReps += parseInt(set.reps) || 0;
          totalWeight += parseInt(set.weight) || 0;
        }
      });
    });

    return { totalSets, totalReps, totalWeight };
  };

  const totals = calculateTotals();
  const currentWorkout = selectedDate ? workouts[selectedDate] : null;

  return (
    <div className="workout-container">
      <h1>Workout Log</h1>
      
      {/* Date Selection */}
      <div className="date-selection">
        <h2>Select Workout Date</h2>
        <div className="form-group">
          <label>Date:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {selectedDate && (
        <>
          {/* Exercise Management */}
          <div className="workout-form">
            <h2>Workout for {selectedDate}</h2>
            
            {/* Add Exercise */}
            <div className="add-exercise-section">
              <h3>Add Exercise</h3>
              <div className="form-row">
                <div className="form-group">
                  <select
                    value={newExercise}
                    onChange={(e) => setNewExercise(e.target.value)}
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
                <button 
                  type="button" 
                  onClick={addExercise}
                  disabled={!newExercise}
                  className="add-button"
                >
                  Add Exercise
                </button>
              </div>
            </div>

            {/* Current Exercises */}
            {currentWorkout?.exercises?.length > 0 && (
              <div className="exercises-section">
                <h3>Exercises</h3>
                {currentWorkout.exercises.map(exercise => (
                  <div key={exercise.id} className="exercise-block">
                    <div className="exercise-header">
                      <h4>{getExerciseLabel(exercise.name)}</h4>
                      <button 
                        onClick={() => removeExercise(exercise.id)}
                        className="remove-button"
                      >
                        Remove Exercise
                      </button>
                    </div>
                    
                    {/* Sets for this exercise */}
                    <div className="sets-section">
                      <div className="sets-header">
                        <span>Sets:</span>
                        <button 
                          onClick={() => addSet(exercise.id)}
                          className="add-button small"
                        >
                          Add Set
                        </button>
                      </div>
                      
                      {exercise.sets.length > 0 ? (
                        <div className="sets-list">
                          {exercise.sets.map((set, index) => (
                            <div key={set.id} className="set-row">
                              <span className="set-number">Set {index + 1}:</span>
                              <div className="set-inputs">
                                <input
                                  type="number"
                                  placeholder="Reps"
                                  value={set.reps}
                                  onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                                  min="1"
                                />
                                <span>reps @</span>
                                <input
                                  type="number"
                                  placeholder="Weight"
                                  value={set.weight}
                                  onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                                  min="0"
                                  step="5"
                                />
                                <span>lbs</span>
                                <button 
                                  onClick={() => removeSet(exercise.id, set.id)}
                                  className="remove-button small"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-sets">No sets added yet. Click "Add Set" to start.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Workout Totals */}
            {selectedDate && (
              <div className="workout-totals">
                <h3>Workout Totals</h3>
                <div className="totals-grid">
                  <div className="total-item">
                    <span className="total-label">Total Sets:</span>
                    <span className="total-value">{totals.totalSets}</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Total Reps:</span>
                    <span className="total-value">{totals.totalReps}</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Total Weight:</span>
                    <span className="total-value">{totals.totalWeight} lbs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Past Workouts Display */}
      <div className="workout-list">
        <h2>Your Workouts</h2>
        
        {Object.keys(workouts).length === 0 ? (
          <p className="no-workouts">No workouts logged yet. Select a date to get started!</p>
        ) : (
          <div className="workouts-history">
            {Object.entries(workouts)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, workout]) => (
                <div key={date} className="workout-summary">
                  <h3>{date}</h3>
                  {workout.exercises?.length > 0 ? (
                    <div className="workout-exercises">
                      {workout.exercises.map(exercise => (
                        <div key={exercise.id} className="exercise-summary">
                          <strong>{getExerciseLabel(exercise.name)}</strong>
                          {exercise.sets.length > 0 && (
                            <div className="sets-summary">
                              {exercise.sets.map((set, index) => (
                                set.reps && set.weight ? (
                                  <span key={set.id} className="set-summary">
                                    {set.reps} × {set.weight}lbs
                                    {index < exercise.sets.length - 1 ? ', ' : ''}
                                  </span>
                                ) : null
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-exercises">No exercises logged for this date.</p>
                  )}
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
