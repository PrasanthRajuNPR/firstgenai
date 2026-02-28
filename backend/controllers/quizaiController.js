const axios = require('axios');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const Planner = require('../models/Planner');
const Quiz = require("../models/Quiz");

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── OFFLINE QUESTION BANK ───────────────────────────────────────────────────
const QUESTION_BANK = {
  "javascript": [
    { question: "Which keyword declares a block-scoped variable in JavaScript?", options: ["var", "let", "define", "local"], answer: "let" },
    { question: "What does '===' check in JavaScript?", options: ["Value only", "Type only", "Value and type", "Reference"], answer: "Value and type" },
    { question: "What will 'typeof null' return?", options: ["null", "undefined", "object", "boolean"], answer: "object" },
    { question: "Which method adds an element to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: "push()" },
    { question: "What is a closure in JavaScript?", options: ["A loop construct", "A function with access to its outer scope", "A type of object", "An error handler"], answer: "A function with access to its outer scope" },
    { question: "What does 'async/await' help with?", options: ["Styling", "Synchronous code", "Handling promises more cleanly", "Database queries"], answer: "Handling promises more cleanly" },
    { question: "Which method removes the last element of an array?", options: ["pop()", "push()", "splice()", "slice()"], answer: "pop()" },
    { question: "What is the output of: console.log(0.1 + 0.2 === 0.3)?", options: ["true", "false", "undefined", "NaN"], answer: "false" },
    { question: "What does the spread operator (...) do?", options: ["Deletes array elements", "Expands iterable into individual elements", "Creates a closure", "Declares a rest parameter only"], answer: "Expands iterable into individual elements" },
    { question: "Which Array method returns a new filtered array?", options: ["map()", "reduce()", "filter()", "find()"], answer: "filter()" },
  ],
  "react": [
    { question: "What hook manages state in a functional component?", options: ["useEffect", "useContext", "useState", "useRef"], answer: "useState" },
    { question: "What does useEffect with [] dependency do?", options: ["Runs on every render", "Runs only on unmount", "Runs once after mount", "Never runs"], answer: "Runs once after mount" },
    { question: "What is JSX?", options: ["A JavaScript library", "A syntax extension for JavaScript", "A CSS preprocessor", "A build tool"], answer: "A syntax extension for JavaScript" },
    { question: "What is the virtual DOM?", options: ["A browser API", "A lightweight copy of the real DOM", "A database", "A testing framework"], answer: "A lightweight copy of the real DOM" },
    { question: "Which hook accesses context values?", options: ["useState", "useRef", "useContext", "useMemo"], answer: "useContext" },
    { question: "What does the 'key' prop help React with?", options: ["Styling", "Identifying list items for reconciliation", "Passing data to children", "Event handling"], answer: "Identifying list items for reconciliation" },
    { question: "What are props in React?", options: ["Internal state", "Read-only data passed to a component", "A lifecycle method", "A React hook"], answer: "Read-only data passed to a component" },
    { question: "Which hook prevents expensive recalculations?", options: ["useCallback", "useMemo", "useRef", "useReducer"], answer: "useMemo" },
    { question: "What does React.StrictMode do?", options: ["Enforces TypeScript", "Highlights potential problems", "Adds security headers", "Disables warnings"], answer: "Highlights potential problems" },
    { question: "How do you conditionally render in React?", options: ["Using for loops", "Using ternary operators in JSX", "Using switch in CSS", "Using useEffect only"], answer: "Using ternary operators in JSX" },
  ],
  "data structures": [
    { question: "Time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], answer: "O(log n)" },
    { question: "Which structure uses LIFO order?", options: ["Queue", "Stack", "Linked List", "Tree"], answer: "Stack" },
    { question: "Which structure uses FIFO order?", options: ["Stack", "Queue", "Graph", "Heap"], answer: "Queue" },
    { question: "Worst-case time complexity of quicksort?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], answer: "O(n²)" },
    { question: "In a binary tree, each node has at most how many children?", options: ["1", "2", "3", "Unlimited"], answer: "2" },
    { question: "What data structure is used for BFS?", options: ["Stack", "Queue", "Heap", "Array"], answer: "Queue" },
    { question: "Average-case lookup time in a hash table?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], answer: "O(1)" },
    { question: "In-order traversal visits nodes in which order?", options: ["Root, Left, Right", "Left, Right, Root", "Left, Root, Right", "Right, Root, Left"], answer: "Left, Root, Right" },
    { question: "What is a min-heap?", options: ["Parent always greater than children", "Parent always smaller than children", "A balanced BST", "A complete graph"], answer: "Parent always smaller than children" },
    { question: "Space complexity of DFS on a graph with V vertices?", options: ["O(1)", "O(V)", "O(V²)", "O(log V)"], answer: "O(V)" },
  ],
  "algorithms": [
    { question: "What is dynamic programming?", options: ["A programming language", "Breaking problems into overlapping subproblems and caching results", "Recursion without memoization", "A sorting technique"], answer: "Breaking problems into overlapping subproblems and caching results" },
    { question: "Time complexity of merge sort?", options: ["O(n²)", "O(n log n)", "O(log n)", "O(n)"], answer: "O(n log n)" },
    { question: "Which algorithm finds shortest path in unweighted graph?", options: ["DFS", "Dijkstra", "BFS", "Bellman-Ford"], answer: "BFS" },
    { question: "What is a greedy algorithm?", options: ["Always backtracks", "Makes the locally optimal choice at each step", "Uses memoization", "Is always recursive"], answer: "Makes the locally optimal choice at each step" },
    { question: "What does Big O notation describe?", options: ["Exact runtime", "Memory usage only", "Upper bound of growth rate", "Lower bound of growth rate"], answer: "Upper bound of growth rate" },
    { question: "Which sort is stable and in-place?", options: ["Merge Sort", "Heap Sort", "Insertion Sort", "Quick Sort"], answer: "Insertion Sort" },
    { question: "Time complexity of array access by index?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: "O(1)" },
    { question: "What is memoization?", options: ["Writing code in memory", "Caching results of expensive function calls", "A sorting technique", "A graph traversal method"], answer: "Caching results of expensive function calls" },
    { question: "Dijkstra's algorithm is used for?", options: ["Sorting arrays", "Shortest paths in weighted graphs", "Traversing binary trees", "Hashing"], answer: "Shortest paths in weighted graphs" },
    { question: "Worst-case time complexity of bubble sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: "O(n²)" },
  ],
  "python": [
    { question: "Which keyword defines a function in Python?", options: ["function", "func", "def", "lambda"], answer: "def" },
    { question: "What is list comprehension syntax?", options: ["[x for x in range(10)]", "{x: x for x in range(10)}", "(x for x in range(10))", "list(x in range(10))"], answer: "[x for x in range(10)]" },
    { question: "What does print(type([])) output?", options: ["<class 'tuple'>", "<class 'list'>", "<class 'array'>", "<class 'dict'>"], answer: "<class 'list'>" },
    { question: "Which Python data type is immutable?", options: ["List", "Dictionary", "Set", "Tuple"], answer: "Tuple" },
    { question: "What does 'self' refer to in a Python class?", options: ["The class itself", "The current instance", "The parent class", "A static method"], answer: "The current instance" },
    { question: "Correct way to open a file in Python?", options: ["open('file.txt')", "file.open('file.txt')", "fopen('file.txt')", "read('file.txt')"], answer: "open('file.txt')" },
    { question: "Which function returns the length of an object?", options: ["size()", "count()", "len()", "length()"], answer: "len()" },
    { question: "What does 'pip' do?", options: ["Runs scripts", "Installs packages", "Compiles code", "Debugs programs"], answer: "Installs packages" },
    { question: "What is a Python decorator?", options: ["A comment style", "A function that wraps another function", "A type of loop", "A class method"], answer: "A function that wraps another function" },
    { question: "What does 'None' represent in Python?", options: ["Zero", "False", "An empty string", "The absence of a value"], answer: "The absence of a value" },
  ],
  "sql": [
    { question: "Which SQL command retrieves data?", options: ["INSERT", "UPDATE", "SELECT", "DELETE"], answer: "SELECT" },
    { question: "What does JOIN do?", options: ["Deletes rows", "Combines rows from two or more tables", "Creates a table", "Updates records"], answer: "Combines rows from two or more tables" },
    { question: "Which clause filters SELECT results?", options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], answer: "WHERE" },
    { question: "What is a PRIMARY KEY?", options: ["Can be NULL", "Uniquely identifies each row", "A foreign reference", "An index type"], answer: "Uniquely identifies each row" },
    { question: "What does INNER JOIN return?", options: ["All rows from both tables", "Only matching rows from both tables", "All rows from left table", "Only non-matching rows"], answer: "Only matching rows from both tables" },
    { question: "Which aggregate function counts rows?", options: ["SUM()", "AVG()", "COUNT()", "MAX()"], answer: "COUNT()" },
    { question: "What does DISTINCT do?", options: ["Sorts results", "Returns only unique values", "Filters nulls", "Joins tables"], answer: "Returns only unique values" },
    { question: "Which clause is used with aggregate functions?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: "HAVING" },
    { question: "What does a FOREIGN KEY do?", options: ["Makes a column unique", "Links to a primary key in another table", "Creates an index", "Encrypts data"], answer: "Links to a primary key in another table" },
    { question: "What does NULL represent in SQL?", options: ["Zero", "Empty string", "Unknown or missing value", "False"], answer: "Unknown or missing value" },
  ],
  "operating systems": [
    { question: "What is a process?", options: ["A stored program", "A program in execution", "A hardware component", "A file system"], answer: "A program in execution" },
    { question: "What is deadlock?", options: ["A slow CPU", "Processes waiting forever for each other's resources", "An OS crash", "A memory leak"], answer: "Processes waiting forever for each other's resources" },
    { question: "Which scheduling algorithm prioritizes the shortest job?", options: ["FCFS", "Round Robin", "SJF", "Priority Scheduling"], answer: "SJF" },
    { question: "What is virtual memory?", options: ["RAM", "Using disk space as extra RAM", "CPU cache", "A type of ROM"], answer: "Using disk space as extra RAM" },
    { question: "What is a semaphore?", options: ["A CPU register", "A synchronization variable for shared resources", "A type of process", "A file structure"], answer: "A synchronization variable for shared resources" },
    { question: "What does paging solve?", options: ["CPU scheduling", "External fragmentation", "Deadlock", "Process starvation"], answer: "External fragmentation" },
    { question: "What is a thread?", options: ["A separate process", "Smallest unit of CPU execution within a process", "A file handle", "A network socket"], answer: "Smallest unit of CPU execution within a process" },
    { question: "Which allocation strategy uses the first sufficient hole?", options: ["Best Fit", "Worst Fit", "First Fit", "Next Fit"], answer: "First Fit" },
    { question: "What is thrashing?", options: ["A disk error", "Excessive paging causing low CPU utilization", "A network issue", "A sorting algorithm"], answer: "Excessive paging causing low CPU utilization" },
    { question: "What does the OS kernel do?", options: ["Run user apps directly", "Manage hardware and provide services to processes", "Display the UI", "Connect to internet"], answer: "Manage hardware and provide services to processes" },
  ],
  "computer networks": [
    { question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "Hyper Transfer Technology Protocol", "HyperText Transport Process"], answer: "HyperText Transfer Protocol" },
    { question: "Which OSI layer handles routing?", options: ["Data Link", "Transport", "Network", "Application"], answer: "Network" },
    { question: "What is an IP address?", options: ["A MAC address", "A unique numerical label for a device on a network", "A domain name", "A port number"], answer: "A unique numerical label for a device on a network" },
    { question: "What does DNS do?", options: ["Assigns IP addresses", "Translates domain names to IP addresses", "Encrypts traffic", "Routes packets"], answer: "Translates domain names to IP addresses" },
    { question: "Which protocol guarantees delivery?", options: ["UDP", "ICMP", "TCP", "ARP"], answer: "TCP" },
    { question: "What is a subnet mask used for?", options: ["Encrypting data", "Identifying network and host portions of an IP", "Routing between ASes", "Assigning MAC addresses"], answer: "Identifying network and host portions of an IP" },
    { question: "What port does HTTPS use?", options: ["80", "21", "443", "22"], answer: "443" },
    { question: "What is a firewall?", options: ["A physical barrier", "A system that monitors and controls network traffic", "A type of router", "A VPN protocol"], answer: "A system that monitors and controls network traffic" },
    { question: "What does UDP prioritize over TCP?", options: ["Reliability", "Error checking", "Speed with no guaranteed delivery", "Ordered delivery"], answer: "Speed with no guaranteed delivery" },
    { question: "What is the purpose of ARP?", options: ["Assigns IPs", "Maps IP addresses to MAC addresses", "Encrypts traffic", "Resolves domain names"], answer: "Maps IP addresses to MAC addresses" },
  ],
  "oop concepts": [
    { question: "What is encapsulation?", options: ["Inheriting from a parent class", "Bundling data and methods within a class", "Overriding methods", "Multiple inheritance"], answer: "Bundling data and methods within a class" },
    { question: "What is polymorphism?", options: ["One class, one method", "Different classes treated as instances of the same class", "Hiding implementation details", "Creating objects"], answer: "Different classes treated as instances of the same class" },
    { question: "What is inheritance?", options: ["Hiding data", "A class acquiring properties of another class", "Creating multiple objects", "Overloading operators"], answer: "A class acquiring properties of another class" },
    { question: "What is abstraction?", options: ["Showing all details", "Hiding complexity and showing only essential features", "Creating multiple constructors", "Type casting"], answer: "Hiding complexity and showing only essential features" },
    { question: "What is method overriding?", options: ["Same name, different params in same class", "Subclass providing specific implementation of a parent method", "Calling a method multiple times", "Static binding"], answer: "Subclass providing specific implementation of a parent method" },
    { question: "What is a constructor?", options: ["Called on deletion", "Special method called when an object is created", "A static method", "An abstract method"], answer: "Special method called when an object is created" },
    { question: "What does 'super' keyword do?", options: ["Creates a new object", "Refers to the parent class", "Deletes an object", "Declares a static field"], answer: "Refers to the parent class" },
    { question: "What is an abstract class?", options: ["A class with no methods", "Cannot be instantiated, may have abstract methods", "Only static methods", "A final class"], answer: "Cannot be instantiated, may have abstract methods" },
    { question: "What is method overloading?", options: ["Redefining a parent method", "Multiple methods with same name but different parameters", "Using static methods", "Hiding parent methods"], answer: "Multiple methods with same name but different parameters" },
    { question: "What is an interface in OOP?", options: ["A class with implementations", "A contract specifying methods a class must implement", "A private class", "A static method container"], answer: "A contract specifying methods a class must implement" },
  ],
  "system design": [
    { question: "What is horizontal scaling?", options: ["Adding more power to existing servers", "Adding more servers to handle load", "Increasing RAM", "Upgrading CPU"], answer: "Adding more servers to handle load" },
    { question: "What is a load balancer?", options: ["A database", "Distributes traffic across multiple servers", "A caching layer", "A message queue"], answer: "Distributes traffic across multiple servers" },
    { question: "What is CAP theorem?", options: ["A coding principle", "A distributed system can only guarantee 2 of: Consistency, Availability, Partition tolerance", "A network protocol", "A database rule"], answer: "A distributed system can only guarantee 2 of: Consistency, Availability, Partition tolerance" },
    { question: "What does CDN stand for?", options: ["Central Data Network", "Content Delivery Network", "Core Database Node", "Cloud Data Node"], answer: "Content Delivery Network" },
    { question: "What is caching?", options: ["Deleting old data", "Storing frequently accessed data for faster retrieval", "Compressing files", "Encrypting data"], answer: "Storing frequently accessed data for faster retrieval" },
    { question: "What is microservices architecture?", options: ["One large application", "Small independently deployable services", "A type of database", "A frontend framework"], answer: "Small independently deployable services" },
    { question: "What is database sharding?", options: ["Encrypting data", "Backing up data", "Splitting a database horizontally across machines", "Indexing a table"], answer: "Splitting a database horizontally across machines" },
    { question: "What is eventual consistency?", options: ["Always consistent", "System becomes consistent over time without immediate guarantee", "Strong ACID compliance", "Synchronous replication"], answer: "System becomes consistent over time without immediate guarantee" },
    { question: "What is a message queue used for?", options: ["Caching responses", "Decoupling services via async messages", "Load balancing", "Database indexing"], answer: "Decoupling services via async messages" },
    { question: "What does REST stand for?", options: ["Remote Execution State Transfer", "Representational State Transfer", "Resource Endpoint Standard Transfer", "Reliable External State Transfer"], answer: "Representational State Transfer" },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getFromQuestionBank = (topic, n) => {
  const t = topic.toLowerCase().trim();
  if (QUESTION_BANK[t]) return shuffle(QUESTION_BANK[t]).slice(0, n);
  const key = Object.keys(QUESTION_BANK).find(k => t.includes(k) || k.includes(t));
  if (key) return shuffle(QUESTION_BANK[key]).slice(0, n);
  const words = t.split(/\s+/);
  const wordKey = Object.keys(QUESTION_BANK).find(k =>
    words.some(w => w.length > 3 && (k.includes(w) || w.includes(k)))
  );
  if (wordKey) return shuffle(QUESTION_BANK[wordKey]).slice(0, n);
  return null;
};

const extractQuestionsArray = (raw) => {
  let text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  let parsed;
  try { parsed = JSON.parse(text); } catch (_) {
    const m = text.match(/(\[[\s\S]*?\])(?:\s*$)/) ||
              text.match(/(\[[\s\S]*\])/) ||
              text.match(/(\{[\s\S]*\})/);
    if (m) { try { parsed = JSON.parse(m[1]); } catch (_) {} }
  }
  if (!parsed) throw new Error('Cannot parse JSON from response');
  if (Array.isArray(parsed)) return parsed;
  if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
  const v = Object.values(parsed).find(v => Array.isArray(v));
  if (v) return v;
  throw new Error('No questions array found in response');
};

const sanitize = (arr) =>
  arr
    .filter(q => q?.question && Array.isArray(q.options) && q.options.length >= 2 && q.answer)
    .map(q => ({
      question: String(q.question).trim(),
      options: q.options.slice(0, 4).map(o => String(o).trim()),
      answer: String(q.answer).trim(),
    }));

// ─── GROQ API CALL ────────────────────────────────────────────────────────────
// Groq is FREE at console.groq.com — blazing fast LPU inference.
// Add GROQ_API_KEY to your .env file.
// Best models for JSON output: llama-3.3-70b-versatile, llama3-8b-8192, mixtral-8x7b-32768

const callGroqAPI = async (topic, difficulty, n) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set in .env');

  const prompt = `Generate exactly ${n} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY a valid JSON object in this exact format, nothing else:
{
  "questions": [
    {
      "question": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- The "answer" must exactly match one of the "options" strings
- Questions should be appropriate for ${difficulty} difficulty
- No extra text, no markdown, no explanations — only the JSON object`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',   // Best quality, free tier
      messages: [
        {
          role: 'system',
          content: 'You are a quiz generator. You always respond with valid JSON only. Never include markdown, explanations, or any text outside the JSON object.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      // Groq supports response_format for JSON mode on supported models
      response_format: { type: 'json_object' },
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    }
  );

  const content = response.data.choices[0].message.content;
  return extractQuestionsArray(content);
};

// ─── GEMINI FALLBACK ─────────────────────────────────────────────────────────

const callGeminiForQuiz = async (topic, difficulty, n) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [{
          text: `Generate ${n} multiple choice quiz questions about "${topic}" at ${difficulty} difficulty. Each needs: question text, 4 options array, answer string matching one option.`
        }]
      }],
      generationConfig: {
        response_mime_type: 'application/json',
        response_schema: {
          type: 'OBJECT',
          properties: {
            questions: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  question: { type: 'STRING' },
                  options: { type: 'ARRAY', items: { type: 'STRING' } },
                  answer: { type: 'STRING' },
                },
                required: ['question', 'options', 'answer'],
              },
            },
          },
          required: ['questions'],
        },
        temperature: 0.5,
        maxOutputTokens: 2000,
      },
    },
    { timeout: 30000 }
  );

  const text = response.data.candidates[0].content.parts[0].text;
  return extractQuestionsArray(text);
};

