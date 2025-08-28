/**
 * Keyboard Simulator - Realistic typing and keyboard interaction simulation
 */

class KeyboardSimulator {
    constructor(behaviorSimulator) {
        this.behaviorSimulator = behaviorSimulator;
        this.isTyping = false;
        this.currentElement = null;
        
        this.keyboardConfig = {
            realisticTyping: true,
            typos: true,
            backspace: true,
            pauses: true,
            shortcuts: true
        };
    }

    /**
     * Type text with realistic behavior
     */
    async typeText(text, element, options = {}) {
        if (!element || !text) return false;
        
        this.isTyping = true;
        this.currentElement = element;
        
        // Focus element
        element.focus();
        
        // Clear existing content if specified
        if (options.clearFirst) {
            await this.clearElement(element);
        }
        
        const personality = this.behaviorSimulator?.currentPersonality;
        const typingSpeed = this.getTypingSpeed(personality);
        
        // Type character by character
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Simulate typo occasionally
            if (this.shouldMakeTypo(personality)) {
                await this.simulateTypo(char, element, typingSpeed);
            }
            
            // Type correct character
            await this.typeCharacter(char, element);
            
            // Variable delay between characters
            const delay = this.getCharacterDelay(typingSpeed, char);
            await this.delay(delay);
            
            // Occasional pause for thinking
            if (this.shouldPauseForThinking(personality)) {
                await this.simulateThinkingPause();
            }
        }
        
        this.isTyping = false;
        this.currentElement = null;
        
