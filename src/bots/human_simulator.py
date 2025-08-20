import random
import time
import math
from typing import Dict, List, Optional, Tuple
import logging

class HumanSimulator:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.behavior_config = config.get("behavior", {})
        
        # Reading time configuration
        self.reading_time_min = self.behavior_config.get("reading_time_min", 240)  # 4 minutes
        self.reading_time_max = self.behavior_config.get("reading_time_max", 420)  # 7 minutes
        
        # Scroll configuration
        self.scroll_interval_min = self.behavior_config.get("scroll_interval_min", 10)
        self.scroll_interval_max = self.behavior_config.get("scroll_interval_max", 30)
    
    def simulate_reading_session(self, multilogin_manager, profile_id: str, target_url: str) -> Dict:
        """Simulate complete human reading session"""
        session_data = {
            "profile_id": profile_id,
            "start_time": time.time(),
            "page_views": 0,
            "interactions": [],
            "success": True
        }
        
        try:
            # Step 1: Navigate to target URL
            self.logger.info(f"Starting reading session for profile {profile_id}")
            
            # Step 2: Wait for page load
            time.sleep(random.uniform(3, 8))
            
            # Step 3: Simulate reading first article (4-7 minutes)
            reading_time = random.randint(self.reading_time_min, self.reading_time_max)
            self.simulate_article_reading(multilogin_manager, profile_id, reading_time, session_data)
            
            # Step 4: Click next article
            if self.click_next_article(multilogin_manager, profile_id):
                session_data["page_views"] += 1
                
                # Step 5: Read second article
                reading_time = random.randint(self.reading_time_min, self.reading_time_max)
                self.simulate_article_reading(multilogin_manager, profile_id, reading_time, session_data)
                
                # Step 6: Click previous article
                if self.click_previous_article(multilogin_manager, profile_id):
                    session_data["page_views"] += 1
                    
                    # Step 7: Read third article
                    reading_time = random.randint(self.reading_time_min, self.reading_time_max)
                    self.simulate_article_reading(multilogin_manager, profile_id, reading_time, session_data)
            
            session_data["duration"] = time.time() - session_data["start_time"]
            self.logger.info(f"Session completed: {session_data['duration']:.2f}s, {session_data['page_views']} pageviews")
            
        except Exception as e:
            self.logger.error(f"Error in reading session: {str(e)}")
            session_data["success"] = False
            session_data["error"] = str(e)
        
        return session_data
    
    def simulate_article_reading(self, multilogin_manager, profile_id: str, reading_time: int, session_data: Dict):
        """Simulate reading an article for specified time"""
        start_time = time.time()
        
        while time.time() - start_time < reading_time:
            # Random scroll
            self.simulate_scroll(multilogin_manager, profile_id, session_data)
            
            # Random pause
            pause_time = random.uniform(10, 30)
            time.sleep(pause_time)
            
            # Occasional interaction
            if random.random() < 0.1:  # 10% chance
                self.simulate_random_interaction(multilogin_manager, profile_id, session_data)
            
            # Check if we should continue
            remaining_time = reading_time - (time.time() - start_time)
            if remaining_time <= 0:
                break
    
    def simulate_scroll(self, multilogin_manager, profile_id: str, session_data: Dict):
        """Simulate realistic scrolling behavior"""
        try:
            # Get current scroll position
            scroll_script = "return window.pageYOffset;"
            current_position = multilogin_manager.execute_script(profile_id, scroll_script)
            
            if current_position:
                current_y = current_position.get("result", 0)
                
                # Calculate scroll distance (realistic)
                scroll_distance = random.randint(100, 500)
                
                # Scroll down
                scroll_script = f"window.scrollTo(0, {current_y + scroll_distance});"
                multilogin_manager.execute_script(profile_id, scroll_script)
                
                # Log interaction
                session_data["interactions"].append({
                    "type": "scroll",
                    "distance": scroll_distance,
                    "timestamp": time.time()
                })
                
                # Small pause after scroll
                time.sleep(random.uniform(0.5, 2.0))
                
        except Exception as e:
            self.logger.warning(f"Error in scroll simulation: {str(e)}")
    
    def simulate_random_interaction(self, multilogin_manager, profile_id: str, session_data: Dict):
        """Simulate random user interactions"""
        interaction_types = [
            "hover_link",
            "click_image",
            "highlight_text",
            "resize_window"
        ]
        
        interaction = random.choice(interaction_types)
        
        try:
            if interaction == "hover_link":
                # Find and hover over a random link
                hover_script = """
                const links = document.querySelectorAll('a[href]');
                if (links.length > 0) {
                    const randomLink = links[Math.floor(Math.random() * links.length)];
                    randomLink.style.backgroundColor = 'yellow';
                    return 'hovered: ' + randomLink.href;
                }
                return 'no links found';
                """
                result = multilogin_manager.execute_script(profile_id, hover_script)
                
            elif interaction == "click_image":
                # Find and click a random image
                click_script = """
                const images = document.querySelectorAll('img');
                if (images.length > 0) {
                    const randomImg = images[Math.floor(Math.random() * images.length)];
                    randomImg.style.border = '2px solid red';
                    return 'clicked image: ' + randomImg.src;
                }
                return 'no images found';
                """
                result = multilogin_manager.execute_script(profile_id, click_script)
                
            elif interaction == "highlight_text":
                # Highlight random text
                highlight_script = """
                const paragraphs = document.querySelectorAll('p');
                if (paragraphs.length > 0) {
                    const randomP = paragraphs[Math.floor(Math.random() * paragraphs.length)];
                    randomP.style.backgroundColor = 'lightblue';
                    return 'highlighted text';
                }
                return 'no paragraphs found';
                """
                result = multilogin_manager.execute_script(profile_id, highlight_script)
            
            # Log interaction
            session_data["interactions"].append({
                "type": interaction,
                "timestamp": time.time(),
                "result": result.get("result", "unknown") if result else "unknown"
            })
            
        except Exception as e:
            self.logger.warning(f"Error in random interaction: {str(e)}")
    
    def click_next_article(self, multilogin_manager, profile_id: str) -> bool:
        """Click next article link"""
        try:
            # Look for next article links
            next_script = """
            const nextSelectors = [
                'a[href*="next"]',
                'a[href*="berikutnya"]',
                'a[href*="selanjutnya"]',
                '.next-article',
                '.next-post',
                'a:contains("Next")',
                'a:contains("Berikutnya")'
            ];
            
            for (let selector of nextSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    element.click();
                    return 'clicked: ' + element.href;
                }
            }
            
            // Fallback: click any article link
            const articleLinks = document.querySelectorAll('a[href*="/artikel/"]');
            if (articleLinks.length > 0) {
                const randomLink = articleLinks[Math.floor(Math.random() * articleLinks.length)];
                randomLink.click();
                return 'clicked random article: ' + randomLink.href;
            }
            
            return 'no next article found';
            """
            
            result = multilogin_manager.execute_script(profile_id, next_script)
            
            if result and "clicked" in result.get("result", ""):
                self.logger.info(f"Clicked next article: {result['result']}")
                time.sleep(random.uniform(2, 5))  # Wait for page load
                return True
            else:
                self.logger.warning("No next article found")
                return False
                
        except Exception as e:
            self.logger.error(f"Error clicking next article: {str(e)}")
            return False
    
    def click_previous_article(self, multilogin_manager, profile_id: str) -> bool:
        """Click previous article link"""
        try:
            # Look for previous article links
            prev_script = """
            const prevSelectors = [
                'a[href*="prev"]',
                'a[href*="sebelumnya"]',
                'a[href*="previous"]',
                '.prev-article',
                '.prev-post',
                'a:contains("Previous")',
                'a:contains("Sebelumnya")'
            ];
            
            for (let selector of prevSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    element.click();
                    return 'clicked: ' + element.href;
                }
            }
            
            // Fallback: go back in history
            window.history.back();
            return 'went back in history';
            """
            
            result = multilogin_manager.execute_script(profile_id, prev_script)
            
            if result and "clicked" in result.get("result", ""):
                self.logger.info(f"Clicked previous article: {result['result']}")
                time.sleep(random.uniform(2, 5))  # Wait for page load
                return True
            else:
                self.logger.warning("No previous article found, using browser back")
                return True
                
        except Exception as e:
            self.logger.error(f"Error clicking previous article: {str(e)}")
            return False
    
    def simulate_mouse_movement(self, multilogin_manager, profile_id: str):
        """Simulate realistic mouse movement (placeholder for future implementation)"""
        # This would typically use pyautogui or similar
        # For now, we'll just add a small delay
        time.sleep(random.uniform(0.1, 0.5))
    
    def get_session_summary(self, session_data: Dict) -> Dict:
        """Get summary of session data"""
        return {
            "duration": session_data.get("duration", 0),
            "page_views": session_data.get("page_views", 0),
            "interaction_count": len(session_data.get("interactions", [])),
            "success": session_data.get("success", False),
            "interaction_types": self.get_interaction_types(session_data.get("interactions", []))
        }
    
    def get_interaction_types(self, interactions: List[Dict]) -> Dict:
        """Get count of each interaction type"""
        types = {}
        for interaction in interactions:
            interaction_type = interaction.get("type", "unknown")
            types[interaction_type] = types.get(interaction_type, 0) + 1
        return types

    def simulate_reading_session_with_complexity(self, session_data: Dict, reading_time_min: int = 240, 
                                               reading_time_max: int = 420, behavioral_profile: Dict = None, 
                                               session_complexity: str = "moderate") -> Dict:
        """Simulate reading session with complexity-based behavior variation"""
        session_data = session_data.copy()
        session_data["start_time"] = time.time()
        session_data["page_views"] = 0
        session_data["interactions"] = []
        session_data["success"] = True
        session_data["session_complexity"] = session_complexity
        
        try:
            self.logger.info(f"Starting {session_complexity} reading session for profile {session_data.get('profile_id', 'unknown')}")
            
            # Complexity-based session structure
            if session_complexity == "simple":
                # Simple session: Single page visit
                reading_time = random.randint(reading_time_min // 2, reading_time_max // 2)  # Shorter reading time
                self.simulate_article_reading_with_complexity(session_data, reading_time, behavioral_profile, "simple")
                session_data["page_views"] = 1
                
            elif session_complexity == "moderate":
                # Moderate session: Multiple page visits with navigation
                reading_time = random.randint(reading_time_min, reading_time_max)
                self.simulate_article_reading_with_complexity(session_data, reading_time, behavioral_profile, "moderate")
                session_data["page_views"] = 2
                
                # Add navigation between articles
                if random.random() < 0.7:  # 70% chance to navigate
                    navigation_delay = random.uniform(5, 15)
                    time.sleep(navigation_delay)
                    
                    # Read second article
                    reading_time_2 = random.randint(reading_time_min // 2, reading_time_max // 2)
                    self.simulate_article_reading_with_complexity(session_data, reading_time_2, behavioral_profile, "moderate")
                    session_data["page_views"] = 3
                
            elif session_complexity == "complex":
                # Complex session: Multiple pages with rich interactions
                reading_time = random.randint(reading_time_min, reading_time_max + 120)  # Longer reading time
                self.simulate_article_reading_with_complexity(session_data, reading_time, behavioral_profile, "complex")
                session_data["page_views"] = 2
                
                # Add multiple navigation steps
                for nav_step in range(random.randint(1, 3)):
                    navigation_delay = random.uniform(10, 30)
                    time.sleep(navigation_delay)
                    
                    # Read additional articles
                    reading_time_nav = random.randint(reading_time_min // 3, reading_time_max // 2)
                    self.simulate_article_reading_with_complexity(session_data, reading_time_nav, behavioral_profile, "complex")
                    session_data["page_views"] += 1
                    
                    # Add complex interactions
                    if random.random() < 0.6:  # 60% chance for complex interactions
                        self.simulate_complex_interactions(session_data, behavioral_profile)
            
            session_data["duration"] = time.time() - session_data["start_time"]
            self.logger.info(f"{session_complexity.capitalize()} session completed: {session_data['duration']:.2f}s, {session_data['page_views']} pageviews")
            
        except Exception as e:
            self.logger.error(f"Error in {session_complexity} reading session: {str(e)}")
            session_data["success"] = False
            session_data["error"] = str(e)
        
        return session_data
    
    def simulate_article_reading_with_complexity(self, session_data: Dict, reading_time: int, 
                                               behavioral_profile: Dict = None, complexity: str = "moderate"):
        """Simulate article reading with complexity-based behavior"""
        start_time = time.time()
        
        # Complexity-based reading patterns
        if complexity == "simple":
            # Simple: Basic scrolling
            while time.time() - start_time < reading_time:
                self.simulate_basic_scroll(session_data)
                pause_time = random.uniform(15, 45)
                time.sleep(pause_time)
                
        elif complexity == "moderate":
            # Moderate: Varied interactions
            while time.time() - start_time < reading_time:
                action = random.choice(["scroll", "pause", "interact"])
                
                if action == "scroll":
                    self.simulate_realistic_scroll(session_data)
                elif action == "pause":
                    pause_time = random.uniform(20, 60)
                    time.sleep(pause_time)
                elif action == "interact":
                    if random.random() < 0.3:  # 30% chance
                        self.simulate_random_interaction(session_data)
                
                # Add occasional longer pauses
                if random.random() < 0.2:  # 20% chance
                    long_pause = random.uniform(30, 90)
                    time.sleep(long_pause)
                
        elif complexity == "complex":
            # Complex: Rich interactions and behaviors
            while time.time() - start_time < reading_time:
                action = random.choice(["scroll", "pause", "interact", "highlight", "note"])
                
                if action == "scroll":
                    self.simulate_advanced_scroll(session_data)
                elif action == "pause":
                    pause_time = random.uniform(25, 75)
                    time.sleep(pause_time)
                elif action == "interact":
                    if random.random() < 0.5:  # 50% chance
                        self.simulate_complex_interaction(session_data, behavioral_profile)
                elif action == "highlight":
                    if random.random() < 0.2:  # 20% chance
                        self.simulate_text_highlighting(session_data)
                elif action == "note":
                    if random.random() < 0.1:  # 10% chance
                        self.simulate_note_taking(session_data)
                
                # Add thinking pauses
                if random.random() < 0.3:  # 30% chance
                    thinking_pause = random.uniform(45, 120)
                    time.sleep(thinking_pause)
    
    def simulate_basic_scroll(self, session_data: Dict):
        """Simulate basic scrolling behavior"""
        scroll_distance = random.randint(100, 300)
        scroll_duration = random.uniform(0.5, 2.0)
        
        # Add to interactions
        session_data["interactions"].append({
            "type": "scroll",
            "distance": scroll_distance,
            "duration": scroll_duration,
            "timestamp": time.time()
        })
    
    def simulate_realistic_scroll(self, session_data: Dict):
        """Simulate realistic scrolling with variations"""
        # Variable scroll patterns
        scroll_pattern = random.choice(["smooth", "jerky", "hesitant"])
        
        if scroll_pattern == "smooth":
            scroll_distance = random.randint(200, 500)
            scroll_duration = random.uniform(1.0, 3.0)
        elif scroll_pattern == "jerky":
            scroll_distance = random.randint(50, 200)
            scroll_duration = random.uniform(0.3, 1.0)
        else:  # hesitant
            scroll_distance = random.randint(100, 250)
            scroll_duration = random.uniform(2.0, 4.0)
        
        session_data["interactions"].append({
            "type": "scroll",
            "pattern": scroll_pattern,
            "distance": scroll_distance,
            "duration": scroll_duration,
            "timestamp": time.time()
        })
    
    def simulate_advanced_scroll(self, session_data: Dict):
        """Simulate advanced scrolling with complex patterns"""
        # Multi-directional scrolling
        scroll_type = random.choice(["down", "up", "bounce", "search"])
        
        if scroll_type == "down":
            scroll_distance = random.randint(300, 800)
            scroll_duration = random.uniform(1.5, 4.0)
        elif scroll_type == "up":
            scroll_distance = random.randint(100, 400)
            scroll_duration = random.uniform(1.0, 2.5)
        elif scroll_type == "bounce":
            # Bounce back and forth
            scroll_distance = random.randint(50, 200)
            scroll_duration = random.uniform(0.5, 1.5)
        else:  # search
            scroll_distance = random.randint(200, 600)
            scroll_duration = random.uniform(2.0, 5.0)
        
        session_data["interactions"].append({
            "type": "advanced_scroll",
            "scroll_type": scroll_type,
            "distance": scroll_distance,
            "duration": scroll_duration,
            "timestamp": time.time()
        })
    
    def simulate_complex_interaction(self, session_data: Dict, behavioral_profile: Dict = None):
        """Simulate complex user interactions"""
        interaction_type = random.choice(["hover", "click", "select", "copy"])
        
        if interaction_type == "hover":
            hover_duration = random.uniform(1.0, 5.0)
            session_data["interactions"].append({
                "type": "hover",
                "duration": hover_duration,
                "timestamp": time.time()
            })
        elif interaction_type == "click":
            click_type = random.choice(["link", "button", "image"])
            session_data["interactions"].append({
                "type": "click",
                "click_type": click_type,
                "timestamp": time.time()
            })
        elif interaction_type == "select":
            selection_length = random.randint(10, 100)
            session_data["interactions"].append({
                "type": "text_selection",
                "length": selection_length,
                "timestamp": time.time()
            })
        elif interaction_type == "copy":
            session_data["interactions"].append({
                "type": "copy_action",
                "timestamp": time.time()
            })
    
    def simulate_text_highlighting(self, session_data: Dict):
        """Simulate text highlighting behavior"""
        highlight_length = random.randint(5, 50)
        highlight_duration = random.uniform(0.5, 2.0)
        
        session_data["interactions"].append({
            "type": "highlight",
            "length": highlight_length,
            "duration": highlight_duration,
            "timestamp": time.time()
        })
    
    def simulate_note_taking(self, session_data: Dict):
        """Simulate note-taking behavior"""
        note_type = random.choice(["bookmark", "note", "share"])
        
        session_data["interactions"].append({
            "type": "note_taking",
            "note_type": note_type,
            "timestamp": time.time()
        })
    
    def simulate_complex_interactions(self, session_data: Dict, behavioral_profile: Dict = None):
        """Simulate multiple complex interactions"""
        num_interactions = random.randint(1, 3)
        
        for _ in range(num_interactions):
            self.simulate_complex_interaction(session_data, behavioral_profile)
            time.sleep(random.uniform(0.5, 2.0))  # Small delay between interactions
