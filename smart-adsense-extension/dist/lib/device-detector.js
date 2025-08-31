/**
 * Device Detector - Deteksi tipe device (Desktop/Mobile)
 */

class DeviceDetector {
    constructor() {
        this.deviceType = null;
        this.userAgent = navigator.userAgent;
        this.screenWidth = window.screen.width;
        this.screenHeight = window.screen.height;
    }

    detectDevice() {
        // Check if mobile based on user agent
        const isMobileByUA = this.isMobileUserAgent();
        
        // Check if mobile based on screen size
        const isMobileByScreen = this.isMobileScreen();
        
        // Check if mobile based on touch capability
        const isMobileByTouch = this.isMobileTouch();
        
        // Determine device type
        if (isMobileByUA || isMobileByScreen || isMobileByTouch) {
            this.deviceType = 'mobile';
        } else {
            this.deviceType = 'desktop';
        }
        
        return this.deviceType;
    }

    isMobileUserAgent() {
        const mobileKeywords = [
            'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 
            'Windows Phone', 'Mobile', 'Opera Mini', 'IEMobile'
        ];
        
        return mobileKeywords.some(keyword => 
            this.userAgent.includes(keyword)
        );
    }

    isMobileScreen() {
        // Consider mobile if screen width is less than 768px
        return this.screenWidth < 768 || this.screenHeight < 768;
    }

    isMobileTouch() {
        // Check if device supports touch events
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 ||
               navigator.msMaxTouchPoints > 0;
    }

    getDeviceInfo() {
        return {
            type: this.deviceType,
            userAgent: this.userAgent,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            isTouch: this.isMobileTouch(),
            platform: navigator.platform,
            language: navigator.language
        };
    }

    isTablet() {
        // Check if device is tablet
        const tabletKeywords = ['iPad', 'Android.*Tablet'];
        return tabletKeywords.some(keyword => 
            new RegExp(keyword, 'i').test(this.userAgent)
        );
    }

    getOrientation() {
        return this.screenWidth > this.screenHeight ? 'landscape' : 'portrait';
    }
}
