const API_URL =
  "https://the-trivia-api.com/api/questions?categories=general_knowledge,science&limit=10&difficulty=medium";
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const nextButton = document.getElementById("next-btn");
const timerElement = document.getElementById("time-left");
const resultElement = document.getElementById("result");
const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restart-btn");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-quiz");
const quizContainer = document.getElementById("quiz-container");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
const timeLimit = 15; // 15 seconds per question
let timeLeft = timeLimit;
let timerEndTime; // Store the end timestamp
let timerId = null;

// Start Quiz when button is clicked
startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  quizContainer.style.display = "block";
  fetchQuestions();
});

// Fetch Questions from API
async function fetchQuestions() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    questions = data.map((q) => formatQuestion(q));
    startQuiz();
  } catch (error) {
    questionElement.textContent =
      "Failed to load questions, please try again later...";
    console.log(error);
  }
}

// Format questions
function formatQuestion(q) {
  const options = [...q.incorrectAnswers];
  const randomIndex = Math.floor(Math.random() * (options.length + 1));
  options.splice(randomIndex, 0, q.correctAnswer);
  return {
    question: q.question,
    options: options,
    answer: q.correctAnswer,
  };
}

// Start Quiz
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  resultElement.style.display = "none";
  nextButton.disabled = true;
  showQuestion();
}

// Show Questions
function showQuestion() {
  stopQuizTimer(); // Ensure any previous timer is stopped
  timeLeft = timeLimit;
  timerElement.textContent = timeLeft;
  timerEndTime = Date.now() + timeLimit * 1000; // Set end time in milliseconds
  startQuizTimer(); // Start the new timer

  const currentQuestion = questions[currentQuestionIndex];
  document.getElementById("current-question").textContent =
    currentQuestionIndex + 1;
  questionElement.textContent = currentQuestion.question;
  optionsElement.innerHTML = "";
  currentQuestion.options.forEach((option) => {
    const button = document.createElement("button");
    button.innerHTML = option;
    button.onclick = () => selectAnswer(button, currentQuestion.answer);
    optionsElement.appendChild(button);
  });
}

// Handle answer selection
function selectAnswer(button, correctAnswer) {
  stopQuizTimer(); // Stop the timer when an answer is selected
  const buttons = optionsElement.querySelectorAll("button");
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) {
      btn.classList.add("correct");
    } else if (btn === button && btn.textContent !== correctAnswer) {
      btn.classList.add("incorrect");
    }
  });
  if (button.textContent === correctAnswer) score++;
  nextButton.disabled = false;
}

// Timer Implementation with requestAnimationFrame
function startQuizTimer() {
  function updateTimer() {
    const timeRemaining = Math.max(
      0,
      Math.floor((timerEndTime - Date.now()) / 1000)
    );
    timerElement.textContent = timeRemaining;
    timeLeft = timeRemaining;

    if (timeRemaining > 0) {
      timerId = requestAnimationFrame(updateTimer); // Continue updating
    } else {
      autoMoveToNextQuestion(); // Time's up
    }
  }
  timerId = requestAnimationFrame(updateTimer); // Start the timer
}

function stopQuizTimer() {
  if (timerId) {
    cancelAnimationFrame(timerId); // Stop the timer
    timerId = null;
  }
}

// Move to Next question
nextButton.addEventListener("click", () => {
  stopQuizTimer(); // Stop current timer before moving
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    nextButton.disabled = true;
    showQuestion();
  } else {
    showResult();
  }
});

// Automatically move to next question if time runs out
function autoMoveToNextQuestion() {
  stopQuizTimer();
  const buttons = optionsElement.querySelectorAll("button");
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === questions[currentQuestionIndex].answer) {
      btn.classList.add("correct");
    }
  });
  nextButton.disabled = false;
}

// Show Result
function showResult() {
  stopQuizTimer(); // Ensure timer is stopped
  quizContainer.style.display = "none";
  resultElement.style.display = "block";
  scoreElement.textContent = score;
}

// Restart Quiz
restartButton.addEventListener("click", () => {
  stopQuizTimer(); // Ensure timer is stopped
  quizContainer.style.display = "block";
  resultElement.style.display = "none";
  fetchQuestions();
});
