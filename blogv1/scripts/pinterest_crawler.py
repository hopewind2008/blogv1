import os
import time
import json
import logging
import requests
import getpass
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
from datetime import datetime
from urllib.parse import quote
import random
import base64
from google.generativeai import GenerativeModel
import google.generativeai as genai
import re
from selenium.webdriver.chrome.options import Options

class PinterestCrawler:
    def __init__(self, email, password, base_dir='public/images/pinterest'):
        """
        初始化Pinterest爬虫
        :param email: Pinterest账号邮箱
        :param password: Pinterest账号密码
        :param base_dir: 图片保存的基础目录
        """
        self.email = email
        self.password = password
        self.base_dir = base_dir
        self.save_dir = os.path.join(os.getcwd(), base_dir)
        self.driver = None
        self.logger = logging.getLogger(__name__)
        
        # 确保保存目录存在
        os.makedirs(self.save_dir, exist_ok=True)
        self.logger.info(f'图片保存目录: {self.save_dir}')
        self.logger.info('成功创建图片保存目录')
        
        # 初始化Chrome driver
        self._init_driver()
        
        # 登录Pinterest
        if not self.login():
            raise Exception("Pinterest登录失败")
        
    def _setup_logger(self):
        """设置日志"""
        logger = logging.getLogger('pinterest_crawler')
        logger.setLevel(logging.DEBUG)  # 设置为DEBUG级别
        
        # 创建日志目录
        log_dir = os.path.join(self.base_dir, 'logs')
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        # 设置日志文件
        log_file = os.path.join(log_dir, f'crawler_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)  # 文件记录DEBUG级别
        
        # 设置日志格式
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        # 添加控制台输出
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)  # 控制台保持INFO级别
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        return logger
        
    def _init_driver(self):
        """
        初始化Chrome driver
        """
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')  # 无头模式
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # 设置下载选项
            prefs = {
                'profile.default_content_setting_values': {
                    'images': 1,  # 允许加载图片
                    'javascript': 1,  # 允许运行JavaScript
                    'cookies': 1  # 允许Cookie
                },
                'profile.managed_default_content_settings': {
                    'images': 1
                }
            }
            chrome_options.add_experimental_option('prefs', prefs)
            
            # 创建driver
            self.driver = webdriver.Chrome(options=chrome_options)
            
            # 设置页面加载超时
            self.driver.set_page_load_timeout(30)
            self.driver.set_script_timeout(30)
            
            # 修改webdriver属性
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            self.logger.info('Chrome driver 初始化成功')
            return True
            
        except Exception as e:
            self.logger.error(f'Chrome driver 初始化失败: {str(e)}')
            raise
            
    def login(self):
        """
        Login to Pinterest with improved error handling and stability
        """
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                self.logger.info('Starting Pinterest login...')
                
                # Clear cookies and cache before login attempt
                self.driver.delete_all_cookies()
                self.driver.get('chrome://settings/clearBrowserData')
                time.sleep(2)
                
                # Navigate to login page
                self.driver.get('https://www.pinterest.com/login/')
                time.sleep(5)  # Wait for page load
                
                # Wait for and enter email
                try:
                    email_input = WebDriverWait(self.driver, 20).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="email"], input[name="id"]'))
                    )
                    email_input.clear()
                    for char in self.email:
                        email_input.send_keys(char)
                        time.sleep(0.1)  # Simulate human typing
                    time.sleep(1)
                    
                except Exception as e:
                    self.logger.error(f'Failed to enter email: {str(e)}')
                    retry_count += 1
                    continue
                    
                # Wait for and enter password
                try:
                    password_input = WebDriverWait(self.driver, 20).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="password"], input[name="password"]'))
                    )
                    password_input.clear()
                    for char in self.password:
                        password_input.send_keys(char)
                        time.sleep(0.1)  # Simulate human typing
                    time.sleep(1)
                    
                except Exception as e:
                    self.logger.error(f'Failed to enter password: {str(e)}')
                    retry_count += 1
                    continue
                    
                # Find and click login button
                try:
                    login_button = WebDriverWait(self.driver, 20).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[type="submit"], button.SignupButton'))
                    )
                    self.driver.execute_script("arguments[0].click();", login_button)
                    time.sleep(5)
                    
                except Exception as e:
                    self.logger.error(f'Failed to click login button: {str(e)}')
                    retry_count += 1
                    continue
                    
                # Verify login success
                try:
                    # Try multiple selectors that indicate successful login
                    success_selectors = [
                        '[data-test-id="header-profile"]',
                        '.HeaderProfileButton',
                        '.UserProfileButton'
                    ]
                    
                    for selector in success_selectors:
                        try:
                            WebDriverWait(self.driver, 10).until(
                                EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                            )
                            self.logger.info('Login successful!')
                            return True
                        except:
                            continue
                            
                    self.logger.error('Login verification failed: Could not detect login status')
                    retry_count += 1
                    
                except Exception as e:
                    self.logger.error(f'Login verification failed: {str(e)}')
                    retry_count += 1
                    
            except Exception as e:
                self.logger.error(f'Login attempt {retry_count + 1}/{max_retries} failed: {str(e)}')
                retry_count += 1
                
                # Cleanup and reinitialize on failure
                try:
                    self.driver.quit()
                except:
                    pass
                    
                try:
                    self._init_driver()
                except Exception as e:
                    self.logger.error(f'Failed to reinitialize driver: {str(e)}')
                    return False
                    
                time.sleep(5)  # Wait before retry
            
        self.logger.error('Login failed after all retries')
        return False

    def analyze_image_metadata(self, description):
        """
        Analyze image description and extract detailed metadata
        """
        metadata = {
            'gender': 'unknown',
            'age_group': 'unknown',
            'styles': [],
            'seasons': [],
            'occasions': [],
            'clothing_types': [],
            'colors': [],
            'body_types': [],
            'silhouette': [],
            'fabric': [],
            'styling_tips': [],
            'pattern': [],
            'trend_elements': [],
            'brand_style': [],
            'scores': {
                'overall': 8.0,
                'fashion': 8.0,
                'practicality': 8.0,
                'occasion_fit': 8.0,
                'creativity': 8.0,
                'cost_effective': 8.0
            },
            'analysis': {
                'key_features': [],
                'color_scheme': 'unknown',
                'layering': 'unknown',
                'proportion': 'unknown',
                'highlight_items': [],
                'improvement_tips': [],
                'suitable_for': [],
                'accessory_tips': [],
                'variation_tips': [],
                'trend_analysis': '',
                'style_tips': [],
                'budget_tips': []
            },
            'raw_description': description,
            'tags': [],
            'keywords': []
        }
        
        try:
            # Extract tags and keywords
            if '#' in description:
                tags = [tag.strip() for tag in description.split('#')[1:]]
                metadata['tags'] = tags
                desc_text = description + ' ' + ' '.join(tags)
            else:
                desc_text = description
                
            keywords = [word for word in desc_text.split() if len(word) > 1]
            metadata['keywords'] = keywords
            
            desc_lower = desc_text.lower()
            
            # Gender analysis
            female_keywords = ['woman', 'women', 'girl', 'feminine', 'ladies', 'she', 'her', 'female']
            male_keywords = ['man', 'men', 'boy', 'masculine', 'gentleman', 'he', 'his', 'male']
            
            if any(keyword in desc_lower for keyword in female_keywords):
                metadata['gender'] = 'female'
            elif any(keyword in desc_lower for keyword in male_keywords):
                metadata['gender'] = 'male'
            
            # Age group analysis
            age_keywords = {
                'teen': ['teen', 'teenage', 'young', 'student', 'school', 'youth'],
                'young_adult': ['young adult', 'college', 'professional', 'office', 'career'],
                'mature': ['mature', 'elegant', 'sophisticated', 'executive', 'refined'],
                'all_age': ['versatile', 'timeless', 'ageless', 'classic']
            }
            
            for age, keywords in age_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['age_group'] = age
                    break
                
            # Style analysis
            style_keywords = {
                'casual': ['casual', 'relaxed', 'comfortable', 'everyday'],
                'elegant': ['elegant', 'sophisticated', 'refined', 'graceful'],
                'sporty': ['sporty', 'athletic', 'active', 'dynamic'],
                'vintage': ['vintage', 'retro', 'classic', 'old-school'],
                'trendy': ['trendy', 'fashion-forward', 'stylish', 'modern'],
                'minimalist': ['minimalist', 'simple', 'clean', 'basic'],
                'romantic': ['romantic', 'sweet', 'feminine', 'delicate'],
                'sexy': ['sexy', 'alluring', 'attractive', 'bold'],
                'korean': ['korean', 'k-fashion', 'seoul', 'hallyu'],
                'japanese': ['japanese', 'j-fashion', 'tokyo', 'harajuku'],
                'western': ['western', 'american', 'european', 'street'],
                'preppy': ['preppy', 'collegiate', 'academic', 'school'],
                'bohemian': ['bohemian', 'boho', 'hippie', 'free-spirited'],
                'business': ['business', 'professional', 'office', 'corporate']
            }
            
            for style, keywords in style_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['styles'].append(style)
                
            # Season analysis
            season_keywords = {
                'spring': ['spring', 'vernal', 'mild', 'light'],
                'summer': ['summer', 'hot', 'sunny', 'warm'],
                'autumn': ['autumn', 'fall', 'cool', 'harvest'],
                'winter': ['winter', 'cold', 'snowy', 'cozy'],
                'all_season': ['all-season', 'year-round', 'versatile', 'transitional']
            }
            
            for season, keywords in season_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['seasons'].append(season)
                
            # Occasion analysis
            occasion_keywords = {
                'date': ['date', 'romantic', 'dinner', 'evening'],
                'work': ['work', 'office', 'business', 'professional'],
                'party': ['party', 'celebration', 'event', 'festive'],
                'daily': ['daily', 'casual', 'everyday', 'regular'],
                'travel': ['travel', 'vacation', 'holiday', 'trip'],
                'sports': ['sports', 'workout', 'exercise', 'fitness'],
                'formal': ['formal', 'ceremony', 'gala', 'special'],
                'interview': ['interview', 'meeting', 'presentation'],
                'shopping': ['shopping', 'outing', 'errand'],
                'home': ['home', 'loungewear', 'relaxing', 'indoor']
            }
            
            for occasion, keywords in occasion_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['occasions'].append(occasion)
                
            # Clothing type analysis
            clothing_keywords = {
                'dress': ['dress', 'gown', 'frock'],
                'coat': ['coat', 'jacket', 'outerwear', 'blazer'],
                'pants': ['pants', 'trousers', 'slacks', 'bottoms'],
                'shirt': ['shirt', 'blouse', 'top', 'button-up'],
                'skirt': ['skirt', 'midi', 'mini', 'maxi'],
                'sweater': ['sweater', 'pullover', 'knit', 'cardigan'],
                't-shirt': ['t-shirt', 'tee', 'top', 'casual'],
                'hoodie': ['hoodie', 'sweatshirt', 'pullover'],
                'suit': ['suit', 'blazer', 'formal', 'business'],
                'jeans': ['jeans', 'denim', 'pants'],
                'shorts': ['shorts', 'hot pants', 'bottoms'],
                'tank': ['tank top', 'camisole', 'sleeveless'],
                'trench': ['trench coat', 'mac', 'raincoat'],
                'down': ['down jacket', 'puffer', 'winter coat']
            }
            
            for clothing, keywords in clothing_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['clothing_types'].append(clothing)
                
            # Color analysis
            color_keywords = {
                'black': ['black', 'ebony', 'onyx'],
                'white': ['white', 'ivory', 'cream'],
                'red': ['red', 'crimson', 'scarlet'],
                'blue': ['blue', 'navy', 'azure'],
                'green': ['green', 'emerald', 'olive'],
                'yellow': ['yellow', 'gold', 'amber'],
                'pink': ['pink', 'rose', 'blush'],
                'purple': ['purple', 'violet', 'lavender'],
                'gray': ['gray', 'grey', 'charcoal'],
                'brown': ['brown', 'chocolate', 'coffee'],
                'beige': ['beige', 'nude', 'tan'],
                'camel': ['camel', 'khaki', 'taupe'],
                'multicolor': ['multicolor', 'colorful', 'vibrant']
            }
            
            for color, keywords in color_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['colors'].append(color)
                
            # Body type analysis
            body_keywords = {
                'tall': ['tall', 'long', 'statuesque'],
                'petite': ['petite', 'small', 'tiny'],
                'slim': ['slim', 'slender', 'thin'],
                'curvy': ['curvy', 'full-figured', 'plus-size'],
                'pear': ['pear-shaped', 'bottom-heavy'],
                'apple': ['apple-shaped', 'top-heavy'],
                'hourglass': ['hourglass', 'curvy', 'balanced']
            }
            
            for body, keywords in body_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['body_types'].append(body)
                
            # Silhouette analysis
            silhouette_keywords = {
                'fitted': ['fitted', 'slim-fit', 'tailored'],
                'loose': ['loose', 'oversized', 'relaxed'],
                'straight': ['straight', 'linear', 'regular'],
                'a-line': ['a-line', 'flared', 'trapeze'],
                'high-waist': ['high-waist', 'high-rise'],
                'low-waist': ['low-waist', 'low-rise'],
                'h-line': ['h-line', 'straight', 'boxy'],
                'x-line': ['x-line', 'fitted', 'hourglass']
            }
            
            for silhouette, keywords in silhouette_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['silhouette'].append(silhouette)
                
            # Fabric analysis
            fabric_keywords = {
                'cotton': ['cotton', 'jersey', 'poplin'],
                'silk': ['silk', 'satin', 'charmeuse'],
                'wool': ['wool', 'cashmere', 'merino'],
                'linen': ['linen', 'flax'],
                'denim': ['denim', 'jean'],
                'leather': ['leather', 'suede', 'nappa'],
                'knit': ['knit', 'jersey', 'sweater'],
                'chiffon': ['chiffon', 'sheer', 'lightweight'],
                'lace': ['lace', 'crochet', 'embroidered'],
                'velvet': ['velvet', 'velveteen', 'plush']
            }
            
            for fabric, keywords in fabric_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['fabric'].append(fabric)
                
            # Pattern analysis
            pattern_keywords = {
                'stripe': ['stripe', 'lined', 'pinstripe'],
                'plaid': ['plaid', 'check', 'tartan'],
                'polka': ['polka dot', 'dot', 'spotted'],
                'floral': ['floral', 'flower', 'botanical'],
                'animal': ['animal', 'leopard', 'zebra'],
                'solid': ['solid', 'plain', 'block'],
                'abstract': ['abstract', 'artistic', 'geometric']
            }
            
            for pattern, keywords in pattern_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['pattern'].append(pattern)
                
            # Trend element analysis
            trend_keywords = {
                'ruffle': ['ruffle', 'frill', 'flounce'],
                'puff': ['puff sleeve', 'balloon sleeve'],
                'tie': ['tie', 'bow', 'ribbon'],
                'off-shoulder': ['off-shoulder', 'cold-shoulder'],
                'slit': ['slit', 'split', 'cutout'],
                'asymmetric': ['asymmetric', 'irregular'],
                'sheer': ['sheer', 'transparent', 'mesh']
            }
            
            for trend, keywords in trend_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['trend_elements'].append(trend)
                
            # Brand style analysis
            brand_keywords = {
                'luxury': ['luxury', 'high-end', 'premium'],
                'affordable': ['affordable', 'budget', 'reasonable'],
                'designer': ['designer', 'couture', 'custom'],
                'mid-range': ['mid-range', 'contemporary'],
                'fast-fashion': ['fast-fashion', 'trendy', 'mass-market']
            }
            
            for brand, keywords in brand_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['brand_style'].append(brand)
                
            # Styling tip analysis
            styling_keywords = {
                'layering': ['layering', 'layered', 'stacked'],
                'color-matching': ['color matching', 'coordination'],
                'mix-match': ['mix and match', 'combination'],
                'underlayer': ['underlayer', 'base layer'],
                'outerlayer': ['outerlayer', 'top layer'],
                'proportion': ['proportion', 'balance'],
                'focal-point': ['focal point', 'highlight'],
                'harmony': ['harmony', 'balanced', 'coordinated']
            }
            
            for tip, keywords in styling_keywords.items():
                if any(keyword in desc_lower for keyword in keywords):
                    metadata['styling_tips'].append(tip)
                
            # Generate scores and analysis
            self._generate_scores_and_analysis(metadata)
            
        except Exception as e:
            self.logger.warning(f'Error analyzing metadata: {str(e)}')
            
        return metadata

    def get_high_quality_image_url(self, pin_element):
        """
        Get high quality image URL from pin element with improved stale element handling
        """
        try:
            # Wait for pin element to be present and visible
            WebDriverWait(self.driver, 10).until(
                EC.visibility_of(pin_element)
            )
            
            # Scroll element into view
            self.driver.execute_script("arguments[0].scrollIntoView(true);", pin_element)
            time.sleep(0.5)  # Short pause after scrolling
            
            # Get image element with wait
            img_element = WebDriverWait(pin_element, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "img"))
            )
            
            # Get attributes immediately after finding element
            srcset = img_element.get_attribute("srcset")
            src = img_element.get_attribute("src")
            
            if srcset:
                # Parse srcset to get the highest resolution image
                sources = [s.strip().split(" ") for s in srcset.split(",")]
                valid_sources = []
                for src_item in sources:
                    if len(src_item) == 2 and src_item[1].endswith("w"):
                        try:
                            width = int(src_item[1][:-1])
                            valid_sources.append((src_item[0], width))
                        except ValueError:
                            continue
                
                if valid_sources:
                    valid_sources.sort(key=lambda x: x[1], reverse=True)
                    return valid_sources[0][0]
            
            # Fallback to src attribute
            if src:
                # Try to get original size image
                src = re.sub(r'/\d+x/|/\d+x\d+/', '/originals/', src)
                
                # Add quality parameter if not present
                if "quality=" not in src:
                    separator = "&" if "?" in src else "?"
                    src = f"{src}{separator}quality=100"
                
                return src
            
            return None
            
        except Exception as e:
            self.logger.warning(f'Error getting high quality image URL: {str(e)}')
            return None

    def analyze_image_with_gemini(self, image_path):
        """
        Analyze image using Gemini API with enhanced capabilities
        """
        try:
            # Get API key from environment variable
            api_key = os.getenv('GOOGLE_API_KEY')
            if not api_key:
                self.logger.error("GOOGLE_API_KEY environment variable not set")
                return None
            
            # Configure Gemini API
            genai.configure(api_key=api_key)
            model = GenerativeModel('gemini-1.5-flash')  # Using the latest model
            
            # Read and encode image
            with open(image_path, 'rb') as f:
                image_bytes = f.read()
            image_parts = [{"mime_type": "image/jpeg", "data": base64.b64encode(image_bytes).decode()}]
            
            # Enhanced prompt for fashion analysis
            prompt = """
            Analyze this fashion image and provide a detailed description in JSON format:
            {
                "outfit_analysis": {
                    "clothing_items": [],
                    "colors": [],
                    "patterns": [],
                    "materials": [],
                    "style_category": "",
                    "formality_level": ""
                },
                "style_elements": {
                    "silhouette": "",
                    "proportions": "",
                    "key_features": [],
                    "accessories": []
                },
                "fashion_scores": {
                    "overall_style": 1-10,
                    "coordination": 1-10,
                    "uniqueness": 1-10,
                    "trend_alignment": 1-10
                },
                "styling_notes": {
                    "strengths": [],
                    "occasions": [],
                    "seasons": []
                }
            }
            
            Focus on objective fashion elements and provide specific details about the outfit composition and style characteristics.
            """
            
            # Call Gemini API with retry mechanism
            max_retries = 3
            retry_count = 0
            
            while retry_count < max_retries:
                try:
                    response = model.generate_content([prompt] + image_parts)
                    
                    if response and response.text:
                        try:
                            # Extract JSON from response
                            json_str = response.text
                            if '```json' in json_str:
                                json_str = json_str.split('```json')[1].split('```')[0]
                            elif '```' in json_str:
                                json_str = json_str.split('```')[1].split('```')[0]
                            
                            # Parse and validate JSON response
                            analysis = json.loads(json_str.strip())
                            
                            # Validate required fields
                            required_fields = ['outfit_analysis', 'style_elements', 'fashion_scores', 'styling_notes']
                            if all(field in analysis for field in required_fields):
                                return analysis
                            else:
                                self.logger.warning("Incomplete analysis from Gemini API")
                                retry_count += 1
                                
                        except json.JSONDecodeError as e:
                            self.logger.warning(f"Failed to parse Gemini API response: {str(e)}")
                            retry_count += 1
                            
                    else:
                        self.logger.warning("Empty response from Gemini API")
                        retry_count += 1
                        
                except Exception as e:
                    self.logger.warning(f"Gemini API error (attempt {retry_count + 1}): {str(e)}")
                    retry_count += 1
                    time.sleep(2)
                    
            self.logger.error("Failed to get valid analysis after all retries")
            return None
            
        except Exception as e:
            self.logger.error(f"Image analysis error: {str(e)}")
            return None

    def search_and_download(self, query, max_images=100):
        """
        Search for pins and download high quality images with improved error handling
        """
        try:
            # Create directory for saving images
            save_dir = os.path.join(self.save_dir, query)
            os.makedirs(save_dir, exist_ok=True)
            
            # Navigate to Pinterest search page
            search_url = f"https://www.pinterest.com/search/pins/?q={quote(query)}"
            self.driver.get(search_url)
            
            # Wait for initial content to load
            time.sleep(5)
            
            downloaded_count = 0
            scroll_count = 0
            max_scrolls = 50  # Limit scrolling to avoid infinite loops
            last_height = 0
            seen_urls = set()
            failed_downloads = 0
            max_failed_downloads = 10
            
            while downloaded_count < max_images and scroll_count < max_scrolls and failed_downloads < max_failed_downloads:
                try:
                    # Find all pin elements
                    pin_elements = WebDriverWait(self.driver, 10).until(
                        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[data-test-id='pin']"))
                    )
                    
                    for pin in pin_elements:
                        if downloaded_count >= max_images:
                            break
                            
                        try:
                            # Get high quality image URL
                            img_url = self.get_high_quality_image_url(pin)
                            
                            if not img_url or img_url in seen_urls:
                                continue
                                
                            seen_urls.add(img_url)
                            
                            # Download image with retry mechanism
                            max_retries = 3
                            retry_count = 0
                            
                            while retry_count < max_retries:
                                try:
                                    response = requests.get(img_url, stream=True, timeout=10)
                                    if response.status_code == 200:
                                        # Verify image data
                                        img_data = response.content
                                        img = Image.open(BytesIO(img_data))
                                        width, height = img.size
                                        
                                        # Skip if image is too small
                                        if width < 800 or height < 800:
                                            self.logger.info(f"Skipping small image: {width}x{height}")
                                            break
                                            
                                        # Skip if aspect ratio is extreme
                                        aspect_ratio = width / height
                                        if aspect_ratio < 0.5 or aspect_ratio > 2.0:
                                            self.logger.info(f"Skipping image with extreme aspect ratio: {aspect_ratio}")
                                            break
                                            
                                        # Verify image format and convert if necessary
                                        if img.format not in ['JPEG', 'JPG']:
                                            img = img.convert('RGB')
                                        
                                        # Save image with high quality
                                        img_path = os.path.join(save_dir, f"pin_{downloaded_count}.jpg")
                                        img.save(img_path, 'JPEG', quality=95)
                                        
                                        # Generate and save JSON analysis
                                        try:
                                            analysis = self.analyze_image_with_gemini(img_path)
                                            if analysis:
                                                json_path = os.path.join(save_dir, f"pin_{downloaded_count}.json")
                                                with open(json_path, 'w', encoding='utf-8') as f:
                                                    json.dump(analysis, f, ensure_ascii=False, indent=2)
                                                self.logger.info(f"Saved analysis to {json_path}")
                                            else:
                                                self.logger.warning(f"Failed to generate analysis for {img_path}")
                                        except Exception as e:
                                            self.logger.error(f"Error generating analysis: {str(e)}")
                                        
                                        self.logger.info(f"Downloaded image {downloaded_count + 1}: {img_path} ({width}x{height})")
                                        downloaded_count += 1
                                        failed_downloads = 0  # Reset failed downloads counter
                                        break
                                        
                                    else:
                                        self.logger.warning(f"Failed to download image: HTTP {response.status_code}")
                                        retry_count += 1
                                        
                                except Exception as e:
                                    self.logger.warning(f"Error downloading image (attempt {retry_count + 1}): {str(e)}")
                                    retry_count += 1
                                    time.sleep(1)
                                    
                            if retry_count >= max_retries:
                                failed_downloads += 1
                                
                        except Exception as e:
                            self.logger.warning(f"Error processing pin: {str(e)}")
                            failed_downloads += 1
                            continue
                            
                    # Scroll down with random delay
                    self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(random.uniform(2.0, 4.0))
                    
                    # Check if page has new content
                    new_height = self.driver.execute_script("return document.body.scrollHeight")
                    if new_height == last_height:
                        scroll_count += 1
                    else:
                        scroll_count = 0
                        last_height = new_height
                        
                except Exception as e:
                    self.logger.error(f"Error during scroll iteration: {str(e)}")
                    scroll_count += 1
                    time.sleep(2)
                    
            if downloaded_count < max_images:
                self.logger.warning(f"Only downloaded {downloaded_count} images out of requested {max_images}")
                
            return downloaded_count > 0
            
        except Exception as e:
            self.logger.error(f"Search and download process error: {str(e)}")
            return False

    def crawl(self, queries, max_images=100):
        """
        执行整的爬取流程
        :param queries: 搜索关键词列表
        :param max_images: 每个关键词的最大图片数量
        """
        try:
            # 确保queries是列表
            if isinstance(queries, str):
                queries = [queries]
                
            for query in queries:
                self.logger.info(f"开始处理关键词: {query}")
                if not self.search_and_download(query, max_images):
                    continue
                
            return True
            
        except Exception as e:
            self.logger.error(f"爬取失败: {str(e)}")
            return False
            
        finally:
            if self.driver:
                try:
                    self.driver.quit()
                except Exception as e:
                    self.logger.error(f"关闭浏览器失败: {str(e)}")

    def __del__(self):
        """
        析构函数，确保关闭浏览器
        """
        try:
            if hasattr(self, 'driver') and self.driver:
                self.driver.quit()
        except Exception as e:
            if hasattr(self, 'logger'):
                self.logger.error(f'关闭浏览器失败: {str(e)}')

    def download_image(self, url, filepath):
        """
        下载图片
        :param url: 图片URL
        :param filepath: 保存路径
        :return: 是否成功
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Referer': 'https://www.pinterest.com/'
            }
            
            response = requests.get(url, headers=headers, stream=True, timeout=10)
            if response.status_code == 200:
                # 检查内容类型
                content_type = response.headers.get('content-type', '')
                if 'image' not in content_type.lower():
                    self.logger.warning(f'非图片内容: {content_type}')
                    return False
                    
                # 保存图片
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(8192):
                        f.write(chunk)
                        
                self.logger.info(f'成功下载图片: {filepath}')
                return True
            else:
                self.logger.warning(f'下载图片失败,状态码: {response.status_code}')
                return False
        except Exception as e:
            self.logger.error(f'下载图片失败: {str(e)}')
            return False

    def _generate_scores_and_analysis(self, metadata):
        """
        Generate scores and analysis based on metadata
        """
        try:
            # Generate scores
            base_score = 7.0
            bonus_score = 2.5
            
            # Adjust scores based on features
            if metadata['styles']:
                metadata['scores']['fashion'] = round(base_score + len(metadata['styles']) * 0.5, 1)
                
            if metadata['styling_tips']:
                metadata['scores']['creativity'] = round(base_score + len(metadata['styling_tips']) * 0.5, 1)
                
            if metadata['occasions']:
                metadata['scores']['occasion_fit'] = round(base_score + len(metadata['occasions']) * 0.5, 1)
                
            if metadata['clothing_types']:
                metadata['scores']['practicality'] = round(base_score + len(metadata['clothing_types']) * 0.3, 1)
                
            # Calculate overall score
            metadata['scores']['overall'] = round(
                (metadata['scores']['fashion'] + 
                 metadata['scores']['creativity'] + 
                 metadata['scores']['occasion_fit'] + 
                 metadata['scores']['practicality']) / 4, 
                1
            )
            
            # Generate analysis
            if metadata['styles']:
                metadata['analysis']['key_features'].append(f"Showcases {'/'.join(metadata['styles'])} style")
                metadata['analysis']['style_tips'].append(f"Can enhance {metadata['styles'][0]} style with accessories")
                
            if metadata['colors']:
                metadata['analysis']['color_scheme'] = f"Primarily {'/'.join(metadata['colors'])}"
                metadata['analysis']['key_features'].append("Harmonious color coordination")
                
            if metadata['silhouette']:
                metadata['analysis']['proportion'] = f"Uses {'/'.join(metadata['silhouette'])} silhouette"
                metadata['analysis']['key_features'].append("Good body proportion")
                
            if metadata['clothing_types']:
                metadata['analysis']['highlight_items'] = metadata['clothing_types']
                metadata['analysis']['key_features'].append("Well-chosen pieces")
                
            if metadata['occasions']:
                metadata['analysis']['suitable_for'] = metadata['occasions']
                metadata['analysis']['key_features'].append("High occasion appropriateness")
                
            if metadata['styling_tips']:
                metadata['analysis']['key_features'].append("Rich styling techniques")
                
            if metadata['trend_elements']:
                metadata['analysis']['trend_analysis'] = f"Incorporates {'/'.join(metadata['trend_elements'])} trend elements"
                metadata['analysis']['key_features'].append("On-trend styling")
                
            if metadata['pattern']:
                metadata['analysis']['key_features'].append(f"Uses {'/'.join(metadata['pattern'])} patterns for detail")
                
            # Generate improvement suggestions
            if not metadata['colors']:
                metadata['analysis']['improvement_tips'].append("Could try more diverse color combinations")
                
            if not metadata['styling_tips']:
                metadata['analysis']['improvement_tips'].append("Could add more layering")
                
            if not metadata['trend_elements']:
                metadata['analysis']['improvement_tips'].append("Could incorporate more trend elements")
                
            # Generate budget suggestions
            if metadata['brand_style']:
                if 'luxury' in metadata['brand_style']:
                    metadata['analysis']['budget_tips'].append("Invest in high-quality pieces with refined tailoring")
                elif 'affordable' in metadata['brand_style']:
                    metadata['analysis']['budget_tips'].append("Maximize value through smart styling")
                    
            # Generate variation suggestions
            if metadata['clothing_types']:
                metadata['analysis']['variation_tips'].append(
                    f"Try different colors and materials of {metadata['clothing_types'][0]} for style variety"
                )
                
            if metadata['styles']:
                metadata['analysis']['variation_tips'].append(
                    f"Can mix in elements from other styles to enrich the {metadata['styles'][0]} look"
                )
                
            if metadata['occasions']:
                metadata['analysis']['variation_tips'].append(
                    f"Adapt to different {metadata['occasions'][0]} settings through accessories and makeup"
                )
                
        except Exception as e:
            self.logger.warning(f'Error generating scores and analysis: {str(e)}')

# 搜索关键词列表
SEARCH_QUERIES = [
    "fashion outfit",
    "street style",
    "korean fashion",
    "japanese fashion",
    "western fashion",
    "street fashion",
    "minimalist fashion",
    "casual chic",
    "elegant fashion",
    "simple fashion"
]

# 使用示例
if __name__ == "__main__":
    # 设置日志格式
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    try:
        # Set Google API key for Gemini
        os.environ['GOOGLE_API_KEY'] = 'YOUR_GEMINI_API_KEY'  # Replace with actual API key
        
        # Pinterest账号信息
        EMAIL = "hopewind7_1@2925.com"
        PASSWORD = "t3_67XHXXLhfx8N"
        
        # 创建爬虫实例并执行爬取
        crawler = PinterestCrawler(EMAIL, PASSWORD)
        
        # 测试搜索和下载
        test_query = 'fashion outfit'
        if crawler.crawl(test_query, max_images=5):
            print("爬取完成!")
        else:
            print("爬取过程中出现错误，请检查日志。")
            
    except KeyboardInterrupt:
        print("\n程序被用户中断")
    except Exception as e:
        print(f"程序执行出错: {str(e)}")
        logging.exception("Detailed error information:")
    finally:
        print("程序结束") 