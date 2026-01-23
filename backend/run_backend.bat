python
-c
import sys; sys.path.insert(0, '.'); from dotenv import load_dotenv; load_dotenv(); from app import create_app; app = create_app(); print('Starting NyayNeti backend on port 8000...'); app.run(host='0.0.0.0', port=8000, debug=True)
