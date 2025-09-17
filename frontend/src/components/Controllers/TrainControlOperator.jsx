import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrainControlOperator = () => {
    const [selectedStation, setSelectedStation] = useState(null);
    const [railwayData, setRailwayData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('controls');
    const [commandHistory, setCommandHistory] = useState([
        { id: 1, time: '21:34:05', command: 'System initialized', user: 'System', type: 'info' },
        { id: 2, time: '21:34:06', command: 'Awaiting station selection', user: 'System', type: 'info' },
        { id: 3, time: '21:34:07', command: 'Control panel ready for operations', user: 'System', type: 'success' }
    ]);
    const [newCommand, setNewCommand] = useState('');
    const [lastAction, setLastAction] = useState('System Ready');
    const [sessionStartTime] = useState(new Date());
    const [alertCount, setAlertCount] = useState(0);

    // Sync with viewer data - improved synchronization
    useEffect(() => {
        const syncData = () => {
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
        };

        // Initial sync
        syncData();

        // Set up interval for continuous sync
        const interval = setInterval(syncData, 100);
        
        // Create a custom event listener for updates
        const handleDataUpdate = () => syncData();
        window.addEventListener('railwayDataUpdated', handleDataUpdate);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('railwayDataUpdated', handleDataUpdate);
        };
    }, []);

    // Real-time clock
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        
        return () => clearInterval(clockInterval);
    }, []);

    // Session time calculator
    const getSessionTime = () => {
        const diff = Math.floor((currentTime - sessionStartTime) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const addToCommandHistory = (command, type = 'action') => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
        
        setCommandHistory(prev => [
            { 
                id: prev.length ? prev[0].id + 1 : 1, 
                time: timeString, 
                command, 
                user: 'Operator',
                type
            },
            ...prev.slice(0, 49) // Keep last 50 commands
        ]);
        setLastAction(command);
        
        if (type === 'emergency') {
            setAlertCount(prev => prev + 1);
        }
    };

    const handleCommandSubmit = (e) => {
        e.preventDefault();
        if (newCommand.trim()) {
            addToCommandHistory(`Manual Command: ${newCommand}`, 'manual');
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
                    // Create a new points array with the updated point
                    const newPoints = prevData.points.map(p => 
                        p.id === id 
                            ? { ...p, position: newPosition } 
                            : p
                    );
                    
                    // Return new state object
                    const newData = { ...prevData, points: newPoints };
                    
                    // Notify that data has been updated
                    window.dispatchEvent(new Event('railwayDataUpdated'));
                    
                    return newData;
                });
            }
            
            addToCommandHistory(`Point ${id} set to ${newPosition} at ${selectedStation?.name || 'Unknown Station'}`, 'success');
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
                    // Create a new signals array with the updated signal
                    const newSignals = prevData.signals.map(s => 
                        s.id === id 
                            ? { ...s, status: newStatus } 
                            : s
                    );
                    
                    // Return new state object
                    const newData = { ...prevData, signals: newSignals };
                    
                    // Notify that data has been updated
                    window.dispatchEvent(new Event('railwayDataUpdated'));
                    
                    return newData;
                });
            }
            
            addToCommandHistory(`Signal ${id} set to ${newStatus} at ${selectedStation?.name || 'Unknown Station'}`, 'success');
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

    // Emergency handlers
    const handleEmergencyStop = () => {
        addToCommandHistory(`🚨 EMERGENCY: All signals set to RED at ${selectedStation?.name || 'system-wide'}`, 'emergency');
        
        if (window.__setRailwayData && selectedStation) {
            window.__setRailwayData(prevData => {
                const newSignals = prevData.signals.map(s => {
                    if (filteredSignals.some(fs => fs.id === s.id)) {
                        return { ...s, status: 'RED' };
                    }
                    return s;
                });
                
                const newData = { ...prevData, signals: newSignals };
                
                // Notify that data has been updated
                window.dispatchEvent(new Event('railwayDataUpdated'));
                
                return newData;
            });
        }
    };

    const handleLockAllPoints = () => {
        addToCommandHistory(`🔒 EMERGENCY: All points locked at ${selectedStation?.name || 'system-wide'}`, 'emergency');
        
        if (window.__setRailwayData && selectedStation) {
            window.__setRailwayData(prevData => {
                const newPoints = prevData.points.map(p => {
                    if (filteredPoints.some(fp => fp.id === p.id)) {
                        return { ...p, locked: true };
                    }
                    return p;
                });
                
                const newData = { ...prevData, points: newPoints };
                
                // Notify that data has been updated
                window.dispatchEvent(new Event('railwayDataUpdated'));
                
                return newData;
            });
        }
    };

    return (
        <div className="text-white min-h-screen font-sans relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -inset-10 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
                    <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
                </div>
            </div>

            <main className="container mx-auto p-4 relative z-10 pt-20"> {/* Added padding top for navbar */}
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden mb-6"
                    >
                        <div className="bg-gradient-to-r from-red-600/30 via-purple-600/30 to-green-600/30 p-4 border-b border-white/10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#FFA500] flex items-center">
                                        🎮 Railway Operations Control Panel
                                        <span className="ml-3 text-sm bg-red-500/20 px-3 py-1 rounded-full border border-red-400/50">LIVE OPERATIONS</span>
                                        <span className="ml-2 text-sm bg-orange-500/20 px-3 py-1 rounded-full border border-orange-400/50">SIH 2024</span>
                                    </h1>
                                    <p className="text-sm text-gray-300 mt-2 flex items-center">
                                        {selectedStation 
                                            ? `🚄 Operating ${filteredSignals.length} signals and ${filteredPoints.length} points at ${selectedStation.name}`
                                            : '⚠️ Select a station from the viewer to begin operations'
                                        }
                                        {alertCount > 0 && (
                                            <span className="ml-4 bg-red-500/20 px-2 py-1 rounded text-red-300 text-xs">
                                                {alertCount} Emergency Actions
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-mono text-cyan-400">
                                        {currentTime.toLocaleTimeString('en-IN', { 
                                            timeZone: 'Asia/Kolkata',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })} IST
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {currentTime.toLocaleDateString('en-IN', { 
                                            timeZone: 'Asia/Kolkata',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                            {lastAction && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-3 text-sm text-green-400 bg-green-900/20 px-3 py-2 rounded border border-green-500/30"
                                >
                                    Last Action: {lastAction}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Main Control Panel */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-black/20 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 overflow-hidden"
                    >
                        {/* Tab Navigation */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-[#FFA500] flex items-center">
                                    🎮 Railway Control Panel
                                    <span className="ml-3 text-sm bg-green-500/20 px-3 py-1 rounded-full border border-green-400/50">AI Powered</span>
                                </h2>
                                <div className="flex space-x-3 items-center">
                                    <span className="text-sm text-gray-300">System Status:</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-sm font-mono text-green-400 font-bold">OPERATIONAL</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-1">
                                {[
                                    { id: 'controls', icon: '🎛️', label: 'Controls' },
                                    { id: 'metrics', icon: '📊', label: 'Metrics' },
                                    { id: 'logs', icon: '📋', label: 'Logs' },
                                    { id: 'emergency', icon: '🚨', label: 'Emergency' }
                                ].map((tab) => (
                                    <button 
                                        key={tab.id}
                                        className={`px-6 py-3 rounded-t-lg font-medium text-sm transition-all duration-300 border-b-2 ${
                                            activeTab === tab.id 
                                                ? 'bg-white/20 text-white border-blue-400 shadow-lg' 
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-transparent'
                                        }`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-grow overflow-auto">
                            <AnimatePresence mode="wait">
                                {activeTab === 'controls' && (
                                    <motion.div
                                        key="controls"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-6"
                                    >
                                        {!selectedStation ? (
                                            <motion.div 
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: 1 }}
                                                className="text-center py-16"
                                            >
                                                <div className="text-gray-400 text-6xl mb-6">🏗️</div>
                                                <div className="text-gray-300 text-2xl mb-4 font-bold">No Station Selected</div>
                                                <div className="text-gray-500 text-lg mb-8">Please select a station from the Railway Viewer to begin operations</div>
                                                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl p-6 max-w-lg mx-auto backdrop-blur-sm">
                                                    <div className="text-blue-300 text-sm">
                                                        <div className="font-bold mb-3 text-lg">🚀 How to get started:</div>
                                                        <div className="space-y-2 text-left">
                                                            <div>1. 🔍 Switch to Viewer mode using navbar</div>
                                                            <div>2. 📍 Select any station from the route</div>
                                                            <div>3. ⚡ Switch back to Operator mode</div>
                                                            <div>4. 🎮 Begin operating signals and points</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="space-y-8">
                                                {/* Points Control */}
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    <h3 className="font-semibold mb-4 flex items-center text-xl">
                                                        🔧 Points Control - {selectedStation.name}
                                                        <span className="ml-3 text-sm bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/50">
                                                            {filteredPoints.length} Points Available
                                                        </span>
                                                    </h3>
                                                    {filteredPoints.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {filteredPoints.map(point => (
                                                                <motion.div 
                                                                    key={point.id}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    onClick={() => handlePointToggle(point.id)}
                                                                    className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 backdrop-blur-md ${
                                                                        point.locked ? 'bg-gray-800/30 border-gray-600 cursor-not-allowed' :
                                                                        point.status !== 'WORKING' ? 'bg-orange-900/30 border-orange-600 hover:border-orange-500' :
                                                                        'bg-blue-900/30 border-blue-600 hover:bg-blue-800/40 hover:border-blue-500 hover:shadow-xl'
                                                                    }`}
                                                                >
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <span className="font-bold text-xl">{point.id}</span>
                                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                            point.locked ? 'bg-yellow-600 text-yellow-100' : 
                                                                            point.status === 'MAINTENANCE' ? 'bg-orange-600 text-orange-100' : 
                                                                            'bg-green-600 text-green-100'
                                                                        }`}>
                                                                            {point.locked ? 'LOCKED' : point.status}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center mt-3">
                                                                        <div className={`h-3 flex-1 rounded-l-full ${
                                                                            point.position === 'NORMAL' ? 'bg-blue-400' : 'bg-gray-600'
                                                                        }`}></div>
                                                                        <div className="mx-3 text-sm font-bold bg-white/10 px-2 py-1 rounded">
                                                                            {point.position}
                                                                        </div>
                                                                        <div className={`h-3 flex-1 rounded-r-full ${
                                                                            point.position === 'REVERSE' ? 'bg-blue-400' : 'bg-gray-600'
                                                                        }`}></div>
                                                                    </div>
                                                                    {!point.locked && point.status === 'WORKING' && (
                                                                        <div className="text-xs text-center mt-3 text-blue-300 bg-blue-900/20 py-1 rounded">
                                                                            Click to toggle position
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl backdrop-blur-md border border-white/10">
                                                            <div className="text-4xl mb-3">🔧</div>
                                                            No points available for {selectedStation.name}
                                                        </div>
                                                    )}
                                                </motion.div>
                                                
                                                {/* Signal Control */}
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <h3 className="font-semibold mb-4 flex items-center text-xl">
                                                        🚦 Signal Control - {selectedStation.name}
                                                        <span className="ml-3 text-sm bg-red-500/20 px-3 py-1 rounded-full border border-red-400/50">
                                                            {filteredSignals.length} Signals Available
                                                        </span>
                                                    </h3>
                                                    {filteredSignals.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {filteredSignals.map(signal => (
                                                                <motion.div 
                                                                    key={signal.id}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    onClick={() => handleSignalChange(signal.id)}
                                                                    className="p-5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:shadow-xl backdrop-blur-md"
                                                                >
                                                                    <div className="flex justify-between items-center mb-4">
                                                                        <span className="font-bold text-xl">{signal.id}</span>
                                                                        <span className="text-xs opacity-75 bg-white/10 px-2 py-1 rounded-full">{signal.type}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-center space-x-4 mb-4">
                                                                        <div className={`w-8 h-8 rounded-full border-3 transition-all duration-300 ${
                                                                            signal.status === 'RED' ? 'bg-red-600 border-white shadow-lg shadow-red-500/50' : 'bg-red-900 border-gray-600'
                                                                        }`}></div>
                                                                        <div className={`w-8 h-8 rounded-full border-3 transition-all duration-300 ${
                                                                            signal.status === 'YELLOW' ? 'bg-yellow-500 border-white shadow-lg shadow-yellow-500/50' : 'bg-yellow-900 border-gray-600'
                                                                        }`}></div>
                                                                        <div className={`w-8 h-8 rounded-full border-3 transition-all duration-300 ${
                                                                            signal.status === 'GREEN' ? 'bg-green-500 border-white shadow-lg shadow-green-500/50' : 'bg-green-900 border-gray-600'
                                                                        }`}></div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="text-sm font-bold mb-2">
                                                                            Current: <span className={`text-lg ${
                                                                                signal.status === 'RED' ? 'text-red-400' : 
                                                                                signal.status === 'YELLOW' ? 'text-yellow-400' : 'text-green-400'
                                                                            }`}>{signal.status}</span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-400 bg-white/10 py-1 rounded">
                                                                            Click to change
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl backdrop-blur-md border border-white/10">
                                                            <div className="text-4xl mb-3">🚦</div>
                                                            No signals available for {selectedStation.name}
                                                        </div>
                                                    )}
                                                </motion.div>
                                                
                                                {/* Route Setting */}
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <h3 className="font-semibold mb-4 flex items-center text-xl">
                                                        🛤️ Route Setting - {selectedStation.name}
                                                        <span className="ml-3 text-sm bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/50">AI Optimized</span>
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <motion.div 
                                                            whileHover={{ scale: 1.02 }}
                                                            className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
                                                        >
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="font-medium">Route R1: Auto Platform Assignment</span>
                                                                <button 
                                                                    onClick={() => addToCommandHistory(`Auto route set for ${selectedStation.name}`, 'success')}
                                                                    className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm transition-colors font-medium"
                                                                >
                                                                    Auto Set
                                                                </button>
                                                            </div>
                                                            <div className="text-xs text-gray-400">AI will optimize platform allocation</div>
                                                        </motion.div>
                                                        <div className="p-5 rounded-xl bg-yellow-900/20 border border-yellow-700 backdrop-blur-md">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="font-medium">Route R2: Emergency Override</span>
                                                                <button className="px-4 py-2 bg-gray-700 rounded-lg text-sm cursor-not-allowed" disabled>
                                                                    🔒 Locked
                                                                </button>
                                                            </div>
                                                            <div className="text-xs text-yellow-400">Requires supervisor authorization</div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'metrics' && (
                                    <motion.div
                                        key="metrics"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-6"
                                    >
                                        <h3 className="font-semibold mb-6 flex items-center text-xl">
                                            📈 {selectedStation ? `${selectedStation.name} Performance` : 'System Performance'} Metrics
                                            <span className="ml-3 text-sm bg-green-500/20 px-3 py-1 rounded-full border border-green-400/50">Real-time</span>
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                            {[
                                                { title: "Station Trains", value: stationTrainData.length, subtitle: "Currently at station", color: "blue", icon: "🚄" },
                                                { title: "Active Signals", value: filteredSignals.length, subtitle: "Under your control", color: "green", icon: "🚦" },
                                                { title: "Active Points", value: filteredPoints.length, subtitle: "Available for operation", color: "yellow", icon: "🔧" },
                                                { title: "Station Status", value: "OPERATIONAL", subtitle: "All systems normal", color: "purple", icon: "⚡" }
                                            ].map((metric, idx) => (
                                                <motion.div 
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className={`bg-gradient-to-br from-${metric.color}-600/20 to-${metric.color}-800/20 p-6 rounded-xl border border-${metric.color}-500/30 backdrop-blur-md hover:scale-105 transition-transform duration-300`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className={`text-sm text-${metric.color}-300`}>{metric.title}</div>
                                                        <div className="text-2xl">{metric.icon}</div>
                                                    </div>
                                                    <div className={`text-3xl font-bold text-${metric.color}-400 mb-1`}>
                                                        {typeof metric.value === 'number' ? metric.value : metric.value}
                                                    </div>
                                                    <div className={`text-xs text-${metric.color}-300`}>{metric.subtitle}</div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {stationTrainData.length > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="mt-8"
                                            >
                                                <h4 className="font-semibold mb-4 flex items-center text-lg">
                                                    🚄 {selectedStation?.name} Train Status
                                                    <span className="ml-3 text-sm bg-blue-500/20 px-3 py-1 rounded-full">
                                                        {stationTrainData.length} Active
                                                    </span>
                                                </h4>
                                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                                    {stationTrainData.map((train, idx) => (
                                                        <motion.div 
                                                            key={train.id || idx}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="bg-white/5 p-5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
                                                        >
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="font-bold text-xl">{train.id}</span>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                    train.status === 'RUNNING' ? 'bg-green-600 text-green-100' :
                                                                    train.status === 'STOPPED' ? 'bg-red-600 text-red-100' :
                                                                    'bg-yellow-600 text-yellow-100'
                                                                }`}>
                                                                    {train.status || 'UNKNOWN'}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-300 mb-2 font-medium">{train.name}</div>
                                                            <div className="text-xs text-gray-400 bg-white/5 p-2 rounded">
                                                                Speed: <span className="font-mono">{train.speed || 0} km/h</span>
                                                                {train.position?.station && ` | Station: ${train.position.station}`}
                                                                {train.position?.platform && ` | Platform: ${train.position.platform}`}
                                                                {train.position?.section && ` | Section: ${train.position.section}`}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'logs' && (
                                    <motion.div
                                        key="logs"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-6"
                                    >
                                        <div className="mb-6">
                                            <h3 className="font-semibold flex items-center mb-4 text-xl">
                                                📜 Command History & System Logs
                                                <span className="ml-3 text-sm bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/50">Live Log</span>
                                                <span className="ml-2 text-sm bg-gray-500/20 px-3 py-1 rounded-full">{commandHistory.length} entries</span>
                                            </h3>
                                            <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 font-mono text-sm h-[400px] overflow-y-auto border border-white/10 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-800">
                                                {commandHistory.map(cmd => (
                                                    <motion.div 
                                                        key={cmd.id} 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`mb-2 border-b border-white/10 pb-2 hover:bg-white/5 px-3 py-2 rounded transition-colors ${
                                                            cmd.type === 'emergency' ? 'bg-red-900/20 border-red-500/30' :
                                                            cmd.type === 'success' ? 'bg-green-900/20 border-green-500/30' :
                                                            cmd.type === 'manual' ? 'bg-blue-900/20 border-blue-500/30' :
                                                            ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-gray-500">[{cmd.time}]</span>
                                                            <span className={`font-semibold text-xs px-2 py-1 rounded ${
                                                                cmd.user === 'System' ? 'text-yellow-400 bg-yellow-900/20' : 
                                                                'text-blue-400 bg-blue-900/20'
                                                            }`}>
                                                                {cmd.user}
                                                            </span>
                                                            {cmd.type === 'emergency' && <span className="text-red-400 text-xs">🚨</span>}
                                                            {cmd.type === 'success' && <span className="text-green-400 text-xs">✅</span>}
                                                        </div>
                                                        <div className="text-green-400 mt-1 ml-2">{cmd.command}</div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h3 className="font-semibold mb-4 text-lg">💻 Manual Command Input</h3>
                                            <form onSubmit={handleCommandSubmit} className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={newCommand}
                                                    onChange={(e) => setNewCommand(e.target.value)}
                                                    className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 backdrop-blur-md transition-colors"
                                                    placeholder="Type command... (e.g., 'set signal H1 to green', 'lock point P101A')"
                                                />
                                                <button 
                                                    type="submit"
                                                    className="bg-blue-700 hover:bg-blue-600 px-8 py-3 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-blue-500/25"
                                                >
                                                    Execute
                                                </button>
                                            </form>
                                            <div className="text-xs text-gray-400 mt-3 bg-yellow-900/20 p-3 rounded-lg border border-yellow-700/50">
                                                ⚠️ Manual commands are logged and can override automatic systems. Use with caution.
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'emergency' && (
                                    <motion.div
                                        key="emergency"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-6"
                                    >
                                        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8 mb-8 backdrop-blur-md">
                                            <h3 className="font-bold text-red-400 text-2xl mb-6 flex items-center">
                                                🚨 Emergency Control Panel
                                                <span className="ml-3 text-sm bg-red-500/20 px-3 py-1 rounded-full border border-red-400/50">CRITICAL OPERATIONS</span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleEmergencyStop}
                                                    className="bg-red-700 hover:bg-red-600 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 border-2 border-red-500 shadow-lg hover:shadow-red-500/25"
                                                >
                                                    <div className="text-2xl mb-2">🛑</div>
                                                    EMERGENCY STOP ALL SIGNALS
                                                </motion.button>
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleLockAllPoints}
                                                    className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 border-2 border-yellow-500 shadow-lg hover:shadow-yellow-500/25"
                                                >
                                                    <div className="text-2xl mb-2">🔒</div>
                                                    LOCK ALL POINTS
                                                </motion.button>
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => addToCommandHistory(`🚨 EMERGENCY: Station isolation activated for ${selectedStation?.name || 'unknown station'}`, 'emergency')}
                                                    className="bg-orange-700 hover:bg-orange-600 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 border-2 border-orange-500 shadow-lg hover:shadow-orange-500/25"
                                                >
                                                    <div className="text-2xl mb-2">⚠️</div>
                                                    ISOLATE STATION
                                                </motion.button>
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => addToCommandHistory(`📞 EMERGENCY: Supervisor notification sent`, 'emergency')}
                                                    className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 border-2 border-blue-500 shadow-lg hover:shadow-blue-500/25"
                                                >
                                                    <div className="text-2xl mb-2">📞</div>
                                                    CALL SUPERVISOR
                                                </motion.button>
                                            </div>
                                            <div className="mt-6 text-sm text-red-300 bg-red-900/30 p-4 rounded-lg border border-red-600/30">
                                                <strong>⚠️ WARNING:</strong> Emergency controls will immediately affect train operations. 
                                                Use only in critical situations. All emergency actions are logged and monitored.
                                            </div>
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-6 backdrop-blur-md border border-white/10">
                                            <h4 className="font-semibold text-xl mb-4">📋 Emergency Protocols</h4>
                                            <div className="space-y-3">
                                                {[
                                                    { title: "EMERGENCY STOP", desc: "Immediately sets all signals in the selected station to RED.", icon: "🛑" },
                                                    { title: "LOCK ALL POINTS", desc: "Prevents any changes to point positions, securing current routes.", icon: "🔒" },
                                                    { title: "ISOLATE STATION", desc: "Prevents trains from entering or leaving the station perimeter.", icon: "⚠️" },
                                                    { title: "CALL SUPERVISOR", desc: "Sends an alert to the supervising authority for immediate assistance.", icon: "📞" }
                                                ].map((protocol, idx) => (
                                                    <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-xl mr-3">{protocol.icon}</span>
                                                            <strong className="text-white">{protocol.title}:</strong>
                                                        </div>
                                                        <p className="text-gray-400 ml-8">{protocol.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer Status Bar */}
                        <div className="p-4 border-t border-white/10 bg-black/20">
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                        Connected to Railway Data Stream
                                    </div>
                                    <div>Operator ID: CR-OP-2025-NGP</div>
                                    <div className="flex items-center">
                                        <span className="text-cyan-400 font-medium">User:</span>
                                        <span className="ml-1 font-mono">Bharat27-d</span>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div>Last update: <span className="font-mono text-cyan-400">{currentTime?.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) || '21:34:34'}</span></div>
                                    <div>Session time: <span className="font-mono text-green-400">{getSessionTime()}</span></div>
                                    <div className="flex items-center justify-end">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                        Sync Status: Synced with Viewer
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Enhanced Footer */}
            <motion.footer 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 bg-black/20 backdrop-blur-md p-8 border-t border-white/20 relative z-10"
            >
                <div className="max-w-7xl mx-auto text-center">
                    <div className="text-white/80 text-lg font-medium mb-2">
                        🇮🇳 <strong>SignalSense AI Control Center</strong> - Empowering Railway Operators with AI 🇮🇳
                    </div>
                    <div className="text-sm text-white/60">
                        © 2024 Team Excellence • Smart India Hackathon • All Rights Reserved
                    </div>
                    <div className="text-xs text-white/40 mt-2">
                        Developed by Bharat27-d • Real-time Railway Management System
                    </div>
                </div>
            </motion.footer>
        </div>
    );
};

export default TrainControlOperator;