// ─── QUIZ GENERATION ─────────────────────────────────────────────────────────

exports.generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty, numberOfQuestions } = req.body;

    if (!topic || !difficulty || !numberOfQuestions) {
      return res.status(400).json({ message: 'topic, difficulty, and numberOfQuestions are required' });
    }

    const n = Math.min(Math.max(Number(numberOfQuestions) || 5, 1), 10);
    let quizData = null;
    let source = 'ai';

    // ── Strategy 1: Groq (FREE, ultra-fast) ─────────────────────────────────
    try {
      console.log(`[Quiz] Trying Groq API for "${topic}"...`);
      const raw = await callGroqAPI(topic, difficulty, n);
      quizData = sanitize(raw);
      source = 'groq';
      console.log(`[Quiz] ✓ Groq generated ${quizData.length} questions`);
    } catch (groqErr) {
      console.warn(`[Quiz] Groq failed: ${groqErr.response?.data?.error?.message || groqErr.message}`);

      // ── Strategy 2: Gemini ───────────────────────────────────────────────
      try {
        console.log(`[Quiz] Trying Gemini API for "${topic}"...`);
        const raw = await callGeminiForQuiz(topic, difficulty, n);
        quizData = sanitize(raw);
        source = 'gemini';
        console.log(`[Quiz] ✓ Gemini generated ${quizData.length} questions`);
      } catch (geminiErr) {
        console.warn(`[Quiz] Gemini failed: ${geminiErr.message}`);

        // ── Strategy 3: Offline question bank ───────────────────────────────
        console.log(`[Quiz] Using offline question bank for "${topic}"...`);
        const bankQ = getFromQuestionBank(topic, n);

        if (bankQ && bankQ.length > 0) {
          quizData = bankQ;
          source = 'offline';
          console.log(`[Quiz] ✓ Offline bank: ${quizData.length} questions`);
        } else {
          return res.status(503).json({
            message: `No questions available for "${topic}". All AI providers are unavailable.`,
            tip: `Try one of these topics which have offline support: ${Object.keys(QUESTION_BANK).join(', ')}`,
            offlineTopics: Object.keys(QUESTION_BANK),
          });
        }
      }
    }

    if (!quizData || quizData.length === 0) {
      throw new Error('No valid questions were generated');
    }

    const newQuiz = await Quiz.create({ topic, difficulty, questions: quizData });
    res.json({ ...newQuiz.toObject(), source });

  } catch (err) {
    console.error('[Quiz] Final error:', err.message);
    res.status(500).json({ message: 'Quiz generation failed', error: err.message });
  }
};

