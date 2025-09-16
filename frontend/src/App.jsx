import React from 'react';
import TrainControlViewer from './components/Controllers/TrainControlViewer';
import TrainControlOperator from './components/Controllers/TrainControlOperator';
import Navbar from './components/Navbar/Navbar';

function App() {
  const path = window.location.pathname;

  return (
    <>
   
    
     
       
    
        <TrainControlViewer />
         <TrainControlOperator />
        
      
    </>
  );
}

export default App;