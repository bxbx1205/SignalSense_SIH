import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrainControlOperator = ({ 
    alarms = [], 
    onAcknowledgeAlarm, 
    points = [], 
    signals = [],
    onPointChange,
    onSignalChange,
    currentTime,
    selectedStation,
    trainData = [],
    onSimulationControl,
    systemStatus = 'NORMAL'
}) => {
    const [activeTab, setActiveTab] = useState('alarms');
    const [filteredAlarms, setFilteredAlarms] = useState([]);
    const [alarmFilter, setAlarmFilter] = useState('all');
    const [expandedAlarm, setExpandedAlarm] = useState(null);
    const [commandHistory, setCommandHistory] = useState([
        { id: 1, time: '16:02:05', command: 'System initialized - NGP Control', user: 'System', type: 'SYSTEM' },
        { id: 2, time: '16:05:15', command: 'Signal H1 set to YELLOW', user: 'Operator', type: 'SIGNAL' },
        { id: 3, time: '16:08:30', command: 'Point P102B set to NORMAL', user: 'Operator', type: 'POINT' }
    ]);
    const [newCommand, setNewCommand] = useState('');
    const [operatorId] = useState(`CR-OP-${new Date().getFullYear()}-${selectedStation?.code || 'NGP'}`);
    const [sessionTime, setSessionTime] = useState(0);

    // Session timer
    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Filter alarms based on severity and acknowledgment
    useEffect(() => {
        let filtered = Array.isArray(alarms) ? [...alarms] : [];
        
        if (alarmFilter === 'critical') {
            filtered = filtered.filter(alarm => alarm.severity === 'CRITICAL');
        } else if (alarmFilter === 'high') {
            filtered = filtered.filter(alarm => alarm.severity === 'HIGH');
        } else if (alarmFilter === 'unacknowledged') {
            filtered = filtered.filter(alarm => !alarm.acknowledged);
        }
        
        // Sort by severity and timestamp
        filtered.sort((a, b) => {
            const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
            if (severityDiff !== 0) return severityDiff;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setFilteredAlarms(filtered);
    }, [alarms, alarmFilter]);

    const addToCommandHistory = useCallback((command, type = 'MANUAL') => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        setCommandHistory(prev => [
            { 
                id: (prev[0]?.id || 0) + 1, 
                time: timeString, 
                command, 
                user: type === 'SYSTEM' ? 'System' : 'Operator',
                type,
                station: selectedStation?.code || 'NGP'
            },
            ...prev.slice(0, 49) // Keep last 50 commands
        ]);
    }, [selectedStation]);

    const handleAcknowledge = useCallback((id) => {
        const alarm = alarms.find(a => a.id === id);
        if (alarm) {
            onAcknowledgeAlarm?.(id);
            addToCommandHistory(`Alarm ${id} acknowledged: ${alarm.type}`, 'ALARM');
        }
    }, [alarms, onAcknowledgeAlarm, addToCommandHistory]);

    const handlePointToggle = useCallback((id) => {
        const point = points.find(p => p.id === id);
        if (point && !point.locked && point.status === 'WORKING') {
            const newPosition = point.position === 'NORMAL' ? 'REVERSE' : 'NORMAL';
            onPointChange?.(id);
            addToCommandHistory(`Point ${id} set to ${newPosition}`, 'POINT');
        }
    }, [points, onPointChange, addToCommandHistory]);

    const handleSignalChange = useCallback((id) => {
        const signal = signals.find(s => s.id === id);
        if (signal) {
            let newStatus;
            if (signal.status === "RED") newStatus = "YELLOW";
            else if (signal.status === "YELLOW") newStatus = "GREEN";
            else newStatus = "RED";
            
            onSignalChange?.(id);
            addToCommandHistory(`Signal ${id} set to ${newStatus}`, 'SIGNAL');
        }
    }, [signals, onSignalChange, addToCommandHistory]);

    const handleCommandSubmit = (e) => {
        e.preventDefault();
        if (newCommand.trim()) {
            addToCommandHistory(newCommand, 'MANUAL');
            setNewCommand('');
        }
    };

    const handleRouteSet = (routeId, description) => {
        addToCommandHistory(`Route ${routeId} set: ${description}`, 'ROUTE');
    };

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'CRITICAL': 
                return 'bg-red-900/80 border-red-500 text-red-100';
            case 'HIGH': 
                return 'bg-orange-900/80 border-orange-500 text-orange-100';
            case 'MEDIUM': 
                return 'bg-yellow-900/80 border-yellow-500 text-yellow-100';
            case 'LOW': 
                return 'bg-blue-900/80 border-blue-500 text-blue-100';
            default: 
                return 'bg-gray-900/80 border-gray-500 text-gray-100';
        }
    };

    const getSystemStatusStyle = () => {
        switch (systemStatus) {
            case 'CRITICAL': 
                return 'bg-red-500 animate-pulse';
            case 'WARNING': 
                return 'bg-yellow-500';
            case 'MAINTENANCE': 
                return 'bg-orange-500';
            default: 
                return 'bg-green-500';
        }
    };

    const formatSessionTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getActiveTrainsCount = () => {
        return trainData?.filter(train => 
            train.position?.station === selectedStation?.code ||
            train.position?.section?.includes(selectedStation?.code)
        ).length || 0;
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-600 h-full flex flex-col">
            {/* Enhanced Header */}
            <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h2 className="text-xl font-bold text-yellow-400">Control Center</h2>
                        <p className="text-sm text-slate-300">{selectedStation?.name || 'Central Control'}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <div className="text-xs text-slate-400">System Status</div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getSystemStatusStyle()}`}></div>
                                <span className="text-sm font-bold text-white">{systemStatus}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Tab Navigation */}
                <div className="flex space-x-1">
                    {[
                        { id: 'alarms', label: 'Alarms', count: alarms.filter(a => !a.acknowledged).length },
                        { id: 'controls', label: 'Controls', count: null },
                        { id: 'logs', label: 'Logs', count: commandHistory.length },
                        { id: 'analytics', label: 'Analytics', count: null }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-slate-700 text-white border-b-2 border-yellow-400' 
                                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                            {tab.count !== null && tab.count > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-600 text-white rounded-full text-xs">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-grow overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'alarms' && (
                        <motion.div
                            key="alarms"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-4 h-full overflow-auto"
                        >
                            {/* Alarm Filters */}
                            <div className="mb-4 flex justify-between items-center">
                                <h3 className="font-semibold text-white">Active Alarms</h3>
                                <div className="flex space-x-2">
                                    {[
                                        { id: 'all', label: 'All' },
                                        { id: 'unacknowledged', label: 'Active' },
                                        { id: 'critical', label: 'Critical' },
                                        { id: 'high', label: 'High' }
                                    ].map(filter => (
                                        <button 
                                            key={filter.id}
                                            onClick={() => setAlarmFilter(filter.id)}
                                            className={`px-3 py-1 text-xs rounded transition-all ${
                                                alarmFilter === filter.id
                                                    ? 'bg-yellow-600 text-white'
                                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Alarms List */}
                            <div className="space-y-3">
                                {filteredAlarms.length > 0 ? (
                                    filteredAlarms.map((alarm) => (
                                        <motion.div 
                                            key={alarm.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 rounded-lg border-l-4 ${getSeverityStyle(alarm.severity)} ${
                                                alarm.acknowledged ? 'opacity-60' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-1">
                                                        {!alarm.acknowledged && (
                                                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></div>
                                                        )}
                                                        <span className="font-bold text-sm">
                                                            [{alarm.type.replace('_', ' ')}]
                                                        </span>
                                                        <span className="ml-2 text-xs bg-slate-700 px-2 py-1 rounded">
                                                            {alarm.location}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm mb-1">{alarm.message}</div>
                                                    <div className="text-xs opacity-75">
                                                        {new Date(alarm.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col space-y-1">
                                                    <button 
                                                        className="text-xs underline hover:no-underline"
                                                        onClick={() => setExpandedAlarm(
                                                            expandedAlarm === alarm.id ? null : alarm.id
                                                        )}
                                                    >
                                                        {expandedAlarm === alarm.id ? 'Hide' : 'Details'}
                                                    </button>
                                                    {!alarm.acknowledged && (
                                                        <button 
                                                            onClick={() => handleAcknowledge(alarm.id)}
                                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                                                        >
                                                            ACK
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {expandedAlarm === alarm.id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-3 pt-3 border-t border-slate-600 text-sm"
                                                >
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div><strong>Severity:</strong> {alarm.severity}</div>
                                                        <div><strong>Type:</strong> {alarm.type}</div>
                                                        <div><strong>Location:</strong> {alarm.location}</div>
                                                        <div><strong>Status:</strong> {alarm.acknowledged ? 'Acknowledged' : 'Active'}</div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-green-400 text-4xl mb-2">✓</div>
                                        <div className="text-slate-400">No alarms matching filter</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'controls' && (
                        <motion.div
                            key="controls"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-4 h-full overflow-auto"
                        >
                            {/* Points Control */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3 text-white">Points Control</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {points.filter(point => 
                                        !selectedStation || 
                                        point.id.startsWith(selectedStation.code) || 
                                        point.id.startsWith('P10')
                                    ).map(point => (
                                        <motion.div 
                                            key={point.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handlePointToggle(point.id)}
                                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                                point.locked 
                                                    ? 'bg-gray-800/50 border-gray-600 cursor-not-allowed' :
                                                point.status !== 'WORKING' 
                                                    ? 'bg-orange-900/50 border-orange-600' :
                                                    'bg-blue-900/50 border-blue-600 hover:bg-blue-800/50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-white">{point.id}</span>
                                                <div className={`px-2 py-1 rounded text-xs font-bold ${
                                                    point.locked ? 'bg-yellow-600 text-white' : 
                                                    point.status === 'MAINTENANCE' ? 'bg-orange-600 text-white' : 
                                                    'bg-green-600 text-white'
                                                }`}>
                                                    {point.locked ? 'LOCKED' : point.status}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className={`h-2 w-16 rounded ${
                                                    point.position === 'NORMAL' ? 'bg-blue-400' : 'bg-gray-600'
                                                }`}></div>
                                                <div className="mx-2 text-xs font-bold text-white">
                                                    {point.position}
                                                </div>
                                                <div className={`h-2 w-16 rounded ${
                                                    point.position === 'REVERSE' ? 'bg-blue-400' : 'bg-gray-600'
                                                }`}></div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Signal Control */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3 text-white">Signal Control</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {signals.filter(signal => 
                                        !selectedStation || 
                                        signal.id.startsWith(selectedStation.code) || 
                                        ['H1', 'H2', 'S1', 'S2', 'S3', 'S4', 'S8'].includes(signal.id)
                                    ).map(signal => (
                                        <motion.div 
                                            key={signal.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSignalChange(signal.id)}
                                            className="p-3 rounded-lg border-2 border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-all"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div>
                                                    <span className="font-medium text-white">{signal.id}</span>
                                                    <div className="text-xs text-slate-400">{signal.type}</div>
                                                </div>
                                                <div className="text-xs text-slate-400">{signal.route}</div>
                                            </div>
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full border-2 border-white ${
                                                    signal.status === 'RED' ? 'bg-red-600 shadow-lg shadow-red-600/50' : 'bg-red-900'
                                                }`}></div>
                                                <div className={`w-4 h-4 rounded-full border-2 border-white ${
                                                    signal.status === 'YELLOW' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-yellow-900'
                                                }`}></div>
                                                <div className={`w-4 h-4 rounded-full border-2 border-white ${
                                                    signal.status === 'GREEN' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-900'
                                                }`}></div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Route Setting */}
                            <div>
                                <h3 className="font-semibold mb-3 text-white">Route Management</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'R1', from: 'AJNI', to: 'NGP-P1', status: 'AVAILABLE' },
                                        { id: 'R2', from: 'AJNI', to: 'NGP-P2', status: 'LOCKED' },
                                        { id: 'R3', from: 'NGP-P1', to: 'GONDIA', status: 'AVAILABLE' },
                                        { id: 'R4', from: 'NGP-P8', to: 'GONDIA', status: 'SET' }
                                    ].map(route => (
                                        <div key={route.id} className={`p-3 rounded-lg border ${
                                            route.status === 'LOCKED' 
                                                ? 'bg-yellow-900/30 border-yellow-600' :
                                            route.status === 'SET'
                                                ? 'bg-green-900/30 border-green-600' :
                                                'bg-slate-800/50 border-slate-600'
                                        }`}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-medium text-white">
                                                        Route {route.id}: {route.from} → {route.to}
                                                    </span>
                                                    <div className="text-xs text-slate-400">Status: {route.status}</div>
                                                </div>
                                                <button 
                                                    onClick={() => handleRouteSet(route.id, `${route.from} → ${route.to}`)}
                                                    disabled={route.status === 'LOCKED'}
                                                    className={`px-3 py-1 rounded text-xs transition-colors ${
                                                        route.status === 'LOCKED'
                                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                                    }`}
                                                >
                                                    {route.status === 'SET' ? 'Clear' : 'Set Route'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'logs' && (
                        <motion.div
                            key="logs"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-4 h-full flex flex-col"
                        >
                            {/* Command History */}
                            <div className="flex-1 mb-4">
                                <h3 className="font-semibold mb-3 text-white">Command History</h3>
                                <div className="bg-black/40 rounded-lg p-3 font-mono text-sm h-64 overflow-y-auto border border-slate-600">
                                    {commandHistory.map(cmd => (
                                        <motion.div 
                                            key={cmd.id} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-2 pb-2 border-b border-slate-800 last:border-b-0"
                                        >
                                            <div className="flex items-center space-x-2 text-xs">
                                                <span className="text-slate-500">[{cmd.time}]</span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${
                                                    cmd.type === 'SYSTEM' ? 'bg-blue-900 text-blue-200' :
                                                    cmd.type === 'ALARM' ? 'bg-red-900 text-red-200' :
                                                    cmd.type === 'SIGNAL' ? 'bg-yellow-900 text-yellow-200' :
                                                    cmd.type === 'POINT' ? 'bg-green-900 text-green-200' :
                                                    'bg-slate-700 text-slate-300'
                                                }`}>
                                                    {cmd.type}
                                                </span>
                                                <span className="text-blue-400">{cmd.user}:</span>
                                                {cmd.station && (
                                                    <span className="text-purple-400">[{cmd.station}]</span>
                                                )}
                                            </div>
                                            <div className="text-green-400 mt-1">{cmd.command}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Command Input */}
                            <div>
                                <h3 className="font-semibold mb-2 text-white">Manual Command Input</h3>
                                <form onSubmit={handleCommandSubmit} className="flex">
                                    <input
                                        type="text"
                                        value={newCommand}
                                        onChange={(e) => setNewCommand(e.target.value)}
                                        className="flex-grow bg-slate-800 border border-slate-600 rounded-l px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
                                        placeholder="Enter command..."
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r text-sm text-white transition-colors"
                                    >
                                        Execute
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-4 h-full overflow-auto"
                        >
                            <h3 className="font-semibold mb-4 text-white">System Analytics</h3>
                            
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                                    <div className="text-2xl font-bold text-green-400">{getActiveTrainsCount()}</div>
                                    <div className="text-sm text-slate-300">Active Trains</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                                    <div className="text-2xl font-bold text-blue-400">{points.length}</div>
                                    <div className="text-sm text-slate-300">Total Points</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                                    <div className="text-2xl font-bold text-yellow-400">{signals.length}</div>
                                    <div className="text-sm text-slate-300">Total Signals</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                                    <div className="text-2xl font-bold text-red-400">
                                        {alarms.filter(a => !a.acknowledged).length}
                                    </div>
                                    <div className="text-sm text-slate-300">Active Alarms</div>
                                </div>
                            </div>

                            {/* Signal Status Distribution */}
                            <div className="mb-6">
                                <h4 className="font-medium mb-3 text-white">Signal Status Distribution</h4>
                                <div className="space-y-2">
                                    {['RED', 'YELLOW', 'GREEN'].map(status => {
                                        const count = signals.filter(s => s.status === status).length;
                                        const percentage = signals.length > 0 ? (count / signals.length) * 100 : 0;
                                        return (
                                            <div key={status} className="flex items-center space-x-3">
                                                <div className={`w-4 h-4 rounded ${
                                                    status === 'RED' ? 'bg-red-500' :
                                                    status === 'YELLOW' ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}></div>
                                                <span className="text-sm text-white w-16">{status}</span>
                                                <div className="flex-1 bg-slate-700 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            status === 'RED' ? 'bg-red-500' :
                                                            status === 'YELLOW' ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-slate-300 w-12">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Point Status */}
                            <div>
                                <h4 className="font-medium mb-3 text-white">Point Status</h4>
                                <div className="space-y-2">
                                    {['WORKING', 'MAINTENANCE', 'LOCKED'].map(status => {
                                        const count = status === 'LOCKED' 
                                            ? points.filter(p => p.locked).length
                                            : points.filter(p => p.status === status).length;
                                        return (
                                            <div key={status} className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                                                <span className="text-sm text-white">{status}</span>
                                                <span className={`text-sm font-bold ${
                                                    status === 'WORKING' ? 'text-green-400' :
                                                    status === 'MAINTENANCE' ? 'text-yellow-400' :
                                                    'text-red-400'
                                                }`}>
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Enhanced Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                    <div>
                        <div className="font-medium text-slate-300">Connection Status</div>
                        <div>✓ Connected: {selectedStation?.name || 'Central'} Control</div>
                        <div>Operator: {operatorId}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-medium text-slate-300">Session Info</div>
                        <div>Last update: {currentTime?.toLocaleTimeString() || new Date().toLocaleTimeString()}</div>
                        <div>Session time: {formatSessionTime(sessionTime)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainControlOperator;