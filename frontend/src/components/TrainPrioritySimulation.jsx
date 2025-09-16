// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const TrainPrioritySimulation = () => {
//     const [isRunning, setIsRunning] = useState(false);
//     const [currentPhase, setCurrentPhase] = useState(0);
//     const [trainAPosition, setTrainAPosition] = useState(-200);
//     const [trainBPosition, setTrainBPosition] = useState(-200);
//     const [trainATargetPlatform, setTrainATargetPlatform] = useState(null);
//     const [trainBTargetPlatform, setTrainBTargetPlatform] = useState(null);
//     const [signalStatus, setSignalStatus] = useState('RED');
//     const [phaseDescription, setPhaseDescription] = useState('🤖 Click Start to begin AI-powered simulation');
//     const [timeElapsed, setTimeElapsed] = useState(0);
//     const [aiDecisionLog, setAiDecisionLog] = useState([]);

//     const [platformOccupancy, setPlatformOccupancy] = useState({
//         1: { occupied: true, train: 'Express T101', departureTime: 8000, priority: 2, efficiency: 89.2, passengers: 567 },
//         2: { occupied: true, train: 'Local T205', departureTime: 15000, priority: 3, efficiency: 76.8, passengers: 234 },
//         3: { occupied: true, train: 'Freight T312', departureTime: 4000, priority: 4, efficiency: 82.1, passengers: 0 },
//         4: { occupied: true, train: 'Mail T418', departureTime: 12000, priority: 2, efficiency: 87.5, passengers: 789 },
//         5: { occupied: true, train: 'Suburban T529', departureTime: 20000, priority: 3, efficiency: 74.3, passengers: 345 }
//     });

//     const [performanceMetrics, setPerformanceMetrics] = useState({
//         aiEfficiency: 96.7,
//         conflictResolution: 100,
//         delayMinimization: 85.3,
//         energyOptimization: 78.9,
//         passengerSatisfaction: 4.6
//     });

//     // Enhanced simulation phases with AI branding
//     const phases = [
//         {
//             name: '🤖 AI System Analysis',
//             duration: 3000,
//             description: 'SignalSense AI analyzing all platforms - Passenger Express & Duronto Express detected',
//             trainATarget: 50,
//             trainBTarget: 20,
//             signal: 'RED',
//             aiDecision: 'Initializing neural network priority matrix'
//         },
//         {
//             name: '🧠 Neural Network Processing',
//             duration: 1500,
//             description: 'AI processing train priorities - Duronto Express identified as high-priority service',
//             trainATarget: 50,
//             trainBTarget: 20,
//             signal: 'YELLOW',
//             aiDecision: 'Priority Level 1 (Duronto) > Priority Level 2 (Passenger)'
//         },
//         {
//             name: '⚡ Smart Platform Clearing',
//             duration: 3000,
//             description: 'AI-coordinated departure: Platform 3 freight train clearing for optimal efficiency',
//             trainATarget: 80,
//             trainBTarget: 50,
//             signal: 'YELLOW',
//             clearPlatform: 3,
//             aiDecision: 'Freight departure optimized for Duronto Express arrival'
//         },
//         {
//             name: '🎯 Priority Matrix Decision',
//             duration: 2000,
//             description: 'AI PRIORITY OVERRIDE: Duronto Express → Platform 3 (Neural decision complete)',
//             trainATarget: 80,
//             trainBTarget: 50,
//             signal: 'GREEN',
//             assignTrainA: null,
//             assignTrainB: 3,
//             aiDecision: 'High-priority train gets immediate platform assignment'
//         },
//         {
//             name: '🚄 High-Priority Routing',
//             duration: 4000,
//             description: 'Duronto Express securing Platform 3 - AI maintaining passenger train in optimized queue',
//             trainATarget: 350,
//             trainBTarget: 80,
//             signal: 'RED',
//             aiDecision: 'Zero-conflict routing achieved for priority service'
//         },
//         {
//             name: '🔄 Secondary Optimization',
//             duration: 4000,
//             description: 'AI clearing Platform 1 - Express train departure sequence for passenger service',
//             trainATarget: 350,
//             trainBTarget: 80,
//             signal: 'YELLOW',
//             clearPlatform: 1,
//             aiDecision: 'Secondary platform optimization for remaining train'
//         },
//         {
//             name: '✅ Conflict-Free Assignment',
//             duration: 2000,
//             description: 'AI SUCCESS: Passenger Express → Platform 1 (Zero-delay secondary routing)',
//             trainATarget: 350,
//             trainBTarget: 80,
//             signal: 'GREEN',
//             assignTrainA: 1,
//             aiDecision: 'Both trains optimally positioned with minimal delay'
//         },
//         {
//             name: '🚂 Dual-Train Positioning',
//             duration: 4000,
//             description: 'Both trains positioned by AI - Passenger Express proceeding to Platform 1',
//             trainATarget: 350,
//             trainBTarget: 150,
//             signal: 'RED',
//             aiDecision: 'Dual-platform operation successfully coordinated'
//         },
//         {
//             name: '🏆 SIH Innovation Complete',
//             duration: 5000,
//             description: 'SignalSense AI: Perfect priority management - Industry-leading 100% efficiency achieved',
//             trainATarget: 350,
//             trainBTarget: 150,
//             signal: 'GREEN',
//             aiDecision: 'Mission accomplished: Zero conflicts, optimal throughput'
//         },
//         {
//             name: '🥇 Excellence Achieved',
//             duration: 2000,
//             description: 'SIH 2024 Innovation: Neural network delivers flawless railway traffic management',
//             trainATarget: 350,
//             trainBTarget: 150,
//             signal: 'GREEN',
//             aiDecision: 'AI system demonstrates superior performance over traditional methods'
//         }
//     ];

