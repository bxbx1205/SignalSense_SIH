import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrainControlOperator from './TrainControlOperator';
import RailwayStationSimulation from './RailwayStationSimulation';

// --- ENRICHED DATA with SIGNALS, POINTS, and ROUTES ---
const initialRailwayData = {
    stations: [
        { code: "WR", name: "Wardha Jn", km: 0.0, platformCount: 4 },
        { code: "SEGM", name: "Sewagram", km: 2.6, platformCount: 2 },
        { code: "BTBR", name: "Butibori", km: 51.3, platformCount: 3 },
        { code: "AJNI", name: "Ajni", km: 75.9, platformCount: 3 },
        { code: "NGP", name: "Nagpur Jn", km: 78.8, platformCount: 8 },
        { code: "G", name: "Gondia Jn", km: 208.4, platformCount: 7 }
    ],
    active_trains: [
        { id: "12859", name: "Gitanjali Express", position: { section: "BTBR-AJNI", km_from_WR: 70.1 }, speed: 88, status: "RUNNING", scheduled_arrival: "2025-09-15T18:15:00Z", delayed_by_min: 5, direction: "UP" },
        { id: "12130", name: "Azad Hind Express", position: { section: "NGP-G", km_from_WR: 95.8 }, speed: 105, status: "RUNNING", scheduled_arrival: "2025-09-15T19:30:00Z", delayed_by_min: 0, direction: "DOWN" },
        { id: "12621", name: "Tamil Nadu Exp", position: { station: "NGP", platform: "P1" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-15T18:10:00Z", delayed_by_min: 21, direction: "UP" },
        { id: "22691", name: "Rajdhani Express", position: { station: "NGP", platform: "P2" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-15T18:08:00Z", delayed_by_min: 8, direction: "DOWN" },
        { id: "12289", name: "CSMT NGP Duronto", position: { section: "AJNI-NGP", km_from_WR: 78.1 }, speed: 25, status: "APPROACHING", scheduled_arrival: "2025-09-15T18:14:00Z", delayed_by_min: 2, direction: "UP" },
        { id: "12649", name: "Sampark Kranti", position: { station: "NGP", platform: "P6" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-15T18:20:00Z", delayed_by_min: 28, direction: "DOWN" },
    ],
    points: [
        { id: "P101A", position: "NORMAL", locked: true, status: "WORKING", coords: { x: 350, y: 115 } },
        { id: "P101B", position: "REVERSE", locked: true, status: "WORKING", coords: { x: 350, y: 205 } },
        { id: "P102A", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 1050, y: 165 } },
        { id: "P102B", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 1050, y: 205 } },
        { id: "P103", position: "REVERSE", locked: false, status: "MAINTENANCE", coords: { x: 370, y: 305 } },
        { id: "P104", position: "NORMAL", locked: true, status: "WORKING", coords: { x: 370, y: 450 } }
    ],
    signals: [
        { id: "H1", type: "HOME", status: "YELLOW", coords: { x: 280, y: 115 }, route: "AJNI-NGP" },
        { id: "S1", type: "STARTER", status: "RED", coords: { x: 810, y: 180 }, route: "P1-OUT" },
        { id: "S2", type: "STARTER", status: "RED", coords: { x: 810, y: 230 }, route: "P2-OUT" },
        { id: "S3", type: "STARTER", status: "GREEN", coords: { x: 810, y: 280 }, route: "P3-OUT" },
        { id: "S4", type: "STARTER", status: "RED", coords: { x: 810, y: 330 }, route: "P4-OUT" },
        { id: "S8", type: "STARTER", status: "YELLOW", coords: { x: 810, y: 450 }, route: "P8-OUT" },
        { id: "H2", type: "HOME", status: "RED", coords: { x: 1100, y: 115 }, route: "GONDIA-NGP" }
    ],
    routes: [
        { id: "R1", from: "AJNI", to: "NGP-P1", status: "AVAILABLE", path: "H1-P101A-S1" },
        { id: "R2", from: "AJNI", to: "NGP-P2", status: "LOCKED", path: "H1-P101B-S2" },
        { id: "R3", from: "NGP-P1", to: "GONDIA", status: "AVAILABLE", path: "S1-P102A-H2" },
        { id: "R4", from: "NGP-P8", to: "GONDIA", status: "SET", path: "S8-P104-H2" }
    ],
    interlocks: [
        { points: ["P101A", "P101B"], signals: ["H1"], condition: "MUTUALLY_EXCLUSIVE" },
        { points: ["P102A", "P102B"], signals: ["S1", "S2"], condition: "DEPENDENT" }
    ]
};

// --- UTILITY FUNCTIONS ---
const getStatusColor = (status) => {
    switch (status) { 
        case "RUNNING": return "bg-green-600"; 
        case "STOPPED": return "bg-red-600"; 
        case "APPROACHING": return "bg-yellow-500 text-black"; 
        default: return "bg-gray-600";
    }
};

const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getSignalColor = (status) => {
    if (status === "GREEN") return "#22c55e";
    if (status === "YELLOW") return "#facc15";
    if (status === "DOUBLE_YELLOW") return "#fbbf24";
    return "#ef4444";
};

// --- SVG Sub-Components ---
const PointSwitch = ({ point, onToggle }) => {
    const { x, y } = point.coords;
    const isReverse = point.position === 'REVERSE';
    const color = point.status === 'WORKING' ? '#00BFFF' : '#ef4444';
    const maintenanceColor = point.status === 'MAINTENANCE' ? '#FFA500' : 'transparent';
    const lockedColor = point.locked ? '#FFD700' : 'transparent';
    const pathNormal = `M ${x-20} ${y} H ${x+20} M ${x+20} ${y} L ${x+5} ${y+15}`;
    const pathReverse = `M ${x-20} ${y} H ${x+20} M ${x-20} ${y} L ${x-5} ${y-15}`;
    
    return (
        <g onClick={() => onToggle && !point.locked && point.status === 'WORKING' && onToggle(point.id)}>
            <path d={isReverse ? pathReverse : pathNormal} stroke={color} strokeWidth="3" fill="none" 
                  style={{ transition: 'd 0.5s ease-in-out', cursor: !point.locked && point.status === 'WORKING' ? 'pointer' : 'not-allowed' }} />
            <circle cx={x} cy={y} r="8" fill={maintenanceColor} opacity="0.6" />
            <circle cx={x} cy={y} r="6" stroke={lockedColor} strokeWidth="2" fill="transparent" />
            <text x={x+25} y={y-10} fill="#FFF" fontSize="10" fontWeight="bold">{point.id}</text>
        </g>
    );
};

const SignalPost = ({ signal, onToggle }) => {
    const { x, y } = signal.coords;
    const color = getSignalColor(signal.status);
    
    return (
        <g onClick={() => onToggle && onToggle(signal.id)} style={{ cursor: 'pointer' }}>
            <rect x={x-1} y={y-15} width="2" height="15" fill="#a0aec0" />
            <circle cx={x} cy={y-20} r="5" fill={color} stroke="white" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount={signal.status === "RED" ? "0" : "indefinite"} />
            </circle>
            <text x={x+8} y={y-25} fill="#FFF" fontSize="10" fontWeight="bold">{signal.id}</text>
        </g>
    );
};

const TrainIndicator = ({ train, position, isMoving }) => {
    const { x, y } = position;
    
    return (
        <g>
            <motion.rect
                x={x-40}
                y={y-12}
                width="80"
                height="24"
                rx="4"
                fill="#a51209"
                stroke="#FFC0CB"
                strokeWidth="2"
                initial={isMoving ? { x: x-200 } : false}
                animate={isMoving ? { x: x } : false}
                transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.text
                x={x}
                y={y+5}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                initial={isMoving ? { x: x-200 } : false}
                animate={isMoving ? { x: x } : false}
                transition={{ duration: 2, ease: "easeInOut" }}
            >
                {train.id}
            </motion.text>
        </g>
    );
};

const NagpurYardLayout = ({ activeTrains, points, signals, onPointToggle, onSignalToggle, trackOccupancy = {} }) => {
    const trainPositions = {
        "P1": { x: 700, y: 180 },
        "P2": { x: 700, y: 230 },
        "P3": { x: 700, y: 280 },
        "P4": { x: 700, y: 280 },
        "P5": { x: 700, y: 330 },
        "P6": { x: 700, y: 330 },
        "P7": { x: 700, y: 380 },
        "P8": { x: 700, y: 450 }
    };
    
    return (
        <div className="relative bg-[#0A1A30] w-full h-[580px] p-2 overflow-hidden rounded-lg border-2 border-[#073f7c]">
            {/* Track Occupancy Legend */}
            <div className="absolute top-2 right-2 bg-gray-800 px-3 py-2 rounded shadow text-xs">
                <div className="font-bold text-yellow-400 mb-1">Track Occupancy</div>
                <div className="grid grid-cols-2 gap-1">
                    {Object.entries(trackOccupancy).map(([section, trainId]) => (
                        <div key={section} className="flex justify-between items-center">
                            <span className="text-gray-300">{section}</span>
                            <span className={`px-2 py-1 rounded text-xs ${trainId ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-400'}`}>{trainId || 'CLEAR'}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute top-0 left-0 w-full flex justify-center">
                <div className="bg-[#073f7c] text-center py-2 px-4 rounded-b-lg">
                    <h2 className="text-lg font-bold text-[#FFA500]">NAGPUR (NGP) YARD CONTROL</h2>
                </div>
            </div>
            
            <div className="flex justify-between mt-12 mx-6 mb-2">
                <div className="bg-[#073f7c] px-4 py-1 rounded text-white font-bold">TO AJNI</div>
                <div className="bg-[#073f7c] px-4 py-1 rounded text-white font-bold">CENTRAL TRAIN CONTROL</div>
                <div className="bg-[#073f7c] px-4 py-1 rounded text-white font-bold">TO GONDIA</div>
            </div>
            
            <svg width="100%" height="90%" viewBox="0 0 1400 500">
                {/* Base tracks */}
                <g className="tracks" stroke="#00BFFF" strokeWidth="3" fill="none">
                    {/* Main Lines */}
                    <path d="M0 100 H300" />
                    <path d="M0 130 H300" />
                    <path d="M1100 100 H1400" />
                    <path d="M1100 130 H1400" />
                    
                    {/* Passenger Yard */}
                    <g className="passenger-yard">
                        <path d="M400 180 H800" />
                        <path d="M400 230 H800" />
                        <path d="M400 280 H800" />
                        <path d="M400 330 H800" />
                        <path d="M400 380 H800" />
                        <path d="M300 100 C 350 100, 350 180, 400 180" />
                        <path d="M300 130 C 350 130, 350 230, 400 230" />
                        <path d="M320 130 C 370 130, 370 280, 400 280" />
                        <path d="M340 130 C 390 130, 390 330, 400 330" />
                        <path d="M350 130 C 400 130, 400 380, 400 380" />
                    </g>
                    
                    {/* Goods Yard */}
                    <g className="goods-yard">
                        <path d="M400 450 H800" />
                        <path d="M400 480 H800" strokeDasharray="5" />
                        <path d="M300 130 L 350 250 C 375 350, 375 450, 400 450" />
                    </g>
                    
                    {/* Exit Connections */}
                    <path d="M800 180 C 850 180, 850 100, 1100 100" />
                    <path d="M800 230 C 950 230, 950 130, 1100 130" />
                    <path d="M800 280 C 900 280, 900 130, 1100 130" />
                    <path d="M800 330 C 870 330, 870 130, 1100 130" />
                    <path d="M800 380 C 870 380, 870 130, 1100 130" />
                    <path d="M800 450 C 950 450, 950 130, 1100 130" />
                </g>
                
                {/* Point switches */}
                {points.map(p => <PointSwitch key={p.id} point={p} onToggle={onPointToggle} />)}
                
                {/* Signals */}
                {signals.map(s => (
                    <SignalPost key={s.id} signal={s} onToggle={onSignalToggle} />
                ))}
                {/* Signal Status Legend */}
                <g>
                    {signals.map((s, idx) => (
                        <text key={s.id} x={1200} y={30 + idx * 18} fontSize="12" fill={s.status === 'GREEN' ? '#22c55e' : s.status === 'YELLOW' ? '#facc15' : '#ef4444'}>
                            {s.id}: {s.status}
                        </text>
                    ))}
                </g>
                
                {/* Platform indicators */}
                <g>
                    <rect x="400" y="170" width="400" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    <rect x="400" y="220" width="400" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    <rect x="400" y="270" width="400" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    <rect x="400" y="320" width="400" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    <rect x="400" y="370" width="400" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    <rect x="400" y="440" width="400" height="20" rx="2" fill="#10693b" opacity="0.6" />
                </g>
                
                {/* Platform labels */}
                <g fill="white">
                    <text x="600" y="165" fontSize="12" textAnchor="middle">P.F. 1</text>
                    <text x="600" y="215" fontSize="12" textAnchor="middle">P.F. 2</text>
                    <text x="600" y="265" fontSize="12" textAnchor="middle">P.F. 3 & 4</text>
                    <text x="600" y="315" fontSize="12" textAnchor="middle">P.F. 5 & 6</text>
                    <text x="600" y="365" fontSize="12" textAnchor="middle">P.F. 7</text>
                    <text x="600" y="435" fontSize="12" textAnchor="middle">P.F. 8</text>
                </g>
                
                {/* Grid lines for reference (subtle) */}
                <g stroke="#1a365d" strokeWidth="1" opacity="0.2">
                    {[...Array(14)].map((_, i) => (
                        <line key={`vl-${i}`} x1={i*100} y1="0" x2={i*100} y2="500" />
                    ))}
                    {[...Array(5)].map((_, i) => (
                        <line key={`hl-${i}`} x1="0" y1={i*100 + 50} x2="1400" y2={i*100 + 50} />
                    ))}
                </g>
                
                {/* Train indicators */}
                {activeTrains.map(train => {
                    let pos = null;
                    let isMoving = false;
                    if (train.position.platform) {
                        pos = trainPositions[train.position.platform];
                    } else if (train.position.section === "AJNI-NGP") {
                        pos = { x: 200, y: 115 };
                        isMoving = train.speed > 0;
                    } else if (train.position.section === "NGP-G") {
                        pos = { x: 1200, y: 115 };
                        isMoving = train.speed > 0;
                    } else if (train.position.section === "BTBR-AJNI") {
                        pos = { x: 100, y: 115 };
                        isMoving = train.speed > 0;
                    }
                    if (pos) {
                        return (
                            <TrainIndicator 
                                key={train.id} 
                                train={train} 
                                position={pos} 
                                isMoving={isMoving} 
                            />
                        );
                    }
                    return null;
                })}
                
                {/* Control room elements */}
                <rect x="500" y="40" width="400" height="60" rx="10" fill="#073f7c" opacity="0.7" stroke="#9EADC8" strokeWidth="2" />
                <text x="700" y="75" fill="#FFA500" fontSize="16" textAnchor="middle" fontWeight="bold">DISPATCH CONTROL PANEL</text>
                
                {/* Legend */}
                <g transform="translate(20, 490)">
                    <circle cx="10" cy="0" r="5" fill="#ef4444" />
                    <text x="20" y="4" fontSize="10" fill="white">RED</text>
                    
                    <circle cx="60" cy="0" r="5" fill="#facc15" />
                    <text x="70" y="4" fontSize="10" fill="white">YELLOW</text>
                    
                    <circle cx="130" cy="0" r="5" fill="#22c55e" />
                    <text x="140" y="4" fontSize="10" fill="white">GREEN</text>
                    
                    <rect x="190" y="-5" width="10" height="10" fill="#10693b" opacity="0.6" />
                    <text x="205" y="4" fontSize="10" fill="white">PLATFORM</text>
                    
                    <path d="M 250 0 H 270 M 270 0 L 260 -5" stroke="#00BFFF" strokeWidth="2" fill="none" />
                    <text x="280" y="4" fontSize="10" fill="white">POINT</text>
                </g>
            </svg>
            
            {/* Alarm Log */}
            <div className="absolute bottom-2 left-2 bg-gray-800 px-3 py-2 rounded shadow text-xs max-h-32 overflow-y-auto w-96">
                <div className="font-bold text-yellow-400 mb-1">Alarm Log</div>
                {Array.isArray(window.__activeAlarms) && window.__activeAlarms.length > 0 ? (
                    window.__activeAlarms.slice(-6).reverse().map(alarm => (
                        <div key={alarm.id} className={`mb-1 px-2 py-1 rounded ${alarm.severity === 'CRITICAL' ? 'bg-red-900 text-red-200' : alarm.severity === 'HIGH' ? 'bg-yellow-900 text-yellow-200' : 'bg-blue-900 text-blue-200'}`}>
                            <span className="font-bold">[{alarm.type}]</span> {alarm.message}
                        </div>
                    ))
                ) : (
                    <div className="text-gray-400">No alarms</div>
                )}
            </div>
            <div className="absolute bottom-2 right-2 bg-[#073f7c] px-2 py-1 rounded">
                <div className="text-xs text-[#FFA500]">SYSTEM STATUS: OPERATIONAL</div>
            </div>
        </div>
    );
};

// --- MAIN VIEWER COMPONENT ---
const TrainControlViewer = () => {
    const [railwayData, setRailwayData] = useState(initialRailwayData);
    // Track occupancy: { section/platform: trainId }
    const [trackOccupancy, setTrackOccupancy] = useState({});
    const [selectedStation, setSelectedStation] = useState(railwayData.stations.find(s => s.code === 'NGP'));
    const [currentTime, setCurrentTime] = useState(new Date("2025-09-15T18:13:12+05:30"));
    const [activeAlarms, setActiveAlarms] = useState([
        { id: 1, type: "POINT_FAILURE", location: "P103", severity: "HIGH", timestamp: "2025-09-15T18:02:10Z", acknowledged: false, message: "Point P103 failed to move to normal position" },
        { id: 2, type: "HOT_AXLE_DETECTED", location: "Train 12621", severity: "CRITICAL", timestamp: "2025-09-15T18:04:30Z", acknowledged: false, message: "Hot axle detected on coach S9 of Tamil Nadu Exp" },
    ]);
    const [lastAction, setLastAction] = useState(null);
    const [trainSimulation, setTrainSimulation] = useState(false);
    const [showStationDemo, setShowStationDemo] = useState(true); // Auto-show 3D station
    const simulationRef = useRef(null);

    useEffect(() => {
        // Real-time clock
        const clockInterval = setInterval(() => {
            setCurrentTime(prevTime => new Date(prevTime.getTime() + 1000));
        }, 1000);
        
        return () => clearInterval(clockInterval);
    }, []);

    // Simulated train movements
    useEffect(() => {
        if (trainSimulation) {
            simulationRef.current = setInterval(() => {
                setRailwayData(prev => {
                    const updatedTrains = [...prev.active_trains];
                    const newTrackOccupancy = { ...trackOccupancy };
                    // Clear previous occupancy
                    Object.keys(newTrackOccupancy).forEach(key => {
                        newTrackOccupancy[key] = null;
                    });
                    // Update each train based on its status
                    // --- Professional Train Movement Logic ---
                    updatedTrains.forEach((train, index) => {
                        // --- Helper Functions ---
                        const getSignalForSection = (section) => {
                            if (section === "BTBR-AJNI") return prev.signals.find(s => s.route === "BTBR-AJNI");
                            if (section === "AJNI-NGP") return prev.signals.find(s => s.route === "AJNI-NGP");
                            if (section === "NGP-G") return prev.signals.find(s => s.route === "GONDIA-NGP");
                            return null;
                        };
                        const isSectionClear = (section) => !newTrackOccupancy[section];
                        const isSignalGreen = (signal) => signal && signal.status === "GREEN";
                        // --- Point Logic ---
                        const getRequiredPoints = (section) => {
                            // Example: BTBR-AJNI requires P101A NORMAL, AJNI-NGP requires P102A NORMAL, NGPG requires P104 NORMAL
                            if (section === "BTBR-AJNI") return [{ id: "P101A", position: "NORMAL" }];
                            if (section === "AJNI-NGP") return [{ id: "P102A", position: "NORMAL" }];
                            if (section === "NGP-G") return [{ id: "P104", position: "NORMAL" }];
                            return [];
                        };
                        const arePointsSet = (section) => {
                            const required = getRequiredPoints(section);
                            return required.every(req => {
                                const pt = prev.points.find(p => p.id === req.id);
                                return pt && pt.position === req.position && pt.status === "WORKING" && !pt.locked;
                            });
                        };
                        // --- RUNNING ---
                        if (train.status === "RUNNING") {
                            let canMove = false;
                            let nextSection = train.position.section;
                            let signal = getSignalForSection(nextSection);
                            if (isSignalGreen(signal) && isSectionClear(nextSection) && arePointsSet(nextSection)) {
                                canMove = true;
                            }
                            if (canMove) {
                                // Move train
                                if (train.position.section === "BTBR-AJNI") {
                                    train.position.km_from_WR += 0.1;
                                    newTrackOccupancy["BTBR-AJNI"] = train.id;
                                    if (train.position.km_from_WR > 75.8) {
                                        train.position = { section: "AJNI-NGP", km_from_WR: 76.0 };
                                    }
                                } else if (train.position.section === "AJNI-NGP") {
                                    train.position.km_from_WR += 0.1;
                                    newTrackOccupancy["AJNI-NGP"] = train.id;
                                    if (train.position.km_from_WR >= 78.7) {
                                        // Train has arrived at station
                                        let platform = "P1";
                                        // Find available platform
                                        const occupiedPlatforms = updatedTrains
                                            .filter(t => t.position.platform)
                                            .map(t => t.position.platform);
                                        for (let i = 1; i <= 8; i++) {
                                            if (!occupiedPlatforms.includes(`P${i}`)) {
                                                platform = `P${i}`;
                                                break;
                                            }
                                        }
                                        train.position = { station: "NGP", platform };
                                        train.status = "STOPPED";
                                        train.speed = 0;
                                        newTrackOccupancy[platform] = train.id;
                                        // Add arrival notification
                                        setActiveAlarms(alarms => [...alarms, {
                                            id: Date.now(),
                                            type: "TRAIN_ARRIVED",
                                            location: `NGP-${platform}`,
                                            severity: "INFO",
                                            timestamp: new Date().toISOString(),
                                            acknowledged: false,
                                            message: `Train ${train.id} (${train.name}) arrived at platform ${platform}`
                                        }]);
                                    }
                                } else if (train.position.section === "NGP-G") {
                                    train.position.km_from_WR += 0.1;
                                    newTrackOccupancy["NGP-G"] = train.id;
                                    // Train exiting the visible area
                                    if (train.position.km_from_WR > 130) {
                                        // Remove train from simulation or reset position
                                        updatedTrains.splice(index, 1);
                                    }
                                }
                            } else {
                                // Train waits for signal, clear track, or correct points
                                train.speed = 0;
                                // Alarm for incorrect points
                                if (!arePointsSet(nextSection)) {
                                    setActiveAlarms(alarms => [...alarms, {
                                        id: Date.now(),
                                        type: "POINT_MISMATCH",
                                        location: nextSection,
                                        severity: "HIGH",
                                        timestamp: new Date().toISOString(),
                                        acknowledged: false,
                                        message: `Train ${train.id} cannot proceed: points not set for ${nextSection}`
                                    }]);
                                }
                            }
                        }
                        // --- APPROACHING ---
                        else if (train.status === "APPROACHING") {
                            train.status = "RUNNING";
                        }
                        // --- STOPPED ---
                        else if (train.status === "STOPPED") {
                            // Randomly depart some trains
                            if (Math.random() < 0.01) { // 1% chance each interval
                                train.status = "RUNNING";
                                train.speed = 30 + Math.floor(Math.random() * 50);
                                train.position = { 
                                    section: "NGP-G", 
                                    km_from_WR: 85.0
                                };
                                newTrackOccupancy["NGP-G"] = train.id;
                                // Add departure notification
                                setActiveAlarms(alarms => [...alarms, {
                                    id: Date.now(),
                                    type: "TRAIN_DEPARTED",
                                    location: `NGP`,
                                    severity: "INFO",
                                    timestamp: new Date().toISOString(),
                                    acknowledged: false,
                                    message: `Train ${train.id} (${train.name}) departed from platform ${train.position.platform}`
                                }]);
                            } else if (train.position.platform) {
                                newTrackOccupancy[train.position.platform] = train.id;
                            }
                        }
                    });
                    // Randomly add new train at 3% chance
                    if (Math.random() < 0.003) {
                        const trainIds = ["16031", "22619", "12723", "12810", "12441"];
                        const trainNames = ["Andaman Express", "Tirunelveli Exp", "Telangana Express", "Howrah Mail", "Shatabdi Express"];
                        const randomId = trainIds[Math.floor(Math.random() * trainIds.length)];
                        const randomName = trainNames[Math.floor(Math.random() * trainNames.length)];
                        updatedTrains.push({
                            id: randomId,
                            name: randomName,
                            position: { section: "BTBR-AJNI", km_from_WR: 60.0 },
                            speed: 70 + Math.floor(Math.random() * 40),
                            status: "RUNNING",
                            scheduled_arrival: new Date(currentTime.getTime() + 10*60000).toISOString(),
                            delayed_by_min: Math.floor(Math.random() * 10),
                            direction: "UP"
                        });
                        newTrackOccupancy["BTBR-AJNI"] = randomId;
                        // Add notification for new train
                        setActiveAlarms(alarms => [...alarms, {
                            id: Date.now(),
                            type: "NEW_TRAIN",
                            location: "BTBR-AJNI",
                            severity: "INFO",
                            timestamp: new Date().toISOString(),
                            acknowledged: false,
                            message: `Train ${randomId} (${randomName}) approaching from BTBR`
                        }]);
                    }
                    setTrackOccupancy(newTrackOccupancy);
                    return { ...prev, active_trains: updatedTrains };
                });
            }, 500);
        } else {
            if (simulationRef.current) {
                clearInterval(simulationRef.current);
            }
        }
        return () => {
            if (simulationRef.current) {
                clearInterval(simulationRef.current);
            }
        };
    }, [trainSimulation, currentTime]);

    const handleStationClick = (station) => {
        setSelectedStation(station);
        setLastAction(`Selected station: ${station.name}`);
    };

    const acknowledgeAlarm = (alarmId) => {
        setActiveAlarms(alarms => alarms.map(alarm => 
            alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
        ));
        setLastAction(`Alarm ${alarmId} acknowledged`);
    };

    const handlePointToggle = (pointId) => {
        setRailwayData(prevData => {
            const newPoints = prevData.points.map(point => 
                point.id === pointId 
                    ? { ...point, position: point.position === "NORMAL" ? "REVERSE" : "NORMAL" } 
                    : point
            );
            return { ...prevData, points: newPoints };
        });
        setLastAction(`Point ${pointId} position toggled`);
    };

    const handleSignalToggle = (signalId) => {
        setRailwayData(prevData => {
            const newSignals = prevData.signals.map(signal => {
                if (signal.id === signalId) {
                    // Cycle through signal states: RED -> YELLOW -> GREEN -> RED
                    let newStatus;
                    if (signal.status === "RED") newStatus = "YELLOW";
                    else if (signal.status === "YELLOW") newStatus = "GREEN";
                    else newStatus = "RED";
                    
                    return { ...signal, status: newStatus };
                }
                return signal;
            });
            return { ...prevData, signals: newSignals };
        });
        setLastAction(`Signal ${signalId} state changed`);
    };

    const toggleSimulation = () => {
        setTrainSimulation(!trainSimulation);
        setLastAction(trainSimulation ? "Simulation paused" : "Simulation started");
    };

    // Expose alarms for NagpurYardLayout
    window.__activeAlarms = activeAlarms;
    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <header className="bg-[#073f7c] p-4 shadow-md border-b-2 border-[#FFA500] flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#FFA500] rounded-full flex items-center justify-center mr-4">
                        <span className="font-bold text-[#073f7c] text-lg">IR</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">SignalSense</h1>
                        <p className="text-sm text-gray-300">Railway Traffic Management System</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                        <div className="text-sm text-gray-400">Current Time</div>
                        <div className="font-mono font-bold text-white">{currentTime.toLocaleTimeString()}</div>
                    </div>
                    <button 
                        onClick={toggleSimulation}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${trainSimulation ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {trainSimulation ? 'Pause Live Data' : 'Start Live Data'}
                    </button>
                </div>
            </header>
            
            <main className="container mx-auto p-4">
                {/* Main 3D Station Simulation */}
                <div className="mb-8">
                    <RailwayStationSimulation />
                </div>
                
                {/* Secondary Controls and Data */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 flex flex-col gap-4">
                        <div className="bg-[#0A1A30] p-4 rounded-lg shadow-lg border border-[#073f7c]">
                            <h2 className="text-lg font-semibold mb-4 text-[#FFA500] border-b border-gray-700 pb-2">Route Stations: Wardha ↔ Gondia <span className="text-xs text-gray-400">{railwayData.stations[0].km} - {railwayData.stations[railwayData.stations.length-1].km} km, Distance: {(railwayData.stations[railwayData.stations.length-1].km - railwayData.stations[0].km).toFixed(1)} km</span></h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                {railwayData.stations.map(station => (
                                    <motion.div 
                                        key={station.code} 
                                        whileHover={{ y: -2 }} 
                                        onClick={() => handleStationClick(station)} 
                                        className={`p-2 text-center rounded-md cursor-pointer transition-all border-2 ${
                                            selectedStation?.code === station.code 
                                                ? 'bg-blue-800 border-blue-400' 
                                                : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                                        }`}
                                    >
                                        <div className="font-bold">{station.code}</div>
                                        <div className="text-xs text-gray-300">{station.name}</div>
                                        <div className="text-xs text-gray-400">{station.km} km</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <NagpurYardLayout 
                            activeTrains={railwayData.active_trains.filter(train => 
                                (train.position.station === selectedStation?.code) || 
                                train.position.section?.includes(selectedStation?.code)
                            )} 
                            points={railwayData.points}
                            signals={railwayData.signals}
                            onPointToggle={handlePointToggle}
                            onSignalToggle={handleSignalToggle}
                            trackOccupancy={trackOccupancy}
                        />
                        
                        <div className="bg-[#0A1A30] p-4 rounded-lg shadow-lg border border-[#073f7c]">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                                <h2 className="text-lg font-semibold text-[#FFA500]">Live Train Traffic</h2>
                                <div className="text-sm">
                                    <span className="text-gray-400">Last action: </span>
                                    <span className="font-mono">{lastAction || "No actions yet"}</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="py-2 px-3 text-left">Train</th>
                                            <th className="py-2 px-3 text-left">Location</th>
                                            <th className="py-2 px-3 text-right">Speed</th>
                                            <th className="py-2 px-3 text-center">Status</th>
                                            <th className="py-2 px-3 text-right">ETA/ETD</th>
                                            <th className="py-2 px-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {railwayData.active_trains.map(train => (
                                            <tr key={train.id} className="hover:bg-gray-800/50">
                                                <td className="py-3 px-3">
                                                    <div className="font-medium">{train.id}</div>
                                                    <div className="text-xs text-gray-400">{train.name}</div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    {train.position.station 
                                                        ? `${train.position.station} (PF ${train.position.platform})` 
                                                        : `${train.position.section} @ KM ${train.position.km_from_WR.toFixed(1)}`
                                                    }
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    {train.speed} km/h
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(train.status)}`}>
                                                        {train.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    {formatTime(train.scheduled_arrival || train.scheduled_departure)}
                                                    {train.delayed_by_min > 0 && (
                                                        <div className="text-xs text-red-400">+{train.delayed_by_min}m</div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <button className="px-2 py-1 bg-blue-700 hover:bg-blue-800 rounded text-xs">
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div>
                        <TrainControlOperator 
                            alarms={activeAlarms} 
                            onAcknowledgeAlarm={acknowledgeAlarm} 
                            points={railwayData.points} 
                            signals={railwayData.signals}
                            onPointChange={handlePointToggle}
                            onSignalChange={handleSignalToggle}
                            currentTime={currentTime}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TrainControlViewer;