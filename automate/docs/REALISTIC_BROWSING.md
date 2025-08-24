# Realistic Browsing Behavior

## Overview

The Automate Project now implements **realistic browsing behavior** that simulates how real users navigate websites. Each user session visits **2-5 pages** with various navigation patterns including categories, legal pages, and previous/next navigation.

## Key Features

### 1. **Multi-Page Browsing**
- **Minimum Pages**: 2 pages per session
- **Maximum Pages**: 5 pages per session
- **Random Selection**: Each session randomly chooses how many pages to visit

### 2. **Navigation Types**
- **Category Browsing**: 40% probability
- **Legal Pages**: 30% probability  
- **Previous/Next**: 60% probability
- **Random Pages**: Fallback option

### 3. **Realistic Behavior**
- **Reading Simulation**: Based on text length
- **Link Hovering**: Without clicking
- **Natural Scrolling**: With occasional scroll back
- **Mouse Movements**: Random patterns

## Navigation Patterns

### Category Browsing
```python
def _navigate_to_category(self) -> Optional[str]:
    category_selectors = [
        "a[href*='category']",
        "a[href*='cat']", 
        "a[href*='tag']",
        "nav a",
        ".category a",
        ".categories a",
        "ul.menu a",
        ".navigation a"
    ]
```

**Examples:**
- `/category/technology`
- `/cat/news`
- `/tag/lifestyle`
- Navigation menu links

### Legal Pages
```python
def _navigate_to_legal_page(self) -> Optional[str]:
    legal_keywords = [
        "about", "about-us", "aboutus",
        "contact", "contact-us", "contactus", 
        "privacy", "privacy-policy", "privacypolicy",
        "terms", "terms-of-service", "termsofservice",
        "disclaimer", "disclaimers",
        "faq", "help", "support",
        "team", "company", "info"
    ]
```

**Examples:**
- `/about-us`
- `/contact`
- `/privacy-policy`
- `/terms-of-service`
- `/faq`

### Previous/Next Navigation
```python
def _navigate_previous_next(self) -> Optional[str]:
    navigation_selectors = [
        "a[rel='prev']",
        "a[rel='next']",
        ".pagination a",
        ".nav-previous a",
        ".nav-next a",
        ".prev a",
        ".next a",
        "a[href*='page']",
        "a[href*='p=']"
    ]
```

**Examples:**
- Next page links
- Previous page links
- Pagination controls
- Page numbers

## Browsing Session Flow

### 1. **Session Initialization**
```python
browsing_session = {
    "pages_visited": [],
    "total_pages": 0,
    "session_duration": 0,
    "navigation_pattern": [],
    "start_time": time.time()
}
```

### 2. **Page Count Determination**
```python
pages_to_visit = random.randint(
    self.browsing_config["min_pages"],  # 2
    self.browsing_config["max_pages"]   # 5
)
```

### 3. **Navigation Decision**
```python
def _choose_navigation_type(self) -> str:
    rand = random.random()
    
    if rand < 0.4:  # 40% chance
        return "category"
    elif rand < 0.7:  # 30% chance
        return "legal"
    elif rand < 1.3:  # 60% chance
        return "previous_next"
    else:
        return "random"
```

### 4. **Page Behavior Simulation**
```python
def _simulate_page_behavior(self):
    # Random initial delay
    time.sleep(random.uniform(2, 5))
    
    # Mouse movements
    self._simulate_mouse_movement()
    
    # Natural scrolling
    self._simulate_natural_scrolling()
    
    # Reading behavior (70% chance)
    if random.random() < 0.7:
        self._simulate_reading_behavior()
    
    # Typing simulation (30% chance)
    if random.random() < 0.3:
        self._simulate_realistic_typing()
    
    # Link hovering (40% chance)
    if random.random() < 0.4:
        self._simulate_link_hovering()
```

## Reading Behavior Simulation

### Text Length Calculation
```python
def _simulate_reading_behavior(self):
    text_selectors = [
        "p", "article", ".content", ".post-content", 
        ".entry-content", ".article-content", "main"
    ]
    
    for selector in text_selectors:
        text_elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
        if text_elements:
            element = random.choice(text_elements)
            text_length = len(element.text)
            
            # Calculate reading time: 200 chars per second, max 30 seconds
            reading_time = min(text_length / 200, 30)
            time.sleep(random.uniform(reading_time * 0.5, reading_time * 1.5))
```

### Reading Time Examples
- **Short text (500 chars)**: 2.5 seconds
- **Medium text (2000 chars)**: 10 seconds  
- **Long text (6000 chars)**: 30 seconds (max)

