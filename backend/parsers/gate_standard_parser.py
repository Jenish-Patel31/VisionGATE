from .base_parser import BaseExamParser
import pdfplumber
from pdf2image import convert_from_path
import re
import os
from typing import Dict, Any, List, Tuple
from PIL import Image

class GateStandardParser(BaseExamParser):
    """
    Parser for the standard GATE Mock Test PDF format.
    Handles multi-page questions by stitching images.
    """

    def parse(self) -> Dict[str, Any]:
        print(f"Parsing {self.input_pdf_path} using GateStandardParser (Multi-page Support)...")
        
        if not os.path.exists(self.input_pdf_path):
            raise FileNotFoundError(f"Input PDF not found: {self.input_pdf_path}")

        # Convert PDF to images
        print("Converting PDF pages to images...")
        try:
            # We need all pages to stitch across them
            self.page_images = convert_from_path(self.input_pdf_path)
        except Exception as e:
            print(f"Error converting PDF to images: {e}")
            raise e

        self.questions = []
        question_counter = 1
        
        # Extract all lines from all pages first to have a continuous stream
        all_lines = []
        with pdfplumber.open(self.input_pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                print(f"Extracting text from page {page_num + 1}...")
                lines = self._extract_lines_with_coords(page, page_num)
                all_lines.extend(lines)

        # Process the stream of lines
        i = 0
        while i < len(all_lines):
            line = all_lines[i]
            line_text = line['text']
            
            # Start of Question: Q #<number>
            match = re.match(r'^Q\s?#(\d+)', line_text)
            if match:
                # Found a question start
                q_start_index = i
                
                # Find the end of this question
                # The end is either the start of the next question OR the end of the document
                # We need to scan ahead
                
                j = i + 1
                q_end_index = len(all_lines) - 1 # Default to last line
                
                while j < len(all_lines):
                    sub_line = all_lines[j]
                    if re.match(r'^Q\s?#(\d+)', sub_line['text']):
                        q_end_index = j - 1
                        break
                    j += 1
                
                # Now we have the range [q_start_index, q_end_index]
                # This range might span multiple pages
                self._process_question_range(all_lines, q_start_index, q_end_index, question_counter)
                question_counter += 1
                
                # Move i to the start of next question
                i = q_end_index + 1
                continue
            
            i += 1
                    
        return {
            "examTitle": "GATE Mock Test",
            "duration": 180,
            "questions": self.questions
        }

    def _extract_lines_with_coords(self, page, page_num) -> List[Dict]:
        """
        Groups words into lines and returns them with top/bottom coordinates and page number.
        """
        words = page.extract_words(keep_blank_chars=True, x_tolerance=3, y_tolerance=3)
        lines = []
        current_line_words = []
        current_line_top = -1
        
        for word in words:
            if current_line_top == -1:
                current_line_top = word['top']
                current_line_words.append(word)
            else:
                if abs(word['top'] - current_line_top) < 5:
                    current_line_words.append(word)
                else:
                    lines.append(self._create_line_dict(current_line_words, page_num, page.height, page.width))
                    current_line_words = [word]
                    current_line_top = word['top']
        
        if current_line_words:
            lines.append(self._create_line_dict(current_line_words, page_num, page.height, page.width))
            
        return lines

    def _create_line_dict(self, words, page_num, page_height, page_width):
        return {
            'text': " ".join([w['text'] for w in words]),
            'top': words[0]['top'],
            'bottom': words[-1]['bottom'],
            'page': page_num,
            'page_height': page_height,
            'page_width': page_width
        }

    def _process_question_range(self, all_lines, start_idx, end_idx, q_id):
        """
        Process lines for a single question, extract metadata, calculate crop regions, and stitch if needed.
        """
        # 1. Extract Metadata from text
        full_text = ""
        q_type = "MCQ"
        q_marks = 1
        q_negative = 0
        q_correct = ""
        
        # We need to find the "Correct Answer" line to define the crop bottom
        # The crop bottom is relative to the page of that line.
        
        crop_regions = [] # List of (page_num, top, bottom)
        
        # Group lines by page
        lines_by_page = {}
        for k in range(start_idx, end_idx + 1):
            line = all_lines[k]
            p = line['page']
            if p not in lines_by_page:
                lines_by_page[p] = []
            lines_by_page[p].append(line)
            
            # Accumulate text for metadata
            full_text += line['text'] + "\n"
            
            # Metadata Parsing (Line by line)
            sub_text = line['text']
            if "Multiple Choice Type" in sub_text: q_type = "MCQ"
            elif "Multiple Select Type" in sub_text: q_type = "MSQ"
            elif "Numerical Type" in sub_text: q_type = "NAT"
            
            if "Award:" in sub_text:
                m = re.search(r'Award:\s*([\d\.]+)', sub_text)
                if m: q_marks = float(m.group(1))
            if "Penalty:" in sub_text:
                m = re.search(r'Penalty:\s*([\d\.]+)', sub_text)
                if m: q_negative = float(m.group(1))
            
            if "Correct Answer:" in sub_text:
                parts = sub_text.split("Correct Answer:")
                if len(parts) > 1:
                    raw_answer = parts[1].strip()
                    if "Not Attempted" in raw_answer:
                        raw_answer = raw_answer.split("Not Attempted")[0].strip()
                    if "Time taken" in raw_answer:
                        raw_answer = raw_answer.split("Time taken")[0].strip()
                    q_correct = raw_answer

        # 2. Calculate Crop Regions
        # Sort pages
        sorted_pages = sorted(lines_by_page.keys())
        
        for i, p in enumerate(sorted_pages):
            p_lines = lines_by_page[p]
            
            # Start Top
            if i == 0:
                # First page of question: Start at Q # line
                top = p_lines[0]['top']
            else:
                # Subsequent pages: Start at top of page (0) or top of first line?
                # Usually top of page margin, but let's use first line top to be safe/tight
                # Or 0 to capture diagrams at top?
                # Let's use 0 to be safe for diagrams, but we might crop header?
                # Better: Use the top of the first line of this question on this page.
                top = p_lines[0]['top']
                # If there's a header, we might want to skip it. 
                # But for now, tight crop to content is good.
            
            # End Bottom
            # Check if "Correct Answer" or "Your Answer" is in this page's lines
            bottom = p_lines[-1]['bottom'] # Default to last line
            
            # Refine bottom if we found the footer
            found_footer = False
            for line in p_lines:
                if "Correct Answer:" in line['text'] or "Your Answer:" in line['text']:
                    bottom = line['top'] - 10
                    found_footer = True
                    break
            
            # If not found footer, and it's the last page, maybe we missed it?
            # Or if it's NOT the last page, we want to capture until the bottom of content
            # or bottom of page?
            # If it's not the last page, we likely want to capture everything below the start point.
            # But 'bottom' is currently the last line's bottom.
            # If there is a diagram below the text, we might miss it if we only look at text lines.
            # This is a limitation of pdfplumber text extraction.
            # However, usually diagrams are between text.
            # If a question splits, usually the text flows.
            
            # Special case: If it's NOT the last page, extend bottom to page margin?
            # Or just trust the text lines?
            # Let's trust text lines for now, but add some padding.
            
            crop_regions.append({
                'page': p,
                'top': top,
                'bottom': bottom,
                'page_height': p_lines[0]['page_height'],
                'page_width': p_lines[0]['page_width']
            })

        # 3. Crop and Stitch
        images_to_stitch = []
        max_width = 0
        
        for region in crop_regions:
            p = region['page']
            pil_image = self.page_images[p]
            
            # Scale coordinates
            scale_x = pil_image.width / region['page_width']
            scale_y = pil_image.height / region['page_height']
            
            box = (
                0,
                region['top'] * scale_y,
                pil_image.width,
                region['bottom'] * scale_y
            )
            
            # Validate box
            if box[3] > box[1]:
                crop = pil_image.crop(box)
                images_to_stitch.append(crop)
                max_width = max(max_width, crop.width)
        
        if not images_to_stitch:
            return

        # Stitch
        total_height = sum(img.height for img in images_to_stitch)
        final_image = Image.new('RGB', (max_width, total_height), (255, 255, 255))
        
        y_offset = 0
        for img in images_to_stitch:
            # Center or align left? Align left usually.
            final_image.paste(img, (0, y_offset))
            y_offset += img.height
            
        # Save
        img_filename = f"q_{q_id}.png"
        img_path = self._save_image(final_image, img_filename)
        
        self.questions.append({
            "id": q_id,
            "imagePath": img_path,
            "type": q_type,
            "marks": q_marks,
            "negativeMarks": q_negative,
            "correctAnswer": q_correct
        })
