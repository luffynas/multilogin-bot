"""
Mouse Movement Simulator
Provides realistic human-like mouse movements for undetectable traffic
"""

import random
import time
import math
import pyautogui
from typing import Dict, List, Tuple, Optional
import logging

class MouseSimulator:
    """Simulates realistic human mouse movements"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Mouse movement patterns
        self.movement_patterns = {
            "linear": 0.3,      # 30% straight movements
            "curved": 0.5,      # 50% curved movements
            "hesitation": 0.2   # 20% hesitant movements
        }
        
        # Speed configurations
        self.speed_config = {
            "min_speed": 100,    # pixels per second
            "max_speed": 800,    # pixels per second
            "acceleration": 0.1, # acceleration factor
            "deceleration": 0.15 # deceleration factor
        }
        
        # Human-like variations
        self.human_variations = {
            "micro_tremors": True,
            "speed_variations": True,
            "pause_patterns": True,
            "overshoot_correction": True
        }
    
    def generate_bezier_curve(self, start: Tuple[int, int], end: Tuple[int, int], 
                            control_points: int = 2) -> List[Tuple[int, int]]:
        """Generate Bezier curve for natural mouse movement"""
        points = [start]
        
        # Generate control points
        for i in range(control_points):
            # Random control point between start and end
            x = start[0] + (end[0] - start[0]) * random.uniform(0.2, 0.8)
            y = start[1] + (end[1] - start[1]) * random.uniform(0.2, 0.8)
            
            # Add some randomness
            x += random.uniform(-50, 50)
            y += random.uniform(-50, 50)
            
            points.append((int(x), int(y)))
        
        points.append(end)
        
        # Generate curve points
        curve_points = []
        steps = 50
        
        for t in range(steps + 1):
            t_normalized = t / steps
            x, y = self._bezier_point(points, t_normalized)
            curve_points.append((int(x), int(y)))
        
        return curve_points
    
    def _bezier_point(self, points: List[Tuple[int, int]], t: float) -> Tuple[float, float]:
        """Calculate point on Bezier curve"""
        n = len(points) - 1
        x = 0
        y = 0
        
        for i, point in enumerate(points):
            coefficient = math.comb(n, i) * (t ** i) * ((1 - t) ** (n - i))
            x += coefficient * point[0]
            y += coefficient * point[1]
        
        return x, y
    
    def add_micro_tremors(self, points: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        """Add micro-tremors to mouse movement"""
        if not self.human_variations["micro_tremors"]:
            return points
        
        trembled_points = []
        for point in points:
            # Add small random variations
            tremor_x = random.uniform(-1, 1)
            tremor_y = random.uniform(-1, 1)
            
            new_point = (int(point[0] + tremor_x), int(point[1] + tremor_y))
            trembled_points.append(new_point)
        
        return trembled_points
    
    def add_speed_variations(self, points: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        """Add speed variations to movement"""
        if not self.human_variations["speed_variations"]:
            return points
        
        # Vary the number of points based on speed
        base_points = len(points)
        speed_factor = random.uniform(0.7, 1.3)
        target_points = int(base_points * speed_factor)
        
        if target_points != base_points:
            # Resample points
            resampled = []
            for i in range(target_points):
                index = (i / (target_points - 1)) * (base_points - 1)
                low_index = int(index)
                high_index = min(low_index + 1, base_points - 1)
                weight = index - low_index
                
                x = points[low_index][0] * (1 - weight) + points[high_index][0] * weight
                y = points[low_index][1] * (1 - weight) + points[high_index][1] * weight
                resampled.append((int(x), int(y)))
            
            return resampled
        
        return points
    
    def add_pause_patterns(self, points: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        """Add natural pause patterns"""
        if not self.human_variations["pause_patterns"]:
            return points
        
        # Add pauses at certain points
        pause_points = []
        for i, point in enumerate(points):
            pause_points.append(point)
            
            # Add pause with 5% probability
            if random.random() < 0.05:
                # Duplicate point to create pause effect
                pause_points.append(point)
                pause_points.append(point)
        
        return pause_points
    
    def add_overshoot_correction(self, points: List[Tuple[int, int]], 
                               target: Tuple[int, int]) -> List[Tuple[int, int]]:
        """Add overshoot and correction pattern"""
        if not self.human_variations["overshoot_correction"]:
            return points
        
        if len(points) < 10:
            return points
        
        # Find the point closest to target
        closest_index = 0
        min_distance = float('inf')
        
        for i, point in enumerate(points):
            distance = math.sqrt((point[0] - target[0])**2 + (point[1] - target[1])**2)
            if distance < min_distance:
                min_distance = distance
                closest_index = i
        
        # Add overshoot if we're close to target
        if closest_index > len(points) * 0.8:  # Near the end
            overshoot_points = []
            
            # Add overshoot
            for i in range(closest_index, len(points)):
                point = points[i]
                # Overshoot slightly
                overshoot_x = point[0] + random.uniform(-10, 10)
                overshoot_y = point[1] + random.uniform(-10, 10)
                overshoot_points.append((int(overshoot_x), int(overshoot_y)))
            
            # Add correction back to target
            for i in range(3):
                correction_x = target[0] + random.uniform(-2, 2)
                correction_y = target[1] + random.uniform(-2, 2)
                overshoot_points.append((int(correction_x), int(correction_y)))
            
            return points[:closest_index] + overshoot_points
        
        return points
    
    def move_mouse_to(self, target_x: int, target_y: int, 
                     start_x: Optional[int] = None, 
                     start_y: Optional[int] = None,
                     duration: Optional[float] = None) -> bool:
        """Move mouse to target with realistic movement"""
        try:
            # Get current position if start not specified
            if start_x is None or start_y is None:
                start_x, start_y = pyautogui.position()
            
            start_pos = (start_x, start_y)
            target_pos = (target_x, target_y)
            
            # Choose movement pattern
            pattern = random.choices(
                list(self.movement_patterns.keys()),
                weights=list(self.movement_patterns.values())
            )[0]
            
            # Generate movement path
            if pattern == "linear":
                points = self._generate_linear_path(start_pos, target_pos)
            elif pattern == "curved":
                points = self._generate_curved_path(start_pos, target_pos)
            else:  # hesitation
                points = self._generate_hesitation_path(start_pos, target_pos)
            
            # Apply human-like variations
            points = self.add_micro_tremors(points)
            points = self.add_speed_variations(points)
            points = self.add_pause_patterns(points)
            points = self.add_overshoot_correction(points, target_pos)
            
            # Calculate duration if not specified
            if duration is None:
                distance = math.sqrt((target_x - start_x)**2 + (target_y - start_y)**2)
                speed = random.uniform(self.speed_config["min_speed"], 
                                     self.speed_config["max_speed"])
                duration = distance / speed
            
            # Execute movement
            self._execute_movement(points, duration)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error in mouse movement: {str(e)}")
            return False
    
    def _generate_linear_path(self, start: Tuple[int, int], 
                            end: Tuple[int, int]) -> List[Tuple[int, int]]:
        """Generate linear path with slight variations"""
        points = []
        steps = random.randint(20, 40)
        
        for i in range(steps + 1):
            t = i / steps
            x = start[0] + (end[0] - start[0]) * t
            y = start[1] + (end[1] - start[1]) * t
            
            # Add slight variations
            x += random.uniform(-2, 2)
            y += random.uniform(-2, 2)
            
            points.append((int(x), int(y)))
        
        return points
    
    def _generate_curved_path(self, start: Tuple[int, int], 
                            end: Tuple[int, int]) -> List[Tuple[int, int]]:
        """Generate curved path using Bezier curve"""
        return self.generate_bezier_curve(start, end, random.randint(1, 3))
    
    def _generate_hesitation_path(self, start: Tuple[int, int], 
                                end: Tuple[int, int]) -> List[Tuple[int, int]]:
        """Generate path with hesitations and corrections"""
        # Start with curved path
        points = self._generate_curved_path(start, end)
        
        # Add hesitations
        hesitation_points = []
        for i, point in enumerate(points):
            hesitation_points.append(point)
            
            # Add hesitation with 15% probability
            if random.random() < 0.15:
                # Add small back-and-forth movement
                for j in range(3):
                    offset_x = random.uniform(-5, 5)
                    offset_y = random.uniform(-5, 5)
                    hesitation_point = (int(point[0] + offset_x), int(point[1] + offset_y))
                    hesitation_points.append(hesitation_point)
        
        return hesitation_points
    
    def _execute_movement(self, points: List[Tuple[int, int]], duration: float):
        """Execute the mouse movement"""
        if not points:
            return
        
        # Calculate time per point
        time_per_point = duration / len(points)
        
        # Move through points
        for point in points:
            pyautogui.moveTo(point[0], point[1])
            time.sleep(time_per_point)
    
    def click_at_position(self, x: int, y: int, click_type: str = "left") -> bool:
        """Click at position with realistic delay"""
        try:
            # Move to position first
            if not self.move_mouse_to(x, y):
                return False
            
            # Add pre-click hesitation (like human thinking)
            hesitation_time = random.uniform(0.1, 0.8)
            time.sleep(hesitation_time)
            
            # Perform click
            if click_type == "left":
                pyautogui.click(x, y)
            elif click_type == "right":
                pyautogui.rightClick(x, y)
            elif click_type == "double":
                pyautogui.doubleClick(x, y)
            
            # Add post-click delay
            post_click_delay = random.uniform(0.05, 0.3)
            time.sleep(post_click_delay)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error in mouse click: {str(e)}")
            return False
    
    def scroll_at_position(self, x: int, y: int, clicks: int = 1, 
                         direction: str = "down") -> bool:
        """Scroll at position with realistic movement"""
        try:
            # Move to position first
            if not self.move_mouse_to(x, y):
                return False
            
            # Add pre-scroll hesitation
            hesitation_time = random.uniform(0.05, 0.3)
            time.sleep(hesitation_time)
            
            # Perform scroll
            if direction == "down":
                pyautogui.scroll(-clicks, x, y)
            else:
                pyautogui.scroll(clicks, x, y)
            
            # Add post-scroll delay
            post_scroll_delay = random.uniform(0.1, 0.5)
            time.sleep(post_scroll_delay)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error in mouse scroll: {str(e)}")
            return False
    
    def hover_at_position(self, x: int, y: int, duration: float = 1.0) -> bool:
        """Hover at position with realistic movement"""
        try:
            # Move to position first
            if not self.move_mouse_to(x, y):
                return False
            
            # Hover for specified duration
            time.sleep(duration)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error in mouse hover: {str(e)}")
            return False
