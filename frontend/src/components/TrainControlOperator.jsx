import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrainControlOperator = ({ 
    alarms = [], 
    onAcknowledgeAlarm, 
    points = [], 
    signals = [],
    onPointChange,
    onSignalChange,
    currentTime
}) => {
    const [activeTab, setActiveTab] = useState('alarms');
    const [filteredAlarms, setFilteredAlarms] = useState([]);
    const [systemStatus, setSystemStatus] = useState('NORMAL');
    const [expandedAlarm, setExpandedAlarm] = useState(null);
    const [commandHistory, setCommandHistory] = useState([
        { id: 1, time: '18:02:05', command: 'Signal H1 set to YELLOW', user: 'Operator' },
        { id: 2, time: '18:05:15', command: 'Point P102B set to NORMAL', user: 'Operator' },
        { id: 3, time: '18:08:30', command: 'Route R2 locked for train 22691', user: 'System' }
    ]);
    const [newCommand, setNewCommand] = useState('');

    useEffect(() => {
        // Update filtered alarms based on latest alarm data
        setFilteredAlarms(Array.isArray(alarms) ? alarms : []);
        // Update system status based on alarm severity
        const hasCritical = Array.isArray(alarms) && alarms.some(alarm => alarm.severity === 'CRITICAL' && !alarm.acknowledged);
        const hasHigh = Array.isArray(alarms) && alarms.some(alarm => alarm.severity === 'HIGH' && !alarm.acknowledged);
        if (hasCritical) {
            setSystemStatus('CRITICAL');
        } else if (hasHigh) {
            setSystemStatus('WARNING');
        } else {
            setSystemStatus('NORMAL');
        }
    }, [alarms]);

    const handleAcknowledge = (id) => {
        onAcknowledgeAlarm(id);
        addToCommandHistory(`Alarm ${id} acknowledged`);
    };

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
            ...prev.slice(0, 19) // Keep last 20 commands
        ]);
    };

    const handleCommandSubmit = (e) => {
        e.preventDefault();
        if (newCommand.trim()) {
            addToCommandHistory(newCommand);
            setNewCommand('');
        }
    };

    const handlePointToggle = (id) => {
        if (!Array.isArray(points)) return;
        const point = points.find(p => p.id === id);
        if (point && !point.locked && point.status === 'WORKING') {
            const newPosition = point.position === 'NORMAL' ? 'REVERSE' : 'NORMAL';
            onPointChange(id);
            addToCommandHistory(`Point ${id} set to ${newPosition}`);
        }
    };

    const handleSignalChange = (id) => {
        if (!Array.isArray(signals)) return;
        const signal = signals.find(s => s.id === id);
        if (signal) {
            let newStatus;
            if (signal.status === "RED") newStatus = "YELLOW";
            else if (signal.status === "YELLOW") newStatus = "GREEN";
            else newStatus = "RED";
            onSignalChange(id);
            addToCommandHistory(`Signal ${id} set to ${newStatus}`);
        }
    };

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-800 text-white';
            case 'HIGH': return 'bg-orange-600 text-white';
            case 'MEDIUM': return 'bg-yellow-600 text-black';
            case 'LOW': return 'bg-blue-600 text-white';
            default: return 'bg-green-600 text-white';
        }
    };

    return (
        <div className="bg-[#0A1A30] rounded-lg shadow-lg border border-[#073f7c] h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-[#FFA500]">Control Panel</h2>
                    <div className="flex space-x-2 items-center">
                        <span className="text-sm">System:</span>
                        <div className={`w-3 h-3 rounded-full ${
                            systemStatus === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 
                            systemStatus === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-mono">
                            {systemStatus === 'CRITICAL' ? 'CRITICAL' : 
                             systemStatus === 'WARNING' ? 'WARNING' : 'NORMAL'}
                        </span>
                    </div>
                </div>

                <div className="flex space-x-1 mt-4">
                    <button 
                        className={`px-4 py-2 rounded-t-md font-medium text-sm ${activeTab === 'alarms' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                        onClick={() => setActiveTab('alarms')}
                    >
                        Alarms
                        {alarms.filter(a => !a.acknowledged).length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-red-600 text-white rounded-full text-xs">
                                {alarms.filter(a => !a.acknowledged).length}
                            </span>
                        )}
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-t-md font-medium text-sm ${activeTab === 'controls' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                        onClick={() => setActiveTab('controls')}
                    >
                        Controls
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-t-md font-medium text-sm ${activeTab === 'logs' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        Logs
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'alarms' && (
                        <motion.div
                            key="alarms"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4"
                        >
                            <div className="mb-4 flex justify-between items-center">
                                <h3 className="font-semibold">Active Alarms</h3>
                                <div className="flex space-x-2">
                                    <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded">
                                        All
                                    </button>
                                    <button className="px-2 py-1 text-xs bg-red-900 hover:bg-red-800 rounded">
                                        Critical
                                    </button>
                                    <button className="px-2 py-1 text-xs bg-orange-800 hover:bg-orange-700 rounded">
                                        High
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {filteredAlarms.length > 0 ? (
                                    filteredAlarms.map((alarm) => (
                                        <div 
                                            key={alarm.id}
                                            className={`p-3 rounded-md ${
                                                alarm.acknowledged ? 'bg-gray-800' : getSeverityStyle(alarm.severity)
                                            } border ${alarm.acknowledged ? 'border-gray-700' : 'border-yellow-600'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium flex items-center">
                                                        {!alarm.acknowledged && (
                                                            <span className="mr-2 inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                                                        )}
                                                        {alarm.type.replace('_', ' ')}
                                                    </div>
                                                    <div className="text-sm opacity-80">{alarm.location}</div>
                                                </div>
                                                <div className="text-xs">
                                                    {new Date(alarm.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                            
                                            {expandedAlarm === alarm.id && (
                                                <div className="mt-2 text-sm border-t border-gray-600 pt-2">
                                                    <p>{alarm.message || 'No additional details available.'}</p>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between mt-2">
                                                <button 
                                                    className="text-xs underline"
                                                    onClick={() => setExpandedAlarm(
                                                        expandedAlarm === alarm.id ? null : alarm.id
                                                    )}
                                                >
                                                    {expandedAlarm === alarm.id ? 'Hide details' : 'Show details'}
                                                </button>
                                                
                                                {!alarm.acknowledged && (
                                                    <button 
                                                        onClick={() => handleAcknowledge(alarm.id)}
                                                        className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs"
                                                    >
                                                        Acknowledge
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No active alarms
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'controls' && (
                        <motion.div
                            key="controls"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4"
                        >
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Points Control</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Array.isArray(points) ? points : []).map(point => (
                                        <div 
                                            key={point.id}
                                            onClick={() => handlePointToggle(point.id)}
                                            className={`p-3 rounded-md border cursor-pointer ${
                                                point.locked ? 'bg-gray-800 border-gray-700' :
                                                point.status !== 'WORKING' ? 'bg-orange-900 border-orange-700' :
                                                'bg-blue-900 border-blue-700 hover:bg-blue-800'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{point.id}</span>
                                                <div className={`px-2 py-1 rounded text-xs ${
                                                    point.locked ? 'bg-yellow-600' : 
                                                    point.status === 'MAINTENANCE' ? 'bg-orange-600' : 
                                                    'bg-green-600'
                                                }`}>
                                                    {point.locked ? 'LOCKED' : point.status}
                                                </div>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <div className={`h-1 flex-1 ${
                                                    point.position === 'NORMAL' ? 'bg-blue-400' : 'bg-gray-600'
                                                }`}></div>
                                                <div className="mx-1 text-xs">
                                                    {point.position}
                                                </div>
                                                <div className={`h-1 flex-1 ${
                                                    point.position === 'REVERSE' ? 'bg-blue-400' : 'bg-gray-600'
                                                }`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Signal Control</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Array.isArray(signals) ? signals : []).map(signal => (
                                        <div 
                                            key={signal.id}
                                            onClick={() => handleSignalChange(signal.id)}
                                            className="p-3 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{signal.id}</span>
                                                <span className="text-xs opacity-75">{signal.type}</span>
                                            </div>
                                            <div className="flex items-center justify-center mt-2 space-x-2">
                                                <div className={`w-4 h-4 rounded-full ${
                                                    signal.status === 'RED' ? 'bg-red-600 ring-2 ring-white' : 'bg-red-900'
                                                }`}></div>
                                                <div className={`w-4 h-4 rounded-full ${
                                                    signal.status === 'YELLOW' ? 'bg-yellow-500 ring-2 ring-white' : 'bg-yellow-900'
                                                }`}></div>
                                                <div className={`w-4 h-4 rounded-full ${
                                                    signal.status === 'GREEN' ? 'bg-green-500 ring-2 ring-white' : 'bg-green-900'
                                                }`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">Route Setting</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="p-3 rounded-md bg-gray-800 border border-gray-700">
                                        <div className="flex justify-between">
                                            <span>Route R1: AJNI → NGP-P1</span>
                                            <button className="px-2 py-0.5 bg-green-700 hover:bg-green-600 rounded text-xs">
                                                Set Route
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-md bg-yellow-900 border border-yellow-700">
                                        <div className="flex justify-between">
                                            <span>Route R2: AJNI → NGP-P2</span>
                                            <button className="px-2 py-0.5 bg-gray-700 rounded text-xs" disabled>
                                                Locked
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-md bg-gray-800 border border-gray-700">
                                        <div className="flex justify-between">
                                            <span>Route R3: NGP-P1 → GONDIA</span>
                                            <button className="px-2 py-0.5 bg-green-700 hover:bg-green-600 rounded text-xs">
                                                Set Route
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                <h3 className="font-semibold">Command History</h3>
                                <div className="mt-2 bg-black bg-opacity-30 rounded-md p-2 font-mono text-sm h-[300px] overflow-y-auto">
                                    {commandHistory.map(cmd => (
                                        <div key={cmd.id} className="mb-1 border-b border-gray-800 pb-1">
                                            <span className="text-gray-500">[{cmd.time}]</span> 
                                            <span className="text-blue-400"> {cmd.user}:</span> 
                                            <span className="text-green-400"> {cmd.command}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">Command Input</h3>
                                <form onSubmit={handleCommandSubmit} className="flex">
                                    <input
                                        type="text"
                                        value={newCommand}
                                        onChange={(e) => setNewCommand(e.target.value)}
                                        className="flex-grow bg-gray-800 border border-gray-700 rounded-l px-3 py-2 text-sm"
                                        placeholder="Type command..."
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-r text-sm"
                                    >
                                        Execute
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 border-t border-gray-700">
                <div className="flex justify-between items-center text-xs text-gray-400">
                    <div>
                        <div>Connected: Nagpur Control Center</div>
                        <div>Operator ID: CR-OP-2025-NGP</div>
                    </div>
                    <div className="text-right">
                        <div>Last update: {currentTime?.toLocaleTimeString() || '18:13:12'}</div>
                        <div>Session time: 01:24:35</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainControlOperator;