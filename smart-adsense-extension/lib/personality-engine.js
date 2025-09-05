/**
 * Personality Engine - Menentukan personalisasi konten dan behavior membaca
 */

class PersonalityEngine {
    constructor() {
        // Enhanced configuration for personalization and persistence
        this.config = {
            // Personality management
            enableAdaptiveLearning: true,
            enableBehavioralAnalytics: true,
            enableSessionPersistence: true,
            enableUserPreferences: true,
            
            // Learning and adaptation
            learningRate: 0.1,
            adaptationThreshold: 5,
            maxPersonalityChanges: 3,
            behaviorMemorySize: 100,
            
            // Session management
            sessionTimeout: 3600000, // 1 hour
            autoSaveInterval: 30000, // 30 seconds
            enableCrossSessionLearning: true,
            
            // Personalization
            enableDynamicPreferences: true,
            enableContextualAdaptation: true,
            enableEmotionalIntelligence: true,
            enableCognitiveLoadOptimization: true
        };

        // Enhanced personality types with dynamic properties
        this.personalityTypes = {
            'explorer': {
                name: 'Explorer',
                description: 'Curious and adventurous reader',
                readingSpeed: { min: 180, max: 220, adaptive: true },
                readingStyle: 'curious',
                interactionLevel: 'high',
                scrollBehavior: 'exploratory',
                pauseFrequency: 'medium',
                learningStyle: 'experimental',
                attentionSpan: 'variable',
                emotionalResponse: 'excited',
                cognitiveLoad: 'medium'
            },
            'researcher': {
                name: 'Researcher',
                description: 'Thorough and analytical reader',
                readingSpeed: { min: 150, max: 180, adaptive: true },
                readingStyle: 'thorough',
                interactionLevel: 'medium',
                scrollBehavior: 'systematic',
                pauseFrequency: 'high',
                learningStyle: 'analytical',
                attentionSpan: 'long',
                emotionalResponse: 'focused',
                cognitiveLoad: 'high'
            },
            'casual': {
                name: 'Casual',
                description: 'Quick and relaxed reader',
                readingSpeed: { min: 200, max: 250, adaptive: true },
                readingStyle: 'skim',
                interactionLevel: 'low',
                scrollBehavior: 'quick',
                pauseFrequency: 'low',
                learningStyle: 'passive',
                attentionSpan: 'short',
                emotionalResponse: 'relaxed',
                cognitiveLoad: 'low'
            },
            'professional': {
                name: 'Professional',
                description: 'Efficient and goal-oriented reader',
                readingSpeed: { min: 160, max: 200, adaptive: true },
                readingStyle: 'focused',
                interactionLevel: 'medium',
                scrollBehavior: 'efficient',
                pauseFrequency: 'medium',
                learningStyle: 'practical',
                attentionSpan: 'medium',
                emotionalResponse: 'neutral',
                cognitiveLoad: 'medium'
            },
            'creative': {
                name: 'Creative',
                description: 'Imaginative and artistic reader',
                readingSpeed: { min: 140, max: 190, adaptive: true },
                readingStyle: 'imaginative',
                interactionLevel: 'high',
                scrollBehavior: 'creative',
                pauseFrequency: 'high',
                learningStyle: 'visual',
                attentionSpan: 'variable',
                emotionalResponse: 'inspired',
                cognitiveLoad: 'medium'
            },
            'academic': {
                name: 'Academic',
                description: 'Scholarly and research-oriented reader',
                readingSpeed: { min: 130, max: 170, adaptive: true },
                readingStyle: 'scholarly',
                interactionLevel: 'high',
                scrollBehavior: 'methodical',
                pauseFrequency: 'very-high',
                learningStyle: 'theoretical',
                attentionSpan: 'very-long',
                emotionalResponse: 'contemplative',
                cognitiveLoad: 'very-high'
            }
        };

        // Enhanced session management
        this.currentPersonality = this.loadPersonality() || this.selectRandomPersonality();
        this.sessionStartTime = Date.now();
        this.sessionId = this.generateSessionId();
        this.lastActivity = Date.now();
        
        // Enhanced personalization data
        this.userPreferences = this.loadUserPreferences();
        this.behavioralData = this.loadBehavioralData();
        this.learningHistory = this.loadLearningHistory();
        this.adaptationMetrics = this.loadAdaptationMetrics();
        
        // Enhanced behavioral tracking
        this.interactionHistory = [];
        this.readingPatterns = [];
        this.preferenceChanges = [];
        this.performanceMetrics = {
            totalSessions: 0,
            averageReadingTime: 0,
            personalityChanges: 0,
            preferenceAdaptations: 0,
            learningProgress: 0
        };
        
        // Enhanced learning system
        this.learningWeights = {
            readingSpeed: 0.3,
            interactionLevel: 0.25,
            scrollBehavior: 0.2,
            pauseFrequency: 0.15,
            topicPreference: 0.1
        };
        
        // Enhanced context awareness
        this.contextData = {
            currentTime: this.getTimeOfDay(),
            deviceType: this.getDeviceType(),
            userLocation: this.getUserLocation(),
            previousSites: this.getPreviousSites(),
            currentMood: this.detectCurrentMood()
        };
        
        // Initialize unified storage service
        this.storageService = new StorageService();
        
        // Initialize persistence and analytics
        this.initializePersistence();
        this.initializeAnalytics();
        
        console.log('🚀 Enhanced Personality Engine initialized with config:', this.config);
    }

