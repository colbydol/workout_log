import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    onSnapshot, 
    setDoc, 
    deleteDoc,
    query
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBv4FbPvDAdhcvgn4JZyBhhS-yCN4V6e08",
  authDomain: "fitness-tracker-66f4c.firebaseapp.com",
  projectId: "fitness-tracker-66f4c",
  storageBucket: "fitness-tracker-66f4c.appspot.com",
  messagingSenderId: "203529284497",
  appId: "1:203529284497:web:37a1feb2881f57f9c44830",
  measurementId: "G-6TJ5GPKRT4"
};

// --- Default Data ---
const initialExerciseList = [
  "Arnold Press", "Barbell Row", "Barbell Shrug", "Bench Press", "Bicep Curl", 
  "Box Jump", "Bulgarian Split Squat", "Burpees", "Cable Crossover", "Cable Row", 
  "Calf Raise", "Chin Up", "Clean and Jerk", "Crunch", "Cycling",
  "Deadlift", "Decline Bench Press", "Dips", "Dumbbell Curl", "Dumbbell Fly",
  "Dumbbell Press", "Face Pull", "Farmer's Walk", "Front Squat", "Good Morning",
  "Hack Squat", "Hammer Curl", "Hanging Leg Raise", "Hip Thrust", "Incline Bench Press",
  "Kettlebell Swing", "Lat Pulldown", "Leg Curl", "Leg Extension", "Leg Press", 
  "Lunge", "Mountain Climber", "Overhead Press", "Plank", "Preacher Curl",
  "Pull Up", "Push Up", "Romanian Deadlift", "Running", "Russian Twist", 
  "Seated Cable Row", "Shoulder Press", "Side Plank", "Skull Crusher", "Snatch",
  "Squat", "Stair Climbing", "Standing Calf Raise", "Sumo Deadlift", "Swimming", 
  "T-Bar Row", "Tricep Extension", "Tricep Pushdown", "Upright Row"
].sort();

// --- Helper Functions ---
const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const authInstance = getAuth(app);
            setAuth(authInstance);
            setDb(getFirestore(app));

            const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
                setUser(currentUser);
                setIsAuthReady(true);
            });
            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase initialization failed:", e);
            setError("Could not connect to the service. Please check your Firebase configuration.");
            setIsAuthReady(true);
        }
    }, []);

    const handleSignOut = () => {
        if(auth) {
            signOut(auth).catch(error => console.error("Sign out error", error));
        }
    };

    if (!isAuthReady) {
        return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>;
    }
    
    if (error) {
         return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4 text-center"><div className="text-xl text-red-500">{error}</div></div>;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            {user ? (
                <div className="container mx-auto p-2 sm:p-4 md:p-8">
                    <WorkoutTracker user={user} db={db} handleSignOut={handleSignOut} />
                </div>
            ) : (
                <AuthScreen auth={auth} />
            )}
        </div>
    );
}

