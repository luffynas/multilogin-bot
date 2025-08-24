# Advanced Behavior System

## Overview

The Automate Project now implements a comprehensive **Advanced Behavior System** that makes automation virtually indistinguishable from real human behavior. This system includes time-based patterns, personality generation, content awareness, device-specific behavior, geographic patterns, and intelligent session memory.

## 🕒 Time-Based Behavior Patterns

### Automatic Time Adjustment
The system automatically adjusts behavior based on the time of day:

```python
def _adjust_behavior_by_time(self):
    current_hour = datetime.now().hour
    
    if 6 <= current_hour < 12:  # Morning - High energy
        self.browsing_config["min_pages"] = 3
        self.browsing_config["max_pages"] = 6
        self.browsing_config["page_dwell_time"] = [20, 120]
        self.browsing_config["reading_speed"] = "fast"
        self.browsing_config["energy_level"] = "high"
```

### Time-Based Patterns
- **🌅 Morning (6-12)**: High energy, fast reading, more pages
- **☀️ Afternoon (12-18)**: Medium energy, balanced activity
- **🌆 Evening (18-22)**: Low energy, slow reading, fewer pages
- **🌙 Night (22-6)**: Very low energy, minimal activity

## 🎭 Personality-Based Behavior

### Personality Types
The system generates consistent personalities for each session:

```python
personalities = {
    "explorer": {
        "curiosity": "high",
        "depth": "shallow", 
        "speed": "fast",
        "navigation_style": "random",
        "attention_span": "short"
    },
    "researcher": {
        "curiosity": "high",
        "depth": "deep",
        "speed": "slow", 
        "navigation_style": "systematic",
        "attention_span": "long"
    },
    "casual": {
        "curiosity": "low",
        "depth": "shallow",
        "speed": "medium",
        "navigation_style": "linear", 
        "attention_span": "medium"
    },
    "professional": {
        "curiosity": "medium",
        "depth": "deep",
        "speed": "medium",
        "navigation_style": "efficient",
        "attention_span": "long"
    }
}
```

### Personality Adjustments
Each personality type adjusts:
- **Page count**: Explorer visits more pages, Researcher fewer
- **Reading speed**: Explorer fast, Researcher slow
- **Navigation style**: Explorer random, Researcher systematic
- **Attention span**: Explorer short, Researcher long

## 📱 Device-Specific Behavior

### Device Types
```python
device_behaviors = {
    "mobile": {
        "scroll_pattern": "touch_scroll",
        "click_pattern": "touch_tap",
        "viewport_behavior": "mobile_viewport",
        "typing_speed": "slow",
        "hover_probability": 0.1
    },
    "tablet": {
        "scroll_pattern": "touch_scroll",
        "click_pattern": "touch_tap",
        "viewport_behavior": "tablet_viewport", 
        "typing_speed": "medium",
        "hover_probability": 0.2
    },
    "desktop": {
        "scroll_pattern": "mouse_scroll",
        "click_pattern": "mouse_click",
        "viewport_behavior": "desktop_viewport",
        "typing_speed": "fast",
        "hover_probability": 0.4
    }
}
```

### Device Adjustments
- **Mobile**: Reduced page count, shorter dwell times, less hovering
- **Tablet**: Medium settings, touch-based interactions
- **Desktop**: Full functionality, mouse-based interactions

## 🌍 Geographic Behavior Patterns

### Country-Specific Behavior
```python
geo_patterns = {
    "US": {
        "reading_speed": "fast",
        "attention_span": "short",
        "preferred_content": ["news", "entertainment", "technology"],
        "navigation_style": "efficient",
        "page_dwell_time": [20, 120]
    },
    "GB": {
        "reading_speed": "medium",
        "attention_span": "medium", 
        "preferred_content": ["news", "sports", "business"],
        "navigation_style": "thorough",
        "page_dwell_time": [30, 180]
    },
    "DE": {
        "reading_speed": "slow",
        "attention_span": "long",
        "preferred_content": ["technology", "business", "education"],
        "navigation_style": "systematic",
        "page_dwell_time": [45, 240]
    }
}
```

