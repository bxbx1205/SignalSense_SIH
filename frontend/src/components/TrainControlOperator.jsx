import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrainControlOperator = () => {
    const [selectedStation, setSelectedStation] = useState(null);
    const [railwayData, setRailwayData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('controls');
    const [commandHistory, setCommandHistory] = useState([
        { id: 1, time: '18:02:05', command: 'System initialized', user: 'System' },
        { id: 2, time: '18:02:06', command: 'Awaiting station selection', user: 'System' },
        { id: 3, time: '18:02:07', command: 'Control panel ready for operations', user: 'System' }
    ]);
    const [newCommand, setNewCommand] = useState('');
    const [lastAction, setLastAction] = useState('System Ready');

    // Sync with viewer data
    useEffect(() => {
        const interval = setInterval(() => {
            // Get data from viewer if available
            if (window.__railwayData) {
                setRailwayData(window.__railwayData);
            }
            if (window.__selectedStation) {
                setSelectedStation(window.__selectedStation);
            }
            if (window.__currentTime) {
                setCurrentTime(window.__currentTime);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Real-time clock fallback
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(prevTime => new Date(prevTime.getTime() + 1000));
        }, 1000);
        
        return () => clearInterval(clockInterval);
    }, []);

    const addToCommandHistory = (command) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setCommandHistory(prev => [
            { 
                id: prev.length ? prev[0].id + 1 : 1, 
                time: timeString, 
                command, 
                user: 'Operator' 
            },
            ...prev.slice(0, 19)
        ]);
        setLastAction(command);
    };

    const handleCommandSubmit = (e) => {
        e.preventDefault();
        if (newCommand.trim()) {
            addToCommandHistory(`Manual Command: ${newCommand}`);
            setNewCommand('');
        }
    };

    const handlePointToggle = (id) => {
        if (!railwayData || !selectedStation) return;
        
        const point = filteredPoints.find(p => p.id === id);
        if (point && !point.locked && point.status === 'WORKING') {
            const newPosition = point.position === 'NORMAL' ? 'REVERSE' : 'NORMAL';
            
            // Update data through viewer if available
            if (window.__setRailwayData) {
                window.__setRailwayData(prevData => {
                    const newPoints = prevData.points.map(p => 
                        p.id === id 
                            ? { ...p, position: newPosition } 
                            : p
                    );
                    return { ...prevData, points: newPoints };
                });
            }
            
            addToCommandHistory(`Point ${id} set to ${newPosition} at ${selectedStation?.name || 'Unknown Station'}`);
        }
    };

    const handleSignalChange = (id) => {
        if (!railwayData || !selectedStation) return;
        
        const signal = filteredSignals.find(s => s.id === id);
        if (signal) {
            let newStatus;
            if (signal.status === "RED") newStatus = "YELLOW";
            else if (signal.status === "YELLOW") newStatus = "GREEN";
            else newStatus = "RED";
            
            // Update data through viewer if available
            if (window.__setRailwayData) {
                window.__setRailwayData(prevData => {
                    const newSignals = prevData.signals.map(s => {
                        if (s.id === id) {
                            return { ...s, status: newStatus };
                        }
                        return s;
                    });
                    return { ...prevData, signals: newSignals };
                });
            }
            
            addToCommandHistory(`Signal ${id} set to ${newStatus} at ${selectedStation?.name || 'Unknown Station'}`);
        }
    };

    // Filter points and signals based on selected station
    const getFilteredPointsAndSignals = () => {
        if (!selectedStation || !railwayData) {
            return { filteredPoints: [], filteredSignals: [] };
        }

        const stationCode = selectedStation.code;
        
        let filteredSignals = [];
        let filteredPoints = [];

        if (stationCode === 'NGP') {
            // Show NGP signals (both with and without prefix)
            filteredSignals = railwayData.signals.filter(signal => 
                signal.stationCode === 'NGP' || 
                (!signal.id.includes('_') && !signal.stationCode) // Legacy NGP signals
            );
            filteredPoints = railwayData.points.filter(point => 
                point.stationCode === 'NGP' || 
                (!point.id.includes('101') && !point.stationCode) // Legacy NGP points
            );
        } else {
            // For other stations, filter by exact station code
            filteredSignals = railwayData.signals.filter(signal => 
                signal.stationCode === stationCode || 
                signal.id.startsWith(stationCode + '_')
            );
            filteredPoints = railwayData.points.filter(point => 
                point.stationCode === stationCode || 
                point.id.startsWith(stationCode)
            );
        }

        return { filteredPoints, filteredSignals };
    };

    const { filteredPoints, filteredSignals } = getFilteredPointsAndSignals();

    // Get station-specific train data
    const getStationTrainData = () => {
        if (!railwayData || !selectedStation) return [];
        
        return railwayData.active_trains.filter(train => 
            selectedStation && (
                train.position.station === selectedStation.code ||
                (train.position.section && train.position.section.includes(selectedStation.code))
            )
        );
    };

    const stationTrainData = getStationTrainData();

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            

            <main className="container mx-auto p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-[#0A1A30] rounded-lg border border-[#073f7c] overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600/20 via-purple-600/20 to-green-600/20 p-4 border-b border-white/10">
                            <h2 className="text-xl font-bold text-[#FFA500] flex items-center">
                                🎮 Railway Operations Control Panel
                                <span className="ml-2 text-sm bg-red-500/20 px-2 py-1 rounded-full">LIVE OPERATIONS</span>
                                <span className="ml-2 text-sm bg-orange-500/20 px-2 py-1 rounded-full">SIH 2024</span>
                            </h2>
                            <p className="text-sm text-gray-300 mt-1">
                                {selectedStation 
                                    ? `Operating ${filteredSignals.length} signals and ${filteredPoints.length} points at ${selectedStation.name}`
                                    : 'Select a station from the viewer to begin operations'
                                }
                            </p>
                            {lastAction && (
                                <div className="mt-2 text-xs text-green-400">
                                    Last Action: {lastAction}
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="bg-[#0A1A30] rounded-lg shadow-lg border border-[#073f7c] h-full flex flex-col">
                                <div className="p-4 border-b border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-[#FFA500] flex items-center">
                                            🎮 Railway Control Panel
                                            <span className="ml-2 text-sm bg-green-500/20 px-2 py-1 rounded-full">AI Powered</span>
                                        </h2>
                                        <div className="flex space-x-2 items-center">
                                            <span className="text-sm">System:</span>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-sm font-mono text-green-400">OPERATIONAL</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-1 mt-4">
                                        <button 
                                            className={`px-4 py-2 rounded-t-md font-medium text-sm ${activeTab === 'controls' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                                            onClick={() => setActiveTab('controls')}
                                        >
                                            🎛️ Controls
                                        </button>
                                        <button 
                                            className={`px-4 py-2 rounded-t-md font-medium text-sm ${activeTab === 'metrics' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                                            onClick={() => setActiveTab('metrics')}
                                        >
                                            📊 Metrics
                                        </button>
                                        <button 
                                            className={`px-4 py-2 rounded-t-md font-medium text-sm ${activeTab === 'logs' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                                            onClick={() => setActiveTab('logs')}
                                        >
                                            📋 Logs
                                        </button>
                                        <button 
                                            className={`px-4 py-2 rounded-t-md font-medium text-sm ${activeTab === 'emergency' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                                            onClick={() => setActiveTab('emergency')}
                                        >
                                            🚨 Emergency
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-grow overflow-auto">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'controls' && (
                                            <motion.div
                                                key="controls"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-4"
                                            >
                                                {!selectedStation ? (
                                                    <div className="text-center py-12">
                                                        <div className="text-gray-400 text-2xl mb-4">🏗️ No Station Selected</div>
                                                        <div className="text-gray-500 text-lg mb-4">Please select a station from the Railway Viewer to begin operations</div>
                                                        <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4 max-w-md mx-auto">
                                                            <div className="text-blue-300 text-sm">
                                                                <div className="font-bold mb-2">How to get started:</div>
                                                                <div>1. Open Railway Viewer in another tab</div>
                                                                <div>2. Select any station from the route</div>
                                                                <div>3. Return to this control panel</div>
                                                                <div>4. Begin operating signals and points</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="mb-6">
                                                            <h3 className="font-semibold mb-3 flex items-center">
                                                                🔧 Points Control - {selectedStation.name}
                                                                <span className="ml-2 text-xs bg-blue-500/20 px-2 py-1 rounded-full">
                                                                    {filteredPoints.length} Points Available
                                                                </span>
                                                            </h3>
                                                            {filteredPoints.length > 0 ? (
                                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {filteredPoints.map(point => (
                                                                        <div 
                                                                            key={point.id}
                                                                            onClick={() => handlePointToggle(point.id)}
                                                                            className={`p-4 rounded-lg border cursor-pointer transition-all transform hover:scale-105 ${
                                                                                point.locked ? 'bg-gray-800 border-gray-700 cursor-not-allowed' :
                                                                                point.status !== 'WORKING' ? 'bg-orange-900 border-orange-700' :
                                                                                'bg-blue-900 border-blue-700 hover:bg-blue-800 hover:shadow-lg'
                                                                            }`}
                                                                        >
                                                                            <div className="flex justify-between items-center mb-2">
                                                                                <span className="font-bold text-lg">{point.id}</span>
                                                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                                    point.locked ? 'bg-yellow-600' : 
                                                                                    point.status === 'MAINTENANCE' ? 'bg-orange-600' : 
                                                                                    'bg-green-600'
                                                                                }`}>
                                                                                    {point.locked ? 'LOCKED' : point.status}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center mt-2">
                                                                                <div className={`h-2 flex-1 rounded-l ${
                                                                                    point.position === 'NORMAL' ? 'bg-blue-400' : 'bg-gray-600'
                                                                                }`}></div>
                                                                                <div className="mx-2 text-sm font-bold">
                                                                                    {point.position}
                                                                                </div>
                                                                                <div className={`h-2 flex-1 rounded-r ${
                                                                                    point.position === 'REVERSE' ? 'bg-blue-400' : 'bg-gray-600'
                                                                                }`}></div>
                                                                            </div>
                                                                            {!point.locked && point.status === 'WORKING' && (
                                                                                <div className="text-xs text-center mt-2 text-blue-300">
                                                                                    Click to toggle position
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-6 text-gray-500 bg-gray-800 rounded-lg">
                                                                    No points available for {selectedStation.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="mb-6">
                                                            <h3 className="font-semibold mb-3 flex items-center">
                                                                🚦 Signal Control - {selectedStation.name}
                                                                <span className="ml-2 text-xs bg-red-500/20 px-2 py-1 rounded-full">
                                                                    {filteredSignals.length} Signals Available
                                                                </span>
                                                            </h3>
                                                            {filteredSignals.length > 0 ? (
                                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {filteredSignals.map(signal => (
                                                                        <div 
                                                                            key={signal.id}
                                                                            onClick={() => handleSignalChange(signal.id)}
                                                                            className="p-4 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg"
                                                                        >
                                                                            <div className="flex justify-between items-center mb-3">
                                                                                <span className="font-bold text-lg">{signal.id}</span>
                                                                                <span className="text-xs opacity-75 bg-gray-700 px-2 py-1 rounded">{signal.type}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-center space-x-3">
                                                                                <div className={`w-6 h-6 rounded-full border-2 ${
                                                                                    signal.status === 'RED' ? 'bg-red-600 border-white shadow-lg' : 'bg-red-900 border-gray-600'
                                                                                }`}></div>
                                                                                <div className={`w-6 h-6 rounded-full border-2 ${
                                                                                    signal.status === 'YELLOW' ? 'bg-yellow-500 border-white shadow-lg' : 'bg-yellow-900 border-gray-600'
                                                                                }`}></div>
                                                                                <div className={`w-6 h-6 rounded-full border-2 ${
                                                                                    signal.status === 'GREEN' ? 'bg-green-500 border-white shadow-lg' : 'bg-green-900 border-gray-600'
                                                                                }`}></div>
                                                                            </div>
                                                                            <div className="text-center mt-2 text-sm font-bold">
                                                                                Current: <span className={`
                                                                                    ${signal.status === 'RED' ? 'text-red-400' : 
                                                                                      signal.status === 'YELLOW' ? 'text-yellow-400' : 'text-green-400'}
                                                                                `}>{signal.status}</span>
                                                                            </div>
                                                                            <div className="text-xs text-center mt-1 text-gray-400">
                                                                                Click to change
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-6 text-gray-500 bg-gray-800 rounded-lg">
                                                                    No signals available for {selectedStation.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div>
                                                            <h3 className="font-semibold mb-3 flex items-center">
                                                                🛤️ Route Setting - {selectedStation.name}
                                                                <span className="ml-2 text-xs bg-purple-500/20 px-2 py-1 rounded-full">AI Optimized</span>
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-750 transition-colors">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-medium">Route R1: Auto Platform Assignment</span>
                                                                        <button 
                                                                            onClick={() => addToCommandHistory(`Auto route set for ${selectedStation.name}`)}
                                                                            className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm transition-colors"
                                                                        >
                                                                            Auto Set
                                                                        </button>
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 mt-1">AI will optimize platform allocation</div>
                                                                </div>
                                                                <div className="p-4 rounded-lg bg-yellow-900 border border-yellow-700">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-medium">Route R2: Emergency Override</span>
                                                                        <button className="px-3 py-1 bg-gray-700 rounded text-sm cursor-not-allowed" disabled>
                                                                            Locked
                                                                        </button>
                                                                    </div>
                                                                    <div className="text-xs text-yellow-400 mt-1">Requires supervisor authorization</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'metrics' && (
                                            <motion.div
                                                key="metrics"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-4"
                                            >
                                                <h3 className="font-semibold mb-4 flex items-center">
                                                    📈 {selectedStation ? `${selectedStation.name} Performance` : 'System Performance'} Metrics
                                                    <span className="ml-2 text-xs bg-green-500/20 px-2 py-1 rounded-full">Real-time</span>
                                                </h3>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-4 rounded-lg border border-blue-500/30">
                                                        <div className="text-sm text-blue-300 mb-1">Station Trains</div>
                                                        <div className="text-3xl font-bold text-blue-400">{stationTrainData.length}</div>
                                                        <div className="text-xs text-blue-300">Currently at station</div>
                                                    </div>
                                                    
                                                    <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-4 rounded-lg border border-green-500/30">
                                                        <div className="text-sm text-green-300 mb-1">Active Signals</div>
                                                        <div className="text-3xl font-bold text-green-400">{filteredSignals.length}</div>
                                                        <div className="text-xs text-green-300">Under your control</div>
                                                    </div>
                                                    
                                                    <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 p-4 rounded-lg border border-yellow-500/30">
                                                        <div className="text-sm text-yellow-300 mb-1">Active Points</div>
                                                        <div className="text-3xl font-bold text-yellow-400">{filteredPoints.length}</div>
                                                        <div className="text-xs text-yellow-300">Available for operation</div>
                                                    </div>
                                                    
                                                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-4 rounded-lg border border-purple-500/30">
                                                        <div className="text-sm text-purple-300 mb-1">Station Status</div>
                                                        <div className="text-2xl font-bold text-purple-400">OPERATIONAL</div>
                                                        <div className="text-xs text-purple-300">All systems normal</div>
                                                    </div>
                                                </div>

                                                {stationTrainData.length > 0 && (
                                                    <div className="mt-6">
                                                        <h4 className="font-semibold mb-3 flex items-center">
                                                            🚄 {selectedStation?.name} Train Status
                                                        </h4>
                                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                                            {stationTrainData.map((train, idx) => (
                                                                <div key={train.id || idx} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="font-bold text-lg">{train.id}</span>
                                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                            train.status === 'RUNNING' ? 'bg-green-600' :
                                                                            train.status === 'STOPPED' ? 'bg-red-600' :
                                                                            'bg-yellow-600'
                                                                        }`}>
                                                                            {train.status || 'UNKNOWN'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-300 mb-1">{train.name}</div>
                                                                    <div className="text-xs text-gray-400">
                                                                        Speed: {train.speed || 0} km/h | 
                                                                        {train.position?.station && ` Station: ${train.position.station}`}
                                                                        {train.position?.platform && ` | Platform: ${train.position.platform}`}
                                                                        {train.position?.section && ` Section: ${train.position.section}`}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'logs' && (
                                            <motion.div
                                                key="logs"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-4"
                                            >
                                                <div className="mb-4">
                                                    <h3 className="font-semibold flex items-center mb-3">
                                                        📜 Command History & System Logs
                                                        <span className="ml-2 text-xs bg-blue-500/20 px-2 py-1 rounded-full">Live Log</span>
                                                    </h3>
                                                    <div className="bg-black bg-opacity-50 rounded-lg p-4 font-mono text-sm h-[400px] overflow-y-auto border border-gray-700">
                                                        {commandHistory.map(cmd => (
                                                            <div key={cmd.id} className="mb-2 border-b border-gray-800 pb-2 hover:bg-gray-800/30 px-2 py-1 rounded">
                                                                <span className="text-gray-500">[{cmd.time}]</span> 
                                                                <span className={`font-semibold ${cmd.user === 'System' ? 'text-yellow-400' : 'text-blue-400'}`}> {cmd.user}:</span> 
                                                                <span className="text-green-400"> {cmd.command}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <h3 className="font-semibold mb-3">💻 Manual Command Input</h3>
                                                    <form onSubmit={handleCommandSubmit} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={newCommand}
                                                            onChange={(e) => setNewCommand(e.target.value)}
                                                            className="flex-grow bg-gray-800 border border-gray-700 rounded px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                                                            placeholder="Type command... (e.g., 'set signal H1 to green', 'lock point P101A')"
                                                        />
                                                        <button 
                                                            type="submit"
                                                            className="bg-blue-700 hover:bg-blue-600 px-6 py-3 rounded text-sm font-medium transition-colors"
                                                        >
                                                            Execute
                                                        </button>
                                                    </form>
                                                    <div className="text-xs text-gray-400 mt-2">
                                                        Manual commands are logged and can override automatic systems. Use with caution.
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'emergency' && (
                                            <motion.div
                                                key="emergency"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-4"
                                            >
                                                <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-6">
                                                    <h3 className="font-bold text-red-400 text-xl mb-4 flex items-center">
                                                        🚨 Emergency Control Panel
                                                        <span className="ml-2 text-xs bg-red-500/20 px-2 py-1 rounded-full">CRITICAL OPERATIONS</span>
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <button 
                                                            onClick={() => addToCommandHistory(`EMERGENCY: All signals set to RED at ${selectedStation?.name || 'system-wide'}`)}
                                                            className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors border-2 border-red-500"
                                                        >
                                                            🛑 EMERGENCY STOP ALL SIGNALS
                                                        </button>
                                                        <button 
                                                            onClick={() => addToCommandHistory(`EMERGENCY: All points locked at ${selectedStation?.name || 'system-wide'}`)}
                                                            className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-lg transition-colors border-2 border-yellow-500"
                                                        >
                                                            🔒 LOCK ALL POINTS
                                                        </button>
                                                        <button 
                                                            onClick={() => addToCommandHistory(`EMERGENCY: Station isolation activated for ${selectedStation?.name || 'unknown station'}`)}
                                                            className="bg-orange-700 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-colors border-2 border-orange-500"
                                                        >
                                                            ⚠️ ISOLATE STATION
                                                        </button>
                                                        <button 
                                                            onClick={() => addToCommandHistory(`EMERGENCY: Supervisor notification sent`)}
                                                            className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors border-2 border-blue-500"
                                                        >
                                                            📞 CALL SUPERVISOR
                                                        </button>
                                                    </div>
                                                    <div className="mt-4 text-sm text-red-300">
                                                        <strong>WARNING:</strong> Emergency controls will immediately affect train operations. 
                                                        Use only in critical situations. All emergency actions are logged and monitored.
                                                    </div>
                                                </div>

                                                                                               <div className="bg-gray-800 rounded-lg p-4">
                                                    <h4 className="font-semibold text-lg mb-3">Emergency Protocols</h4>
                                                    <ul className="list-disc list-inside text-gray-400 space-y-2">
                                                        <li><strong>EMERGENCY STOP:</strong> Immediately sets all signals in the selected station to RED.</li>
                                                        <li><strong>LOCK ALL POINTS:</strong> Prevents any changes to point positions, securing current routes.</li>
                                                        <li><strong>ISOLATE STATION:</strong> Prevents trains from entering or leaving the station perimeter.</li>
                                                        <li><strong>CALL SUPERVISOR:</strong> Sends an alert to the supervising authority for immediate assistance.</li>
                                                    </ul>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="p-4 border-t border-gray-700">
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <div>
                                            <div className="flex items-center">
                                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                                                Connected to Railway Data Stream
                                            </div>
                                            <div>Operator ID: CR-OP-2025-NGP</div>
                                            <div>User: Bharat27-d</div>
                                        </div>
                                        <div className="text-right">
                                            <div>Last update: {currentTime?.toLocaleTimeString() || '18:40:09'}</div>
                                            <div>Session time: 01:24:35</div>
                                            <div>Sync Status: Synced with Viewer</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="mt-12 bg-gradient-to-r from-slate-800 to-red-800 p-6 border-t border-white/20">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="text-white/80">
                        🇮🇳 <strong>SignalSense AI Control Center</strong> - Empowering Railway Operators with AI 🇮🇳
                    </div>
                    <div className="text-xs text-white/60 mt-2">
                        © 2024 Team Excellence • Smart India Hackathon • All Rights Reserved
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TrainControlOperator;