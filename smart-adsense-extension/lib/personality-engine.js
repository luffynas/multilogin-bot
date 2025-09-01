/**
 * Personality Engine - Menentukan personalisasi konten dan behavior membaca
 */

class PersonalityEngine {
    constructor() {
        this.personalityTypes = {
            'explorer': {
                name: 'Explorer',
                readingSpeed: { min: 180, max: 220 }, // words per minute
                readingStyle: 'curious',
                interactionLevel: 'high',
                scrollBehavior: 'exploratory',
                pauseFrequency: 'medium'
            },
            'researcher': {
                name: 'Researcher',
                readingSpeed: { min: 150, max: 180 },
                readingStyle: 'thorough',
                interactionLevel: 'medium',
                scrollBehavior: 'systematic',
                pauseFrequency: 'high'
            },
            'casual': {
                name: 'Casual',
                readingSpeed: { min: 200, max: 250 },
                readingStyle: 'skim',
                interactionLevel: 'low',
                scrollBehavior: 'quick',
                pauseFrequency: 'low'
            },
            'professional': {
                name: 'Professional',
                readingSpeed: { min: 160, max: 200 },
                readingStyle: 'focused',
                interactionLevel: 'medium',
                scrollBehavior: 'efficient',
                pauseFrequency: 'medium'
            }
        };
        
        this.currentPersonality = this.selectRandomPersonality();
        this.sessionStartTime = Date.now();
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
        const timeOfDay = this.getTimeOfDay();
        
        // Get base reading speed
        let readingSpeed = this.getRandomInRange(personality.readingSpeed);
        
        // Adjust reading speed based on time of day for more realistic behavior
        readingSpeed = this.adjustReadingSpeedForTimeOfDay(readingSpeed, timeOfDay);
        
        return {
            type: this.currentPersonality,
            readingSpeed: readingSpeed,
            style: personality.readingStyle,
            interactionLevel: personality.interactionLevel,
            scrollBehavior: personality.scrollBehavior,
            pauseFrequency: personality.pauseFrequency,
            eyeMovement: this.generateEyeMovementPattern(),
            textSelection: this.shouldSelectText(),
            reReading: this.shouldReRead(),
            timeOfDay: timeOfDay
        };
    }

    adjustReadingSpeedForTimeOfDay(baseSpeed, timeOfDay) {
        let adjustedSpeed = baseSpeed;
        
        switch (timeOfDay) {
            case 'morning':
                // Morning: More alert, slightly faster reading
                adjustedSpeed *= 1.05; // 5% faster
                console.log('🌅 Morning reading speed: +5% (more alert)');
                break;
            case 'afternoon':
                // Afternoon: Peak alertness, fastest reading
                adjustedSpeed *= 1.1; // 10% faster
                console.log('☀️ Afternoon reading speed: +10% (peak alertness)');
                break;
            case 'evening':
                // Evening: Starting to slow down, more relaxed
                adjustedSpeed *= 0.8; // 20% slower
                console.log('🌆 Evening reading speed: -20% (more relaxed)');
                break;
            case 'night':
                // Night: Tired, slowest reading
                adjustedSpeed *= 0.6; // 40% slower
                console.log('🌙 Night reading speed: -40% (tired)');
                break;
            default:
                console.log('⏰ Default reading speed: no adjustment');
        }
        
        return Math.max(80, Math.min(300, adjustedSpeed)); // Keep within realistic bounds (80-300 WPM)
    }

    calculateReadingTime(content) {
        const wordCount = this.getWordCount(content || '');
        const personality = this.personalityTypes[this.currentPersonality];
        const timeOfDay = this.getTimeOfDay();
        
        // Get base reading speed and adjust for time of day
        let readingSpeed = this.getRandomInRange(personality.readingSpeed);
        readingSpeed = this.adjustReadingSpeedForTimeOfDay(readingSpeed, timeOfDay);
        
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
        
        const topics = {
            technology: ['tech', 'software', 'programming', 'computer', 'digital', 'app', 'mobile', 'web', 'internet'],
            business: ['business', 'entrepreneur', 'startup', 'company', 'market', 'finance', 'money', 'investment'],
            health: ['health', 'medical', 'fitness', 'wellness', 'diet', 'exercise', 'nutrition', 'medicine'],
            lifestyle: ['lifestyle', 'fashion', 'beauty', 'travel', 'food', 'home', 'family', 'life'],
            education: ['education', 'learning', 'study', 'course', 'tutorial', 'guide', 'knowledge', 'school']
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
}
