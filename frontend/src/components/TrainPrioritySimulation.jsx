import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TrainPrioritySimulation = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [trainAPosition, setTrainAPosition] = useState(-200);
    const [trainBPosition, setTrainBPosition] = useState(-200);
    const [trainATargetPlatform, setTrainATargetPlatform] = useState(null);
    const [trainBTargetPlatform, setTrainBTargetPlatform] = useState(null);
    const [signalStatus, setSignalStatus] = useState('RED');
    const [phaseDescription, setPhaseDescription] = useState('Click Start to begin simulation');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [platformOccupancy, setPlatformOccupancy] = useState({
        1: { occupied: true, train: 'T101', departureTime: 8000 },
        2: { occupied: true, train: 'T205', departureTime: 15000 },
        3: { occupied: true, train: 'T312', departureTime: 4000 },
        4: { occupied: true, train: 'T418', departureTime: 12000 },
        5: { occupied: true, train: 'T529', departureTime: 20000 }
    });

    // Simulation phases
    const phases = [
        {
            name: 'Station Status',
            duration: 3000,
            description: 'All platforms occupied - incoming trains A & B waiting for assignment',
            trainATarget: 50,
            trainBTarget: 20,
            signal: 'RED'
        },
        {
            name: 'Platform Monitoring',
            duration: 1000,
            description: 'Control system monitoring platform availability...',
            trainATarget: 50,
            trainBTarget: 20,
            signal: 'YELLOW'
        },
        {
            name: 'Platform 3 Clearing',
            duration: 3000,
            description: 'Platform 3 clearing - Train T312 departing',
            trainATarget: 80,
            trainBTarget: 50,
            signal: 'YELLOW',
            clearPlatform: 3
        },
        {
            name: 'Priority Assignment',
            duration: 2000,
            description: 'Train A assigned to Platform 3 (priority) - GREEN signal',
            trainATarget: 80,
            trainBTarget: 50,
            signal: 'GREEN',
            assignTrainA: 3
        },
        {
            name: 'Train A to Platform 3',
            duration: 4000,
            description: 'Train A proceeding to Platform 3',
            trainATarget: 350,
            trainBTarget: 80,
            signal: 'RED'
        },
        {
            name: 'Platform 1 Clearing',
            duration: 4000,
            description: 'Platform 1 clearing - Train T101 departing',
            trainATarget: 350,
            trainBTarget: 80,
            signal: 'YELLOW',
            clearPlatform: 1
        },
        {
            name: 'Train B Assignment',
            duration: 2000,
            description: 'Train B assigned to Platform 1 - minimal delay achieved',
            trainATarget: 350,
            trainBTarget: 80,
            signal: 'GREEN',
            assignTrainB: 1
        },
        {
            name: 'Train B to Platform 1',
            duration: 4000,
            description: 'Train B proceeding to Platform 1',
            trainATarget: 350,
            trainBTarget: 150,
            signal: 'RED'
        },
        {
            name: 'Both Platforms Active',
            duration: 5000,
            description: 'Both trains at platforms - optimal scheduling achieved',
            trainATarget: 350,
            trainBTarget: 150,
            signal: 'GREEN'
        },
        {
            name: 'Simulation Complete',
            duration: 2000,
            description: 'Efficient platform management - zero conflicts, minimal delays',
            trainATarget: 350,
            trainBTarget: 150,
            signal: 'GREEN'
        }
    ];

    useEffect(() => {
        let interval;
        if (isRunning && currentPhase < phases.length) {
            const phase = phases[currentPhase];
            
            // Update phase description and signal
            setPhaseDescription(phase.description);
            setSignalStatus(phase.signal);
            
            // Handle platform clearing
            if (phase.clearPlatform) {
                setPlatformOccupancy(prev => ({
                    ...prev,
                    [phase.clearPlatform]: { occupied: false, train: null, departureTime: null }
                }));
            }
            
            // Handle train assignments
            if (phase.assignTrainA) {
                setTrainATargetPlatform(phase.assignTrainA);
                setPlatformOccupancy(prev => ({
                    ...prev,
                    [phase.assignTrainA]: { occupied: true, train: 'TRAIN A', departureTime: null }
                }));
            }
            
            if (phase.assignTrainB) {
                setTrainBTargetPlatform(phase.assignTrainB);
                setPlatformOccupancy(prev => ({
                    ...prev,
                    [phase.assignTrainB]: { occupied: true, train: 'TRAIN B', departureTime: null }
                }));
            }
            
            // Animate trains to their target positions
            setTrainAPosition(phase.trainATarget);
            setTrainBPosition(phase.trainBTarget);
            
            // Set timer for next phase
            interval = setTimeout(() => {
                setCurrentPhase(prev => prev + 1);
            }, phase.duration);
            
            // Update elapsed time
            const timeInterval = setInterval(() => {
                setTimeElapsed(prev => prev + 100);
            }, 100);
            
            return () => {
                clearTimeout(interval);
                clearInterval(timeInterval);
            };
        } else if (currentPhase >= phases.length) {
            setIsRunning(false);
        }
    }, [isRunning, currentPhase]);

    const startSimulation = () => {
        setIsRunning(true);
        setCurrentPhase(0);
        setTimeElapsed(0);
        setTrainAPosition(-200);
        setTrainBPosition(-200);
        setSignalStatus('RED');
    };

    const resetSimulation = () => {
        setIsRunning(false);
        setCurrentPhase(0);
        setTimeElapsed(0);
        setTrainAPosition(-200);
        setTrainBPosition(-200);
        setTrainATargetPlatform(null);
        setTrainBTargetPlatform(null);
        setSignalStatus('RED');
        setPhaseDescription('Click Start to begin simulation');
        setPlatformOccupancy({
            1: { occupied: true, train: 'T101', departureTime: 8000 },
            2: { occupied: true, train: 'T205', departureTime: 15000 },
            3: { occupied: true, train: 'T312', departureTime: 4000 },
            4: { occupied: true, train: 'T418', departureTime: 12000 },
            5: { occupied: true, train: 'T529', departureTime: 20000 }
        });
    };

    const getSignalColor = () => {
        switch (signalStatus) {
            case 'GREEN': return '#22c55e';
            case 'YELLOW': return '#facc15';
            default: return '#ef4444';
        }
    };

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${seconds}.${centiseconds.toString().padStart(2, '0')}s`;
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Train Priority Management Simulation</h2>
                <p className="text-slate-300 text-sm">Demonstrating efficient scheduling and conflict resolution</p>
            </div>

            {/* Status Bar */}
            <div className="flex justify-between items-center mb-6 bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                    <div className="text-white font-medium">Time: {formatTime(timeElapsed)}</div>
                    <div className="text-white font-medium">
                        Phase: {currentPhase + 1}/{phases.length}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-white text-sm">Signal:</span>
                    <div 
                        className="w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: getSignalColor() }}
                    />
                    <span className="text-white font-medium">{signalStatus}</span>
                </div>
            </div>

            {/* Main Track Visualization */}
            <div className="relative bg-slate-900 rounded-lg p-6 mb-6 h-80 overflow-hidden">
                {/* Station Header */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-800 px-4 py-1 rounded">
                    <span className="text-yellow-400 font-bold text-sm">CENTRAL STATION - PLATFORM CONTROL</span>
                </div>

                {/* Platforms */}
                {[1, 2, 3, 4, 5].map((platformNum) => {
                    const platform = platformOccupancy[platformNum];
                    const yPos = 50 + (platformNum - 1) * 40;
                    const platformColor = platform.occupied ? 
                        (platform.train === 'TRAIN A' ? 'bg-blue-800 border-blue-400' : 
                         platform.train === 'TRAIN B' ? 'bg-red-800 border-red-400' : 
                         'bg-yellow-800 border-yellow-400') : 
                        'bg-green-800 border-green-400';
                    
                    return (
                        <div key={platformNum} className="absolute" style={{ top: `${yPos}px`, left: '200px' }}>
                            {/* Platform Track */}
                            <div className="w-80 h-2 bg-gray-400 rounded-full"></div>
                            
                            {/* Platform */}
                            <div className={`w-80 h-6 mt-1 rounded ${platformColor} border-2 flex items-center justify-between px-2`}>
                                <span className="text-white font-bold text-xs">PLATFORM {platformNum}</span>
                                <span className="text-white text-xs">
                                    {platform.occupied ? platform.train : 'AVAILABLE'}
                                </span>
                            </div>
                            
                            {/* Platform Number Label */}
                            <div className="absolute -left-8 top-0 text-white font-bold">P{platformNum}</div>
                        </div>
                    );
                })}

                {/* Signal Posts */}
                <div className="absolute top-16 right-12">
                    <div className="w-1 h-16 bg-gray-600 mx-auto"></div>
                    <div 
                        className="w-8 h-8 rounded-full border-2 border-white mx-auto -mt-1 flex items-center justify-center"
                        style={{ backgroundColor: getSignalColor() }}
                    >
                        <div className="w-4 h-4 rounded-full bg-white opacity-80"></div>
                    </div>
                    <div className="text-white text-xs text-center mt-1 font-bold">MAIN SIG</div>
                </div>

                {/* Train A */}
                <motion.div
                    className="absolute flex items-center z-10"
                    style={{ top: trainATargetPlatform ? `${50 + (trainATargetPlatform - 1) * 40}px` : '120px' }}
                    animate={{ x: trainAPosition }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                >
                    <div className="w-20 h-8 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-blue-400 shadow-xl">
                        <span className="text-white font-bold text-xs">TRAIN A</span>
                    </div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full ml-1"></div>
                </motion.div>

                {/* Train B */}
                <motion.div
                    className="absolute flex items-center z-10"
                    style={{ top: trainBTargetPlatform ? `${50 + (trainBTargetPlatform - 1) * 40}px` : '160px' }}
                    animate={{ x: trainBPosition }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                >
                    <div className="w-20 h-8 bg-red-600 rounded-lg flex items-center justify-center border-2 border-red-400 shadow-xl">
                        <span className="text-white font-bold text-xs">TRAIN B</span>
                    </div>
                    <div className="w-3 h-3 bg-red-400 rounded-full ml-1"></div>
                </motion.div>

                {/* Direction Indicators */}
                <div className="absolute top-4 left-4 text-white text-sm font-medium flex items-center">
                    <div className="mr-2">←</div>
                    <span>Approaching Trains</span>
                </div>
                <div className="absolute top-4 right-4 text-white text-sm font-medium flex items-center">
                    <span>Departing</span>
                    <div className="ml-2">→</div>
                </div>

                {/* Waiting Area */}
                <div className="absolute left-4 top-16 bg-slate-800/50 rounded p-2 text-white text-xs">
                    <div className="font-bold mb-1">HOLDING AREA</div>
                    <div>Incoming trains wait here</div>
                    <div>for platform assignment</div>
                </div>
            </div>

            {/* Phase Description */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="text-center">
                    <div className="text-lg font-semibold text-white mb-2">
                        {phases[currentPhase]?.name || 'Ready to Start'}
                    </div>
                    <div className="text-slate-300 text-sm">
                        {phaseDescription}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
                <button
                    onClick={startSimulation}
                    disabled={isRunning}
                    className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                        isRunning 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
                    }`}
                >
                    {isRunning ? 'Running...' : 'Start Simulation'}
                </button>
                <button
                    onClick={resetSimulation}
                    className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-600 hover:bg-slate-700 transition-all transform hover:scale-105"
                >
                    Reset
                </button>
            </div>

            {/* Platform Status Grid */}
            <div className="mt-6 grid grid-cols-5 gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((platformNum) => {
                    const platform = platformOccupancy[platformNum];
                    return (
                        <div key={platformNum} className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <div className="font-bold text-white text-sm">P{platformNum}</div>
                            <div className={`text-xs mt-1 px-2 py-1 rounded ${
                                platform.occupied ? 
                                    (platform.train === 'TRAIN A' ? 'bg-blue-600 text-white' : 
                                     platform.train === 'TRAIN B' ? 'bg-red-600 text-white' : 
                                     'bg-yellow-600 text-black') : 
                                'bg-green-600 text-white'
                            }`}>
                                {platform.occupied ? 'OCCUPIED' : 'FREE'}
                            </div>
                            {platform.train && (
                                <div className="text-xs text-slate-300 mt-1">{platform.train}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="text-green-400 font-bold text-lg">
                        {Object.values(platformOccupancy).filter(p => !p.occupied).length}
                    </div>
                    <div className="text-slate-300 text-xs">Available Platforms</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="text-blue-400 font-bold text-lg">
                        {Object.values(platformOccupancy).filter(p => p.occupied).length}
                    </div>
                    <div className="text-slate-300 text-xs">Occupied Platforms</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="text-yellow-400 font-bold text-lg">~12s</div>
                    <div className="text-slate-300 text-xs">Avg Wait Time</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="text-purple-400 font-bold text-lg">96%</div>
                    <div className="text-slate-300 text-xs">Efficiency</div>
                </div>
            </div>
        </div>
    );
};

export default TrainPrioritySimulation;