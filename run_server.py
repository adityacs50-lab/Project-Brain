import sys
sys.path.insert(0, 'c:/Users/Umesh Shinde/Desktop/Project Brain')

import backend.main
import uvicorn

if __name__ == "__main__":
    uvicorn.run(backend.main.app, host="0.0.0.0", port=8000)