## 📄 Content-Aware Browsing

### Content Type Detection
The system automatically detects content types:

```python
content_indicators = {
    "news": ["news", "breaking", "update", "latest", "report"],
    "product": ["buy", "price", "product", "shop", "store", "purchase"],
    "blog": ["blog", "post", "article", "story", "tutorial", "guide"],
    "technology": ["tech", "technology", "software", "app", "digital"],
    "business": ["business", "company", "corporate", "enterprise"],
    "entertainment": ["entertainment", "movie", "music", "game", "fun"]
}
```

### Content-Specific Behavior
Each content type triggers specific behaviors:

#### Product Pages
- **Hover over product images**
- **Read price information**
- **Higher typing probability** (search forms)
- **Fast scanning behavior**

#### News Pages
- **Read headlines systematically**
- **Check author/date information**
- **Fast reading speed**
- **Medium engagement**

#### Blog Pages
- **Hover over social sharing buttons**
- **Check related articles**
- **Normal reading speed**
- **High engagement**

#### Technology Pages
- **Read code blocks slowly**
- **Check technical specifications**
- **Slow reading speed**
- **High engagement**

## 🧠 Session Memory System

### Memory Persistence
The system maintains session memory across sessions:

```python
def _save_session_memory(self, session_data: Dict):
    memory_file = f"data/session_memory_{datetime.now().strftime('%Y%m%d')}.json"
    
    existing_memory[session_id] = {
        "timestamp": datetime.now().isoformat(),
        "personality": self.user_personality,
        "device_type": self.device_type,
        "geo_location": self.geo_location,
        "session_data": session_data
    }
```

### Memory-Based Consistency
- **Preferred categories**: Remember and prefer previously visited categories
- **Reading speed**: Maintain consistent reading speed across sessions
- **Navigation style**: Keep consistent navigation patterns
- **Behavioral patterns**: Learn and repeat successful patterns

## 🎯 Smart Ad Interaction

### Context-Aware Ad Interaction
```python
def _smart_ad_interaction(self) -> Dict:
    # Analyze page context
    high_relevance = ["product", "buy", "shop", "purchase", "service"]
    medium_relevance = ["information", "guide", "tutorial", "help"]
    low_relevance = ["news", "entertainment", "blog", "personal"]
    
    if high_score > 0:
        return {"interaction_probability": 0.05, "dwell_time": "long", "relevance": "high"}
    elif medium_score > 0:
        return {"interaction_probability": 0.02, "dwell_time": "medium", "relevance": "medium"}
    else:
        return {"interaction_probability": 0.001, "dwell_time": "short", "relevance": "low"}
```

### Intelligent Interaction Rates
- **High relevance**: 5% interaction probability, long dwell time
- **Medium relevance**: 2% interaction probability, medium dwell time
- **Low relevance**: 0.1% interaction probability, short dwell time

## 🔄 Advanced Navigation

### Personality-Based Navigation
```python
def _choose_navigation_type_with_context(self, session_memory: Dict) -> str:
    personality_preferences = {
        "explorer": {"category": 0.6, "random": 0.3, "legal": 0.1, "previous_next": 0.0},
        "researcher": {"legal": 0.5, "category": 0.3, "previous_next": 0.2, "random": 0.0},
        "casual": {"previous_next": 0.6, "category": 0.2, "random": 0.2, "legal": 0.0},
        "professional": {"category": 0.4, "legal": 0.3, "previous_next": 0.2, "random": 0.1}
    }
```

### Memory-Enhanced Navigation
- **Explorer**: Prefers categories and random navigation
- **Researcher**: Prefers legal pages and systematic navigation
- **Casual**: Prefers previous/next navigation
- **Professional**: Balanced navigation with efficiency focus

## 📊 Behavioral Analytics