    selectRandomPersonality() {
        const types = Object.keys(this.personalityTypes);
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex];
    }

    determinePersonalization(content) {
        const topics = this.analyzeContentTopics(content || '');
        const readingPreferences = this.getReadingPreferences();
        
        return {
            personality: this.currentPersonality,
            topics: topics,
            preferences: readingPreferences,
            deviceType: this.getDeviceType(),
            timeOfDay: this.getTimeOfDay()
        };
    }

    determineReadingBehavior() {
        const personality = this.personalityTypes[this.currentPersonality];
        
        return {
            type: this.currentPersonality,
            readingSpeed: this.getRandomInRange(personality.readingSpeed),
            style: personality.readingStyle,
            interactionLevel: personality.interactionLevel,
            scrollBehavior: personality.scrollBehavior,
            pauseFrequency: personality.pauseFrequency,
            eyeMovement: this.generateEyeMovementPattern(),
            textSelection: this.shouldSelectText(),
            reReading: this.shouldReRead()
        };
    }

    calculateReadingTime(content) {
        const wordCount = this.getWordCount(content || '');
        const personality = this.personalityTypes[this.currentPersonality];
        const readingSpeed = this.getRandomInRange(personality.readingSpeed);
        
        // Calculate base reading time
        let baseTime = wordCount / readingSpeed;
        
        // Apply personality modifiers
        switch (this.currentPersonality) {
            case 'researcher':
                baseTime *= 1.5; // 50% slower for thorough reading
                break;
            case 'casual':
                baseTime *= 0.7; // 30% faster for skimming
                break;
            case 'explorer':
                baseTime *= 1.2; // 20% slower for exploration
                break;
            case 'professional':
                baseTime *= 1.1; // 10% slower for focus
                break;
        }
        
        // Ensure reading time is between 2-5 minutes
        const minTime = 2;
        const maxTime = 5;
        
        return Math.max(minTime, Math.min(maxTime, Math.ceil(baseTime)));
    }

    analyzeContentTopics(content) {
        const text = (content && content.text) || content || '';
        const title = (content && content.title) || '';
        const fullText = `${title} ${text}`.toLowerCase();
        
        // const topics = {
        //     technology: ['tech', 'software', 'programming', 'computer', 'digital', 'app', 'mobile', 'web', 'internet'],
        //     business: ['business', 'entrepreneur', 'startup', 'company', 'market', 'finance', 'money', 'investment'],
        //     health: ['health', 'medical', 'fitness', 'wellness', 'diet', 'exercise', 'nutrition', 'medicine'],
        //     lifestyle: ['lifestyle', 'fashion', 'beauty', 'travel', 'food', 'home', 'family', 'life'],
        //     education: ['education', 'learning', 'study', 'course', 'tutorial', 'guide', 'knowledge', 'school']
        // };
        const topics = {
            technology: [
                'tech', 'software', 'programming', 'computer', 'digital', 'app', 'mobile', 'web', 'internet',
                // Indonesia
                'teknologi', 'perangkat lunak', 'komputer', 'aplikasi', 'internet cepat',
                // Malaysia
                'teknologi maklumat', 'aplikasi mudah alih', 'perisian', 'komputer riba',
                // Germany
                'Technologie', 'Software', 'Computer', 'Internet', 'Digitale Welt',
                // France
                'technologie', 'logiciel', 'ordinateur', 'numérique', 'application mobile'
            ],
            business: [
                'business', 'entrepreneur', 'startup', 'company', 'market', 'finance', 'money', 'investment',
                // Indonesia
                'bisnis', 'usaha', 'perusahaan', 'pasar', 'ekonomi', 'investasi', 'keuangan',
                // Malaysia
                'perniagaan', 'usahawan', 'syarikat', 'pasaran', 'pelaburan', 'ekonomi',
                // Germany
                'Geschäft', 'Unternehmen', 'Markt', 'Finanzen', 'Investition', 'Wirtschaft',
                // France
                'entreprise', 'marché', 'finance', 'argent', 'investissement', 'économie'
            ],
            health: [
                'health', 'medical', 'fitness', 'wellness', 'diet', 'exercise', 'nutrition', 'medicine',
                // Indonesia
                'kesehatan', 'medis', 'olahraga', 'gizi', 'diet sehat', 'dokter', 'obat',
                // Malaysia
                'kesihatan', 'perubatan', 'senaman', 'pemakanan', 'ubat-ubatan',
                // Germany
                'Gesundheit', 'medizinisch', 'Fitness', 'Ernährung', 'Diät', 'Arzt', 'Medizin',
                // France
                'santé', 'médical', 'forme', 'nutrition', 'régime', 'médecin', 'médicament'
            ],
            lifestyle: [
                'lifestyle', 'fashion', 'beauty', 'travel', 'food', 'home', 'family', 'life',
                // Indonesia
                'gaya hidup', 'fashion indonesia', 'kuliner', 'wisata', 'keluarga', 'rumah tangga',
                // Malaysia
                'gaya hidup', 'fesyen', 'pelancongan', 'makanan', 'keluarga', 'rumah',
                // Germany
                'Lebensstil', 'Mode', 'Schönheit', 'Reisen', 'Essen', 'Familie', 'Zuhause',
                // France
                'style de vie', 'mode', 'beauté', 'voyage', 'cuisine', 'famille', 'maison'
            ],
            education: [
                'education', 'learning', 'study', 'course', 'tutorial', 'guide', 'knowledge', 'school',
                // Indonesia
                'pendidikan', 'belajar', 'kuliah', 'kursus', 'tutorial bahasa', 'sekolah',
                // Malaysia
                'pendidikan', 'pembelajaran', 'kursus', 'panduan belajar', 'sekolah',
                // Germany
                'Bildung', 'lernen', 'Studium', 'Kurs', 'Schule', 'Wissen', 'Anleitung',
                // France
                'éducation', 'apprentissage', 'étude', 'cours', 'tutoriel', 'école', 'connaissance'
            ]
        };        
        
        const detectedTopics = [];
        
        Object.entries(topics).forEach(([topic, keywords]) => {
            const matchCount = keywords.filter(keyword => 
                fullText.includes(keyword)
            ).length;
            
            if (matchCount > 0) {
                detectedTopics.push({
                    topic,
                    relevance: matchCount / keywords.length,
                    keywords: keywords.filter(keyword => fullText.includes(keyword))
                });
            }
        });
        
        // Sort by relevance
        detectedTopics.sort((a, b) => b.relevance - a.relevance);
        
        return detectedTopics;
    }

    getReadingPreferences() {
        const preferences = {
            fontSize: this.getPreferredFontSize(),
            lineHeight: this.getPreferredLineHeight(),
            colorScheme: this.getPreferredColorScheme(),
            focusAreas: this.getFocusAreas()
        };
        
        return preferences;
    }

    getPreferredFontSize() {
        const sizes = ['small', 'medium', 'large'];
        const weights = [0.3, 0.5, 0.2]; // Probability weights
        
        return this.weightedRandomChoice(sizes, weights);
    }

    getPreferredLineHeight() {
        const heights = [1.2, 1.4, 1.6, 1.8];
        return heights[Math.floor(Math.random() * heights.length)];
    }

    getPreferredColorScheme() {
        return Math.random() > 0.5 ? 'light' : 'dark';
    }

    getFocusAreas() {
        const areas = ['title', 'introduction', 'main-content', 'conclusion', 'images'];
        const numAreas = Math.floor(Math.random() * 3) + 2; // 2-4 areas
        
        return this.shuffleArray(areas).slice(0, numAreas);
    }

    generateEyeMovementPattern() {
        const patterns = {
            'explorer': 'zigzag',
            'researcher': 'linear',
            'casual': 'quick-scan',
            'professional': 'focused-linear'
        };
        
        return patterns[this.currentPersonality];
    }

    shouldSelectText() {
        const selectionRates = {
            'explorer': 0.3,
            'researcher': 0.6,
            'casual': 0.1,
            'professional': 0.4
        };
        
        return Math.random() < selectionRates[this.currentPersonality];
    }

    shouldReRead() {
        const reReadRates = {
            'explorer': 0.2,
            'researcher': 0.5,
            'casual': 0.05,
            'professional': 0.3
        };
        
        return Math.random() < reReadRates[this.currentPersonality];
    }

    getDeviceType() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent);
        return isMobile ? 'mobile' : 'desktop';
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    getWordCount(text) {
        if (!text || typeof text !== 'string') return 0;
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    getRandomInRange(range) {
        return Math.random() * (range.max - range.min) + range.min;
    }

    weightedRandomChoice(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    getPersonalityInfo() {
        return {
            type: this.currentPersonality,
            name: this.personalityTypes[this.currentPersonality].name,
            sessionStartTime: this.sessionStartTime,
            sessionDuration: Date.now() - this.sessionStartTime
        };
    }

    // Enhanced persistence and session management
    initializePersistence() {
        if (this.config.enableSessionPersistence) {
            // Auto-save interval
            this.persistenceInterval = setInterval(() => {
                this.saveSessionData();
            }, this.config.autoSaveInterval);
            
            // Session timeout handler
            this.sessionTimeoutHandler = setTimeout(() => {
                this.handleSessionTimeout();
            }, this.config.sessionTimeout);
        }
    }

    initializeAnalytics() {
        if (this.config.enableBehavioralAnalytics) {
            // Track user interactions
            this.trackUserInteractions();
            
            // Monitor reading patterns
            this.monitorReadingPatterns();
            
            // Analyze behavioral changes
            this.analyzeBehavioralChanges();
        }
    }

    // Enhanced session management
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async saveSessionData() {
        try {
            const sessionData = {
                sessionId: this.sessionId,
                personality: this.currentPersonality,
                preferences: this.userPreferences,
                behavioralData: this.behavioralData,
                learningHistory: this.learningHistory,
                adaptationMetrics: this.adaptationMetrics,
                timestamp: Date.now()
            };
            
            if (this.storageService) {
                await this.storageService.set('personality_engine_session', sessionData);
                console.log('💾 Session data saved to unified storage successfully');
            }
            
        } catch (error) {
            console.warn('⚠️ Error saving session data to unified storage:', error);
        }
    }

    async loadPersonality() {
        try {
            if (this.storageService) {
                const sessionData = await this.storageService.get('personality_engine_session');
                if (sessionData) {
                    const timeDiff = Date.now() - sessionData.timestamp;
                    
                    // Check if session is still valid
                    if (timeDiff < this.config.sessionTimeout) {
                        console.log('📂 Session data loaded from unified storage successfully');
                        return sessionData.personality;
                    } else {
                        console.log('⏰ Session expired, starting new session');
                        await this.storageService.remove('personality_engine_session');
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Error loading session data from unified storage:', error);
        }
        return null;
    }

    async loadUserPreferences() {
        try {
            if (this.storageService) {
                const preferences = await this.storageService.get('personality_engine_preferences');
                if (preferences) {
                    return preferences;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error loading user preferences from unified storage:', error);
        }
        
        // Default preferences
        return {
            fontSize: 'medium',
            lineHeight: 1.4,
            colorScheme: 'light',
            focusAreas: ['title', 'main-content'],
            readingMode: 'standard',
            accessibility: 'normal'
        };
    }

    async loadBehavioralData() {
        try {
            if (this.storageService) {
                const data = await this.storageService.get('personality_engine_behavioral');
                if (data) {
                    return data;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error loading behavioral data from unified storage:', error);
        }
        
        return {
            totalSessions: 0,
            averageReadingTime: 0,
            preferredTopics: [],
            readingSpeedHistory: [],
            interactionPatterns: []
        };
    }

    async loadLearningHistory() {
        try {
            if (this.storageService) {
                const history = await this.storageService.get('personality_engine_learning');
                if (history) {
                    return history;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error loading learning history from unified storage:', error);
        }
        
        return {
            personalityChanges: [],
            preferenceAdaptations: [],
            learningProgress: 0,
            adaptationHistory: []
        };
    }

    async loadAdaptationMetrics() {
        try {
            if (this.storageService) {
                const metrics = await this.storageService.get('personality_engine_adaptation');
                if (metrics) {
                    return metrics;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error loading adaptation metrics from unified storage:', error);
        }
        
        return {
            successRate: 0,
            adaptationCount: 0,
            lastAdaptation: null,
            improvementTrend: 'stable'
        };
    }

    // Enhanced personalization and learning
    async updateUserPreferences(newPreferences) {
        try {
            this.userPreferences = { ...this.userPreferences, ...newPreferences };
            this.preferenceChanges.push({
                timestamp: Date.now(),
                changes: newPreferences,
                reason: 'user_update'
            });
            
            // Save to unified storage
            if (this.storageService) {
                await this.storageService.set('personality_engine_preferences', this.userPreferences);
            }
            
            // Trigger adaptation if needed
            if (this.config.enableAdaptiveLearning) {
                this.adaptToPreferenceChanges(newPreferences);
            }
            
            console.log('✅ User preferences updated successfully');
            
        } catch (error) {
            console.warn('⚠️ Error updating user preferences:', error);
        }
    }

    adaptToPreferenceChanges(changes) {
        try {
            // Analyze preference changes
            const adaptationScore = this.calculateAdaptationScore(changes);
            
            if (adaptationScore > this.config.adaptationThreshold) {
                // Trigger personality adaptation
                this.adaptPersonality(changes);
                
                // Update adaptation metrics
                this.updateAdaptationMetrics(adaptationScore);
            }
            
        } catch (error) {
            console.warn('⚠️ Error adapting to preference changes:', error);
        }
    }

    calculateAdaptationScore(changes) {
        let score = 0;
        
        // Weight different types of changes
        if (changes.fontSize) score += 2;
        if (changes.lineHeight) score += 1;
        if (changes.colorScheme) score += 3;
        if (changes.focusAreas) score += 2;
        if (changes.readingMode) score += 4;
        if (changes.accessibility) score += 3;
        
        return score;
    }

    adaptPersonality(changes) {
        try {
            const currentPersonality = this.personalityTypes[this.currentPersonality];
            let bestMatch = this.currentPersonality;
            let bestScore = 0;
            
            // Find best matching personality based on changes
            Object.entries(this.personalityTypes).forEach(([type, personality]) => {
                const score = this.calculatePersonalityMatch(personality, changes);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = type;
                }
            });
            
            // Change personality if significantly better match found
            if (bestMatch !== this.currentPersonality && bestScore > currentPersonality.score + 0.2) {
                this.changePersonality(bestMatch);
            }
            
        } catch (error) {
            console.warn('⚠️ Error adapting personality:', error);
        }
    }

    calculatePersonalityMatch(personality, changes) {
        let score = 0;
        
        // Match reading preferences with personality traits
        if (changes.readingMode === 'fast' && personality.readingSpeed.max > 200) score += 0.3;
        if (changes.readingMode === 'slow' && personality.readingSpeed.max < 180) score += 0.3;
        if (changes.accessibility === 'high' && personality.cognitiveLoad === 'low') score += 0.2;
        if (changes.focusAreas && personality.attentionSpan === 'long') score += 0.2;
        
        return score;
    }

    changePersonality(newPersonality) {
        try {
            if (this.personalityTypes[newPersonality]) {
                const oldPersonality = this.currentPersonality;
                this.currentPersonality = newPersonality;
                
                // Record personality change
                this.learningHistory.personalityChanges.push({
                    timestamp: Date.now(),
                    from: oldPersonality,
                    to: newPersonality,
                    reason: 'adaptive_learning',
                    context: this.contextData
                });
                
                // Update performance metrics
                this.performanceMetrics.personalityChanges++;
                
                // Save changes
                this.saveSessionData();
                
                console.log(`🔄 Personality changed from ${oldPersonality} to ${newPersonality}`);
                
                // Trigger context update
                this.updateContext();
                
            } else {
                console.warn('⚠️ Invalid personality type:', newPersonality);
            }
            
        } catch (error) {
            console.warn('⚠️ Error changing personality:', error);
        }
    }

    // Enhanced behavioral tracking
    trackUserInteractions() {
        try {
            // Track scroll behavior
            let lastScrollY = window.scrollY;
            let scrollCount = 0;
            
            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;
                const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
                const scrollDistance = Math.abs(currentScrollY - lastScrollY);
                
                this.interactionHistory.push({
                    type: 'scroll',
                    direction: scrollDirection,
                    distance: scrollDistance,
                    timestamp: Date.now()
                });
                
                lastScrollY = currentScrollY;
                scrollCount++;
                
                // Analyze scroll patterns
                if (scrollCount % 10 === 0) {
                    this.analyzeScrollPatterns();
                }
            });
            
            // Track reading behavior
            this.trackReadingBehavior();
            
        } catch (error) {
            console.warn('⚠️ Error tracking user interactions:', error);
        }
    }

    trackReadingBehavior() {
        try {
            let readingStartTime = null;
            let readingPauses = 0;
            let totalReadingTime = 0;
            
            // Track when user starts reading
            document.addEventListener('click', () => {
                if (!readingStartTime) {
                    readingStartTime = Date.now();
                }
            });
            
            // Track reading pauses
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    readingPauses++;
                    if (readingStartTime) {
                        totalReadingTime += Date.now() - readingStartTime;
                        readingStartTime = null;
                    }
                }
            });
            
            // Save reading data periodically
            setInterval(() => {
                if (readingStartTime) {
                    totalReadingTime += Date.now() - readingStartTime;
                    readingStartTime = Date.now();
                }
                
                this.readingPatterns.push({
                    totalTime: totalReadingTime,
                    pauses: readingPauses,
                    timestamp: Date.now()
                });
                
                // Clean up old patterns
                if (this.readingPatterns.length > this.config.behaviorMemorySize) {
                    this.readingPatterns = this.readingPatterns.slice(-this.config.behaviorMemorySize);
                }
            }, 60000); // Every minute
            
        } catch (error) {
            console.warn('⚠️ Error tracking reading behavior:', error);
        }
    }

    // Enhanced context awareness
    getUserLocation() {
        try {
            // Try to get location from various sources
            if (navigator.geolocation) {
                // Note: This requires user permission
                return 'location_available';
            }
            
            // Fallback to timezone-based location
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            return timezone || 'unknown';
            
        } catch (error) {
            return 'unknown';
        }
    }

    getPreviousSites() {
        try {
            // Get referrer information
            const referrer = document.referrer;
            if (referrer) {
                const domain = new URL(referrer).hostname;
                return [domain];
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    detectCurrentMood() {
        try {
            // Simple mood detection based on time and context
            const hour = new Date().getHours();
            const timeOfDay = this.getTimeOfDay();
            
            let mood = 'neutral';
            
            if (timeOfDay === 'morning' && hour < 10) mood = 'energetic';
            else if (timeOfDay === 'afternoon' && hour >= 14 && hour <= 16) mood = 'focused';
            else if (timeOfDay === 'evening' && hour >= 19) mood = 'relaxed';
            else if (timeOfDay === 'night' && hour >= 22) mood = 'tired';
            
            return mood;
            
        } catch (error) {
            return 'neutral';
        }
    }

    updateContext() {
        try {
            this.contextData = {
                currentTime: this.getTimeOfDay(),
                deviceType: this.getDeviceType(),
                userLocation: this.getUserLocation(),
                previousSites: this.getPreviousSites(),
                currentMood: this.detectCurrentMood()
            };
            
            // Adapt behavior based on new context
            if (this.config.enableContextualAdaptation) {
                this.adaptToContext();
            }
            
        } catch (error) {
            console.warn('⚠️ Error updating context:', error);
        }
    }

    adaptToContext() {
        try {
            const context = this.contextData;
            let adaptations = [];
            
            // Time-based adaptations
            if (context.currentTime === 'night') {
                adaptations.push({ type: 'reading_speed', value: 'slower' });
                adaptations.push({ type: 'interaction_level', value: 'lower' });
            } else if (context.currentTime === 'morning') {
                adaptations.push({ type: 'reading_speed', value: 'faster' });
                adaptations.push({ type: 'interaction_level', value: 'higher' });
            }
            
            // Mood-based adaptations
            if (context.currentMood === 'tired') {
                adaptations.push({ type: 'cognitive_load', value: 'lower' });
                adaptations.push({ type: 'pause_frequency', value: 'higher' });
            } else if (context.currentMood === 'energetic') {
                adaptations.push({ type: 'cognitive_load', value: 'higher' });
                adaptations.push({ type: 'pause_frequency', value: 'lower' });
            }
            
            // Apply adaptations
            adaptations.forEach(adaptation => {
                this.applyContextualAdaptation(adaptation);
            });
            
        } catch (error) {
            console.warn('⚠️ Error adapting to context:', error);
        }
    }

    applyContextualAdaptation(adaptation) {
        try {
            // Apply adaptation to current personality
            const personality = this.personalityTypes[this.currentPersonality];
            
            switch (adaptation.type) {
                case 'reading_speed':
                    if (adaptation.value === 'slower') {
                        personality.readingSpeed.min *= 0.8;
                        personality.readingSpeed.max *= 0.8;
                    } else if (adaptation.value === 'faster') {
                        personality.readingSpeed.min *= 1.2;
                        personality.readingSpeed.max *= 1.2;
                    }
                    break;
                    
                case 'interaction_level':
                    if (adaptation.value === 'lower') {
                        personality.interactionLevel = 'low';
                    } else if (adaptation.value === 'higher') {
                        personality.interactionLevel = 'high';
                    }
                    break;
                    
                case 'cognitive_load':
                    if (adaptation.value === 'lower') {
                        personality.cognitiveLoad = 'low';
                    } else if (adaptation.value === 'higher') {
                        personality.cognitiveLoad = 'high';
                    }
                    break;
                    
                case 'pause_frequency':
                    if (adaptation.value === 'higher') {
                        personality.pauseFrequency = 'high';
                    } else if (adaptation.value === 'lower') {
                        personality.pauseFrequency = 'low';
                    }
                    break;
            }
            
            console.log(`🔄 Applied contextual adaptation: ${adaptation.type} = ${adaptation.value}`);
            
        } catch (error) {
            console.warn('⚠️ Error applying contextual adaptation:', error);
        }
    }

    // Enhanced behavioral analysis and learning
    analyzeScrollPatterns() {
        try {
            const recentScrolls = this.interactionHistory
                .filter(interaction => interaction.type === 'scroll')
                .slice(-20);
            
            if (recentScrolls.length < 5) return;
            
            // Analyze scroll patterns
            const downScrolls = recentScrolls.filter(s => s.direction === 'down').length;
            const upScrolls = recentScrolls.filter(s => s.direction === 'up').length;
            const avgDistance = recentScrolls.reduce((sum, s) => sum + s.distance, 0) / recentScrolls.length;
            
            // Detect reading patterns
            if (downScrolls > upScrolls * 2 && avgDistance > 100) {
                // User is reading down quickly
                this.adaptToReadingPattern('fast_forward');
            } else if (upScrolls > downScrolls && avgDistance < 50) {
                // User is re-reading or going back
                this.adaptToReadingPattern('re_reading');
            } else if (downScrolls === upScrolls && avgDistance < 30) {
                // User is scanning content
                this.adaptToReadingPattern('scanning');
            }
            
        } catch (error) {
            console.warn('⚠️ Error analyzing scroll patterns:', error);
        }
    }

    adaptToReadingPattern(pattern) {
        try {
            const personality = this.personalityTypes[this.currentPersonality];
            
            switch (pattern) {
                case 'fast_forward':
                    // Increase reading speed
                    personality.readingSpeed.min *= 1.1;
                    personality.readingSpeed.max *= 1.1;
                    break;
                    
                case 're_reading':
                    // Decrease reading speed, increase pause frequency
                    personality.readingSpeed.min *= 0.9;
                    personality.readingSpeed.max *= 0.9;
                    personality.pauseFrequency = 'high';
                    break;
                    
                case 'scanning':
                    // Optimize for quick scanning
                    personality.readingSpeed.min *= 1.2;
                    personality.readingSpeed.max *= 1.2;
                    personality.interactionLevel = 'low';
                    break;
            }
            
            // Record adaptation
            this.learningHistory.adaptationHistory.push({
                timestamp: Date.now(),
                pattern: pattern,
                personality: this.currentPersonality,
                adaptations: { ...personality }
            });
            
            console.log(`🔄 Adapted to reading pattern: ${pattern}`);
            
        } catch (error) {
            console.warn('⚠️ Error adapting to reading pattern:', error);
        }
    }

    monitorReadingPatterns() {
        try {
            // Monitor reading speed changes
            if (this.readingPatterns.length > 10) {
                const recentPatterns = this.readingPatterns.slice(-10);
                const avgReadingTime = recentPatterns.reduce((sum, p) => sum + p.totalTime, 0) / recentPatterns.length;
                
                // Update behavioral data
                this.behavioralData.averageReadingTime = avgReadingTime;
                this.behavioralData.readingSpeedHistory.push({
                    timestamp: Date.now(),
                    averageTime: avgReadingTime
                });
                
                // Clean up old history
                if (this.behavioralData.readingSpeedHistory.length > 50) {
                    this.behavioralData.readingSpeedHistory = this.behavioralData.readingSpeedHistory.slice(-50);
                }
                
                // Analyze reading speed trends
                this.analyzeReadingSpeedTrends();
            }
            
        } catch (error) {
            console.warn('⚠️ Error monitoring reading patterns:', error);
        }
    }

    analyzeReadingSpeedTrends() {
        try {
            const history = this.behavioralData.readingSpeedHistory;
            if (history.length < 5) return;
            
            // Calculate trend
            const recent = history.slice(-5);
            const older = history.slice(-10, -5);
            
            const recentAvg = recent.reduce((sum, h) => sum + h.averageTime, 0) / recent.length;
            const olderAvg = older.reduce((sum, h) => sum + h.averageTime, 0) / older.length;
            
            const trend = recentAvg < olderAvg ? 'faster' : 'slower';
            
            // Adapt personality if significant change detected
            if (Math.abs(recentAvg - olderAvg) / olderAvg > 0.2) {
                this.adaptToReadingSpeedTrend(trend, recentAvg, olderAvg);
            }
            
        } catch (error) {
            console.warn('⚠️ Error analyzing reading speed trends:', error);
        }
    }

    adaptToReadingSpeedTrend(trend, recentAvg, olderAvg) {
        try {
            const personality = this.personalityTypes[this.currentPersonality];
            const changeRatio = Math.abs(recentAvg - olderAvg) / olderAvg;
            
            if (trend === 'faster' && changeRatio > 0.2) {
                // User is reading faster, increase speed limits
                personality.readingSpeed.min *= 1.1;
                personality.readingSpeed.max *= 1.1;
                console.log('🔄 Adapted to faster reading trend');
            } else if (trend === 'slower' && changeRatio > 0.2) {
                // User is reading slower, decrease speed limits
                personality.readingSpeed.min *= 0.9;
                personality.readingSpeed.max *= 0.9;
                console.log('🔄 Adapted to slower reading trend');
            }
            
            // Update learning progress
            this.performanceMetrics.learningProgress += 0.1;
            
        } catch (error) {
            console.warn('⚠️ Error adapting to reading speed trend:', error);
        }
    }

    analyzeBehavioralChanges() {
        try {
            // Analyze interaction patterns
            if (this.interactionHistory.length > 20) {
                const recentInteractions = this.interactionHistory.slice(-20);
                const olderInteractions = this.interactionHistory.slice(-40, -20);
                
                // Calculate interaction frequency
                const recentFreq = recentInteractions.length / 20;
                const olderFreq = olderInteractions.length / 20;
                
                // Detect significant changes
                if (Math.abs(recentFreq - olderFreq) / olderFreq > 0.3) {
                    this.adaptToBehavioralChange(recentFreq > olderFreq ? 'increased' : 'decreased');
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Error analyzing behavioral changes:', error);
        }
    }

    adaptToBehavioralChange(changeType) {
        try {
            const personality = this.personalityTypes[this.currentPersonality];
            
            if (changeType === 'increased') {
                // User is more active, increase interaction level
                if (personality.interactionLevel === 'low') {
                    personality.interactionLevel = 'medium';
                } else if (personality.interactionLevel === 'medium') {
                    personality.interactionLevel = 'high';
                }
                console.log('🔄 Adapted to increased interaction level');
            } else {
                // User is less active, decrease interaction level
                if (personality.interactionLevel === 'high') {
                    personality.interactionLevel = 'medium';
                } else if (personality.interactionLevel === 'medium') {
                    personality.interactionLevel = 'low';
                }
                console.log('🔄 Adapted to decreased interaction level');
            }
            
        } catch (error) {
            console.warn('⚠️ Error adapting to behavioral change:', error);
        }
    }

    // Enhanced utility methods
    async updateAdaptationMetrics(score) {
        try {
            this.adaptationMetrics.adaptationCount++;
            this.adaptationMetrics.lastAdaptation = Date.now();
            
            // Calculate success rate based on user behavior
            const recentChanges = this.learningHistory.personalityChanges.slice(-5);
            if (recentChanges.length > 0) {
                const successfulChanges = recentChanges.filter(change => {
                    // Consider change successful if user stays with new personality
                    return Date.now() - change.timestamp > 300000; // 5 minutes
                }).length;
                
                this.adaptationMetrics.successRate = successfulChanges / recentChanges.length;
            }
            
            // Determine improvement trend
            if (this.adaptationMetrics.successRate > 0.7) {
                this.adaptationMetrics.improvementTrend = 'improving';
            } else if (this.adaptationMetrics.successRate < 0.3) {
                this.adaptationMetrics.improvementTrend = 'declining';
            } else {
                this.adaptationMetrics.improvementTrend = 'stable';
            }
            
            // Save metrics to unified storage
            if (this.storageService) {
                await this.storageService.set('personality_engine_adaptation', this.adaptationMetrics);
            }
            
        } catch (error) {
            console.warn('⚠️ Error updating adaptation metrics:', error);
        }
    }

    handleSessionTimeout() {
        try {
            console.log('⏰ Session timeout reached, cleaning up...');
            
            // Save final session data
            this.saveSessionData();
            
            // Clear intervals
            if (this.persistenceInterval) {
                clearInterval(this.persistenceInterval);
            }
            
            // Reset session
            this.sessionStartTime = Date.now();
            this.sessionId = this.generateSessionId();
            
            // Update performance metrics
            this.performanceMetrics.totalSessions++;
            
            // Start new session
            this.initializePersistence();
            
        } catch (error) {
            console.warn('⚠️ Error handling session timeout:', error);
        }
    }

    // Enhanced personalization methods
    getPersonalizedReadingBehavior() {
        try {
            const personality = this.personalityTypes[this.currentPersonality];
            const context = this.contextData;
            
            // Apply contextual modifications
            let readingSpeed = this.getRandomInRange(personality.readingSpeed);
            let interactionLevel = personality.interactionLevel;
            let pauseFrequency = personality.pauseFrequency;
            
            // Time-based modifications
            if (context.currentTime === 'night') {
                readingSpeed *= 0.8; // Slower at night
                interactionLevel = 'low';
                pauseFrequency = 'high';
            } else if (context.currentTime === 'morning') {
                readingSpeed *= 1.2; // Faster in morning
                interactionLevel = 'high';
                pauseFrequency = 'low';
            }
            
            // Mood-based modifications
            if (context.currentMood === 'tired') {
                readingSpeed *= 0.7;
                interactionLevel = 'low';
                pauseFrequency = 'very-high';
            } else if (context.currentMood === 'energetic') {
                readingSpeed *= 1.3;
                interactionLevel = 'high';
                pauseFrequency = 'low';
            }
            
            return {
                type: this.currentPersonality,
                readingSpeed: Math.round(readingSpeed),
                style: personality.readingStyle,
                interactionLevel: interactionLevel,
                scrollBehavior: personality.scrollBehavior,
                pauseFrequency: pauseFrequency,
                eyeMovement: this.generateEyeMovementPattern(),
                textSelection: this.shouldSelectText(),
                reReading: this.shouldReRead(),
                context: context,
                adaptations: {
                    timeBased: context.currentTime !== 'afternoon',
                    moodBased: context.currentMood !== 'neutral',
                    contextual: true
                }
            };
            
        } catch (error) {
            console.warn('⚠️ Error getting personalized reading behavior:', error);
            return this.determineReadingBehavior();
        }
    }

    // Enhanced analytics and reporting
    getLearningReport() {
        try {
            return {
                currentPersonality: {
                    type: this.currentPersonality,
                    name: this.personalityTypes[this.currentPersonality].name,
                    description: this.personalityTypes[this.currentPersonality].description
                },
                sessionInfo: {
                    sessionId: this.sessionId,
                    startTime: this.sessionStartTime,
                    duration: Date.now() - this.sessionStartTime,
                    lastActivity: this.lastActivity
                },
                learningProgress: {
                    personalityChanges: this.learningHistory.personalityChanges.length,
                    preferenceAdaptations: this.preferenceChanges.length,
                    adaptationSuccess: this.adaptationMetrics.successRate,
                    improvementTrend: this.adaptationMetrics.improvementTrend
                },
                behavioralInsights: {
                    totalInteractions: this.interactionHistory.length,
                    readingPatterns: this.readingPatterns.length,
                    averageReadingTime: this.behavioralData.averageReadingTime,
                    preferredTopics: this.behavioralData.preferredTopics
                },
                contextAnalysis: {
                    timeOfDay: this.contextData.currentTime,
                    deviceType: this.contextData.deviceType,
                    userMood: this.contextData.currentMood,
                    location: this.contextData.userLocation
                },
                recommendations: this.generateRecommendations()
            };
            
        } catch (error) {
            console.warn('⚠️ Error generating learning report:', error);
            return null;
        }
    }

    generateRecommendations() {
        try {
            const recommendations = [];
            const personality = this.personalityTypes[this.currentPersonality];
            
            // Reading speed recommendations
            if (this.behavioralData.averageReadingTime > 300000) { // 5 minutes
                recommendations.push({
                    type: 'reading_speed',
                    suggestion: 'Consider increasing reading speed for better efficiency',
                    priority: 'medium'
                });
            }
            
            // Interaction level recommendations
            if (this.interactionHistory.length < 10) {
                recommendations.push({
                    type: 'interaction',
                    suggestion: 'Try interacting more with content for better engagement',
                    priority: 'low'
                });
            }
            
            // Topic preference recommendations
            if (this.behavioralData.preferredTopics.length === 0) {
                recommendations.push({
                    type: 'content',
                    suggestion: 'Explore different content types to discover preferences',
                    priority: 'high'
                });
            }
            
            // Context-based recommendations
            if (this.contextData.currentTime === 'night') {
                recommendations.push({
                    type: 'context',
                    suggestion: 'Consider using night mode for better reading comfort',
                    priority: 'medium'
                });
            }
            
            return recommendations;
            
        } catch (error) {
            console.warn('⚠️ Error generating recommendations:', error);
            return [];
        }
    }

    // Enhanced cleanup and disposal
    dispose() {
        try {
            // Clear intervals
            if (this.persistenceInterval) {
                clearInterval(this.persistenceInterval);
            }
            
            if (this.sessionTimeoutHandler) {
                clearTimeout(this.sessionTimeoutHandler);
            }
            
            // Save final data
            this.saveSessionData();
            
            // Clean up event listeners
            this.cleanupEventListeners();
            
            console.log('🧹 Personality Engine disposed successfully');
            
        } catch (error) {
            console.warn('⚠️ Error disposing Personality Engine:', error);
        }
    }

    cleanupEventListeners() {
        try {
            // Remove scroll event listener
            window.removeEventListener('scroll', this.trackUserInteractions);
            
            // Remove visibility change listener
            document.removeEventListener('visibilitychange', this.trackReadingBehavior);
            
        } catch (error) {
            console.warn('⚠️ Error cleaning up event listeners:', error);
        }
    }
}
