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
