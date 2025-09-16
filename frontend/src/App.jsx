import './App.css'
import TrainControlViewer from './components/Controllers/TrainControlViewer.jsx'
import TrainControlOperator from './components/Controllers/TrainControlOperator.jsx'
import DarkVeil from './components/DarkVeil.jsx'


function App() {
  

  return (
    <>
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <DarkVeil />
</div>
     <TrainControlViewer />
     {/* <p>alag</p> */}
     <TrainControlOperator />
    </>
  )
}

export default App
