import json
import os
import time
import urllib.request
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load API key
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY is not set in environment or .env file.")
    exit(1)

client = genai.Client(api_key=GEMINI_API_KEY)

def evaluate_answer(question, madhhab, expected, actual):
    """Uses LLM as a judge to evaluate if the actual answer matches the expected ruling."""
    prompt = f"""أنت مقيم إجابات فقهية. 
قارن الإجابة التي ولدها الذكاء الاصطناعي بالإجابة النموذجية المعتمدة.
السؤال: {question}
المذهب: {madhhab}
الإجابة النموذجية: {expected}
الإجابة المولدة: {actual}

هل الإجابة المولدة صحيحة وتتفق في الحكم مع الإجابة النموذجية؟ 
إذا كانت الإجابة المولدة صحيحة أجب بكلمة "CORRECT" فقط، وإذا كانت خاطئة أو تقول "لا توجد إجابة" أجب بكلمة "INCORRECT" فقط."""

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.0)
        )
        text = response.text.strip().upper()
        if "CORRECT" in text and "INCORRECT" not in text:
            return True
        return False
    except Exception as e:
        print(f"[Eval Error] {e}")
        return False

def run_evaluation():
    json_path = "questions_and_answers.json"
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Make sure your API is running before executing this script!
    API_URL = "http://127.0.0.1:8000/ask-all"

    total_correct = 0
    total_incorrect = 0

    madhhab_keys = {
        "hanafi": "Hanafi",
        "maliki": "Maliki",
        "shafii": "Shafi",
        "hanbali": "Hanbali"
    }

    print(f"Starting evaluation of {len(data)} questions...")
    print("Make sure your API server is running at http://127.0.0.1:8000")
    print("=" * 50)

    for i, item in enumerate(data):
        q = item.get("question", "")
        print(f"Q{i+1}: {q}")
        
        try:
            req_body = json.dumps({"question": q, "madhhab": "hanafi", "lang": "ar"}).encode('utf-8')
            req = urllib.request.Request(API_URL, data=req_body, headers={'Content-Type': 'application/json'})
            
            answers = {"hanafi": "", "maliki": "", "shafii": "", "hanbali": ""}
            current_m = None
            
            with urllib.request.urlopen(req) as resp:
                for line in resp:
                    decoded = line.decode('utf-8')
                    if decoded.startswith("data: "):
                        content = decoded[6:]
                        if content.startswith("[MADHHAB_START:"):
                            current_m = content.replace("[MADHHAB_START:", "").replace("]", "").strip()
                        elif content.startswith("[MADHHAB_END:"):
                            current_m = None
                        elif content.strip() in ("[DONE]", "[ALL_DONE]") or content.startswith("[ERROR]") or content.startswith("[GENERAL"):
                            pass
                        elif current_m:
                            answers[current_m] += content.replace("\\n", "\n")

            q_correct = 0
            for m_code, expected_key in madhhab_keys.items():
                expected_ans = item.get(expected_key, "")
                actual_ans = answers.get(m_code, "")
                
                is_correct = evaluate_answer(q, expected_key, expected_ans, actual_ans)
                
                if is_correct:
                    total_correct += 1
                    q_correct += 1
                    print(f"  - {expected_key}: Correct")
                else:
                    total_incorrect += 1
                    print(f"  - {expected_key}: Incorrect")
            
            print(f"  Score for Q{i+1}: {q_correct}/4")

        except Exception as e:
            print(f"  [Request Error] {e}")
            total_incorrect += 4
            
        print("-" * 30)
        # Sleep to avoid hitting Gemini free-tier rate limits during evaluation
        time.sleep(2)

    print("=" * 50)
    print("EVALUATION SUMMARY")
    print(f"Total Questions: {len(data)}")
    print(f"Total Evaluations: {len(data) * 4}")
    print(f"Total Correct: {total_correct}")
    print(f"Total Incorrect: {total_incorrect}")
    if total_correct + total_incorrect > 0:
        accuracy = (total_correct / (total_correct + total_incorrect)) * 100
        print(f"Accuracy: {accuracy:.2f}%")

if __name__ == "__main__":
    run_evaluation()
