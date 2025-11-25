from abc import ABC, abstractmethod
from typing import List, Dict, Any
import os

class BaseExamParser(ABC):
    """
    Abstract Base Class for Exam Parsers.
    Each parser implementation should handle a specific PDF format.
    """

    def __init__(self, input_pdf_path: str, output_image_dir: str):
        self.input_pdf_path = input_pdf_path
        self.output_image_dir = output_image_dir
        self.questions: List[Dict[str, Any]] = []

    @abstractmethod
    def parse(self) -> Dict[str, Any]:
        """
        Main method to parse the PDF and return the exam data structure.
        Should return a dictionary matching the exam_data.json structure.
        """
        pass

    def _save_image(self, image, filename: str) -> str:
        """
        Helper to save an image and return its relative path.
        """
        path = os.path.join(self.output_image_dir, filename)
        image.save(path)
        return f"/output_images/{filename}"
