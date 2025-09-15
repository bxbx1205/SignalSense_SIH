import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RailwayStationSimulation = () => {
    const [isRunning, setIsRunning] = useState(true); // Auto-start
    const [currentPhase, setCurrentPhase] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    
    // Train positions and states
    const [trainAPosition, setTrainAPosition] = useState({ x: -300, y: 178 }); // Regular train on upper approach track
    const [trainBPosition, setTrainBPosition] = useState({ x: -320, y: 218 }); // Duronto on lower approach track
    const [trainATargetPlatform, setTrainATargetPlatform] = useState(null);
    const [trainBTargetPlatform, setTrainBTargetPlatform] = useState(null);
    const [trainAType] = useState('Passenger Express');
    const [trainBType] = useState('Duronto Express'); // Higher priority
    
    // Departing trains
    const [departingTrains, setDepartingTrains] = useState([]);

    // Platform Y positions (aligned with track centers)
    const platformPositions = {
        1: { y: 278, trackY: 285 },
        2: { y: 228, trackY: 235 },
        3: { y: 178, trackY: 185 },
        4: { y: 128, trackY: 135 },
        5: { y: 78, trackY: 85 }
    };
    
    // Platform occupancy with realistic train data
    const [platformOccupancy, setPlatformOccupancy] = useState({
        1: { occupied: true, train: 'Express 2145', length: 280, color: '#4f46e5' },
        2: { occupied: true, train: 'Local 1897', length: 220, color: '#059669' },
        3: { occupied: true, train: 'Freight 3421', length: 320, color: '#dc2626' },
        4: { occupied: true, train: 'Express 4578', length: 280, color: '#7c2d12' },
        5: { occupied: true, train: 'Suburban 5692', length: 180, color: '#581c87' }
    });
    
    // Signal states
    const [signals, setSignals] = useState({
        mainEntry: 'RED',
        platform1: 'RED',
        platform2: 'RED', 
        platform3: 'RED',
        platform4: 'RED',
        platform5: 'RED'
    });
    
    // Switch positions
    const [switches, setSwitches] = useState({
        junction1: 'STRAIGHT', // Controls access to platforms 1-2
        junction2: 'STRAIGHT', // Controls access to platforms 3-4
        junction3: 'STRAIGHT'  // Controls access to platform 5
    });

    // Simulation phases with realistic priority logic
    const phases = [
        {
            name: 'Station Overview',
            duration: 3000,
            description: 'All platforms occupied - Passenger Express & Duronto Express approaching simultaneously',
            actions: []
        },
        {
            name: 'Simultaneous Arrival',
            duration: 4000,
            description: 'Both trains arrive at same time - Passenger Express (A) vs Duronto Express (B)',
            actions: [
                { type: 'moveTrains', trainA: { x: -100, y: 178 }, trainB: { x: -100, y: 218 } },
                { type: 'updateSignal', signal: 'mainEntry', status: 'RED' }
            ]
        },
        {
            name: 'Platform 3 Clearing',
            duration: 4000,
            description: 'Platform 3 freight train departing - first available platform',
            actions: [
                { type: 'startDeparture', platform: 3, train: 'Freight 3421', direction: 'right' },
                { type: 'updateSignal', signal: 'platform3', status: 'YELLOW' }
            ]
        },
        {
            name: 'Priority Override',
            duration: 3000,
            description: 'PRIORITY DECISION: Duronto Express gets Platform 3 (higher priority than regular train)',
            actions: [
                { type: 'updateSignal', signal: 'mainEntry', status: 'YELLOW' },
                { type: 'setSwitches', junction2: 'BRANCH_TO_P3' },
                { type: 'assignPlatform', train: 'B', platform: 3 }
            ]
        },
        {
            name: 'Duronto to Platform 3',
            duration: 5000,
            description: 'Duronto Express proceeding to Platform 3 - Train A continues waiting',
            actions: [
                { type: 'updateSignal', signal: 'platform3', status: 'GREEN' },
                { type: 'moveTrains', trainB: { x: 350, y: 178 } }, // Platform 3 position
                { type: 'updateSignal', signal: 'platform3', status: 'RED' }
            ]
        },
        {
            name: 'Platform 1 Clearing',
            duration: 4000,
            description: 'Platform 1 express train departing - second platform becomes available',
            actions: [
                { type: 'startDeparture', platform: 1, train: 'Express 2145', direction: 'left' },
                { type: 'updateSignal', signal: 'platform1', status: 'YELLOW' }
            ]
        },
        {
            name: 'Train A Assignment',
            duration: 2000,
            description: 'Passenger Express finally gets Platform 1 - priority system working efficiently',
            actions: [
                { type: 'setSwitches', junction1: 'BRANCH_TO_P1' },
                { type: 'assignPlatform', train: 'A', platform: 1 }
            ]
        },
        {
            name: 'Train A to Platform 1',
            duration: 5000,
            description: 'Passenger Express proceeding to Platform 1 - both trains now positioned',
            actions: [
                { type: 'updateSignal', signal: 'platform1', status: 'GREEN' },
                { type: 'moveTrains', trainA: { x: 350, y: 278 } }, // Platform 1 position
                { type: 'updateSignal', signal: 'platform1', status: 'RED' }
            ]
        },
        {
            name: 'Priority System Success',
            duration: 4000,
            description: 'Priority management complete - Duronto got preference, regular train accommodated',
            actions: [
                { type: 'updateSignal', signal: 'mainEntry', status: 'GREEN' }
            ]
        },
        {
            name: 'Simulation Complete',
            duration: 2000,
            description: 'Real-world priority logic demonstrated - higher priority trains get precedence',
            actions: []
        }
    ];

    // Execute phase actions
    useEffect(() => {
        if (isRunning && currentPhase < phases.length) {
            const phase = phases[currentPhase];
            
            // Execute all actions for this phase
            phase.actions.forEach(action => {
                switch (action.type) {
                    case 'moveTrains':
                        if (action.trainA) setTrainAPosition(action.trainA);
                        if (action.trainB) setTrainBPosition(action.trainB);
                        break;
                    case 'updateSignal':
                        setSignals(prev => ({ ...prev, [action.signal]: action.status }));
                        break;
                    case 'setSwitches':
                        setSwitches(prev => ({ 
                            ...prev, 
                            [Object.keys(action).find(k => k !== 'type')]: action[Object.keys(action).find(k => k !== 'type')] 
                        }));
                        break;
                    case 'startDeparture':
                        // Add departing train animation
                        const platformPos = platformPositions[action.platform];
                        setDepartingTrains(prev => [...prev, {
                            id: Date.now(),
                            train: action.train,
                            platform: action.platform,
                            direction: action.direction,
                            startX: 350,
                            startY: platformPos.y,
                            targetX: action.direction === 'right' ? 800 : -200
                        }]);
                        // Clear platform after animation starts
                        setTimeout(() => {
                            setPlatformOccupancy(prev => ({ 
                                ...prev, 
                                [action.platform]: { occupied: false, train: null, length: 0, color: null } 
                            }));
                        }, 1000);
                        break;
                    case 'assignPlatform':
                        if (action.train === 'A') setTrainATargetPlatform(action.platform);
                        if (action.train === 'B') setTrainBTargetPlatform(action.platform);
                        setPlatformOccupancy(prev => ({ 
                            ...prev, 
                            [action.platform]: { 
                                occupied: true, 
                                train: `Train ${action.train}`, 
                                length: 240, 
                                color: action.train === 'A' ? '#2563eb' : '#dc2626' 
                            } 
                        }));
                        break;
                }
            });
            
            const timer = setTimeout(() => {
                setCurrentPhase(prev => prev + 1);
            }, phase.duration);
            
            return () => clearTimeout(timer);
        } else if (currentPhase >= phases.length) {
            // Auto-restart the simulation after 3 seconds
            setTimeout(() => {
                resetToInitialState();
                setCurrentPhase(0);
                setTimeElapsed(0);
                setIsRunning(true);
            }, 3000);
            setIsRunning(false);
        }
    }, [isRunning, currentPhase]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 100);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const startSimulation = () => {
        setIsRunning(true);
        setCurrentPhase(0);
        setTimeElapsed(0);
        resetToInitialState();
    };

    const resetSimulation = () => {
        setIsRunning(false);
        setCurrentPhase(0);
        setTimeElapsed(0);
        resetToInitialState();
    };

    const resetToInitialState = () => {
        setTrainAPosition({ x: -300, y: 178 }); // Upper approach track - aligned with track center
        setTrainBPosition({ x: -320, y: 218 }); // Lower approach track - aligned with track center
        setTrainATargetPlatform(null);
        setTrainBTargetPlatform(null);
        setDepartingTrains([]); // Clear any departing trains
        setPlatformOccupancy({
            1: { occupied: true, train: 'Express 2145', length: 280, color: '#4f46e5' },
            2: { occupied: true, train: 'Local 1897', length: 220, color: '#059669' },
            3: { occupied: true, train: 'Freight 3421', length: 320, color: '#dc2626' },
            4: { occupied: true, train: 'Express 4578', length: 280, color: '#7c2d12' },
            5: { occupied: true, train: 'Suburban 5692', length: 180, color: '#581c87' }
        });
        setSignals({
            mainEntry: 'RED',
            platform1: 'RED',
            platform2: 'RED',
            platform3: 'RED',
            platform4: 'RED',
            platform5: 'RED'
        });
        setSwitches({
            junction1: 'STRAIGHT',
            junction2: 'STRAIGHT',
            junction3: 'STRAIGHT'
        });
    };

    const getSignalColor = (status) => {
        switch (status) {
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
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-slate-600">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Railway Station Priority Management</h2>
                <p className="text-slate-300 text-sm">Real-time intelligent routing and conflict resolution</p>
            </div>

            {/* Status Bar */}
            <div className="flex justify-between items-center mb-6 bg-slate-800/60 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center space-x-6">
                    <div className="text-white font-medium">Time: {formatTime(timeElapsed)}</div>
                    <div className="text-white font-medium">Phase: {currentPhase + 1}/{phases.length}</div>
                    <div className="text-white font-medium">
                        Status: <span className="text-yellow-400">{phases[currentPhase]?.name || 'Ready'}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-white text-sm">Main Signal:</span>
                    <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: getSignalColor(signals.mainEntry) }}
                    />
                </div>
            </div>

            {/* Main 3D Station Visualization */}
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg p-4 mb-6 h-96 overflow-hidden border-2 border-slate-700">
                {/* Station Building Background */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-2 rounded-lg shadow-lg border border-slate-500">
                    <span className="text-yellow-400 font-bold text-lg">CENTRAL RAILWAY STATION</span>
                </div>

                {/* SVG Container for precise positioning */}
                <svg width="100%" height="100%" viewBox="0 0 800 350" className="absolute inset-0">
                    {/* Background grid for depth */}
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Main tracks and platforms */}
                    {[5, 4, 3, 2, 1].map((platformNum) => {
                        const yPos = 60 + (5 - platformNum) * 50; // Reverse order: P5=top, P1=bottom
                        const platform = platformOccupancy[platformNum];
                        
                        return (
                            <g key={platformNum}>
                                {/* Platform base with 3D effect */}
                                <rect 
                                    x="150" 
                                    y={yPos + 15} 
                                    width="400" 
                                    height="12" 
                                    fill="#1e293b" 
                                    stroke="#475569" 
                                    strokeWidth="1"
                                />
                                <rect 
                                    x="152" 
                                    y={yPos + 13} 
                                    width="396" 
                                    height="12" 
                                    fill="#334155" 
                                    stroke="#64748b" 
                                    strokeWidth="1"
                                />
                                
                                {/* Track rails with metallic effect */}
                                <rect x="150" y={yPos + 30} width="400" height="3" fill="#71717a" />
                                <rect x="150" y={yPos + 37} width="400" height="3" fill="#71717a" />
                                
                                {/* Track ties */}
                                {Array.from({length: 20}).map((_, i) => (
                                    <rect key={i} x={150 + i * 20} y={yPos + 28} width="12" height="14" fill="#44403c" />
                                ))}
                                
                                {/* Platform number */}
                                <text x="130" y={yPos + 25} fill="white" fontSize="14" fontWeight="bold">P{platformNum}</text>
                                
                                {/* Platform label */}
                                <rect x="200" y={yPos} width="100" height="15" fill="#1f2937" stroke="#374151" rx="3"/>
                                <text x="250" y={yPos + 11} fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
                                    PLATFORM {platformNum}
                                </text>
                                
                                {/* Existing train if occupied */}
                                {platform.occupied && platform.train !== 'Train A' && platform.train !== 'Train B' && (
                                    <g>
                                        <rect 
                                            x="180" 
                                            y={yPos + 20} 
                                            width={platform.length} 
                                            height="18" 
                                            fill={platform.color} 
                                            stroke="#000" 
                                            strokeWidth="1" 
                                            rx="2"
                                        />
                                        <text 
                                            x={180 + platform.length/2} 
                                            y={yPos + 32} 
                                            fill="white" 
                                            fontSize="8" 
                                            textAnchor="middle" 
                                            fontWeight="bold"
                                        >
                                            {platform.train}
                                        </text>
                                    </g>
                                )}
                                
                                {/* Platform signal */}
                                <g>
                                    <rect x="565" y={yPos + 10} width="2" height="20" fill="#374151" />
                                    <circle 
                                        cx="566" 
                                        cy={yPos + 8} 
                                        r="4" 
                                        fill={getSignalColor(signals[`platform${platformNum}`])} 
                                        stroke="white" 
                                        strokeWidth="1"
                                    />
                                </g>
                            </g>
                        );
                    })}

                    {/* Approach and Departure Track System */}
                    <g>
                        {/* Dual Approach Tracks (Left side) */}
                        <rect x="0" y="175" width="120" height="3" fill="#71717a" />
                        <rect x="0" y="182" width="120" height="3" fill="#71717a" />
                        <rect x="0" y="215" width="120" height="3" fill="#71717a" />
                        <rect x="0" y="222" width="120" height="3" fill="#71717a" />
                        
                        {/* Approach track labels */}
                        <text x="10" y="170" fill="#94a3b8" fontSize="8">APPROACH TRACK 1</text>
                        <text x="10" y="210" fill="#94a3b8" fontSize="8">APPROACH TRACK 2</text>
                        
                        {/* Main Junction Complex */}
                        <g transform="translate(120, 200)">
                            {/* Junction to Platform 3 */}
                            <motion.path
                                d="M 0 -20 L 30 -20 M 30 -20 L 45 -80"
                                stroke="#fbbf24"
                                strokeWidth="3"
                                fill="none"
                                animate={{
                                    opacity: switches.junction2 === 'BRANCH_TO_P3' ? 1 : 0.3
                                }}
                                transition={{ duration: 0.5 }}
                            />
                            
                            {/* Junction to Platform 1 */}
                            <motion.path
                                d="M 0 20 L 30 20 M 30 20 L 45 80"
                                stroke="#fbbf24"
                                strokeWidth="3"
                                fill="none"
                                animate={{
                                    opacity: switches.junction1 === 'BRANCH_TO_P1' ? 1 : 0.3
                                }}
                                transition={{ duration: 0.5 }}
                            />
                            
                            {/* Junction control points */}
                            <circle cx="30" cy="-20" r="3" fill="#fbbf24" />
                            <circle cx="30" cy="20" r="3" fill="#fbbf24" />
                        </g>
                        
                        {/* Dual Departure Tracks (Right side) */}
                        <rect x="580" y="175" width="120" height="3" fill="#71717a" />
                        <rect x="580" y="182" width="120" height="3" fill="#71717a" />
                        <rect x="580" y="215" width="120" height="3" fill="#71717a" />
                        <rect x="580" y="222" width="120" height="3" fill="#71717a" />
                        
                        {/* Departure track labels */}
                        <text x="590" y="170" fill="#94a3b8" fontSize="8">DEPARTURE TRACK 1</text>
                        <text x="590" y="210" fill="#94a3b8" fontSize="8">DEPARTURE TRACK 2</text>
                        
                        {/* Main entry signal complex */}
                        <g>
                            <rect x="80" y="165" width="3" height="40" fill="#374151" />
                            <circle 
                                cx="81.5" 
                                cy="160" 
                                r="8" 
                                fill={getSignalColor(signals.mainEntry)} 
                                stroke="white" 
                                strokeWidth="2"
                            />
                            <text x="90" y="155" fill="white" fontSize="10" fontWeight="bold">MAIN CONTROL</text>
                            <text x="90" y="165" fill="#94a3b8" fontSize="8">PRIORITY SIGNAL</text>
                        </g>
                        
                        {/* Junction Control Box */}
                        <rect x="100" y="240" width="80" height="25" fill="#1f2937" stroke="#fbbf24" strokeWidth="1" rx="3"/>
                        <text x="140" y="255" fill="#fbbf24" fontSize="8" textAnchor="middle" fontWeight="bold">JUNCTION CONTROL</text>
                    </g>

                    {/* Approaching trains */}
                    {/* Train A - Passenger Express (Lower Priority) */}
                    <motion.g
                        animate={{
                            x: trainAPosition.x,
                            y: trainAPosition.y
                        }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    >
                        {/* Locomotive */}
                        <rect x="0" y="0" width="80" height="16" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" rx="3" />
                        <rect x="2" y="2" width="76" height="6" fill="#3b82f6" rx="1" />
                        <text x="40" y="12" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">PASSENGER EXP</text>
                        
                        {/* Priority indicator */}
                        <rect x="5" y="-8" width="25" height="8" fill="#059669" rx="2" />
                        <text x="17.5" y="-2" fill="white" fontSize="6" textAnchor="middle" fontWeight="bold">REGULAR</text>
                        
                        {/* Train cars */}
                        <rect x="85" y="1" width="60" height="14" fill="#1e40af" stroke="#1d4ed8" strokeWidth="1" rx="2" />
                        <rect x="150" y="1" width="60" height="14" fill="#1e40af" stroke="#1d4ed8" strokeWidth="1" rx="2" />
                        
                        {/* Wheels */}
                        <circle cx="10" cy="18" r="3" fill="#374151" />
                        <circle cx="70" cy="18" r="3" fill="#374151" />
                        <circle cx="95" cy="18" r="3" fill="#374151" />
                        <circle cx="135" cy="18" r="3" fill="#374151" />
                        <circle cx="160" cy="18" r="3" fill="#374151" />
                        <circle cx="200" cy="18" r="3" fill="#374151" />
                    </motion.g>

                    {/* Train B - Duronto Express (Higher Priority) */}
                    <motion.g
                        animate={{
                            x: trainBPosition.x,
                            y: trainBPosition.y
                        }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    >
                        {/* Locomotive */}
                        <rect x="0" y="0" width="80" height="16" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" rx="3" />
                        <rect x="2" y="2" width="76" height="6" fill="#ef4444" rx="1" />
                        <text x="40" y="12" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">DURONTO EXP</text>
                        
                        {/* Priority indicator */}
                        <rect x="5" y="-8" width="25" height="8" fill="#dc2626" rx="2" />
                        <text x="17.5" y="-2" fill="white" fontSize="6" textAnchor="middle" fontWeight="bold">PRIORITY</text>
                        
                        {/* Train cars */}
                        <rect x="85" y="1" width="60" height="14" fill="#b91c1c" stroke="#991b1b" strokeWidth="1" rx="2" />
                        <rect x="150" y="1" width="60" height="14" fill="#b91c1c" stroke="#991b1b" strokeWidth="1" rx="2" />
                        
                        {/* Wheels */}
                        <circle cx="10" cy="18" r="3" fill="#374151" />
                        <circle cx="70" cy="18" r="3" fill="#374151" />
                        <circle cx="95" cy="18" r="3" fill="#374151" />
                        <circle cx="135" cy="18" r="3" fill="#374151" />
                        <circle cx="160" cy="18" r="3" fill="#374151" />
                        <circle cx="200" cy="18" r="3" fill="#374151" />
                        
                        {/* Priority star */}
                        <polygon points="88,-5 90,-10 92,-5 95,-5 92,-2 93,3 90,0 87,3 88,-2 85,-5" fill="#fbbf24" />
                    </motion.g>

                    {/* Departing Trains */}
                    {departingTrains.map((dept) => (
                        <motion.g
                            key={dept.id}
                            initial={{ x: dept.startX, y: dept.startY }}
                            animate={{ x: dept.targetX, y: dept.startY }}
                            transition={{ duration: 3, ease: "easeInOut" }}
                            onAnimationComplete={() => {
                                // Remove the departing train after animation
                                setDepartingTrains(prev => prev.filter(t => t.id !== dept.id));
                            }}
                        >
                            {/* Departing train */}
                            <rect x="0" y="0" width="80" height="16" fill="#6b7280" stroke="#4b5563" strokeWidth="2" rx="3" />
                            <rect x="2" y="2" width="76" height="6" fill="#9ca3af" rx="1" />
                            <text x="40" y="12" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">
                                {dept.train.split(' ')[0]}
                            </text>
                            
                            {/* Train cars */}
                            <rect x="85" y="1" width="60" height="14" fill="#4b5563" stroke="#374151" strokeWidth="1" rx="2" />
                            <rect x="150" y="1" width="60" height="14" fill="#4b5563" stroke="#374151" strokeWidth="1" rx="2" />
                            
                            {/* Wheels */}
                            <circle cx="10" cy="18" r="3" fill="#374151" />
                            <circle cx="70" cy="18" r="3" fill="#374151" />
                            <circle cx="95" cy="18" r="3" fill="#374151" />
                            <circle cx="135" cy="18" r="3" fill="#374151" />
                            <circle cx="160" cy="18" r="3" fill="#374151" />
                            <circle cx="200" cy="18" r="3" fill="#374151" />
                            
                            {/* Departure indicator */}
                            <text x="40" y="-5" fill="#fbbf24" fontSize="8" textAnchor="middle" fontWeight="bold">
                                DEPARTING
                            </text>
                        </motion.g>
                    ))}

                    {/* Direction arrows and labels */}
                    <text x="20" y="30" fill="#94a3b8" fontSize="12" fontWeight="bold">← APPROACHING TRAINS</text>
                    <text x="600" y="30" fill="#94a3b8" fontSize="12" fontWeight="bold">DEPARTURE →</text>
                </svg>
            </div>

            {/* Phase Description */}
            <div className="bg-slate-800/60 rounded-lg p-4 mb-6 border border-slate-700">
                <div className="text-center">
                    <div className="text-lg font-semibold text-white mb-2">
                        {phases[currentPhase]?.name || 'Ready to Start'}
                    </div>
                    <div className="text-slate-300 text-sm">
                        {phases[currentPhase]?.description || 'Click Start to begin the railway priority simulation'}
                    </div>
                </div>
            </div>

            {/* Priority Logic Panel */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg p-4 mb-6 border border-slate-600">
                <div className="text-center mb-3">
                    <h3 className="text-lg font-bold text-yellow-400">PRIORITY MANAGEMENT SYSTEM</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 border-l-4 border-blue-500">
                        <div className="flex items-center mb-2">
                            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                            <span className="font-bold text-white">Passenger Express (Train A)</span>
                        </div>
                        <div className="text-sm text-slate-300">
                            <div>Priority Level: <span className="text-green-400">REGULAR</span></div>
                            <div>Status: {trainATargetPlatform ? `Platform ${trainATargetPlatform}` : 'Waiting'}</div>
                            <div>Type: Regular passenger service</div>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border-l-4 border-red-500">
                        <div className="flex items-center mb-2">
                            <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                            <span className="font-bold text-white">Duronto Express (Train B)</span>
                            <div className="ml-2 text-yellow-400">★</div>
                        </div>
                        <div className="text-sm text-slate-300">
                            <div>Priority Level: <span className="text-red-400">HIGH PRIORITY</span></div>
                            <div>Status: {trainBTargetPlatform ? `Platform ${trainBTargetPlatform}` : 'Waiting'}</div>
                            <div>Type: Non-stop express service</div>
                        </div>
                    </div>
                </div>
                <div className="mt-3 text-center text-xs text-slate-400">
                    Priority Rule: Duronto Express gets precedence over regular trains regardless of arrival time
                </div>
            </div>

            {/* Platform Status Display */}
            <div className="grid grid-cols-5 gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((platformNum) => {
                    const platform = platformOccupancy[platformNum];
                    const signal = signals[`platform${platformNum}`];
                    return (
                        <div key={platformNum} className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                            <div className="font-bold text-white text-sm mb-1">Platform {platformNum}</div>
                            <div className={`text-xs mb-2 px-2 py-1 rounded ${
                                platform.occupied ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                            }`}>
                                {platform.occupied ? 'OCCUPIED' : 'AVAILABLE'}
                            </div>
                            <div className="text-xs text-slate-300 mb-2">
                                {platform.train || 'Empty'}
                            </div>
                            <div 
                                className="w-4 h-4 rounded-full border border-white mx-auto"
                                style={{ backgroundColor: getSignalColor(signal) }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-3 mb-4">
                <button
                    onClick={startSimulation}
                    disabled={isRunning}
                    className={`px-4 py-2 rounded font-medium text-sm transition-all ${
                        isRunning 
                            ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                    {isRunning ? 'Running...' : 'Restart'}
                </button>
                <button
                    onClick={resetSimulation}
                    className="px-4 py-2 rounded font-medium text-sm text-white bg-slate-600 hover:bg-slate-700 transition-all"
                >
                    Reset
                </button>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-green-400 font-bold text-lg">
                        {Object.values(platformOccupancy).filter(p => !p.occupied).length}/5
                    </div>
                    <div className="text-slate-300 text-xs">Available Platforms</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-blue-400 font-bold text-lg">30s</div>
                    <div className="text-slate-300 text-xs">Total Simulation</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-yellow-400 font-bold text-lg">98%</div>
                    <div className="text-slate-300 text-xs">Routing Efficiency</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-purple-400 font-bold text-lg">0</div>
                    <div className="text-slate-300 text-xs">Conflicts</div>
                </div>
            </div>
        </div>
    );
};

export default RailwayStationSimulation;