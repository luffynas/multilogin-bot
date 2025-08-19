"""
Advanced Audio Context Emulator
Provides realistic audio capabilities for device emulation
"""

import random
import json
from typing import Dict, List, Optional, Tuple
import logging

class AdvancedAudioEmulator:
    """Advanced audio context emulation for realistic device behavior"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Audio profiles for different device types
        self.audio_profiles = {
            "desktop_windows": {
                "sample_rate": 48000,
                "channel_count": 2,
                "latency": 0.005,  # 5ms
                "buffer_size": 512,
                "supported_formats": ["wav", "mp3", "aac", "ogg"],
                "audio_devices": {
                    "inputs": [
                        {"name": "Microphone (Realtek High Definition Audio)", "channels": 1, "sample_rate": 48000},
                        {"name": "Line In (Realtek High Definition Audio)", "channels": 2, "sample_rate": 48000}
                    ],
                    "outputs": [
                        {"name": "Speakers (Realtek High Definition Audio)", "channels": 2, "sample_rate": 48000},
                        {"name": "Headphones (Realtek High Definition Audio)", "channels": 2, "sample_rate": 48000}
                    ]
                },
                "audio_processing": {
                    "max_channels": 8,
                    "max_sample_rate": 192000,
                    "supported_effects": ["reverb", "echo", "compression", "equalizer"]
                }
            },
            "desktop_mac": {
                "sample_rate": 48000,
                "channel_count": 2,
                "latency": 0.003,  # 3ms
                "buffer_size": 256,
                "supported_formats": ["wav", "mp3", "aac", "alac", "ogg"],
                "audio_devices": {
                    "inputs": [
                        {"name": "Built-in Microphone", "channels": 1, "sample_rate": 48000},
                        {"name": "External Microphone", "channels": 2, "sample_rate": 48000}
                    ],
                    "outputs": [
                        {"name": "Built-in Output", "channels": 2, "sample_rate": 48000},
                        {"name": "Headphones", "channels": 2, "sample_rate": 48000}
                    ]
                },
                "audio_processing": {
                    "max_channels": 16,
                    "max_sample_rate": 192000,
                    "supported_effects": ["reverb", "echo", "compression", "equalizer", "spatial_audio"]
                }
            },
            "mobile_android": {
                "sample_rate": 44100,
                "channel_count": 2,
                "latency": 0.010,  # 10ms
                "buffer_size": 1024,
                "supported_formats": ["wav", "mp3", "aac", "ogg", "flac"],
                "audio_devices": {
                    "inputs": [
                        {"name": "Built-in Microphone", "channels": 1, "sample_rate": 44100},
                        {"name": "Bluetooth Microphone", "channels": 1, "sample_rate": 44100}
                    ],
                    "outputs": [
                        {"name": "Built-in Speaker", "channels": 2, "sample_rate": 44100},
                        {"name": "Bluetooth Headphones", "channels": 2, "sample_rate": 44100}
                    ]
                },
                "audio_processing": {
                    "max_channels": 4,
                    "max_sample_rate": 96000,
                    "supported_effects": ["reverb", "echo", "noise_reduction"]
                }
            },
            "mobile_ios": {
                "sample_rate": 44100,
                "channel_count": 2,
                "latency": 0.008,  # 8ms
                "buffer_size": 512,
                "supported_formats": ["wav", "mp3", "aac", "alac"],
                "audio_devices": {
                    "inputs": [
                        {"name": "Built-in Microphone", "channels": 1, "sample_rate": 44100},
                        {"name": "Lightning Microphone", "channels": 2, "sample_rate": 48000}
                    ],
                    "outputs": [
                        {"name": "Built-in Speaker", "channels": 2, "sample_rate": 44100},
                        {"name": "Lightning Headphones", "channels": 2, "sample_rate": 48000}
                    ]
                },
                "audio_processing": {
                    "max_channels": 8,
                    "max_sample_rate": 96000,
                    "supported_effects": ["reverb", "echo", "spatial_audio", "noise_cancellation"]
                }
            }
        }
        
        # Audio context states
        self.audio_context_states = {
            "suspended": "suspended",
            "running": "running",
            "closed": "closed"
        }
        
    def generate_audio_profile(self, device_type: str) -> Dict:
        """Generate realistic audio profile for device type"""
        base_profile = self.audio_profiles.get(device_type, self.audio_profiles["desktop_windows"])
        
        # Add some randomization to make each profile unique
        audio_profile = base_profile.copy()
        
        # Randomize sample rate within reasonable bounds
        sample_rate_variations = [44100, 48000, 96000]
        audio_profile["sample_rate"] = random.choice(sample_rate_variations)
        
        # Randomize latency slightly
        latency_variation = random.uniform(0.8, 1.2)
        audio_profile["latency"] *= latency_variation
        
        # Randomize buffer size
        buffer_size_variations = [256, 512, 1024, 2048]
        audio_profile["buffer_size"] = random.choice(buffer_size_variations)
        
        return audio_profile
    
    def get_audio_emulation_scripts(self, audio_profile: Dict) -> List[str]:
        """Get JavaScript scripts for audio context emulation"""
        scripts = []
        
        # Audio Context emulation
        audio_script = f"""
        // Advanced Audio Context Emulation
        const originalAudioContext = window.AudioContext || window.webkitAudioContext;
        
        if (originalAudioContext) {{
            window.AudioContext = function(options) {{
                const context = new originalAudioContext(options);
                
                // Override sample rate
                Object.defineProperty(context, 'sampleRate', {{
                    get: () => {audio_profile['sample_rate']}
                }});
                
                // Override state
                let currentState = '{self.audio_context_states["suspended"]}';
                Object.defineProperty(context, 'state', {{
                    get: () => currentState
                }});
                
                // Override resume method
                const originalResume = context.resume;
                context.resume = function() {{
                    currentState = '{self.audio_context_states["running"]}';
                    return originalResume.call(this);
                }};
                
                // Override suspend method
                const originalSuspend = context.suspend;
                context.suspend = function() {{
                    currentState = '{self.audio_context_states["suspended"]}';
                    return originalSuspend.call(this);
                }};
                
                // Override close method
                const originalClose = context.close;
                context.close = function() {{
                    currentState = '{self.audio_context_states["closed"]}';
                    return originalClose.call(this);
                }};
                
                // Override createBuffer method
                const originalCreateBuffer = context.createBuffer;
                context.createBuffer = function(numberOfChannels, length, sampleRate) {{
                    const buffer = originalCreateBuffer.call(this, numberOfChannels, length, sampleRate);
                    
                    // Add subtle noise to audio data for fingerprinting
                    for (let channel = 0; channel < numberOfChannels; channel++) {{
                        const channelData = buffer.getChannelData(channel);
                        for (let i = 0; i < channelData.length; i++) {{
                            // Add very subtle noise (0.0001 amplitude)
                            channelData[i] += (Math.random() - 0.5) * 0.0001;
                        }}
                    }}
                    
                    return buffer;
                }};
                
                // Override getChannelData method
                const originalGetChannelData = AudioBuffer.prototype.getChannelData;
                AudioBuffer.prototype.getChannelData = function(channel) {{
                    const data = originalGetChannelData.call(this, channel);
                    
                    // Add subtle noise for fingerprinting
                    for (let i = 0; i < data.length; i++) {{
                        data[i] += (Math.random() - 0.5) * 0.0001;
                    }}
                    
                    return data;
                }};
                
                return context;
            }};
            
            // Copy static properties
            window.AudioContext.prototype = originalAudioContext.prototype;
        }}
        
        // Audio device enumeration emulation
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {{
            const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
            navigator.mediaDevices.enumerateDevices = function() {{
                return Promise.resolve([
                    // Audio input devices
                    {{
                        deviceId: 'default',
                        kind: 'audioinput',
                        label: '{audio_profile["audio_devices"]["inputs"][0]["name"]}',
                        groupId: 'audio-input-group-1'
                    }},
                    {{
                        deviceId: 'audio-input-1',
                        kind: 'audioinput',
                        label: '{audio_profile["audio_devices"]["inputs"][0]["name"]}',
                        groupId: 'audio-input-group-1'
                    }},
                    // Audio output devices
                    {{
                        deviceId: 'default',
                        kind: 'audiooutput',
                        label: '{audio_profile["audio_devices"]["outputs"][0]["name"]}',
                        groupId: 'audio-output-group-1'
                    }},
                    {{
                        deviceId: 'audio-output-1',
                        kind: 'audiooutput',
                        label: '{audio_profile["audio_devices"]["outputs"][0]["name"]}',
                        groupId: 'audio-output-group-1'
                    }}
                ]);
            }};
        }}
        
        // Audio capabilities emulation
        window.audioCapabilities = {{
            sampleRate: {audio_profile['sample_rate']},
            channelCount: {audio_profile['channel_count']},
            latency: {audio_profile['latency']},
            bufferSize: {audio_profile['buffer_size']},
            supportedFormats: {audio_profile['supported_formats']},
            maxChannels: {audio_profile['audio_processing']['max_channels']},
            maxSampleRate: {audio_profile['audio_processing']['max_sample_rate']},
            supportedEffects: {audio_profile['audio_processing']['supported_effects']}
        }};
        """
        scripts.append(audio_script)
        
        return scripts
    
    def generate_audio_fingerprint(self, audio_profile: Dict) -> str:
        """Generate unique audio fingerprint"""
        # Create fingerprint based on audio capabilities
        fingerprint_data = {
            "sample_rate": audio_profile["sample_rate"],
            "channel_count": audio_profile["channel_count"],
            "latency": audio_profile["latency"],
            "buffer_size": audio_profile["buffer_size"],
            "device_count": len(audio_profile["audio_devices"]["inputs"]) + len(audio_profile["audio_devices"]["outputs"]),
            "supported_formats": len(audio_profile["supported_formats"]),
            "max_channels": audio_profile["audio_processing"]["max_channels"],
            "max_sample_rate": audio_profile["audio_processing"]["max_sample_rate"]
        }
        
        # Convert to string and hash
        import hashlib
        fingerprint_string = json.dumps(fingerprint_data, sort_keys=True)
        return hashlib.md5(fingerprint_string.encode()).hexdigest()
    
    def get_audio_analytics(self) -> Dict:
        """Get audio analytics summary"""
        return {
            "total_audio_profiles": len(self.audio_profiles),
            "supported_device_types": list(self.audio_profiles.keys()),
            "average_sample_rate": sum(p["sample_rate"] for p in self.audio_profiles.values()) / len(self.audio_profiles),
            "average_latency": sum(p["latency"] for p in self.audio_profiles.values()) / len(self.audio_profiles),
            "total_audio_devices": sum(
                len(p["audio_devices"]["inputs"]) + len(p["audio_devices"]["outputs"]) 
                for p in self.audio_profiles.values()
            )
        }