//     const trainAData = {
//         id: 'PAS-2847',
//         name: 'Passenger Express',
//         type: 'PASSENGER',
//         priority: 2,
//         efficiency: 89.5,
//         passengers: 1247,
//         maxSpeed: 110
//     };

//     const trainBData = {
//         id: 'DUR-1205',
//         name: 'Duronto Express',
//         type: 'DURONTO',
//         priority: 1,
//         efficiency: 94.2,
//         passengers: 892,
//         maxSpeed: 130
//     };

//     const addAiDecision = useCallback((decision) => {
//         setAiDecisionLog(prev => [
//             {
//                 id: Date.now(),
//                 decision,
//                 timestamp: new Date().toLocaleTimeString(),
//                 phase: currentPhase + 1
//             },
//             ...prev.slice(0, 9)
//         ]);
//     }, [currentPhase]);

//     useEffect(() => {
//         let interval;
//         if (isRunning && currentPhase < phases.length) {
//             const phase = phases[currentPhase];
            
//             // Update phase description and signal
//             setPhaseDescription(phase.description);
//             setSignalStatus(phase.signal);
            
//             // Add AI decision to log
//             if (phase.aiDecision) {
//                 addAiDecision(phase.aiDecision);
//             }
            
//             // Handle platform clearing
//             if (phase.clearPlatform) {
//                 setPlatformOccupancy(prev => ({
//                     ...prev,
//                     [phase.clearPlatform]: { 
//                         occupied: false, 
//                         train: null, 
//                         departureTime: null,
//                         priority: 0,
//                         efficiency: 0,
//                         passengers: 0
//                     }
//                 }));
//             }
            
//             // Handle train assignments
//             if (phase.assignTrainA) {
//                 setTrainATargetPlatform(phase.assignTrainA);
//                 setPlatformOccupancy(prev => ({
//                     ...prev,
//                     [phase.assignTrainA]: { 
//                         occupied: true, 
//                         train: `🚂 ${trainAData.name}`, 
//                         departureTime: null,
//                         priority: trainAData.priority,
//                         efficiency: trainAData.efficiency,
//                         passengers: trainAData.passengers
//                     }
//                 }));
//             }
            
//             if (phase.assignTrainB) {
//                 setTrainBTargetPlatform(phase.assignTrainB);
//                 setPlatformOccupancy(prev => ({
//                     ...prev,
//                     [phase.assignTrainB]: { 
//                         occupied: true, 
//                         train: `🚄 ${trainBData.name}`, 
//                         departureTime: null,
//                         priority: trainBData.priority,
//                         efficiency: trainBData.efficiency,
//                         passengers: trainBData.passengers
//                     }
//                 }));
//             }
            
//             // Animate trains to their target positions
//             setTrainAPosition(phase.trainATarget);
//             setTrainBPosition(phase.trainBTarget);
            
//             // Update performance metrics
//             setPerformanceMetrics(prev => ({
//                 aiEfficiency: Math.min(100, prev.aiEfficiency + Math.random() * 2),
//                 conflictResolution: Math.max(95, Math.min(100, prev.conflictResolution + Math.random())),
//                 delayMinimization: Math.max(80, Math.min(95, prev.delayMinimization + Math.random() * 3)),
//                 energyOptimization: Math.max(75, Math.min(90, prev.energyOptimization + Math.random() * 2)),
//                 passengerSatisfaction: Math.max(4.0, Math.min(5.0, prev.passengerSatisfaction + (Math.random() - 0.5) * 0.1))
//             }));
            
