import { useState } from 'react'
// Remove this line:
// import viteLogo from '/vite.svg'
// If you have reactLogo import, you can keep it or remove it too
// import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, useState] = useState(0)

  return (
    <>
      <div>
        {/* Remove or comment out the logo references */}
        {/* <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a> */}
        {/* Keep any other content */}
      </div>
      {/* Rest of your component */}
    </>
  )
}

export default App
