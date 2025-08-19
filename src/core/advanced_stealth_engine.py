import random
import time
import json
import hashlib
from typing import Dict, List, Optional
import logging

class AdvancedStealthEngine:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Advanced stealth configurations
        self.stealth_levels = {
            "basic": self.get_basic_stealth_scripts(),
            "advanced": self.get_advanced_stealth_scripts(),
            "expert": self.get_expert_stealth_scripts()
        }
        
        # Behavioral patterns database
        self.behavior_patterns = self.load_behavior_patterns()
        
        # Anti-detection mechanisms
        self.detection_indicators = []
    
    def get_basic_stealth_scripts(self) -> List[str]:
        """Basic stealth scripts for common detection methods"""
        return [
            # Disable webdriver property
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});",
            
            # Disable automation flags
            "delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;",
            "delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;",
            "delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;",
            
            # Disable Chrome automation
            "delete window.chrome;",
            
            # Disable Selenium
            "delete window.$cdc_asdjflasutopfhvcZLmcfl_;",
            "delete window.$chrome_asyncScriptInfo;",
        ]
    
    def get_advanced_stealth_scripts(self) -> List[str]:
        """Advanced stealth scripts for sophisticated detection"""
        return self.get_basic_stealth_scripts() + [
            # Randomize canvas fingerprint
            """
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type) {
                const context = originalGetContext.apply(this, arguments);
                if (type === '2d') {
                    const originalFillText = context.fillText;
                    context.fillText = function() {
                        const args = Array.prototype.slice.call(arguments);
                        args[0] = args[0] + Math.random().toString(36).substr(2, 1);
                        return originalFillText.apply(this, args);
                    };
                    
                    const originalGetImageData = context.getImageData;
                    context.getImageData = function() {
                        const imageData = originalGetImageData.apply(this, arguments);
                        // Add subtle noise to image data
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            imageData.data[i] += Math.floor(Math.random() * 2) - 1;
                        }
                        return imageData;
                    };
                }
                return context;
            };
            """,
            
            # Disable WebRTC
            """
            const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
            navigator.mediaDevices.getUserMedia = function() {
                return Promise.reject(new Error('getUserMedia is not implemented'));
            };
            
            // Disable RTCPeerConnection
            if (window.RTCPeerConnection) {
                const originalRTCPeerConnection = window.RTCPeerConnection;
                window.RTCPeerConnection = function() {
                    const pc = new originalRTCPeerConnection(...arguments);
                    pc.createDataChannel = function() {
                        return { send: function() {} };
                    };
                    return pc;
                };
            }
            """,
            
            # Randomize audio fingerprint
            """
            const originalGetChannelData = AudioBuffer.prototype.getChannelData;
            AudioBuffer.prototype.getChannelData = function(channel) {
                const data = originalGetChannelData.call(this, channel);
                // Add subtle noise to audio data
                for (let i = 0; i < data.length; i += 100) {
                    data[i] += (Math.random() - 0.5) * 0.001;
                }
                return data;
            };
            """,
            
            # Disable battery API
            """
            if (navigator.getBattery) {
                navigator.getBattery = function() {
                    return Promise.resolve({
                        charging: true,
                        chargingTime: Infinity,
                        dischargingTime: Infinity,
                        level: 1.0
                    });
                };
            }
            """,
            
            # Disable connection API
            """
            if (navigator.connection) {
                Object.defineProperty(navigator, 'connection', {
                    get: () => ({
                        effectiveType: '4g',
                        rtt: 50,
                        downlink: 10,
                        saveData: false
                    })
                });
            }
            """,
        ]
    
    def get_expert_stealth_scripts(self) -> List[str]:
        """Expert level stealth scripts for maximum undetectability"""
        return self.get_advanced_stealth_scripts() + [
            # Advanced canvas fingerprint randomization
            """
            // Randomize canvas rendering
            const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = function() {
                const canvas = this;
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Add random noise to specific pixels
                for (let i = 0; i < imageData.data.length; i += 4) {
                    if (Math.random() < 0.01) { // 1% chance
                        imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + (Math.random() - 0.5) * 2));
                        imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + (Math.random() - 0.5) * 2));
                        imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + (Math.random() - 0.5) * 2));
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
                return originalToDataURL.apply(this, arguments);
            };
            """,
            
            # Advanced WebGL fingerprint randomization
            """
            // Randomize WebGL parameters
            const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                const result = originalGetParameter.call(this, parameter);
                
                // Randomize specific WebGL parameters
                if (parameter === this.MAX_TEXTURE_SIZE) {
                    return result + Math.floor(Math.random() * 100);
                }
                if (parameter === this.MAX_VIEWPORT_DIMS) {
                    return [result[0] + Math.floor(Math.random() * 10), result[1] + Math.floor(Math.random() * 10)];
                }
                
                return result;
            };
            """,
            
            # Disable performance timing
            """
            // Disable high-resolution time
            const originalNow = performance.now;
            performance.now = function() {
                return originalNow.call(this) + Math.random() * 0.1;
            };
            
            // Disable performance timing API
            if (performance.getEntriesByType) {
                const originalGetEntriesByType = performance.getEntriesByType;
                performance.getEntriesByType = function(type) {
                    if (type === 'navigation' || type === 'resource') {
                        return [];
                    }
                    return originalGetEntriesByType.call(this, type);
                };
            }
            """,
            
            # Advanced mouse movement simulation
            """
            // Simulate realistic mouse movements
            let mouseX = 0, mouseY = 0;
            let lastMoveTime = 0;
            
            document.addEventListener('mousemove', function(e) {
                const now = Date.now();
                const timeDiff = now - lastMoveTime;
                
                // Add realistic mouse movement patterns
                if (timeDiff > 16) { // 60fps max
                    mouseX = e.clientX + (Math.random() - 0.5) * 2;
                    mouseY = e.clientY + (Math.random() - 0.5) * 2;
                    lastMoveTime = now;
                }
            }, { passive: true });
            """,
            
            # Disable automation detection
            """
            // Disable various automation detection methods
            Object.defineProperty(navigator, 'plugins', {
                get: () => {
                    const plugins = [];
                    for (let i = 0; i < 3 + Math.floor(Math.random() * 5); i++) {
                        plugins.push({
                            name: ['Chrome PDF Plugin', 'Chrome PDF Viewer', 'Native Client'][i % 3],
                            filename: 'internal-pdf-viewer',
                            description: 'Portable Document Format'
                        });
                    }
                    return plugins;
                }
            });
            
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en', 'id-ID', 'id'].slice(0, 2 + Math.floor(Math.random() * 2))
            });
            """,
        ]
    
    def load_behavior_patterns(self) -> Dict:
        """Load realistic human behavior patterns"""
        return {
            "mouse_movements": [
                {"type": "linear", "probability": 0.3},
                {"type": "curved", "probability": 0.5},
                {"type": "hesitation", "probability": 0.2}
            ],
            "scroll_patterns": [
                {"type": "smooth", "probability": 0.4},
                {"type": "jerky", "probability": 0.3},
                {"type": "pause_resume", "probability": 0.3}
            ],
            "click_patterns": [
                {"type": "single", "probability": 0.7},
                {"type": "double", "probability": 0.2},
                {"type": "right_click", "probability": 0.1}
            ],
            "reading_patterns": [
                {"type": "fast_reader", "probability": 0.2},
                {"type": "average_reader", "probability": 0.6},
                {"type": "slow_reader", "probability": 0.2}
            ]
        }
    
    def generate_behavioral_signature(self, user_type: str = "average") -> Dict:
        """Generate unique behavioral signature for each session"""
        signatures = {
            "fast_reader": {
                "scroll_speed": (200, 400),
                "reading_speed": (150, 250),  # words per minute
                "click_delay": (0.1, 0.3),
                "mouse_speed": (100, 200)
            },
            "average_reader": {
                "scroll_speed": (100, 200),
                "reading_speed": (200, 300),
                "click_delay": (0.3, 0.8),
                "mouse_speed": (50, 100)
            },
            "slow_reader": {
                "scroll_speed": (50, 100),
                "reading_speed": (250, 350),
                "click_delay": (0.8, 1.5),
                "mouse_speed": (25, 50)
            }
        }
        
        base_signature = signatures.get(user_type, signatures["average_reader"])
        
        # Add randomization to make each signature unique
        return {
            "scroll_speed": random.randint(*base_signature["scroll_speed"]),
            "reading_speed": random.randint(*base_signature["reading_speed"]),
            "click_delay": random.uniform(*base_signature["click_delay"]),
            "mouse_speed": random.randint(*base_signature["mouse_speed"]),
            "hesitation_factor": random.uniform(0.1, 0.3),
            "accuracy_factor": random.uniform(0.8, 0.95)
        }
    
    def inject_stealth_scripts(self, multilogin_manager, profile_id: str, stealth_level: str = "advanced") -> bool:
        """Inject stealth scripts into browser"""
        try:
            scripts = self.stealth_levels.get(stealth_level, self.stealth_levels["advanced"])
            
            for i, script in enumerate(scripts):
                result = multilogin_manager.execute_script(profile_id, script)
                if result:
                    self.logger.debug(f"Injected stealth script {i+1}/{len(scripts)}")
                else:
                    self.logger.warning(f"Failed to inject stealth script {i+1}")
                
                # Small delay between injections
                time.sleep(random.uniform(0.1, 0.3))
            
            self.logger.info(f"Stealth scripts injected successfully (level: {stealth_level})")
            return True
            
        except Exception as e:
            self.logger.error(f"Error injecting stealth scripts: {str(e)}")
            return False
    
    def monitor_detection_indicators(self, session_data: Dict) -> Dict:
        """Monitor and analyze detection indicators"""
        indicators = {
            "bot_detection_score": 0,
            "suspicious_activities": [],
            "recommendations": []
        }
        
        # Check for suspicious patterns
        if session_data.get("duration", 0) < 180:  # Less than 3 minutes
            indicators["bot_detection_score"] += 20
            indicators["suspicious_activities"].append("Session too short")
            indicators["recommendations"].append("Increase session duration")
        
        if session_data.get("page_views", 0) < 2:
            indicators["bot_detection_score"] += 15
            indicators["suspicious_activities"].append("Too few page views")
            indicators["recommendations"].append("Navigate to more pages")
        
        if session_data.get("interaction_count", 0) < 5:
            indicators["bot_detection_score"] += 10
            indicators["suspicious_activities"].append("Low interaction count")
            indicators["recommendations"].append("Increase user interactions")
        
        # Check for perfect timing patterns
        interactions = session_data.get("interactions", [])
        if len(interactions) > 2:
            timestamps = [i.get("timestamp", 0) for i in interactions]
            intervals = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps)-1)]
            
            # Check for too regular intervals
            if len(set(intervals)) < len(intervals) * 0.5:
                indicators["bot_detection_score"] += 25
                indicators["suspicious_activities"].append("Too regular interaction timing")
                indicators["recommendations"].append("Randomize interaction timing")
        
        # Determine risk level
        if indicators["bot_detection_score"] > 50:
            indicators["risk_level"] = "HIGH"
        elif indicators["bot_detection_score"] > 25:
            indicators["risk_level"] = "MEDIUM"
        else:
            indicators["risk_level"] = "LOW"
        
        return indicators
    
    def get_stealth_recommendations(self, detection_indicators: Dict) -> List[str]:
        """Get recommendations to improve stealth"""
        recommendations = []
        
        if detection_indicators["risk_level"] == "HIGH":
            recommendations.extend([
                "Increase session duration to minimum 5 minutes",
                "Add more random interactions",
                "Vary timing between actions",
                "Use more diverse mouse movements",
                "Add occasional pauses and hesitations"
            ])
        elif detection_indicators["risk_level"] == "MEDIUM":
            recommendations.extend([
                "Slightly increase session duration",
                "Add 2-3 more page interactions",
                "Vary scroll patterns",
                "Add occasional text selection"
            ])
        
        return recommendations
