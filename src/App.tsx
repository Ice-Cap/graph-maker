import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Graph from './components/Graph';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Graph />
    </>
  )
}

export default App