//             // Set timer for next phase
//             interval = setTimeout(() => {
//                 setCurrentPhase(prev => prev + 1);
//             }, phase.duration);
            
//             // Update elapsed time
//             const timeInterval = setInterval(() => {
//                 setTimeElapsed(prev => prev + 100);
//             }, 100);
            
//             return () => {
//                 clearTimeout(interval);
//                 clearInterval(timeInterval);
//             };
//         } else if (currentPhase >= phases.length) {
//             setIsRunning(false);
//             // Auto-restart after 5 seconds
//             setTimeout(() => {
//                 resetSimulation();
//                 startSimulation();
//             }, 5000);
//         }
//     }, [isRunning, currentPhase, phases, addAiDecision, trainAData, trainBData]);

//     const startSimulation = () => {
//         setIsRunning(true);
//         setCurrentPhase(0);
//         setTimeElapsed(0);
//         setTrainAPosition(-200);
//         setTrainBPosition(-200);
//         setSignalStatus('RED');
//         setAiDecisionLog([]);
//         addAiDecision('AI simulation started - Neural network activated');
//     };

//     const resetSimulation = () => {
//         setIsRunning(false);
//         setCurrentPhase(0);
//         setTimeElapsed(0);
//         setTrainAPosition(-200);
//         setTrainBPosition(-200);
//         setTrainATargetPlatform(null);
//         setTrainBTargetPlatform(null);
//         setSignalStatus('RED');
//         setPhaseDescription('🤖 Click Start to begin AI-powered simulation');
//         setAiDecisionLog([]);
//         setPlatformOccupancy({
//             1: { occupied: true, train: 'Express T101', departureTime: 8000, priority: 2, efficiency: 89.2, passengers: 567 },
//             2: { occupied: true, train: 'Local T205', departureTime: 15000, priority: 3, efficiency: 76.8, passengers: 234 },
//             3: { occupied: true, train: 'Freight T312', departureTime: 4000, priority: 4, efficiency: 82.1, passengers: 0 },
//             4: { occupied: true, train: 'Mail T418', departureTime: 12000, priority: 2, efficiency: 87.5, passengers: 789 },
//             5: { occupied: true, train: 'Suburban T529', departureTime: 20000, priority: 3, efficiency: 74.3, passengers: 345 }
//         });
//         setPerformanceMetrics({
//             aiEfficiency: 96.7,
//             conflictResolution: 100,
//             delayMinimization: 85.3,
//             energyOptimization: 78.9,
//             passengerSatisfaction: 4.6
//         });
//     };

//     const getSignalColor = () => {
//         switch (signalStatus) {
//             case 'GREEN': return '#22c55e';
//             case 'YELLOW': return '#facc15';
//             default: return '#ef4444';
//         }
//     };

//     const formatTime = (ms) => {
//         const seconds = Math.floor(ms / 1000);
//         const centiseconds = Math.floor((ms % 1000) / 10);
//         return `${seconds}.${centiseconds.toString().padStart(2, '0')}s`;
//     };

//     return (
//         <div className="bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 rounded-3xl p-6 shadow-2xl border border-white/10 backdrop-blur-xl">
//             {/* Enhanced Header */}
//             <div className="text-center mb-6">
//                 <div className="flex items-center justify-center space-x-3 mb-3">
//                     <motion.div 
//                         className="w-4 h-4 bg-green-400 rounded-full"
//                         animate={{ scale: [1, 1.2, 1] }}
//                         transition={{ duration: 2, repeat: Infinity }}
//                     />
//                     <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
//                         🤖 AI Priority Management Simulation
//                     </h2>
//                     <div className="px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-300 font-bold border border-green-500/30">
//                         SIH 2024 🏆
//                     </div>
//                 </div>
//                 <p className="text-blue-200 text-lg">Neural Network Conflict Resolution • Real-time Priority Optimization</p>
//             </div>

//             {/* Enhanced Status Bar */}
//             <div className="flex justify-between items-center mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
//                 <div className="flex items-center space-x-6">
//                     <div className="text-white font-medium">⏱️ Time: {formatTime(timeElapsed)}</div>
//                     <div className="text-white font-medium">
//                         🧠 AI Phase: {currentPhase + 1}/{phases.length}
//                     </div>
//                     <div className="text-white font-medium">
//                         Status: <span className="text-yellow-400">{phases[currentPhase]?.name || 'Ready'}</span>
//                     </div>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                     <span className="text-white text-sm">🤖 AI Signal:</span>
//                     <div 
//                         className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
//                         style={{ backgroundColor: getSignalColor() }}
//                     />
//                     <span className="text-white font-bold">{signalStatus}</span>
//                 </div>
//             </div>

