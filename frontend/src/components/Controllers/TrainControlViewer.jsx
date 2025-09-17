import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ENRICHED DATA with SIGNALS, POINTS, and ROUTES ---
const initialRailwayData = {
    stations: [
        { code: "WR", name: "Wardha Jn", km: 0.0, platformCount: 2, trackLines: 2 },
        { code: "SEGM", name: "Sewagram", km: 2.6, platformCount: 2, trackLines: 2 },
        { code: "BTBR", name: "Butibori", km: 51.3, platformCount: 2, trackLines: 2 },
        { code: "AJNI", name: "Ajni", km: 75.9, platformCount: 4, trackLines: 4 },
        { code: "NGP", name: "Nagpur Jn", km: 78.8, platformCount: 8, trackLines: 6 },
        { code: "G", name: "Gondia Jn", km: 208.4, platformCount: 2, trackLines: 2 }
    ],
    active_trains: [
        { id: "12859", name: "Gitanjali Express", position: { section: "BTBR-AJNI", km_from_WR: 70.1 }, speed: 88, status: "RUNNING", scheduled_arrival: "2025-09-16T18:15:00Z", delayed_by_min: 5, direction: "UP" },
        { id: "12130", name: "Azad Hind Express", position: { section: "NGP-G", km_from_WR: 95.8 }, speed: 105, status: "RUNNING", scheduled_arrival: "2025-09-16T19:30:00Z", delayed_by_min: 0, direction: "DOWN" },
        { id: "12621", name: "Tamil Nadu Exp", position: { station: "NGP", platform: "P1" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-16T18:10:00Z", delayed_by_min: 21, direction: "UP" },
        { id: "22691", name: "Rajdhani Express", position: { station: "NGP", platform: "P2" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-16T18:08:00Z", delayed_by_min: 8, direction: "DOWN" },
        { id: "12289", name: "CSMT NGP Duronto", position: { section: "AJNI-NGP", km_from_WR: 78.1 }, speed: 25, status: "APPROACHING", scheduled_arrival: "2025-09-16T18:14:00Z", delayed_by_min: 2, direction: "UP" },
        { id: "12649", name: "Sampark Kranti", position: { station: "NGP", platform: "P6" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-16T18:20:00Z", delayed_by_min: 28, direction: "DOWN" },
        { id: "16032", name: "Andaman Express", position: { station: "WR", platform: "P1" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-16T18:30:00Z", delayed_by_min: 0, direction: "UP" },
        { id: "12860", name: "Gitanjali Express", position: { station: "SEGM", platform: "P1" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-16T18:15:00Z", delayed_by_min: 10, direction: "DOWN" },
        { id: "12724", name: "Telangana Express", position: { station: "BTBR", platform: "P2" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-16T18:40:00Z", delayed_by_min: 5, direction: "UP" },
        { id: "12442", name: "Rajdhani Express", position: { section: "AJNI-NGP", km_from_WR: 77.5 }, speed: 35, status: "APPROACHING", scheduled_arrival: "2025-09-16T18:25:00Z", delayed_by_min: 0, direction: "DOWN" },
        { id: "12619", name: "Matsyagandha Exp", position: { station: "AJNI", platform: "P1" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-16T18:12:00Z", delayed_by_min: 15, direction: "UP" },
        { id: "18030", name: "Shalimar Express", position: { station: "G", platform: "P2" }, speed: 0, status: "STOPPED", scheduled_departure: "2025-09-16T18:05:00Z", delayed_by_min: 20, direction: "DOWN" },
    ],
    points: [
        // NGP Points
        { id: "P101A", position: "NORMAL", locked: true, status: "WORKING", coords: { x: 350, y: 115 }, stationCode: "NGP" },
        { id: "P101B", position: "REVERSE", locked: true, status: "WORKING", coords: { x: 350, y: 205 }, stationCode: "NGP" },
        { id: "P102A", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 1050, y: 165 }, stationCode: "NGP" },
        { id: "P102B", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 1050, y: 205 }, stationCode: "NGP" },
        { id: "P103", position: "REVERSE", locked: false, status: "MAINTENANCE", coords: { x: 370, y: 305 }, stationCode: "NGP" },
        { id: "P104", position: "NORMAL", locked: true, status: "WORKING", coords: { x: 370, y: 450 }, stationCode: "NGP" },
        
        // WR Points (2 track lines)
        { id: "WR101", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 300, y: 175 }, stationCode: "WR" },
        { id: "WR102", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 800, y: 175 }, stationCode: "WR" },
        
        // SEGM Points (2 track lines)
        { id: "SEGM101", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 300, y: 175 }, stationCode: "SEGM" },
        { id: "SEGM102", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 800, y: 175 }, stationCode: "SEGM" },
        
        // BTBR Points (2 track lines)
        { id: "BTBR101", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 300, y: 175 }, stationCode: "BTBR" },
        { id: "BTBR102", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 800, y: 175 }, stationCode: "BTBR" },
        
        // AJNI Points (4 track lines)
        { id: "AJNI101", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 300, y: 150 }, stationCode: "AJNI" },
        { id: "AJNI102", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 300, y: 200 }, stationCode: "AJNI" },
        { id: "AJNI103", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 800, y: 150 }, stationCode: "AJNI" },
        { id: "AJNI104", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 800, y: 200 }, stationCode: "AJNI" },
        
        // G Points (2 track lines)
        { id: "G101", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 300, y: 175 }, stationCode: "G" },
        { id: "G102", position: "NORMAL", locked: false, status: "WORKING", coords: { x: 800, y: 175 }, stationCode: "G" },
    ],
    signals: [
        // NGP Signals
        { id: "H1", type: "HOME", status: "YELLOW", coords: { x: 280, y: 115 }, route: "AJNI-NGP", stationCode: "NGP" },
        { id: "S1", type: "STARTER", status: "RED", coords: { x: 810, y: 180 }, route: "P1-OUT", stationCode: "NGP" },
        { id: "S2", type: "STARTER", status: "RED", coords: { x: 810, y: 230 }, route: "P2-OUT", stationCode: "NGP" },
        { id: "S3", type: "STARTER", status: "GREEN", coords: { x: 810, y: 280 }, route: "P3-OUT", stationCode: "NGP" },
        { id: "S4", type: "STARTER", status: "RED", coords: { x: 810, y: 330 }, route: "P4-OUT", stationCode: "NGP" },
        { id: "S8", type: "STARTER", status: "YELLOW", coords: { x: 810, y: 450 }, route: "P8-OUT", stationCode: "NGP" },
        { id: "H2", type: "HOME", status: "RED", coords: { x: 1100, y: 115 }, route: "GONDIA-NGP", stationCode: "NGP" },
        
        // WR Signals
        { id: "WR_H1", type: "HOME", status: "GREEN", coords: { x: 250, y: 150 }, route: "ENTRY-WR", stationCode: "WR" },
        { id: "WR_H2", type: "HOME", status: "RED", coords: { x: 250, y: 200 }, route: "ENTRY-WR", stationCode: "WR" },
        { id: "WR_S1", type: "STARTER", status: "YELLOW", coords: { x: 850, y: 150 }, route: "EXIT-WR", stationCode: "WR" },
        { id: "WR_S2", type: "STARTER", status: "GREEN", coords: { x: 850, y: 200 }, route: "EXIT-WR", stationCode: "WR" },
        
        // SEGM Signals
        { id: "SEGM_H1", type: "HOME", status: "RED", coords: { x: 250, y: 150 }, route: "ENTRY-SEGM", stationCode: "SEGM" },
        { id: "SEGM_H2", type: "HOME", status: "YELLOW", coords: { x: 250, y: 200 }, route: "ENTRY-SEGM", stationCode: "SEGM" },
        { id: "SEGM_S1", type: "STARTER", status: "GREEN", coords: { x: 850, y: 150 }, route: "EXIT-SEGM", stationCode: "SEGM" },
        { id: "SEGM_S2", type: "STARTER", status: "RED", coords: { x: 850, y: 200 }, route: "EXIT-SEGM", stationCode: "SEGM" },
        
        // BTBR Signals
        { id: "BTBR_H1", type: "HOME", status: "YELLOW", coords: { x: 250, y: 150 }, route: "ENTRY-BTBR", stationCode: "BTBR" },
        { id: "BTBR_H2", type: "HOME", status: "GREEN", coords: { x: 250, y: 200 }, route: "ENTRY-BTBR", stationCode: "BTBR" },
        { id: "BTBR_S1", type: "STARTER", status: "RED", coords: { x: 850, y: 150 }, route: "EXIT-BTBR", stationCode: "BTBR" },
        { id: "BTBR_S2", type: "STARTER", status: "YELLOW", coords: { x: 850, y: 200 }, route: "EXIT-BTBR", stationCode: "BTBR" },
        
        // AJNI Signals (4 lines)
        { id: "AJNI_H1", type: "HOME", status: "GREEN", coords: { x: 250, y: 130 }, route: "ENTRY-AJNI", stationCode: "AJNI" },
        { id: "AJNI_H2", type: "HOME", status: "RED", coords: { x: 250, y: 180 }, route: "ENTRY-AJNI", stationCode: "AJNI" },
        { id: "AJNI_H3", type: "HOME", status: "YELLOW", coords: { x: 250, y: 230 }, route: "ENTRY-AJNI", stationCode: "AJNI" },
        { id: "AJNI_H4", type: "HOME", status: "GREEN", coords: { x: 250, y: 280 }, route: "ENTRY-AJNI", stationCode: "AJNI" },
        { id: "AJNI_S1", type: "STARTER", status: "RED", coords: { x: 850, y: 130 }, route: "EXIT-AJNI", stationCode: "AJNI" },
        { id: "AJNI_S2", type: "STARTER", status: "YELLOW", coords: { x: 850, y: 180 }, route: "EXIT-AJNI", stationCode: "AJNI" },
        { id: "AJNI_S3", type: "STARTER", status: "GREEN", coords: { x: 850, y: 230 }, route: "EXIT-AJNI", stationCode: "AJNI" },
        { id: "AJNI_S4", type: "STARTER", status: "RED", coords: { x: 850, y: 280 }, route: "EXIT-AJNI", stationCode: "AJNI" },
        
        // G Signals
        { id: "G_H1", type: "HOME", status: "RED", coords: { x: 250, y: 150 }, route: "ENTRY-G", stationCode: "G" },
        { id: "G_H2", type: "HOME", status: "GREEN", coords: { x: 250, y: 200 }, route: "ENTRY-G", stationCode: "G" },
        { id: "G_S1", type: "STARTER", status: "YELLOW", coords: { x: 850, y: 150 }, route: "EXIT-G", stationCode: "G" },
        { id: "G_S2", type: "STARTER", status: "RED", coords: { x: 850, y: 200 }, route: "EXIT-G", stationCode: "G" },
    ],
    routes: [
        { id: "R1", from: "AJNI", to: "NGP-P1", status: "AVAILABLE", path: "H1-P101A-S1" },
        { id: "R2", from: "AJNI", to: "NGP-P2", status: "LOCKED", path: "H1-P101B-S2" },
        { id: "R3", from: "NGP-P1", to: "GONDIA", status: "AVAILABLE", path: "S1-P102A-H2" },
        { id: "R4", from: "NGP-P8", to: "GONDIA", status: "SET", path: "S8-P104-H2" },
    ],
    interlocks: [
        { points: ["P101A", "P101B"], signals: ["H1"], condition: "MUTUALLY_EXCLUSIVE" },
        { points: ["P102A", "P102B"], signals: ["S1", "S2"], condition: "DEPENDENT" },
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

// --- TRACK COMPONENTS ---
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

// --- STATION LAYOUTS ---

// Layout for stations with 2 track lines (WR, SEGM, BTBR, G)
const TwoTrackStationLayout = ({ stationName, stationCode, activeTrains, points, signals, onPointToggle, onSignalToggle, trackOccupancy = {} }) => {
    const getTrainPosition = (train) => {
        if (train.position.platform) {
            return { x: 600, y: train.position.platform === "P1" ? 150 : 200 };
        } else if (train.position.section && train.position.section.includes(stationCode)) {
            return { x: 300, y: 150 };
        }
        return null;
    };

    const stationSignals = signals.filter(s => s.stationCode === stationCode || s.id.startsWith(stationCode));
    const stationPoints = points.filter(p => p.stationCode === stationCode || p.id.startsWith(stationCode));

    return (
        <div className="relative bg-slate-900/40 backdrop-blur-md w-full h-[580px] p-2 overflow-hidden rounded-lg border-2 border-blue-400/30">
            <div className="absolute top-0 left-0 w-full flex justify-center">
                <div className="bg-slate-800/40 backdrop-blur-md text-center py-2 px-4 rounded-b-lg border border-blue-400/30">
                    <h2 className="text-lg font-bold text-[#FFA500]">{stationName} ({stationCode}) - 2 TRACK STATION</h2>
                </div>
            </div>
            
            <div className="flex justify-between mt-12 mx-6 mb-2">
                <div className="bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded text-white font-bold border border-blue-400/30">INCOMING</div>
                <div className="bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded text-white font-bold border border-blue-400/30">CENTRAL TRAIN CONTROL</div>
                <div className="bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded text-white font-bold border border-blue-400/30">OUTGOING</div>
            </div>
            
            <svg width="100%" height="90%" viewBox="0 0 1200 400">
                {/* Base tracks - 2 main lines */}
                <g className="tracks" stroke="#00BFFF" strokeWidth="4" fill="none">
                    <path d="M0 150 H1200" />
                    <path d="M0 200 H1200" />
                    
                    {/* Platform indicators */}
                    <rect x="450" y="140" width="300" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    <rect x="450" y="190" width="300" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    
                    {/* Station building */}
                    <rect x="500" y="100" width="200" height="140" rx="5" stroke="#FFA500" strokeWidth="2" strokeDasharray="5,5" fill="rgba(255, 165, 0, 0.1)" />
                    <text x="600" y="90" fill="#FFA500" fontSize="16" textAnchor="middle" fontWeight="bold">STATION BUILDING</text>
                    
                    {/* Track numbers */}
                    <text x="50" y="145" fill="#FFF" fontSize="14" fontWeight="bold">TRACK 1</text>
                    <text x="50" y="195" fill="#FFF" fontSize="14" fontWeight="bold">TRACK 2</text>
                </g>
                
                {/* Signals */}
                {stationSignals.map(signal => (
                    <SignalPost key={signal.id} signal={signal} onToggle={onSignalToggle} />
                ))}
                
                {/* Points */}
                {stationPoints.map(point => (
                    <PointSwitch key={point.id} point={point} onToggle={onPointToggle} />
                ))}
                
                {/* Train indicators */}
                {activeTrains
                    .filter(train => 
                        train.position.station === stationCode || 
                        (train.position.section && train.position.section.includes(stationCode))
                    )
                    .map(train => {
                        const pos = getTrainPosition(train);
                        if (pos) {
                            return <TrainIndicator key={train.id} train={train} position={pos} isMoving={train.speed > 0} />;
                        }
                        return null;
                    })
                }
                
                {/* Platform labels */}
                <text x="600" y="135" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">PLATFORM 1</text>
                <text x="600" y="185" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">PLATFORM 2</text>
                
                {/* Grid lines for reference */}
                <g stroke="#1a365d" strokeWidth="1" opacity="0.3">
                    {[...Array(12)].map((_, i) => (
                        <line key={`vl-${i}`} x1={i*100} y1="0" x2={i*100} y2="400" />
                    ))}
                    {[...Array(4)].map((_, i) => (
                        <line key={`hl-${i}`} x1="0" y1={i*100 + 50} x2="1200" y2={i*100 + 50} />
                    ))}
                </g>
                
                {/* Signal status indicators */}
                <g transform="translate(950, 50)">
                    <rect x="0" y="0" width="200" height="120" rx="5" fill="rgba(0, 0, 0, 0.7)" stroke="#FFA500" strokeWidth="1" />
                    <text x="100" y="20" fill="#FFA500" fontSize="12" textAnchor="middle" fontWeight="bold">SIGNAL STATUS</text>
                    {stationSignals.slice(0, 4).map((signal, idx) => (
                        <g key={signal.id} transform={`translate(10, ${30 + idx * 20})`}>
                            <circle cx="10" cy="10" r="4" fill={getSignalColor(signal.status)} />
                            <text x="20" y="14" fill="white" fontSize="10">{signal.id}: {signal.status}</text>
                        </g>
                    ))}
                </g>
            </svg>
            
            {/* Track Occupancy Info */}
            <div className="absolute top-2 right-2 bg-slate-900/50 backdrop-blur-md px-3 py-2 rounded shadow text-xs border border-blue-400/30">
                <div className="font-bold text-yellow-400 mb-1">Track Occupancy</div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Track 1</span>
                        <span className={`px-2 py-1 rounded text-xs ${trackOccupancy[`${stationCode}-T1`] ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>
                            {trackOccupancy[`${stationCode}-T1`] ? 'OCCUPIED' : 'CLEAR'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Track 2</span>
                        <span className={`px-2 py-1 rounded text-xs ${trackOccupancy[`${stationCode}-T2`] ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>
                            {trackOccupancy[`${stationCode}-T2`] ? 'OCCUPIED' : 'CLEAR'}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Station info panel */}
            <div className="absolute bottom-2 left-2 bg-slate-900/50 backdrop-blur-md px-3 py-2 rounded shadow text-xs border border-blue-400/30">
                <div className="font-bold text-yellow-400 mb-1">Station Info</div>
                <div className="text-gray-300">
                    <div>Code: {stationCode}</div>
                    <div>Platforms: 2</div>
                    <div>Track Lines: 2</div>
                    <div>Status: Operational</div>
                </div>
            </div>
        </div>
    );
};

// Layout for Ajni station with 4 track lines
const AjniStationLayout = ({ activeTrains, points, signals, onPointToggle, onSignalToggle, trackOccupancy = {} }) => {
    const getTrainPosition = (train) => {
        if (train.position.platform) {
            const platformMap = { "P1": 130, "P2": 180, "P3": 230, "P4": 280 };
            return { x: 600, y: platformMap[train.position.platform] || 130 };
        } else if (train.position.section && train.position.section.includes("AJNI")) {
            return { x: 300, y: 150 };
        }
        return null;
    };

    const ajniSignals = signals.filter(s => s.stationCode === 'AJNI' || s.id.startsWith('AJNI'));
    const ajniPoints = points.filter(p => p.stationCode === 'AJNI' || p.id.startsWith('AJNI'));

    return (
        <div className="relative bg-slate-900/40 backdrop-blur-md w-full h-[580px] p-2 overflow-hidden rounded-lg border-2 border-blue-400/30">
            <div className="absolute top-0 left-0 w-full flex justify-center">
                <div className="bg-slate-800/40 backdrop-blur-md text-center py-2 px-4 rounded-b-lg border border-blue-400/30">
                    <h2 className="text-lg font-bold text-[#FFA500]">AJNI JUNCTION - 4 TRACK STATION</h2>
                </div>
            </div>
            
            <div className="flex justify-between mt-12 mx-6 mb-2">
                <div className="bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded text-white font-bold border border-blue-400/30">FROM BTBR</div>
                <div className="bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded text-white font-bold border border-blue-400/30">AJNI CONTROL ROOM</div>
                <div className="bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded text-white font-bold border border-blue-400/30">TO NGP</div>
            </div>
            
            <svg width="100%" height="90%" viewBox="0 0 1200 450">
                {/* Base tracks - 4 main lines for Ajni */}
                <g className="tracks" stroke="#00BFFF" strokeWidth="4" fill="none">
                    <path d="M0 130 H1200" />
                    <path d="M0 180 H1200" />
                    <path d="M0 230 H1200" />
                    <path d="M0 280 H1200" />
                    
                    {/* Platform indicators */}
                    <rect x="450" y="120" width="300" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    <rect x="450" y="170" width="300" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    <rect x="450" y="220" width="300" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    <rect x="450" y="270" width="300" height="20" rx="2" fill="#10693b" opacity="0.6" />
                    
                    {/* Station building */}
                    <rect x="500" y="80" width="200" height="240" rx="5" stroke="#FFA500" strokeWidth="2" strokeDasharray="5,5" fill="rgba(255, 165, 0, 0.1)" />
                    <text x="600" y="70" fill="#FFA500" fontSize="16" textAnchor="middle" fontWeight="bold">AJNI STATION BUILDING</text>
                    
                    {/* Track numbers */}
                    <text x="50" y="125" fill="#FFF" fontSize="14" fontWeight="bold">TRACK 1</text>
                    <text x="50" y="175" fill="#FFF" fontSize="14" fontWeight="bold">TRACK 2</text>
                    <text x="50" y="225" fill="#FFF" fontSize="14" fontWeight="bold">TRACK 3</text>
                    <text x="50" y="275" fill="#FFF" fontSize="14" fontWeight="bold">TRACK 4</text>
                    
                    {/* Junction connections */}
                    <path d="M 200 130 L 250 180" stroke="#00BFFF" strokeWidth="3" fill="none" strokeDasharray="3,3" />
                    <path d="M 200 230 L 250 180" stroke="#00BFFF" strokeWidth="3" fill="none" strokeDasharray="3,3" />
                    <path d="M 950 180 L 1000 130" stroke="#00BFFF" strokeWidth="3" fill="none" strokeDasharray="3,3" />
                    <path d="M 950 180 L 1000 230" stroke="#00BFFF" strokeWidth="3" fill="none" strokeDasharray="3,3" />
                </g>
                
                {/* Signals */}
                {ajniSignals.map(signal => (
                    <SignalPost key={signal.id} signal={signal} onToggle={onSignalToggle} />
                ))}
                
                {/* Points */}
                {ajniPoints.map(point => (
                    <PointSwitch key={point.id} point={point} onToggle={onPointToggle} />
                ))}
                
                {/* Train indicators */}
                {activeTrains
                    .filter(train => 
                        train.position.station === "AJNI" || 
                        (train.position.section && train.position.section.includes("AJNI"))
                    )
                    .map(train => {
                        const pos = getTrainPosition(train);
                        if (pos) {
                            return <TrainIndicator key={train.id} train={train} position={pos} isMoving={train.speed > 0} />;
                        }
                        return null;
                    })
                }
                
                {/* Platform labels */}
                <text x="600" y="115" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">PLATFORM 1</text>
                <text x="600" y="165" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">PLATFORM 2</text>
                <text x="600" y="215" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">PLATFORM 3</text>
                <text x="600" y="265" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">PLATFORM 4</text>
                
                {/* Grid lines for reference */}
                <g stroke="#1a365d" strokeWidth="1" opacity="0.3">
                    {[...Array(12)].map((_, i) => (
                        <line key={`vl-${i}`} x1={i*100} y1="0" x2={i*100} y2="450" />
                    ))}
                    {[...Array(5)].map((_, i) => (
                        <line key={`hl-${i}`} x1="0" y1={i*100 + 50} x2="1200" y2={i*100 + 50} />
                    ))}
                </g>
                
                {/* Signal status indicators */}
                <g transform="translate(950, 50)">
                    <rect x="0" y="0" width="200" height="180" rx="5" fill="rgba(0, 0, 0, 0.7)" stroke="#FFA500" strokeWidth="1" />
                    <text x="100" y="20" fill="#FFA500" fontSize="12" textAnchor="middle" fontWeight="bold">SIGNAL STATUS</text>
                    {ajniSignals.slice(0, 8).map((signal, idx) => (
                        <g key={signal.id} transform={`translate(10, ${30 + idx * 18})`}>
                            <circle cx="8" cy="8" r="3" fill={getSignalColor(signal.status)} />
                            <text x="18" y="12" fill="white" fontSize="9">{signal.id}: {signal.status}</text>
                        </g>
                    ))}
                </g>
            </svg>
            
            {/* Track Occupancy Info */}
            <div className="absolute top-2 right-2 bg-slate-900/50 backdrop-blur-md px-3 py-2 rounded shadow text-xs border border-blue-400/30">
                <div className="font-bold text-yellow-400 mb-1">Track Occupancy</div>
                <div className="space-y-1">
                    {[1,2,3,4].map(track => (
                        <div key={track} className="flex justify-between items-center">
                            <span className="text-gray-300">Track {track}</span>
                            <span className={`px-2 py-1 rounded text-xs ${trackOccupancy[`AJNI-T${track}`] ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>
                                {trackOccupancy[`AJNI-T${track}`] ? 'OCCUPIED' : 'CLEAR'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Station info panel */}
            <div className="absolute bottom-2 left-2 bg-slate-900/50 backdrop-blur-md px-3 py-2 rounded shadow text-xs border border-blue-400/30">
                <div className="font-bold text-yellow-400 mb-1">Station Info</div>
                <div className="text-gray-300">
                    <div>Code: AJNI</div>
                    <div>Platforms: 4</div>
                    <div>Track Lines: 4</div>
                    <div>Type: Junction</div>
                    <div>Status: Operational</div>
                </div>
            </div>
        </div>
    );
};

// Nagpur layout (keeping the complex multi-platform layout)
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

    const ngpSignals = signals.filter(s => s.stationCode === 'NGP' || (!s.stationCode && !s.id.includes('_')));
    const ngpPoints = points.filter(p => p.stationCode === 'NGP' || (!p.stationCode && !p.id.includes('101')));
    
    return (
        <div className="relative bg-slate-900/40 backdrop-blur-md w-full h-[580px] p-2 overflow-hidden rounded-lg border-2 border-blue-400/30">
            {/* Track Occupancy Legend */}
            <div className="absolute top-2 right-2 bg-slate-900/50 backdrop-blur-md px-3 py-2 rounded shadow text-xs border border-blue-400/30">
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
                <div className="bg-slate-800/40 backdrop-blur-md text-center py-2 px-4 rounded-b-lg border border-blue-400/30">
                    <h2 className="text-lg font-bold text-[#FFA500]">NAGPUR (NGP) YARD CONTROL</h2>
                </div>
            </div>
            
            <div className="flex justify-between mt-12 mx-6 mb-2">
                <div className="bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded text-white font-bold border border-blue-400/30">TO AJNI</div>
                <div className="bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded text-white font-bold border border-blue-400/30">CENTRAL TRAIN CONTROL</div>
                <div className="bg-slate-800/40 backdrop-blur-md px-4 py-1 rounded text-white font-bold border border-blue-400/30">TO GONDIA</div>
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
                {ngpPoints.map(p => <PointSwitch key={p.id} point={p} onToggle={onPointToggle} />)}
                
                {/* Signals */}
                {ngpSignals.map(s => (
                    <SignalPost key={s.id} signal={s} onToggle={onSignalToggle} />
                ))}
                
                {/* Signal Status Legend */}
                <g>
                    {ngpSignals.map((s, idx) => (
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
                <rect x="500" y="40" width="400" height="60" rx="10" fill="rgba(71, 85, 105, 0.3)" opacity="0.7" stroke="#60A5FA" strokeWidth="2" />
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
            <div className="absolute bottom-2 left-2 bg-slate-900/50 backdrop-blur-md px-3 py-2 rounded shadow text-xs max-h-32 overflow-y-auto w-96 border border-blue-400/30">
                <div className="font-bold text-yellow-400 mb-1">System Log</div>
                <div className="text-gray-400">All systems operational</div>
            </div>
            <div className="absolute bottom-2 right-2 bg-slate-800/40 backdrop-blur-md px-2 py-1 rounded border border-blue-400/30">
                <div className="text-xs text-[#FFA500]">SYSTEM STATUS: OPERATIONAL</div>
            </div>
        </div>
    );
};

// --- MAIN VIEWER COMPONENT ---
const TrainControlViewer = () => {
    const [railwayData, setRailwayData] = useState(initialRailwayData);
    const [trackOccupancy, setTrackOccupancy] = useState({});
    const [selectedStation, setSelectedStation] = useState(railwayData.stations.find(s => s.code === 'NGP'));
    const [currentTime, setCurrentTime] = useState(new Date("2025-09-16T15:33:52+05:30"));
    const [activeAlarms, setActiveAlarms] = useState([]);
    const [lastAction, setLastAction] = useState(null);
    const [trainSimulation, setTrainSimulation] = useState(false);
    const simulationRef = useRef(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

    // Add this useEffect for synchronizing with TrainControlOperator changes
    useEffect(() => {
        // Expose data to window object for cross-component communication
        window.__railwayData = railwayData;
        window.__selectedStation = selectedStation;
        window.__currentTime = currentTime;
        
        // Setup state setter function that will be called by the operator component
        window.__setRailwayData = (newDataOrUpdater) => {
            if (typeof newDataOrUpdater === 'function') {
                setRailwayData(prevData => {
                    const newData = newDataOrUpdater(prevData);
                    setLastUpdateTime(new Date());
                    return newData;
                });
            } else {
                setRailwayData(newDataOrUpdater);
                setLastUpdateTime(new Date());
            }
        };
        
        // Listen for update events from operator component
        const handleDataUpdate = () => {
            // This will be triggered when the Operator component updates data
            // and dispatches the 'railwayDataUpdated' event
            console.log("railwayDataUpdated event received in viewer");
            setLastUpdateTime(new Date());
        };
        
        window.addEventListener('railwayDataUpdated', handleDataUpdate);
        
        return () => {
            window.removeEventListener('railwayDataUpdated', handleDataUpdate);
        };
    }, [railwayData, selectedStation, currentTime]);

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
                    updatedTrains.forEach((train, index) => {
                        if (train.status === "RUNNING") {
                            // Simple movement simulation
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
                                    // Arrive at NGP
                                    const availablePlatforms = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];
                                    const occupiedPlatforms = updatedTrains
                                        .filter(t => t.position.platform)
                                        .map(t => t.position.platform);
                                    const freePlatform = availablePlatforms.find(p => !occupiedPlatforms.includes(p)) || "P1";
                                    
                                    train.position = { station: "NGP", platform: freePlatform };
                                    train.status = "STOPPED";
                                    train.speed = 0;
                                    newTrackOccupancy[`NGP-${freePlatform}`] = train.id;
                                }
                            } else if (train.position.section === "NGP-G") {
                                train.position.km_from_WR += 0.1;
                                newTrackOccupancy["NGP-G"] = train.id;
                                if (train.position.km_from_WR > 220) {
                                    // Train exits simulation
                                    updatedTrains.splice(index, 1);
                                }
                            }
                        } else if (train.status === "STOPPED") {
                            // Mark platform as occupied
                            if (train.position.platform && train.position.station) {
                                newTrackOccupancy[`${train.position.station}-${train.position.platform}`] = train.id;
                            }
                            
                            // Randomly depart some trains
                            if (Math.random() < 0.005) { // 0.5% chance each interval
                                train.status = "RUNNING";
                                train.speed = 30 + Math.floor(Math.random() * 50);
                                train.position = { 
                                    section: "NGP-G", 
                                    km_from_WR: 85.0
                                };
                                newTrackOccupancy["NGP-G"] = train.id;
                            }
                        }
                    });
                    
                    // Randomly add new train at 0.3% chance
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
                    }
                    
                    setTrackOccupancy(newTrackOccupancy);
                    return { ...prev, active_trains: updatedTrains };
                });
            }, 1000);
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

        const handlePointToggle = (pointId) => {
        setRailwayData(prevData => {
            const newPoints = prevData.points.map(point => 
                point.id === pointId 
                    ? { ...point, position: point.position === "NORMAL" ? "REVERSE" : "NORMAL" } 
                    : point
            );
            
            const updatedData = { ...prevData, points: newPoints };
            
            // Dispatch the event to notify other components
            window.dispatchEvent(new Event('railwayDataUpdated'));
            
            return updatedData;
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
            
            const updatedData = { ...prevData, signals: newSignals };
            
            // Dispatch the event to notify other components
            window.dispatchEvent(new Event('railwayDataUpdated'));
            
            return updatedData;
        });
        
        setLastAction(`Signal ${signalId} state changed`);
    };

    const toggleSimulation = () => {
        setTrainSimulation(!trainSimulation);
        setLastAction(trainSimulation ? 'Live simulation paused' : 'Live simulation started');
    };

    const renderStationLayout = () => {
        if (!selectedStation) {
            return (
                <div className="flex items-center justify-center h-64 bg-slate-900/40 backdrop-blur-md rounded-lg border border-blue-400/30">
                    <p className="text-gray-400">Please select a station to view its layout</p>
                </div>
            );
        }

        const stationCode = selectedStation.code;
        
        switch (stationCode) {
            case "NGP":
                return (
                    <NagpurYardLayout 
                        activeTrains={railwayData.active_trains.filter(train => 
                            (train.position.station === stationCode) || 
                            train.position.section?.includes(stationCode)
                        )} 
                        points={railwayData.points}
                        signals={railwayData.signals}
                        onPointToggle={handlePointToggle}
                        onSignalToggle={handleSignalToggle}
                        trackOccupancy={trackOccupancy}
                    />
                );
            case "AJNI":
                return (
                    <AjniStationLayout 
                        activeTrains={railwayData.active_trains.filter(train => 
                            (train.position.station === stationCode) || 
                            train.position.section?.includes(stationCode)
                        )} 
                        points={railwayData.points}
                        signals={railwayData.signals}
                        onPointToggle={handlePointToggle}
                        onSignalToggle={handleSignalToggle}
                        trackOccupancy={trackOccupancy}
                    />
                );
            case "WR":
                return (
                    <TwoTrackStationLayout 
                        stationName="Wardha Junction"
                        stationCode="WR"
                        activeTrains={railwayData.active_trains.filter(train => 
                            (train.position.station === stationCode) || 
                            train.position.section?.includes(stationCode)
                        )}
                        points={railwayData.points}
                        signals={railwayData.signals}
                        onPointToggle={handlePointToggle}
                        onSignalToggle={handleSignalToggle}
                        trackOccupancy={trackOccupancy}
                    />
                );
            case "SEGM":
                return (
                    <TwoTrackStationLayout 
                        stationName="Sewagram"
                        stationCode="SEGM"
                        activeTrains={railwayData.active_trains.filter(train => 
                            (train.position.station === stationCode) || 
                            train.position.section?.includes(stationCode)
                        )}
                        points={railwayData.points}
                        signals={railwayData.signals}
                        onPointToggle={handlePointToggle}
                        onSignalToggle={handleSignalToggle}
                        trackOccupancy={trackOccupancy}
                    />
                );
            case "BTBR":
                return (
                    <TwoTrackStationLayout 
                        stationName="Butibori"
                        stationCode="BTBR"
                        activeTrains={railwayData.active_trains.filter(train => 
                            (train.position.station === stationCode) || 
                            train.position.section?.includes(stationCode)
                        )}
                        points={railwayData.points}
                        signals={railwayData.signals}
                        onPointToggle={handlePointToggle}
                        onSignalToggle={handleSignalToggle}
                        trackOccupancy={trackOccupancy}
                    />
                );
            case "G":
                return (
                    <TwoTrackStationLayout 
                        stationName="Gondia Junction"
                        stationCode="G"
                        activeTrains={railwayData.active_trains.filter(train => 
                            (train.position.station === stationCode) || 
                            train.position.section?.includes(stationCode)
                        )}
                        points={railwayData.points}
                        signals={railwayData.signals}
                        onPointToggle={handlePointToggle}
                        onSignalToggle={handleSignalToggle}
                        trackOccupancy={trackOccupancy}
                    />
                );
            default:
                return (
                    <div className="flex items-center justify-center h-64 bg-slate-900/40 backdrop-blur-md rounded-lg border border-blue-400/30">
                        <p className="text-gray-400">Please select a station to view its layout</p>
                    </div>
                );
        }
    };
    
    return (
        <div className="text-white min-h-screen font-sans">
            <main className="container mx-auto p-4 pt-20"> {/* Added padding top for navbar */}
                {/* Main 3D Station Simulation - Centered */}
                <div className="mb-8 flex justify-center">
                    <div className="w-full max-w-7xl">
                        {/* Simulation control panel */}
                        <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-lg border border-blue-400/30 mb-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-[#FFA500] flex items-center">
                                    🚄 Live Railway Simulation
                                    <span className="ml-2 text-xs bg-blue-500/30 px-2 py-1 rounded-full border border-blue-400/50">
                                        SignalSense AI
                                    </span>
                                    <span className="ml-2 text-xs bg-green-500/30 px-2 py-1 rounded-full">
                                        Last updated: {lastUpdateTime.toLocaleTimeString()}
                                    </span>
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleSimulation}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all border ${
                                            trainSimulation 
                                                ? 'bg-red-600/80 hover:bg-red-600 text-white border-red-400/50' 
                                                : 'bg-green-600/80 hover:bg-green-600 text-white border-green-400/50'
                                        }`}
                                    >
                                        {trainSimulation ? '⏸️ Pause Simulation' : '▶️ Start Simulation'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Centered Main Content Area */}
                <div className="flex flex-col gap-6 max-w-7xl mx-auto">
                    {/* Station Selection Row */}
                    <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-lg shadow-lg border border-blue-400/30">
                        <h2 className="text-lg font-semibold mb-4 text-[#FFA500] border-b border-blue-400/30 pb-2 flex items-center">
                            🚄 Route Stations: Wardha ↔ Gondia 
                            <span className="ml-2 text-xs bg-blue-500/30 px-2 py-1 rounded-full border border-blue-400/50">
                                Interactive Mode
                            </span>
                            <span className="text-xs text-gray-300 ml-2">
                                {railwayData.stations[0].km} - {railwayData.stations[railwayData.stations.length-1].km} km, 
                                Distance: {(railwayData.stations[railwayData.stations.length-1].km - railwayData.stations[0].km).toFixed(1)} km
                            </span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                            {railwayData.stations.map(station => (
                                <motion.div 
                                    key={station.code} 
                                    whileHover={{ y: -2, scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStationClick(station)} 
                                    className={`p-3 text-center rounded-lg cursor-pointer transition-all border-2 backdrop-blur-md ${
                                        selectedStation?.code === station.code 
                                            ? 'bg-blue-800/40 border-blue-400 shadow-lg shadow-blue-500/25' 
                                            : 'bg-slate-800/30 border-blue-400/20 hover:border-blue-400/40 hover:bg-slate-800/40'
                                    }`}
                                >
                                    <div className="font-bold text-lg">{station.code}</div>
                                    <div className="text-xs text-gray-300 truncate">{station.name}</div>
                                    <div className="text-xs text-gray-400">{station.km} km</div>
                                    <div className="text-xs text-green-400">
                                        {station.trackLines} track{station.trackLines > 1 ? 's' : ''}
                                    </div>
                                    {/* Active train count indicator */}
                                    <div className="mt-1">
                                        {(() => {
                                            const stationTrains = railwayData.active_trains.filter(train => 
                                                train.position.station === station.code ||
                                                (train.position.section && train.position.section.includes(station.code))
                                            ).length;
                                            return stationTrains > 0 ? (
                                                <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                                    {stationTrains} train{stationTrains > 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                    Clear
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Station Layout Viewer - Centered */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedStation?.code}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex justify-center"
                        >
                            <div className="w-full max-w-7xl">
                                {renderStationLayout()}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Live Train Traffic Table */}
                    <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-lg shadow-lg border border-blue-400/30">
                        <div className="flex justify-between items-center mb-4 border-b border-blue-400/30 pb-2">
                            <h2 className="text-lg font-semibold text-[#FFA500] flex items-center">
                                🚂 Live Train Traffic
                                <span className="ml-2 text-xs bg-green-500/30 px-2 py-1 rounded-full border border-green-400/50">
                                    Real-time Data
                                </span>
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="text-sm">
                                    <span className="text-gray-400">Total Trains: </span>
                                    <span className="font-bold text-white">{railwayData.active_trains.length}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-400">Last action: </span>
                                    <span className="font-mono text-green-400">{lastAction || "No actions yet"}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-400">Simulation: </span>
                                    <span className={`font-bold ${trainSimulation ? 'text-green-400' : 'text-red-400'}`}>
                                        {trainSimulation ? 'ACTIVE' : 'PAUSED'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800/40 backdrop-blur-md">
                                    <tr>
                                        <th className="py-3 px-4 text-left font-semibold">Train Details</th>
                                        <th className="py-3 px-4 text-left font-semibold">Current Location</th>
                                        <th className="py-3 px-4 text-right font-semibold">Speed</th>
                                        <th className="py-3 px-4 text-center font-semibold">Status</th>
                                        <th className="py-3 px-4 text-right font-semibold">Schedule</th>
                                        <th className="py-3 px-4 text-center font-semibold">Priority</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-400/20">
                                    {railwayData.active_trains.map(train => (
                                        <motion.tr 
                                            key={train.id} 
                                            className="hover:bg-slate-800/30 transition-colors backdrop-blur-md"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-white">{train.id}</div>
                                                <div className="text-xs text-gray-400 max-w-32 truncate">{train.name}</div>
                                                <div className="text-xs text-blue-400">{train.direction}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-mono text-sm">
                                                    {train.position.station 
                                                        ? (
                                                            <div>
                                                                <span className="text-green-400">{train.position.station}</span>
                                                                <br />
                                                                <span className="text-xs text-gray-400">Platform {train.position.platform}</span>
                                                            </div>
                                                        )
                                                        : (
                                                            <div>
                                                                <span className="text-yellow-400">{train.position.section}</span>
                                                                <br />
                                                                <span className="text-xs text-gray-400">KM {train.position.km_from_WR?.toFixed(1)}</span>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="font-mono font-bold">
                                                    {train.speed} <span className="text-xs text-gray-400">km/h</span>
                                                </div>
                                                {train.speed > 0 && (
                                                    <div className="text-xs text-blue-400">Moving</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(train.status)}`}>
                                                    {train.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="font-mono">
                                                    {formatTime(train.scheduled_arrival || train.scheduled_departure)}
                                                </div>
                                                {train.delayed_by_min > 0 && (
                                                    <div className="text-xs text-red-400 font-medium">
                                                        Delayed +{train.delayed_by_min}m
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        train.id.startsWith('22') || train.id.startsWith('12') 
                                                            ? 'bg-red-600 text-white' 
                                                            : 'bg-blue-600 text-white'
                                                    }`}>
                                                        {train.id.startsWith('22') || train.id.startsWith('12') ? 'HIGH' : 'NORMAL'}
                                                    </span>
                                                    <button className="px-2 py-1 bg-slate-800/40 hover:bg-slate-700/40 rounded text-xs transition-colors border border-blue-400/20">
                                                        View Details
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Analytics Dashboard */}
                    <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-lg shadow-lg border border-blue-400/30">
                        <h2 className="text-lg font-semibold mb-4 text-[#FFA500] border-b border-blue-400/30 pb-2 flex items-center">
                            📊 System Analytics Dashboard
                            <span className="ml-2 text-xs bg-purple-500/30 px-2 py-1 rounded-full border border-purple-400/50">
                                AI Insights
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-4 rounded-lg border border-blue-500/30 backdrop-blur-md">
                                <div className="text-sm text-blue-300 mb-1">Network Efficiency</div>
                                <div className="text-2xl font-bold text-blue-400">94.2%</div>
                                <div className="text-xs text-blue-300">+2.1% from yesterday</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-4 rounded-lg border border-green-500/30 backdrop-blur-md">
                                <div className="text-sm text-green-300 mb-1">On-Time Performance</div>
                                <div className="text-2xl font-bold text-green-400">87.5%</div>
                                <div className="text-xs text-green-300">+0.8% from yesterday</div>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 p-4 rounded-lg border border-yellow-500/30 backdrop-blur-md">
                                <div className="text-sm text-yellow-300 mb-1">Average Delay</div>
                                <div className="text-2xl font-bold text-yellow-400">8.2m</div>
                                <div className="text-xs text-yellow-300">-1.3m from yesterday</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-4 rounded-lg border border-purple-500/30 backdrop-blur-md">
                                <div className="text-sm text-purple-300 mb-1">AI Predictions</div>
                                <div className="text-2xl font-bold text-purple-400">96.8%</div>
                                <div className="text-xs text-purple-300">Accuracy rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer with updated theme */}
            <footer className="mt-12 bg-slate-900/40 backdrop-blur-md p-6 border-t border-blue-400/30">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="text-white/90">
                        🇮🇳 <strong>SignalSense AI Railway Management System</strong> - Empowering Railway Operations with Intelligent Technology 🇮🇳
                    </div>
                    <div className="text-xs text-white/70 mt-2">
                        © 2024 Team Excellence • Smart India Hackathon 2024 • 
                        <a href="https://github.com/bxbx1205/SignalSense_SIH" className="text-cyan-400 hover:text-cyan-300 ml-1">
                            GitHub: bxbx1205/SignalSense_SIH
                        </a> • All Rights Reserved
                    </div>
                    <div className="text-xs text-cyan-400 mt-1">
                        Developed by Bharat27-d • Current Session: {currentTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TrainControlViewer;