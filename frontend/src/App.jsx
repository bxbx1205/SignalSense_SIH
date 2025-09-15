import React from 'react';
import TrainControlViewer from './components/TrainControlViewer';
import TrainControlOperator from './components/TrainControlOperator';

function App() {
  const path = window.location.pathname;

  return (
    <>
      {path.includes('/operator') ? (
        <TrainControlOperator />
      ) : (
        <TrainControlViewer />
      )}
    </>
  );
}

export default App;