### Session Tracking
```python
browsing_session = {
    "pages_visited": [
        {
            "url": "https://example.com",
            "type": "main_page",
            "content_type": "news",
            "content_quality": {"dwell_time": "medium", "engagement": "medium"},
            "dwell_time": 45.2
        }
    ],
    "total_pages": 3,
    "session_duration": 136.1,
    "navigation_pattern": ["category", "legal"],
    "personality": "explorer",
    "device_type": "desktop",
    "geo_location": "US",
    "session_memory": {...},
    "geo_behavior": {...}
}
```

### Performance Metrics
- **Session duration**: Total time spent browsing
- **Page dwell time**: Time spent on each page
- **Navigation efficiency**: How effectively pages are found
- **Content engagement**: How well content matches preferences
- **Ad interaction rates**: Context-appropriate ad engagement

## ⚙️ Configuration

### Advanced Behavior Settings
```yaml
selenium:
  advanced_behavior:
    time_based_adjustment: true
    personality_generation: true
    device_detection: true
    geo_specific_behavior: true
    content_awareness: true
    session_memory: true
    smart_ad_interaction: true
    
    personality_weights:
      explorer: 0.25
      researcher: 0.25
      casual: 0.25
      professional: 0.25
    
    device_distribution:
      desktop: 0.6
      mobile: 0.3
      tablet: 0.1
    
    geo_behavior_enabled: true
    memory_persistence: true
    content_analysis: true
```

## 🚀 Usage Examples

### Basic Usage with Advanced Features
```python
from src.selenium_automation import UndetectableSeleniumAutomation

# Initialize with advanced behavior
automation = UndetectableSeleniumAutomation()

# Run browsing session with all advanced features
browsing_session = automation.simulate_realistic_browsing("https://example.com")

print(f"Personality: {browsing_session['personality']}")
print(f"Device: {browsing_session['device_type']}")
print(f"Location: {browsing_session['geo_location']}")
print(f"Pages visited: {browsing_session['total_pages']}")
print(f"Navigation pattern: {browsing_session['navigation_pattern']}")
```

### AdSense Testing with Smart Interaction
```python
result = automation.test_adsense_ads("https://example.com")

print(f"Ads detected: {result['ads_detected']}")
print(f"Context relevance: {result['interactions']['context_relevance']}")
print(f"Smart interaction rate: {result['interactions']['clicks']}")
```

## 🎯 Benefits

### 1. **Ultra-Realistic Behavior**
- **Time-based patterns**: Natural energy variations
- **Personality consistency**: Believable user personas
- **Device-specific**: Realistic device behavior
- **Geographic patterns**: Location-appropriate behavior

### 2. **Intelligent Adaptation**
- **Content awareness**: Responsive to page content
- **Memory persistence**: Consistent across sessions
- **Smart navigation**: Context-appropriate choices
- **Adaptive interaction**: Intelligent ad engagement

### 3. **Comprehensive Analytics**
- **Detailed tracking**: Complete behavior analysis
- **Performance metrics**: Engagement and efficiency
- **Pattern recognition**: Learning from sessions
- **Risk assessment**: Detection avoidance

### 4. **Safety & Undetectability**
- **Context-aware interaction**: Safe ad engagement
- **Natural patterns**: No predictable behavior
- **Geographic consistency**: Location-appropriate actions
- **Memory-based consistency**: Believable user history

## 🔧 Customization

### Personality Customization
```python
# Custom personality weights
personality_weights = {
    "explorer": 0.4,      # More explorers
    "researcher": 0.2,    # Fewer researchers
    "casual": 0.2,        # Fewer casual users
    "professional": 0.2   # Fewer professionals
}
```

### Device Distribution
```python
# Custom device distribution
device_distribution = {
    "desktop": 0.7,   # More desktop users
    "mobile": 0.2,    # Fewer mobile users
    "tablet": 0.1     # Fewer tablet users
}
```

### Geographic Behavior
```python
# Custom geo-specific behavior
custom_geo_behavior = {
    "US": {
        "reading_speed": "very_fast",
        "attention_span": "very_short",
        "preferred_content": ["entertainment", "sports"]
    }
}
```

This advanced behavior system creates the most realistic and undetectable automation possible, with intelligent adaptation and comprehensive analytics! 🎉
