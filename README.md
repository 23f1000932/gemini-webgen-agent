# Automated Task Receiver & Processor

This project is a FastAPI application designed to receive tasks, generate code using LLMs (specifically Gemini API), and deploy the resulting code to GitHub Pages. It handles multiple rounds of tasks, including full generation and surgical updates.

## Fork & Setup Instructions

### Prerequisites
- Python 3.9+
- Git
- GitHub Account
- Gemini API key

### Step 1: Fork the Repository
1. Visit the GitHub repository
2. Click the "Fork" button in the top right corner
3. Clone your forked repository locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/tds-project1.git
   cd tds-project1
   ```

### Step 2: Set Up Environment
1. Create a virtual environment:
   ```bash
   python -m venv myenv
   ```

2. Activate the virtual environment:
   - Windows:
     ```bash
     myenv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source myenv/bin/activate
     ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_USERNAME=your_github_username
   STUDENT_SECRET=your_secret_key_for_authentication
   ```

### Step 3: Run the Application
1. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

2. The server will be running at `http://127.0.0.1:8000`

### API Endpoints
- `POST /ready`: Receives task requests
- `GET /`: Root endpoint with basic info
- `GET /status`: Check status of running tasks
- `GET /health`: Server health check
- `GET /logs`: View application logs

### Testing
You can use the included `json-post-requests.txt` file for examples of how to format requests to the API.

## Project Structure
- `main.py`: Main application code
- `requirements.txt`: Project dependencies
- `generated_tasks/`: Directory where generated code is stored
- `logs/`: Application logs

## Common Issues
If you encounter file access errors with the `generated_tasks` directory, ensure that you don't have multiple processes trying to access the same files simultaneously. The `.gitignore` file is configured to exclude this directory from version control.

## License
This project is licensed under the MIT License.