## Link Hovering Simulation

### Safe Interaction
```python
def _simulate_link_hovering(self):
    links = self.driver.find_elements(By.TAG_NAME, "a")
    visible_links = [link for link in links if link.is_displayed()]
    
    if visible_links:
        # Hover over 1-3 random links
        num_hovers = random.randint(1, min(3, len(visible_links)))
        chosen_links = random.sample(visible_links, num_hovers)
        
        for link in chosen_links:
            actions = ActionChains(self.driver)
            actions.move_to_element(link)
            actions.pause(random.uniform(0.5, 2.0))
            actions.perform()
            time.sleep(random.uniform(0.5, 1.5))
```

**Features:**
- **No clicking**: Only hover simulation
- **Random selection**: 1-3 links per page
- **Realistic timing**: 0.5-2.0 second hovers

## Configuration

### Browsing Behavior Settings
```python
self.browsing_config = {
    "min_pages": 2,
    "max_pages": 5,
    "page_dwell_time": (30, 180),  # seconds
    "navigation_probability": 0.7,  # 70% chance to navigate
    "category_browsing_probability": 0.4,  # 40% chance
    "legal_page_probability": 0.3,  # 30% chance
    "previous_next_probability": 0.6,  # 60% chance
}
```

### Customization Options
```yaml
selenium:
  browsing_behavior:
    min_pages: 2
    max_pages: 5
    page_dwell_time: [30, 180]
    navigation_probabilities:
      category: 0.4
      legal: 0.3
      previous_next: 0.6
      random: 0.1
```

## Session Output

### Browsing Session Data
```python
{
    "pages_visited": [
        {
            "url": "https://example.com",
            "type": "main_page",
            "dwell_time": 45.2
        },
        {
            "url": "https://example.com/category/technology",
            "type": "category",
            "dwell_time": 67.8
        },
        {
            "url": "https://example.com/about-us",
            "type": "legal",
            "dwell_time": 23.1
        }
    ],
    "total_pages": 3,
    "session_duration": 136.1,
    "navigation_pattern": ["category", "legal"]
}
```

### Complete Test Results
```python
{
    "url": "https://example.com",
    "browsing_session": {
        "pages_visited": [...],
        "total_pages": 3,
        "session_duration": 136.1
    },
    "ads_detected": 5,
    "ad_positions": [...],
    "interactions": {
        "impressions": 5,
        "clicks": 0,
        "hover_events": 1
    },
    "metrics": {
        "page_load_time": 2500,
        "adsense_loaded": True,
        "page_title": "Example Site"
    }
}
```

## Logging Examples

### Session Start
```
[INFO] Starting realistic browsing session: 4 pages
[INFO] Visited page 1: category - https://example.com/category/technology
[INFO] Visited page 2: legal - https://example.com/about-us
[INFO] Visited page 3: previous_next - https://example.com/page/2
[INFO] Browsing session completed: 4 pages, 156.3s
```

### Navigation Details
```
[DEBUG] Navigating to category: https://example.com/category/technology
[DEBUG] Navigating to legal page: https://example.com/about-us
[DEBUG] Navigating with prev/next: https://example.com/page/2
[DEBUG] Navigating to random page: https://example.com/post/123
```

## Benefits

### 1. **Undetectable Behavior**
- **Natural patterns**: Mimics real user browsing
- **Random navigation**: No predictable patterns
- **Realistic timing**: Based on content length

### 2. **Comprehensive Coverage**
- **Multiple page types**: Categories, legal, content
- **Various navigation**: Previous/next, random links
- **Full site exploration**: Not just homepage

### 3. **Safe Interaction**
- **No clicking**: Only hover simulation
- **Low interaction rates**: Minimal ad interaction
- **Natural delays**: Realistic timing

### 4. **Detailed Analytics**
- **Session tracking**: Complete browsing history
- **Navigation patterns**: User behavior analysis
- **Performance metrics**: Load times and interactions

## Best Practices

### 1. **Configuration**
- Adjust page counts based on site size
- Modify probabilities for different site types
- Customize dwell times for content type

### 2. **Monitoring**
- Track navigation success rates
- Monitor session durations
- Analyze page visit patterns

### 3. **Safety**
- Keep interaction rates very low
- Use realistic timing patterns
- Avoid predictable navigation

### 4. **Customization**
- Add site-specific selectors
- Modify legal page keywords
- Adjust reading time calculations

This realistic browsing behavior makes the automation virtually indistinguishable from real user behavior while maintaining safety and undetectability! 🎉