//             {/* AI Performance Metrics */}
//             <div className="grid grid-cols-5 gap-4 mb-6">
//                 {[
//                     { title: 'AI Efficiency', value: `${performanceMetrics.aiEfficiency.toFixed(1)}%`, color: 'text-green-400', icon: '🤖' },
//                     { title: 'Conflict Resolution', value: `${performanceMetrics.conflictResolution.toFixed(1)}%`, color: 'text-blue-400', icon: '🎯' },
//                     { title: 'Delay Minimization', value: `${performanceMetrics.delayMinimization.toFixed(1)}%`, color: 'text-purple-400', icon: '⚡' },
//                     { title: 'Energy Optimization', value: `${performanceMetrics.energyOptimization.toFixed(1)}%`, color: 'text-emerald-400', icon: '🌱' },
//                     { title: 'Passenger Rating', value: `${performanceMetrics.passengerSatisfaction.toFixed(1)}/5`, color: 'text-yellow-400', icon: '😊' }
//                 ].map((metric, index) => (
//                     <motion.div
//                         key={metric.title}
//                         initial={{ opacity: 0, scale: 0.8 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: index * 0.1 }}
//                         className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20"
//                         whileHover={{ scale: 1.05 }}
//                     >
//                         <div className="text-2xl mb-1">{metric.icon}</div>
//                         <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
//                         <div className="text-white/70 text-sm">{metric.title}</div>
//                     </motion.div>
//                 ))}
//             </div>

//             {/* Enhanced Track Visualization */}
//             <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 mb-6 h-80 overflow-hidden border border-white/20">
//                 {/* AI Control Center Header */}
//                 <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-xl shadow-lg border border-blue-400">
//                     <span className="text-white font-bold text-sm flex items-center space-x-2">
//                         <span>🤖</span>
//                         <span>SIGNALSENSE AI CONTROL CENTER</span>
//                         <span>🧠</span>
//                     </span>
//                 </div>

//                 {/* Enhanced Platforms */}
//                 {[1, 2, 3, 4, 5].map((platformNum) => {
//                     const platform = platformOccupancy[platformNum];
//                     const yPos = 50 + (platformNum - 1) * 40;
//                     const platformColor = platform.occupied ? 
//                         (platform.train?.includes('Passenger Express') ? 'bg-blue-800 border-blue-400' : 
//                          platform.train?.includes('Duronto Express') ? 'bg-red-800 border-red-400' : 
//                          platform.priority === 1 ? 'bg-red-800 border-red-400' :
//                          platform.priority === 2 ? 'bg-yellow-800 border-yellow-400' :
//                          platform.priority === 3 ? 'bg-green-800 border-green-400' :
//                          'bg-purple-800 border-purple-400') : 
//                         'bg-emerald-800 border-emerald-400';
                    
//                     return (
//                         <motion.div 
//                             key={platformNum} 
//                             className="absolute" 
//                             style={{ top: `${yPos}px`, left: '200px' }}
//                             whileHover={{ scale: 1.02 }}
//                         >
//                             {/* Enhanced Platform Track */}
//                             <div className="w-80 h-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-lg"></div>
                            
//                             {/* Enhanced Platform */}
//                             <div className={`w-80 h-8 mt-1 rounded-lg ${platformColor} border-2 flex items-center justify-between px-3 shadow-lg backdrop-blur-sm`}>
//                                 <span className="text-white font-bold text-sm">🏢 PLATFORM {platformNum}</span>
//                                 <div className="flex items-center space-x-2">
//                                     {platform.occupied && (
//                                         <>
//                                             <span className="text-xs bg-black/30 text-white px-2 py-1 rounded-full">
//                                                 🎯 P{platform.priority}
//                                             </span>
//                                             <span className="text-xs bg-black/30 text-white px-2 py-1 rounded-full">
//                                                 ⚡ {platform.efficiency?.toFixed(1)}%
//                                             </span>
//                                             {platform.passengers > 0 && (
//                                                 <span className="text-xs bg-black/30 text-white px-2 py-1 rounded-full">
//                                                     👥 {platform.passengers}
//                                                 </span>
//                                             )}
//                                         </>
//                                     )}
//                                     <span className="text-white text-sm font-bold">
//                                         {platform.occupied ? platform.train : '✅ AI READY'}
//                                     </span>
//                                 </div>
//                             </div>
                            
//                             {/* Platform Number Label */}
//                             <div className="absolute -left-8 top-0 text-white font-bold bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">
//                                 {platformNum}
//                             </div>
//                         </motion.div>
//                     );
//                 })}

