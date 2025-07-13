import React, { useState } from 'react';
import { exerciseOptions, getExerciseLabel } from './data/exercises';
import './App.css';

function App() {
  // Hierarchical data structure: { date: { exercises: [{ id, name, sets: [{ id, reps, weight }] }] } }
  const [workouts, setWorkouts] = useState({});
  const [selectedDate, setSelectedDate] = useState('');

  // Add a new exercise to the selected date
  const addExercise = (exerciseName) => {
    if (!selectedDate || !exerciseName) return;
    
    const newExercise = {
      id: Date.now(),
      name: exerciseName,
      sets: []
    };

    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        exercises: [...(prev[selectedDate]?.exercises || []), newExercise]
      }
    }));
  };

  // Remove an exercise
  const removeExercise = (exerciseId) => {
    if (!selectedDate) return;
    
    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        exercises: prev[selectedDate].exercises.filter(ex => ex.id !== exerciseId)
      }
    }));
  };

  // Add a set to an exercise
  const addSet = (exerciseId) => {
    if (!selectedDate) return;
    
    const newSet = {
      id: Date.now(),
      reps: '',
      weight: ''
    };

    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        exercises: prev[selectedDate].exercises.map(ex => 
          ex.id === exerciseId 
            ? { ...ex, sets: [...ex.sets, newSet] }
            : ex
        )
      }
    }));
  };

  // Remove a set from an exercise
  const removeSet = (exerciseId, setId) => {
    if (!selectedDate) return;
    
    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        exercises: prev[selectedDate].exercises.map(ex => 
          ex.id === exerciseId 
            ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
            : ex
        )
      }
    }));
  };

  // Update set data (reps or weight)
  const updateSet = (exerciseId, setId, field, value) => {
    if (!selectedDate) return;
    
    setWorkouts(prev => ({
      ...prev,
      [selectedDate]: {
        exercises: prev[selectedDate].exercises.map(ex => 
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
        )
      }
    }));
  };

  // Calculate totals for the selected workout
  const calculateTotals = () => {
    if (!selectedDate || !workouts[selectedDate]) {
      return { totalSets: 0, totalReps: 0, totalWeight: 0 };
    }

    const exercises = workouts[selectedDate].exercises;
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

  const { totalSets, totalReps, totalWeight } = calculateTotals();

  return (
    <div className="workout-container">
      <h1>Workout Log</h1>
      
      {/* Date Selection */}
      <div className="date-selection">
        <h2>Select Workout Date</h2>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
      </div>

      {selectedDate && (
        <>
          {/* Exercise Management */}
          <div className="exercise-management">
            <h2>Workout for {selectedDate}</h2>
            
            {/* Add Exercise Form */}
            <div className="add-exercise-form">
              <select 
                id="new-exercise"
                className="exercise-dropdown"
                onChange={(e) => {
                  if (e.target.value) {
                    addExercise(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Add an exercise...</option>
                {exerciseOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercise List */}
            <div className="exercises-list">
              {workouts[selectedDate]?.exercises?.map(exercise => (
                <div key={exercise.id} className="exercise-card">
                  <div className="exercise-header">
                    <h3>{getExerciseLabel(exercise.name)}</h3>
                    <button 
                      onClick={() => removeExercise(exercise.id)}
                      className="remove-button"
                    >
                      Remove Exercise
                    </button>
                  </div>

                  {/* Sets for this exercise */}
                  <div className="sets-container">
                    <div className="sets-header">
                      <span>Sets:</span>
                      <button 
                        onClick={() => addSet(exercise.id)}
                        className="add-set-button"
                      >
                        Add Set
                      </button>
                    </div>

                    {exercise.sets.length === 0 ? (
                      <p className="no-sets">No sets added yet. Click "Add Set" to get started!</p>
                    ) : (
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
                                className="reps-input"
                                min="1"
                              />
                              <span>reps @</span>
                              <input
                                type="number"
                                placeholder="Weight"
                                value={set.weight}
                                onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                                className="weight-input"
                                min="0"
                                step="5"
                              />
                              <span>lbs</span>
                              <button 
                                onClick={() => removeSet(exercise.id, set.id)}
                                className="remove-set-button"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {(!workouts[selectedDate]?.exercises || workouts[selectedDate].exercises.length === 0) && (
                <p className="no-exercises">No exercises added yet. Select an exercise from the dropdown above!</p>
              )}
            </div>
          </div>

          {/* Workout Totals */}
          <div className="workout-totals">
            <h2>Workout Totals</h2>
            <div className="totals-grid">
              <div className="total-item">
                <span className="total-label">Total Sets:</span>
                <span className="total-value">{totalSets}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Total Reps:</span>
                <span className="total-value">{totalReps}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Total Weight:</span>
                <span className="total-value">{totalWeight} lbs</span>
              </div>
            </div>
          </div>
        </>
      )}

      {!selectedDate && (
        <p className="select-date-message">Please select a date above to start logging your workout!</p>
      )}
    </div>
  );
}

export default App;
