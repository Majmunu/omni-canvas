import { useAppStore } from './store/appStore'

function App() {
  const counter = useAppStore((state) => state.counter)
  const inc = useAppStore((state) => state.inc)

  return (
    <main>
      <h1>Zero Code Canvas Explore</h1>
      <p>Counter: {counter}</p>
      <button type="button" onClick={inc}>
        +1
      </button>
    </main>
  )
}

export default App