        return true;
    }

    /**
     * Type single character
     */
    async typeCharacter(char, element) {
        // Key down
        const keyDownEvent = new KeyboardEvent('keydown', {
            key: char,
            code: this.getKeyCode(char),
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(keyDownEvent);
        
        // Key press
        const keyPressEvent = new KeyboardEvent('keypress', {
            key: char,
            code: this.getKeyCode(char),
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(keyPressEvent);
        
        // Insert character
        this.insertCharacter(char, element);
        
        // Key up
        const keyUpEvent = new KeyboardEvent('keyup', {
            key: char,
            code: this.getKeyCode(char),
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(keyUpEvent);
        
        // Input event
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
    }

    /**
     * Simulate typo
     */
    async simulateTypo(correctChar, element, typingSpeed) {
        const typoChar = this.generateTypo(correctChar);
        
        // Type typo
        await this.typeCharacter(typoChar, element);
        await this.delay(typingSpeed);
        
        // Backspace
        await this.backspace(element);
        await this.delay(typingSpeed * 0.5);
    }

    /**
     * Generate typo character
     */
    generateTypo(char) {
        const nearbyKeys = {
            'a': ['s', 'q', 'z'],
            's': ['a', 'd', 'z'],
            'd': ['s', 'f', 'e'],
            'f': ['d', 'g', 'r'],
            'g': ['f', 'h', 't'],
            'h': ['g', 'j', 'y'],
            'j': ['h', 'k', 'u'],
            'k': ['j', 'l', 'i'],
            'l': ['k', 'o'],
            'z': ['a', 's', 'x'],
            'x': ['z', 'c', 's'],
            'c': ['x', 'v', 'd'],
            'v': ['c', 'b', 'f'],
            'b': ['v', 'n', 'g'],
            'n': ['b', 'm', 'h'],
            'm': ['n', 'j'],
            'q': ['w', 'a'],
            'w': ['q', 'e', 's'],
            'e': ['w', 'r', 'd'],
            'r': ['e', 't', 'f'],
            't': ['r', 'y', 'g'],
            'y': ['t', 'u', 'h'],
            'u': ['y', 'i', 'j'],
            'i': ['u', 'o', 'k'],
            'o': ['i', 'p', 'l'],
            'p': ['o', 'l']
        };
        
        const nearby = nearbyKeys[char.toLowerCase()];
        if (nearby) {
            return nearby[Math.floor(Math.random() * nearby.length)];
        }
        
        return char;
    }

    /**
     * Backspace operation
     */
    async backspace(element) {
        // Key down
        const keyDownEvent = new KeyboardEvent('keydown', {
            key: 'Backspace',
            code: 'Backspace',
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(keyDownEvent);
        
        // Remove character
        this.removeCharacter(element);
        
        // Key up
        const keyUpEvent = new KeyboardEvent('keyup', {
            key: 'Backspace',
            code: 'Backspace',
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(keyUpEvent);
        
        // Input event
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
    }

    /**
     * Insert character into element
     */
    insertCharacter(char, element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const start = element.selectionStart || 0;
            const end = element.selectionEnd || 0;
            const value = element.value;
            
            element.value = value.substring(0, start) + char + value.substring(end);
            element.selectionStart = element.selectionEnd = start + 1;
        } else {
            element.textContent += char;
        }
    }

    /**
     * Remove character from element
     */
    removeCharacter(element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const start = element.selectionStart || 0;
            const end = element.selectionEnd || 0;
            const value = element.value;
            
            if (start === end && start > 0) {
                element.value = value.substring(0, start - 1) + value.substring(end);
                element.selectionStart = element.selectionEnd = start - 1;
            } else if (start !== end) {
                element.value = value.substring(0, start) + value.substring(end);
                element.selectionStart = element.selectionEnd = start;
            }
        } else {
            const text = element.textContent;
            if (text.length > 0) {
                element.textContent = text.substring(0, text.length - 1);
            }
        }
    }

    /**
     * Clear element content
     */
    async clearElement(element) {
        // Select all
        await this.selectAll(element);
        
        // Delete
        await this.delete(element);
    }

    /**
     * Select all text
     */
    async selectAll(element) {
        element.focus();
        
        // Ctrl+A
        const keyDownEvent = new KeyboardEvent('keydown', {
            key: 'a',
            code: 'KeyA',
            ctrlKey: true,
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(keyDownEvent);
        
        // Select all
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.select();
        } else {
            const range = document.createRange();
            range.selectNodeContents(element);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    /**
     * Delete selected text
     */
    async delete(element) {
        const keyDownEvent = new KeyboardEvent('keydown', {
            key: 'Delete',
            code: 'Delete',
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(keyDownEvent);
        
        // Clear content
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = '';
        } else {
            element.textContent = '';
        }
        
        const keyUpEvent = new KeyboardEvent('keyup', {
            key: 'Delete',
            code: 'Delete',
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(keyUpEvent);
        
        // Input event
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
    }

    /**
     * Press key combination
     */
    async pressKey(key, options = {}) {
        const keyEvent = new KeyboardEvent('keydown', {
            key: key,
            code: this.getKeyCode(key),
            ctrlKey: options.ctrl || false,
            shiftKey: options.shift || false,
            altKey: options.alt || false,
            metaKey: options.meta || false,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(keyEvent);
        
        await this.delay(100);
        
        const keyUpEvent = new KeyboardEvent('keyup', {
            key: key,
            code: this.getKeyCode(key),
            ctrlKey: options.ctrl || false,
            shiftKey: options.shift || false,
            altKey: options.alt || false,
            metaKey: options.meta || false,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(keyUpEvent);
    }

    /**
     * Get key code for character
     */
    getKeyCode(char) {
        const keyMap = {
            ' ': 'Space',
            '\n': 'Enter',
            '\t': 'Tab',
            'Backspace': 'Backspace',
            'Delete': 'Delete',
            'ArrowUp': 'ArrowUp',
            'ArrowDown': 'ArrowDown',
            'ArrowLeft': 'ArrowLeft',
            'ArrowRight': 'ArrowRight'
        };
        
        if (keyMap[char]) {
            return keyMap[char];
        }
        
        return `Key${char.toUpperCase()}`;
    }

    /**
     * Get typing speed based on personality
     */
    getTypingSpeed(personality) {
        const baseSpeed = 100; // ms per character
        
        if (!personality) return baseSpeed;
        
        switch (personality.readingSpeed) {
            case 'slow':
                return baseSpeed * 1.5;
            case 'fast':
                return baseSpeed * 0.7;
            default:
                return baseSpeed;
        }
    }

    /**
     * Get character delay
     */
    getCharacterDelay(baseSpeed, char) {
        let delay = baseSpeed;
        
        // Slower for punctuation
        if (['.', ',', '!', '?', ';', ':'].includes(char)) {
            delay *= 1.5;
        }
        
        // Faster for common characters
        if (['e', 't', 'a', 'o', 'i', 'n', 's', 'r'].includes(char.toLowerCase())) {
            delay *= 0.8;
        }
        
        // Add randomness
        delay += (Math.random() - 0.5) * 50;
        
        return Math.max(50, delay);
    }

    /**
     * Check if should make typo
     */
    shouldMakeTypo(personality) {
        if (!this.keyboardConfig.typos) return false;
        
        const typoProbability = personality?.type === 'casual' ? 0.05 : 0.02;
        return Math.random() < typoProbability;
    }

    /**
     * Check if should pause for thinking
     */
    shouldPauseForThinking(personality) {
        if (!this.keyboardConfig.pauses) return false;
        
        const pauseProbability = personality?.attentionSpan === 'long' ? 0.1 : 0.05;
        return Math.random() < pauseProbability;
    }

    /**
     * Simulate thinking pause
     */
    async simulateThinkingPause() {
        const pauseTime = 500 + Math.random() * 1000;
        await this.delay(pauseTime);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardSimulator;
} else if (typeof window !== 'undefined' && !window.KeyboardSimulator) {
    window.KeyboardSimulator = KeyboardSimulator;
}
