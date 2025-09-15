import React, { useState, useCallback } from 'react';
import TrainControlOperator from './TrainControlOperator';
import RailwayStationSimulation from './RailwayStationSimulation';

const IntegratedTrainSystem = () => {
    const [alarms, setAlarms] = useState([
        { 
            id: 1, 
            type: "POINT_FAILURE", 
            location: "P103", 
            severity: "HIGH", 
            timestamp: new Date().toISOString(), 
            acknowledged: false, 
            message: "Point P103 failed to move to normal position" 
        }
    ]);
    
    const [signals, setSignals] = useState({
        mainEntry: 'RED',
        platform1: 'RED',
        platform2: 'RED',
        platform3: 'RED',
        platform4: 'RED',
        platform5: 'RED'
    });
    
    const [selectedStation] = useState({ code: 'NGP', name: 'Nagpur Junction' });
    const [simulationTrigger, setSimulationTrigger] = useState(null);

    const handleAlarmGenerate = useCallback((newAlarm) => {
        setAlarms(prev => [
            {
                ...newAlarm,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                acknowledged: false
            },
            ...prev
        ]);
    }, []);

    const handleSignalChange = useCallback((signalData) => {
        setSignals(prev => ({
            ...prev,
            [signalData.signalId]: signalData.newStatus
        }));
    }, []);

    const handleSimulationControl = useCallback((action) => {
        setSimulationTrigger({ action, timestamp: Date.now() });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {/* Main Simulation */}
                <div className="xl:col-span-2">
                    <RailwayStationSimulation
                        stationCode={selectedStation.code}
                        signalStates={signals}
                        onSignalChange={handleSignalChange}
                        onAlarmGenerate={handleAlarmGenerate}
                        externalTrigger={simulationTrigger}
                    />
                </div>
                
                {/* Control Panel */}
                <div>
                    <TrainControlOperator
                        alarms={alarms}
                        onAcknowledgeAlarm={(id) => {
                            setAlarms(prev => prev.map(alarm => 
                                alarm.id === id ? { ...alarm, acknowledged: true } : alarm
                            ));
                        }}
                        signals={Object.entries(signals).map(([id, status]) => ({
                            id,
                            status,
                            type: id.includes('platform') ? 'STARTER' : 'HOME',
                            route: `${id}-ROUTE`
                        }))}
                        onSignalChange={(signalId) => {
                            const currentStatus = signals[signalId];
                            let newStatus;
                            if (currentStatus === "RED") newStatus = "YELLOW";
                            else if (currentStatus === "YELLOW") newStatus = "GREEN";
                            else newStatus = "RED";
                            
                            handleSignalChange({ signalId, newStatus });
                        }}
                        selectedStation={selectedStation}
                        currentTime={new Date()}
                        onSimulationControl={handleSimulationControl}
                    />
                </div>
            </div>
        </div>
    );
};

export default IntegratedTrainSystem;