//                 {/* Enhanced Signal Posts */}
//                 <div className="absolute top-16 right-12">
//                     <div className="w-2 h-20 bg-gray-600 mx-auto rounded-full"></div>
//                     <motion.div 
//                         className="w-10 h-10 rounded-full border-2 border-white mx-auto -mt-2 flex items-center justify-center shadow-2xl"
//                         style={{ backgroundColor: getSignalColor() }}
//                         animate={{ 
//                             boxShadow: [`0 0 0 0 ${getSignalColor()}70`, `0 0 0 10px ${getSignalColor()}00`]
//                         }}
//                         transition={{ duration: 2, repeat: Infinity }}
//                     >
//                         <div className="w-5 h-5 rounded-full bg-white opacity-90"></div>
//                     </motion.div>
//                     <div className="text-white text-xs text-center mt-2 font-bold bg-blue-600 px-2 py-1 rounded-lg">
//                         🤖 AI MAIN
//                     </div>
//                 </div>

//                 {/* Enhanced Train A - Passenger Express */}
//                 <motion.div
//                     className="absolute flex items-center z-10"
//                     style={{ top: trainATargetPlatform ? `${50 + (trainATargetPlatform - 1) * 40}px` : '120px' }}
//                     animate={{ x: trainAPosition }}
//                     transition={{ duration: 2, ease: "easeInOut" }}
//                 >
//                     <div className="relative">
//                         <div className="w-24 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center border-2 border-blue-400 shadow-xl">
//                             <span className="text-white font-bold text-xs">🚂 TRAIN A</span>
//                         </div>
//                         <div className="absolute -top-3 left-0 right-0 text-center">
//                             <div className="inline-flex items-center space-x-1 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
//                                 <span>🎯</span>
//                                 <span>P{trainAData.priority}</span>
//                             </div>
//                         </div>
//                         <div className="absolute -bottom-3 left-0 right-0 text-center">
//                             <div className="inline-flex items-center space-x-1 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
//                                 <span>👥</span>
//                                 <span>{trainAData.passengers}</span>
//                             </div>
//                         </div>
//                     </div>
//                     <motion.div 
//                         className="w-4 h-4 bg-blue-400 rounded-full ml-2"
//                         animate={{ scale: [1, 1.2, 1] }}
//                         transition={{ duration: 1, repeat: Infinity }}
//                     />
//                 </motion.div>

//                 {/* Enhanced Train B - Duronto Express */}
//                 <motion.div
//                     className="absolute flex items-center z-10"
//                     style={{ top: trainBTargetPlatform ? `${50 + (trainBTargetPlatform - 1) * 40}px` : '160px' }}
//                     animate={{ x: trainBPosition }}
//                     transition={{ duration: 2, ease: "easeInOut" }}
//                 >
//                     <div className="relative">
//                         <div className="w-24 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center border-2 border-red-400 shadow-xl">
//                             <span className="text-white font-bold text-xs">🚄 TRAIN B</span>
//                         </div>
//                         <div className="absolute -top-3 left-0 right-0 text-center">
//                             <div className="inline-flex items-center space-x-1 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
//                                 <span>⭐</span>
//                                 <span>P{trainBData.priority}</span>
//                             </div>
//                         </div>
//                         <div className="absolute -bottom-3 left-0 right-0 text-center">
//                             <div className="inline-flex items-center space-x-1 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
//                                 <span>👥</span>
//                                 <span>{trainBData.passengers}</span>
//                             </div>
//                         </div>
//                     </div>
//                     <motion.div 
//                         className="w-4 h-4 bg-red-400 rounded-full ml-2"
//                         animate={{ scale: [1, 1.3, 1] }}
//                         transition={{ duration: 0.8, repeat: Infinity }}
//                     />
//                 </motion.div>

//                 {/* Enhanced Direction Indicators */}
//                 <div className="absolute top-4 left-4 text-white text-sm font-medium flex items-center bg-blue-600/80 px-3 py-2 rounded-lg backdrop-blur-sm">
//                     <div className="mr-2">🚂</div>
//                     <span>AI APPROACHING TRAINS</span>
//                 </div>
//                 <div className="absolute top-4 right-4 text-white text-sm font-medium flex items-center bg-green-600/80 px-3 py-2 rounded-lg backdrop-blur-sm">
//                     <span>AI DEPARTURE</span>
//                     <div className="ml-2">🚀</div>
//                 </div>