// ─── ROADMAP GENERATION ──────────────────────────────────────────────────────

const getFallbackRoadmap = (profile) => ({
  title: `${profile.branch} Engineering Roadmap - ${profile.goal}`,
  phases: [
    { title: 'Foundation Phase', timeline: 'Weeks 1-4', topics: ['Core Mathematics', 'Programming Fundamentals', 'Problem Solving Basics', 'Data Structures Introduction'], resources: ['NPTEL lectures', 'GeeksforGeeks', 'YouTube tutorials'] },
    { title: 'Core Skills Phase', timeline: 'Weeks 5-8', topics: ['Advanced Data Structures', 'Algorithms', 'Object Oriented Programming', 'Database Basics'], resources: ['LeetCode', 'HackerRank', 'Coursera'] },
    { title: 'Applied Phase', timeline: 'Weeks 9-12', topics: ['Projects', 'System Design', 'Domain Specialization', 'Open Source Contributions'], resources: ['GitHub', 'Medium blogs', 'Domain-specific courses'] },
  ],
});

const callGeminiAPI = async (profile) => {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await axios.post(API_URL, {
    contents: [{ parts: [{ text: `Create a structured learning roadmap for engineering student. Branch: ${profile.branch}, Year: ${profile.year}, Goal: ${profile.goal}, Skill Level: ${profile.skillLevel}. Provide 3-4 phases.` }] }],
    generationConfig: {
      response_mime_type: 'application/json',
      response_schema: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          phases: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                timeline: { type: 'STRING' },
                topics: { type: 'ARRAY', items: { type: 'STRING' } },
                resources: { type: 'ARRAY', items: { type: 'STRING' } },
              },
              required: ['title', 'timeline', 'topics', 'resources'],
            },
          },
        },
        required: ['title', 'phases'],
      },
      temperature: 0.2,
      maxOutputTokens: 2000,
    },
  });
  return JSON.parse(response.data.candidates[0].content.parts[0].text);
};

