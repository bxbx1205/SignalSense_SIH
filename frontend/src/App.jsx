import React, { useState, useEffect } from 'react';
import DarkVeil from './components/DarkVeil';
import Navbar from './components/Navbar/Navbar';
import TrainControlOperator from './components/Controllers/TrainControlOperator';
import TrainControlViewer from './components/Controllers/TrainControlViewer';

const App = () => {
  const [currentMode, setCurrentMode] = useState('Viewer');
  // Shared state between components
  const [railwayData, setRailwayData] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Initialize railway data from the viewer on first load
  useEffect(() => {
    if (!railwayData && window.__initialRailwayData) {
      setRailwayData(window.__initialRailwayData);
    }
  }, [railwayData]);

  // Real-time clock that will be shared between components
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(clockInterval);
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      {/* Full-page DarkVeil background - Fixed position */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={200}
          noiseIntensity={0.03}
          scanlineIntensity={0.08}
          speed={0.4}
          scanlineFrequency={0.3}
          warpAmount={0.2}
          resolutionScale={1}
        />
      </div>
      
      {/* Navbar - Fixed on top with your glass effect */}
      <Navbar currentMode={currentMode} onModeChange={setCurrentMode} />
      
      {/* Main content area with proper spacing for navbar */}
      <div className="relative z-10 pt-[70px]"> {/* Added padding-top to account for navbar height */}
        {currentMode === 'Operator' ? (
          <TrainControlOperator 
            railwayData={railwayData} 
            setRailwayData={setRailwayData}
            selectedStation={selectedStation}
            setSelectedStation={setSelectedStation}
            currentTime={currentTime}
          />
        ) : (
          <TrainControlViewer 
            railwayData={railwayData}
            setRailwayData={setRailwayData} 
            selectedStation={selectedStation}
            setSelectedStation={setSelectedStation}
            currentTime={currentTime}
            initializeData={(data) => window.__initialRailwayData = data}
          />
        )}
      </div>
    </div>
  );
};

export default App;