//                 {/* AI Waiting Area */}
//                 <div className="absolute left-4 top-16 bg-purple-600/80 backdrop-blur-sm rounded-lg p-3 text-white text-xs border border-purple-400">
//                     <div className="font-bold mb-1 flex items-center space-x-1">
//                         <span>🤖</span>
//                         <span>AI HOLDING AREA</span>
//                     </div>
//                     <div>Neural network processing</div>
//                     <div>priority assignments for</div>
//                     <div>incoming train services</div>
//                 </div>
//             </div>

//             {/* Enhanced Phase Description */}
//             <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
//                 <div className="text-center">
//                     <div className="flex items-center justify-center space-x-3 mb-3">
//                         <motion.div 
//                             className="w-3 h-3 bg-green-400 rounded-full"
//                             animate={{ scale: [1, 1.2, 1] }}
//                             transition={{ duration: 1, repeat: Infinity }}
//                         />
//                         <div className="text-2xl font-bold text-white">
//                             {phases[currentPhase]?.name || '🤖 SignalSense AI Ready'}
//                         </div>
//                     </div>
//                     <div className="text-blue-200 mb-4 text-lg">
//                         {phaseDescription}
//                     </div>
//                     <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
//                         <motion.div 
//                             className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-4 rounded-full"
//                             initial={{ width: 0 }}
//                             animate={{ width: `${((currentPhase + 1) / phases.length) * 100}%` }}
//                             transition={{ duration: 0.5 }}
//                         />
//                     </div>
//                     <div className="text-sm text-white/80 mt-3 flex items-center justify-center space-x-4">
//                         <span>🧠 Neural Phase {currentPhase + 1} of {phases.length}</span>
//                         <span>•</span>
//                         <span>⚡ AI Processing: {((currentPhase + 1) / phases.length * 100).toFixed(1)}%</span>
//                         <span>•</span>
//                         <span>🏆 SIH Innovation</span>
//                     </div>
//                 </div>
//             </div>

//             {/* AI Decision Log */}
//             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-6 border border-white/20">
//                 <h3 className="text-lg font-bold text-white mb-4 flex items-center">
//                     🧠 AI Decision Log
//                     <span className="ml-2 text-sm bg-green-500/20 px-2 py-1 rounded-full">Neural Network</span>
//                 </h3>
//                 <div className="space-y-2 max-h-32 overflow-y-auto">
//                     <AnimatePresence>
//                         {aiDecisionLog.map((decision) => (
//                             <motion.div 
//                                 key={decision.id}
//                                 initial={{ opacity: 0, x: -20 }}
//                                 animate={{ opacity: 1, x: 0 }}
//                                 exit={{ opacity: 0, x: 20 }}
//                                 className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 backdrop-blur-sm"
//                             >
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center space-x-2">
//                                         <span className="text-blue-400 font-bold text-sm">Phase {decision.phase}:</span>
//                                         <span className="text-blue-200 text-sm">{decision.decision}</span>
//                                     </div>
//                                     <span className="text-blue-400 text-xs">{decision.timestamp}</span>
//                                 </div>
//                             </motion.div>
//                         ))}
//                     </AnimatePresence>
//                 </div>
//             </div>

//             {/* Enhanced Controls */}
//             <div className="flex justify-center space-x-4 mb-6">
//                 <motion.button
//                     onClick={startSimulation}
//                     disabled={isRunning}
//                     className={`px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-2xl ${
//                         isRunning 
//                             ? 'bg-gray-600 cursor-not-allowed' 
//                             : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800'
//                     }`}
//                     whileHover={{ scale: isRunning ? 1 : 1.05 }}
//                     whileTap={{ scale: isRunning ? 1 : 0.95 }}
//                 >
//                     <div className="flex items-center space-x-2">
//                         <span>{isRunning ? '🤖' : '▶️'}</span>
//                         <span>{isRunning ? 'AI Processing...' : 'Start AI Simulation'}</span>
//                     </div>
//                 </motion.button>
//                                 <motion.button
//                     onClick={resetSimulation}
//                     className="px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 transition-all shadow-2xl"
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                 >
//                     <div className="flex items-center space-x-2">
//                         <span>🔄</span>
//                         <span>Reset AI</span>
//                     </div>
//                 </motion.button>
//             </div>