const generatePlanner = (userId, roadmapId, phases, dailyStudyTime) => {
  const tasks = [];
  phases.forEach(phase => {
    phase.topics.forEach(topic => {
      tasks.push({
        title: topic,
        day: DAYS[tasks.length % 7],
        duration: dailyStudyTime || '2 hours',
        completed: false,
        completedAt: null,
        locked: false,
        phase: phase.title,
      });
    });
  });
  return { userId, roadmapId, weeklySchedule: tasks };
};

exports.generateRoadmap = async (req, res) => {
  try {
    const { branch, year, goal, dailyStudyTime, skillLevel } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      branch, year, goal, dailyStudyTime, skillLevel, onboardingComplete: true,
    });

    const profile = { branch, year, goal, dailyStudyTime, skillLevel };
    let roadmapData, aiUsed = true;

    try {
      roadmapData = await callGeminiAPI(profile);
      if (!roadmapData?.phases || !Array.isArray(roadmapData.phases)) {
        throw new Error('Invalid AI response structure');
      }
    } catch (e) {
      console.warn('[Roadmap] Gemini failed, using fallback:', e.message);
      roadmapData = getFallbackRoadmap(profile);
      aiUsed = false;
    }

    const roadmap = await Roadmap.create({
      userId,
      title: roadmapData.title,
      goal,
      branchSnapshot: branch,
      phases: roadmapData.phases,
    });

    const planner = await Planner.create(
      generatePlanner(userId, roadmap._id, roadmapData.phases, dailyStudyTime)
    );

    res.status(201).json({
      message: 'Roadmap and planner generated successfully',
      roadmap,
      planner,
      aiUsed,
    });
  } catch (err) {
    console.error('[Roadmap] Error:', err);
    res.status(500).json({ message: 'Failed to generate roadmap', error: err.message });
  }
};