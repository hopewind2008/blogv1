def get_high_quality_image_url(self, pin_element):
    try:
        # Add more retries for 403 errors
        max_retries = 3
        for attempt in range(max_retries):
            try:
                img_element = pin_element.find_element(By.TAG_NAME, "img")
                srcset = img_element.get_attribute("srcset")
                if srcset:
                    # Get the highest resolution URL from srcset
                    urls = [url.strip().split(" ") for url in srcset.split(",")]
                    highest_res_url = max(urls, key=lambda x: int(x[1].replace("x", "")))[0]
                    return highest_res_url
                else:
                    # Fallback to regular src attribute
                    return img_element.get_attribute("src")
            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(2)  # Add delay between retries
                    continue
                raise e
    except Exception as e:
        logging.warning(f"Error getting high quality image URL: {str(e)}")
        return None

def analyze_image_with_gemini(self, image_path):
    try:
        # Update to use gemini-1.5-flash model
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        image_parts = [{'mime_type': 'image/jpeg', 'data': image_data}]
        prompt = """Analyze this fashion outfit image and provide a detailed description in JSON format with the following structure:
        {
            "gender": "female/male",
            "age_group": "young adult/adult/etc",
            "style": "casual/formal/etc",
            "season": "spring/summer/fall/winter",
            "occasion": "daily/work/party/etc",
            "clothing_items": ["item1", "item2", ...],
            "colors": ["color1", "color2", ...],
            "style_score": 1-10,
            "fashion_analysis": "brief analysis of the overall look"
        }"""
        
        response = model.generate_content([prompt, image_parts[0]])
        return response.text
        
    except Exception as e:
        logging.error(f"Error in Gemini analysis: {str(e)}")
        return None 