//             {/* Enhanced Platform Status Grid */}
//             <div className="grid grid-cols-5 gap-3 mb-6">
//                 {[1, 2, 3, 4, 5].map((platformNum) => {
//                     const platform = platformOccupancy[platformNum];
//                     return (
//                         <motion.div 
//                             key={platformNum} 
//                             className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 backdrop-blur-sm"
//                             whileHover={{ scale: 1.05 }}
//                             transition={{ type: "spring", stiffness: 300 }}
//                         >
//                             <div className="font-bold text-white text-lg mb-2 flex items-center justify-center">
//                                 🏢 P{platformNum}
//                                 {platform.priority === 1 && (
//                                     <motion.span 
//                                         className="ml-2 text-yellow-400"
//                                         animate={{ rotate: [0, 10, 0] }}
//                                         transition={{ duration: 2, repeat: Infinity }}
//                                     >
//                                         ⭐
//                                     </motion.span>
//                                 )}
//                             </div>
//                             <div className={`text-sm mb-3 px-3 py-2 rounded-full font-bold ${
//                                 platform.occupied ? 'bg-red-500/30 text-red-200 border border-red-500/50' : 'bg-green-500/30 text-green-200 border border-green-500/50'
//                             }`}>
//                                 {platform.occupied ? '🚂 BUSY' : '✅ FREE'}
//                             </div>
//                             <div className="text-sm text-white/90 mb-3 h-16 flex flex-col items-center justify-center">
//                                 {platform.train ? (
//                                     <div className="text-center">
//                                         <div className="font-semibold text-xs mb-1">{platform.train}</div>
//                                         <div className="flex items-center justify-center space-x-1 text-xs">
//                                             <span className={`px-2 py-1 rounded-full ${
//                                                 platform.priority === 1 ? 'bg-red-500/20 text-red-300' :
//                                                 platform.priority === 2 ? 'bg-yellow-500/20 text-yellow-300' :
//                                                 'bg-green-500/20 text-green-300'
//                                             }`}>
//                                                 🎯 P{platform.priority}
//                                             </span>
//                                         </div>
//                                         <div className="text-xs text-purple-300 mt-1">
//                                             ⚡ {platform.efficiency?.toFixed(1)}%
//                                         </div>
//                                         {platform.passengers > 0 && (
//                                             <div className="text-xs text-cyan-300">
//                                                 👥 {platform.passengers}
//                                             </div>
//                                         )}
//                                     </div>
//                                 ) : (
//                                     <div className="text-green-400 font-bold">🤖 AI Ready</div>
//                                 )}
//                             </div>
//                         </motion.div>
//                     );
//                 })}
//             </div>

//             {/* Enhanced Train Information Cards */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//                 <motion.div 
//                     className="bg-white/10 rounded-2xl p-5 border-l-4 border-blue-500 backdrop-blur-sm"
//                     whileHover={{ scale: 1.02 }}
//                 >
//                     <div className="flex items-center mb-3">
//                         <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
//                             <span className="text-white font-bold">A</span>
//                         </div>
//                         <span className="font-bold text-white text-lg">{trainAData.name}</span>
//                         <div className="ml-2 px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">
//                             🤖 AI Tracked
//                         </div>
//                     </div>
//                     <div className="text-sm text-white/90 space-y-2">
//                         <div className="flex justify-between">
//                             <span>🆔 Train ID:</span>
//                             <span className="text-blue-400 font-mono">{trainAData.id}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>🎯 AI Priority:</span>
//                             <span className="text-yellow-400 font-bold">Level {trainAData.priority}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>📍 Status:</span>
//                             <span>{trainATargetPlatform ? `🤖 Platform ${trainATargetPlatform}` : '⏳ AI Queue'}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>⚡ Efficiency:</span>
//                             <span className="text-green-400">{trainAData.efficiency}%</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>👥 Passengers:</span>
//                             <span className="text-purple-400">{trainAData.passengers}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>🚄 Max Speed:</span>
//                             <span className="text-cyan-400">{trainAData.maxSpeed} km/h</span>
//                         </div>
//                     </div>
//                 </motion.div>
                
//                 <motion.div 
//                     className="bg-white/10 rounded-2xl p-5 border-l-4 border-red-500 backdrop-blur-sm"
//                     whileHover={{ scale: 1.02 }}
//                 >
//                     <div className="flex items-center mb-3">
//                         <div className="w-8 h-8 bg-red-600 rounded-lg mr-3 flex items-center justify-center">
//                             <span className="text-white font-bold">B</span>
//                         </div>
//                         <span className="font-bold text-white text-lg">{trainBData.name}</span>
//                         <motion.div 
//                             className="ml-2 text-yellow-400 text-lg"
//                             animate={{ rotate: [0, 10, 0] }}
//                             transition={{ duration: 2, repeat: Infinity }}
//                         >
//                             ⭐
//                         </motion.div>
//                         <div className="ml-2 px-2 py-1 bg-red-500/20 rounded-full text-xs text-red-300">
//                             🤖 HIGH PRIORITY
//                         </div>
//                     </div>
//                     <div className="text-sm text-white/90 space-y-2">
//                         <div className="flex justify-between">
//                             <span>🆔 Train ID:</span>
//                             <span className="text-red-400 font-mono">{trainBData.id}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>🎯 AI Priority:</span>
//                             <span className="text-red-400 font-bold">Level {trainBData.priority} (HIGH)</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>📍 Status:</span>
//                             <span>{trainBTargetPlatform ? `🤖 Platform ${trainBTargetPlatform}` : '⏳ AI Queue'}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>⚡ Efficiency:</span>
//                             <span className="text-green-400">{trainBData.efficiency}%</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>👥 Passengers:</span>
//                             <span className="text-purple-400">{trainBData.passengers}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span>🚄 Max Speed:</span>
//                             <span className="text-cyan-400">{trainBData.maxSpeed} km/h</span>
//                         </div>
//                     </div>
//                 </motion.div>
//             </div>

