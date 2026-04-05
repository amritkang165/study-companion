# Study Companion

A modern, visually appealing study planner and AI-powered revision assistant built with React. Organize your subjects, track your progress, and generate summaries, practice questions, and flashcards with the help of AI.

## Features

- 📚 **Subject & Topic Management**: Add, edit, and delete subjects and topics. Track your study progress for each.
- ✅ **Task Tracking**: Create tasks with deadlines, priorities, and completion status.
- 🔁 **Revision Scheduling**: Automatic revision scheduling when topics are completed.
- 📈 **Progress & Revision Charts**: Visualize your weekly study and revision activity with beautiful, glowing charts.
- 🤖 **AI Tools (Groq API)**: Generate topic summaries, practice questions, and flashcards using the Groq API (LLM models).
- 🎨 **Dark Pink Glowing Theme**: Stylish, modern UI with a dark pink and glowing accent.

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd study-companion
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```
REACT_APP_GROQ_API_KEY=your_groq_api_key_here
REACT_APP_GROQ_MODEL=llama3-70b-8192
```
You can get a Groq API key from [Groq Console](https://console.groq.com/).

### 4. Start the development server
```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Demo Data
- The app loads with sample subjects, topics, tasks, and revisions for demo purposes if no data is present.
- To reset and see the sample data again, clear your browser's localStorage for the app and refresh.

## Customization
- **Theme**: The UI uses a dark pink glowing theme. You can further customize it in `src/index.css`.
- **AI Model**: Change the model in `.env` with `REACT_APP_GROQ_MODEL`.

## Tech Stack
- React
- React Router
- Axios
- Recharts
- React Toastify
- React Hook Form
- Groq API (for AI features)

## Screenshots

![Dashboard Screenshot](./screenshots/dashboard.png)
![AI Tools Screenshot](./screenshots/ai-tools.png)

## License

MIT

---

**Made with ❤️ for students and lifelong learners!**
