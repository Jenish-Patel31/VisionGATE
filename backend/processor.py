import argparse
import os
import json
from parsers.gate_standard_parser import GateStandardParser

def main():
    parser = argparse.ArgumentParser(description="GATE Mock Exam Processor")
    parser.add_argument("--input", required=True, help="Path to input PDF")
    parser.add_argument("--output-dir", default="output_images", help="Directory for output images")
    parser.add_argument("--data-dir", default="data", help="Directory for output JSON")
    parser.add_argument("--parser", default="gate_standard", help="Parser type (default: gate_standard)")
    
    args = parser.parse_args()
    
    # Ensure directories exist (Clear output_images first)
    if os.path.exists(args.output_dir):
        import shutil
        shutil.rmtree(args.output_dir)
    os.makedirs(args.output_dir, exist_ok=True)
    os.makedirs(args.data_dir, exist_ok=True)
    
    # Select Parser
    if args.parser == "gate_standard":
        exam_parser = GateStandardParser(args.input, args.output_dir)
    else:
        print(f"Unknown parser: {args.parser}")
        return

    # Run Processing
    try:
        exam_data = exam_parser.parse()
        
        # Save JSON
        output_json_path = os.path.join(args.data_dir, "exam_data.json")
        with open(output_json_path, 'w') as f:
            json.dump(exam_data, f, indent=2)
            
        print(f"Processing complete. Data saved to {output_json_path}")
        
    except Exception as e:
        print(f"Processing failed: {e}")

if __name__ == "__main__":
    main()