// --- Authentication Screen Component ---
function AuthScreen({ auth }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            if (err.code === 'auth/operation-not-allowed') {
                setError("Sign-in method not enabled. Please go to your Firebase Console -> Authentication -> Sign-in method and enable the Email/Password provider.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 shadow-2xl rounded-xl p-8 mb-4">
                    <h1 className="text-3xl font-bold text-center text-cyan-400 mb-6">
                        {isLogin ? 'Welcome Back!' : 'Create Account'}
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">Email</label>
                            <input
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-white"
                                id="email" type="email" placeholder="you@example.com" value={email}
                                onChange={(e) => setEmail(e.target.value)} required disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">Password</label>
                            <input
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-white"
                                id="password" type="password" placeholder="******************" value={password}
                                onChange={(e) => setPassword(e.target.value)} required disabled={loading}
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm p-2 bg-red-900/20 rounded-md">{error}</p>}
                        <div>
                            <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500" type="submit" disabled={loading}>
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="inline-block align-baseline font-bold text-sm text-cyan-400 hover:text-cyan-300" disabled={loading}>
                        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- Workout Tracker Component ---
function WorkoutTracker({ user, db, handleSignOut }) {
    const [activeTab, setActiveTab] = useState('logger');
    const [workouts, setWorkouts] = useState({});
    const [exercises, setExercises] = useState([]);
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [dbError, setDbError] = useState(null);

    const workoutsColPath = `users/${user.uid}/workouts`;
    const exercisesDocPath = `users/${user.uid}/lists/exercises`;

    useEffect(() => {
        if (!user || !db) return;
        setDbError(null);
        const q = query(collection(db, workoutsColPath));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newWorkouts = {};
            querySnapshot.forEach((doc) => {
                newWorkouts[doc.id] = doc.data().entries;
            });
            setWorkouts(newWorkouts);
        }, (error) => {
            console.error("Error fetching workouts:", error);
            if (error.code === 'permission-denied') {
                setDbError("Permission Denied: Your database security rules are blocking access.");
            }
        });
        return () => unsubscribe();
    }, [db, user, workoutsColPath]);

    useEffect(() => {
        if (!user || !db) return;
        const docRef = doc(db, exercisesDocPath);
        const unsubscribe = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                setExercises(docSnap.data().list);
            } else {
                try {
                    await setDoc(docRef, { list: initialExerciseList });
                    setExercises(initialExerciseList);
                } catch (e) {
                     if (e.code === 'permission-denied') {
                        setDbError("Permission Denied: Your database security rules are blocking access.");
                    }
                    console.error("Error setting initial exercises:", e);
                }
            }
        }, (error) => {
            console.error("Error fetching exercises:", error);
            if (error.code === 'permission-denied') {
                setDbError("Permission Denied: Your database security rules are blocking access.");
            }
        });
        return () => unsubscribe();
    }, [db, user, exercisesDocPath]);

    const addExerciseToList = async (newExercise) => {
        if (newExercise && !exercises.includes(newExercise)) {
            const newExerciseList = [...exercises, newExercise].sort();
            await setDoc(doc(db, exercisesDocPath), { list: newExerciseList });
        }
    };

    const addWorkout = async (exercise, sets) => {
        const dateDocRef = doc(db, workoutsColPath, selectedDate);
        const currentWorkouts = workouts[selectedDate] || [];
        const existingExerciseIndex = currentWorkouts.findIndex(w => w.exercise === exercise);
        let newWorkoutsForDate = [...currentWorkouts];

        if (existingExerciseIndex > -1) {
            newWorkoutsForDate[existingExerciseIndex].sets.push(...sets);
        } else {
            newWorkoutsForDate.push({ exercise, sets });
        }
        await setDoc(dateDocRef, { entries: newWorkoutsForDate });
    };

    const deleteWorkout = async (date, exerciseIndex) => {
        const dateDocRef = doc(db, workoutsColPath, date);
        const currentWorkouts = workouts[date] || [];
        const newWorkoutsForDate = [...currentWorkouts];
        newWorkoutsForDate.splice(exerciseIndex, 1);

        if (newWorkoutsForDate.length === 0) {
            await deleteDoc(dateDocRef);
        } else {
            await setDoc(dateDocRef, { entries: newWorkoutsForDate });
        }
    };

    const deleteSet = async (date, exerciseIndex, setIndex) => {
        const dateDocRef = doc(db, workoutsColPath, date);
        const currentWorkouts = workouts[date] || [];
        const newWorkoutsForDate = JSON.parse(JSON.stringify(currentWorkouts));
        
        newWorkoutsForDate[exerciseIndex].sets.splice(setIndex, 1);
        if (newWorkoutsForDate[exerciseIndex].sets.length === 0) {
            newWorkoutsForDate.splice(exerciseIndex, 1);
        }

        if (newWorkoutsForDate.length === 0) {
            await deleteDoc(dateDocRef);
        } else {
            await setDoc(dateDocRef, { entries: newWorkoutsForDate });
        }
    };

    return (
        <>
            <header className="text-center mb-6 md:mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400">Workout Tracker</h1>
                    <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Sign Out
                    </button>
                </div>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">Log your progress and stay consistent.</p>
                <div className="mt-4 text-xs text-gray-500 bg-gray-800 inline-block px-3 py-1 rounded-full">
                    User: {user.email}
                </div>
            </header>
            
            {dbError && (
                <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
                    <h2 className="font-bold text-lg mb-2">Database Error</h2>
                    <p>{dbError}</p>
                    <p className="mt-4 text-sm">To fix this, go to your Firebase project, navigate to **Firestore Database &gt; Rules**, and replace the existing rules with the following:</p>
                    <pre className="bg-gray-900 p-2 rounded-md mt-2 text-xs overflow-x-auto">
                        <code>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{documents=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
                        </code>
                    </pre>
                </div>
            )}

            <div className={`max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden ${dbError ? 'opacity-25 pointer-events-none' : ''}`}>
                <div className="flex border-b border-gray-700">
                    <TabButton title="Logger" isActive={activeTab === 'logger'} onClick={() => setActiveTab('logger')} />
                    <TabButton title="History" isActive={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
                </div>

                <div className="p-2 sm:p-4 md:p-8">
                    {activeTab === 'logger' && 
                        <WorkoutLogger 
                            addWorkout={addWorkout} 
                            selectedDate={selectedDate} 
                            setSelectedDate={setSelectedDate} 
                            workoutsOnDate={workouts[selectedDate] || []}
                            exercises={exercises}
                            addExerciseToList={addExerciseToList}
                            allWorkouts={workouts}
                        />}
                    {activeTab === 'calendar' && <WorkoutCalendar workouts={workouts} deleteWorkout={deleteWorkout} deleteSet={deleteSet} />}
                </div>
            </div>
            <footer className="text-center mt-8 text-gray-500 text-sm">
                <p>Built with React, Firebase & Tailwind CSS</p>
            </footer>
        </>
    );
}

// --- UI Components ---

const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <div className="text-gray-300 mb-6">{children}</div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ title, isActive, onClick }) => (
  <button onClick={onClick} className={`flex-1 py-3 sm:py-4 px-2 text-sm md:text-base font-semibold transition-colors duration-300 focus:outline-none ${isActive ? 'bg-cyan-500 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
    {title}
  </button>
);

const WorkoutLogger = ({ addWorkout, selectedDate, setSelectedDate, workoutsOnDate, exercises, addExerciseToList, allWorkouts }) => {
  const [exercise, setExercise] = useState(exercises[0] || '');
  const [sets, setSets] = useState([]);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [comment, setComment] = useState('');
  const [isAddingNewExercise, setIsAddingNewExercise] = useState(false);
  const [newExercise, setNewExercise] = useState("");
  const [exerciseHistory, setExerciseHistory] = useState([]);

  useEffect(() => {
    if (exercises.length > 0 && !exercises.includes(exercise)) {
        setExercise(exercises[0]);
    }
  }, [exercises, exercise]);

  useEffect(() => {
    if (!exercise || !allWorkouts) {
      setExerciseHistory([]);
      return;
    }

    const allDates = Object.keys(allWorkouts).sort().reverse();
    const foundHistory = [];

    for (const date of allDates) {
      const dayWorkouts = allWorkouts[date];
      const workoutForExercise = dayWorkouts.find(w => w.exercise === exercise);

      if (workoutForExercise) {
        foundHistory.push({ date, sets: workoutForExercise.sets });
      }

      if (foundHistory.length >= 3) {
        break;
      }
    }
    setExerciseHistory(foundHistory);
  }, [exercise, allWorkouts]);

  const handleAddSet = (e) => {
    e.preventDefault();
    if (reps > 0) {
      setSets([...sets, { reps: Number(reps), weight: Number(weight) || 0, comment }]);
      setReps(''); setWeight(''); setComment('');
    }
  };
  
  const removeSet = (index) => setSets(sets.filter((_, i) => i !== index));

  const handleSaveWorkout = () => {
    if (sets.length > 0) { addWorkout(exercise, sets); setSets([]); }
  };

  const handleSaveNewExercise = () => {
    const trimmedName = newExercise.trim();
    if (trimmedName) {
      addExerciseToList(trimmedName);
      setExercise(trimmedName);
      setNewExercise("");
      setIsAddingNewExercise(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="date-selector" className="block text-lg font-medium text-cyan-400 mb-2">Date</label>
        <input id="date-selector" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">Log New Workout</h3>
        {isAddingNewExercise && (
          <div className="bg-gray-600 p-3 rounded-lg mb-4">
            <h4 className="text-lg font-semibold mb-2">Add New Exercise</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="text" placeholder="Enter exercise name" value={newExercise} onChange={(e) => setNewExercise(e.target.value)} className="w-full p-3 bg-gray-500 border border-gray-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
              <button onClick={handleSaveNewExercise} className="p-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors">Save</button>
              <button onClick={() => { setIsAddingNewExercise(false); setNewExercise(""); }} className="p-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        )}
        <form onSubmit={handleAddSet} className="space-y-4">
          <div>
            <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-300 mb-1">Exercise</label>
            <div className="flex gap-2">
                <select id="exercise-select" value={exercise} onChange={(e) => setExercise(e.target.value)} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" disabled={isAddingNewExercise || exercises.length === 0}>
                    {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
                <button type="button" onClick={() => setIsAddingNewExercise(true)} className="p-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors whitespace-nowrap" disabled={isAddingNewExercise}>+ New</button>
            </div>
          </div>

          <ExerciseHistory history={exerciseHistory} exercise={exercise} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reps-input" className="block text-sm font-medium text-gray-300 mb-1">Reps</label>
              <input id="reps-input" type="number" placeholder="8" value={reps} onChange={(e) => setReps(e.target.value)} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
            </div>
            <div>
              <label htmlFor="weight-input" className="block text-sm font-medium text-gray-300 mb-1">Weight</label>
              <input id="weight-input" type="number" placeholder="100" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
            </div>
          </div>
           <div>
              <label htmlFor="comment-input" className="block text-sm font-medium text-gray-300 mb-1">Comment</label>
              <input id="comment-input" type="text" placeholder="e.g., Good form" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
            </div>
          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors">Add Set</button>
        </form>
      </div>
      {sets.length > 0 && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{exercise} - Current Sets</h3>
          <SetTable sets={sets} onRemove={removeSet} />
          <button onClick={handleSaveWorkout} className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Save Workout</button>
        </div>
      )}
      {workoutsOnDate.length > 0 && (
        <div className="bg-gray-700 p-4 rounded-lg mt-6">
            <h3 className="text-xl font-semibold mb-4">Workouts on {selectedDate}</h3>
            {workoutsOnDate.map((workout, index) => (
                <div key={index} className="mb-4">
                    <h4 className="text-lg font-bold text-cyan-400">{workout.exercise}</h4>
                    <SetTable sets={workout.sets} isHistory={true} />
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

const ExerciseHistory = ({ history, exercise }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-4 border border-gray-600">
      <h4 className="text-lg font-semibold text-cyan-400 mb-3">Recent History for {exercise}</h4>
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {history.map(entry => (
          <div key={entry.date}>
            <p className="font-bold text-gray-300 mb-1">{entry.date}</p>
            <SetTable sets={entry.sets} isHistory={true} />
          </div>
        ))}
      </div>
    </div>
  );
};


const SetTable = ({ sets, onRemove, isHistory = false }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
            <thead>
                <tr className="border-b border-gray-600">
                    <th className="p-2">Set</th><th className="p-2">Reps</th><th className="p-2">Weight</th><th className="p-2">Comment</th>
                    {!isHistory && onRemove && <th className="p-2"></th>}
                </tr>
            </thead>
            <tbody>
                {sets.map((set, index) => (
                    <tr key={index} className="border-b border-gray-800">
                        <td className="p-2">{index + 1}</td><td className="p-2">{set.reps}</td><td className="p-2">{set.weight}</td>
                        <td className="p-2 whitespace-pre-wrap break-words max-w-xs">{set.comment}</td>
                        {!isHistory && onRemove && (<td className="p-2 text-right"><button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600">&times;</button></td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const WorkoutCalendar = ({ workouts, deleteWorkout, deleteSet }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
  
  const selectedDayWorkouts = selectedDay ? workouts[selectedDay] : null;

  const openConfirmationModal = (title, message, onConfirm) => setModalState({ isOpen: true, title, message, onConfirm });
  const closeConfirmationModal = () => setModalState({ isOpen: false, onConfirm: null, title: '', message: '' });
  const handleConfirm = () => {
    if (modalState.onConfirm) modalState.onConfirm();
    closeConfirmationModal();
  };

  const handleDayClick = (day) => {
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setSelectedDay(dateStr);
  };
  
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Date,Exercise,Set,Reps,Weight,Comment\n";
    const sortedDates = Object.keys(workouts).sort((a,b) => new Date(a) - new Date(b));
    sortedDates.forEach(date => {
        (workouts[date] || []).forEach(workout => {
            (workout.sets || []).forEach((set, index) => {
                const comment = set.comment ? `"${set.comment.replace(/"/g, '""')}"` : '';
                csvContent += `${date},"${workout.exercise}",${index + 1},${set.reps},${set.weight},${comment}\n`;
            });
        });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "workout_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCalendar = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`blank-${i}`}></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
        calendarDays.push(
            <div key={d} onClick={() => handleDayClick(d)} className={`p-1 text-xs sm:p-2 sm:text-sm text-center border border-gray-700 rounded-md cursor-pointer transition-colors duration-200 ${workouts[dateStr] ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-gray-700 hover:bg-gray-600'} ${selectedDay === dateStr ? 'ring-2 ring-cyan-400' : ''}`}>
                {d}
            </div>
        );
    }
    return calendarDays;
  };

  return (
    <div>
        <Modal isOpen={modalState.isOpen} onClose={closeConfirmationModal} onConfirm={handleConfirm} title={modalState.title}>{modalState.message}</Modal>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-400 text-center sm:text-left">Workout History</h2>
            <button onClick={exportToCSV} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Export to CSV</button>
        </div>
      <div className="bg-gray-700 p-2 sm:p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500">&lt;</button>
          <h3 className="text-lg sm:text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 rounded-full bg-gray-600 hover:bg-gray-500">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-xs sm:text-sm">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="font-bold text-center text-gray-400">{day}</div>)}
          {renderCalendar()}
        </div>
      </div>
      {selectedDay && (
        <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Details for {selectedDay}</h3>
            {selectedDayWorkouts ? (
                selectedDayWorkouts.map((workout, exIndex) => (
                    <div key={exIndex} className="mb-4 p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-lg font-bold text-cyan-400">{workout.exercise}</h4>
                             <button onClick={() => openConfirmationModal('Delete Workout?', `Delete the entire ${workout.exercise} workout for this day?`, () => deleteWorkout(selectedDay, exIndex))} className="text-red-400 hover:text-red-600 font-bold text-xl">&times;</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-600"><th className="p-2">Set</th><th className="p-2">Reps</th><th className="p-2">Weight</th><th className="p-2">Comment</th><th className="p-2"></th></tr>
                                </thead>
                                <tbody>
                                    {(workout.sets || []).map((set, setIndex) => (
                                        <tr key={setIndex} className="border-b border-gray-900">
                                            <td className="p-2">{setIndex + 1}</td><td className="p-2">{set.reps}</td><td className="p-2">{set.weight}</td>
                                            <td className="p-2 whitespace-pre-wrap break-words max-w-xs">{set.comment}</td>
                                            <td className="p-2 text-right">
                                                <button onClick={() => openConfirmationModal('Delete Set?', 'Are you sure you want to delete this set?', () => deleteSet(selectedDay, exIndex, setIndex))} className="text-red-400 hover:text-red-600">&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            ) : <p className="text-gray-400">No workouts logged for this day.</p>}
        </div>
      )}
    </div>
  );
};