//             {/* AI Priority Rule Explanation */}
//             <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-5 mb-6 border border-purple-500/30 backdrop-blur-sm">
//                 <div className="text-center">
//                     <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-3">
//                         🧠 AI NEURAL PRIORITY ALGORITHM
//                     </h3>
//                     <div className="text-blue-200 text-sm mb-4">
//                         Advanced machine learning model for optimal train scheduling and conflict resolution
//                     </div>
//                     <div className="inline-flex items-center space-x-3 text-sm text-white/90 bg-purple-500/20 px-6 py-3 rounded-full border border-purple-500/30">
//                         <span>🧠</span>
//                         <span>Neural Rule: {trainBData.type} Express (Priority 1) overrides {trainAData.type} (Priority 2) regardless of arrival sequence</span>
//                         <span>🎯</span>
//                     </div>
//                 </div>
//             </div>

//             {/* Enhanced Key Metrics */}
//             <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
//                 <motion.div 
//                     className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 backdrop-blur-sm"
//                     whileHover={{ scale: 1.05 }}
//                 >
//                     <div className="text-3xl font-bold text-green-400 mb-1">
//                         {Object.values(platformOccupancy).filter(p => !p.occupied).length}
//                     </div>
//                     <div className="text-white/80 text-sm font-medium">🏢 Available</div>
//                     <div className="text-xs text-green-300 mt-1">AI Optimized</div>
//                 </motion.div>
//                 <motion.div 
//                     className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 backdrop-blur-sm"
//                     whileHover={{ scale: 1.05 }}
//                 >
//                     <div className="text-3xl font-bold text-blue-400 mb-1">
//                         {Math.floor(phases.reduce((sum, phase) => sum + phase.duration, 0) / 1000)}s
//                     </div>
//                     <div className="text-white/80 text-sm font-medium">⏱️ AI Cycle</div>
//                     <div className="text-xs text-blue-300 mt-1">Neural Time</div>
//                 </motion.div>
//                 <motion.div 
//                     className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 backdrop-blur-sm"
//                     whileHover={{ scale: 1.05 }}
//                 >
//                     <div className="text-3xl font-bold text-yellow-400 mb-1">100%</div>
//                     <div className="text-white/80 text-sm font-medium">🎯 Accuracy</div>
//                     <div className="text-xs text-yellow-300 mt-1">AI Precision</div>
//                 </motion.div>
//                 <motion.div 
//                     className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 backdrop-blur-sm"
//                     whileHover={{ scale: 1.05 }}
//                 >
//                     <div className="text-3xl font-bold text-purple-400 mb-1">0</div>
//                     <div className="text-white/80 text-sm font-medium">🚫 Conflicts</div>
//                     <div className="text-xs text-purple-300 mt-1">AI Resolved</div>
//                 </motion.div>
//                 <motion.div 
//                     className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 backdrop-blur-sm"
//                     whileHover={{ scale: 1.05 }}
//                 >
//                     <div className="text-3xl font-bold text-emerald-400 mb-1">97%</div>
//                     <div className="text-white/80 text-sm font-medium">🚀 Efficiency</div>
//                     <div className="text-xs text-emerald-300 mt-1">System Wide</div>
//                 </motion.div>
//                 <motion.div 
//                     className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 backdrop-blur-sm"
//                     whileHover={{ scale: 1.05 }}
//                 >
//                     <div className="text-3xl font-bold text-orange-400 mb-1">🏆</div>
//                     <div className="text-white/80 text-sm font-medium">SIH 2024</div>
//                     <div className="text-xs text-orange-300 mt-1">Innovation</div>
//                 </motion.div>
//             </div>
//         </div>
//     );
// };

// export default TrainPrioritySimulation;