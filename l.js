// Smooth scrolling for nav links
document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Scroll to top button
const scrollBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("visible", window.scrollY > 400);
});

// Toast notification
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// Speech synthesis
function speak(word) {
  const speech = new SpeechSynthesisUtterance(word);
  speech.lang = "en-US";
  speech.rate = 0.9;
  window.speechSynthesis.speak(speech);
}

// =============================================
// GAMES
// =============================================

const gameArea = document.getElementById("gameArea");
const gameTitle = document.getElementById("gameTitle");
const gameQuestion = document.getElementById("gameQuestion");
const gameOptions = document.getElementById("gameOptions");
const gameScore = document.getElementById("gameScore");
const gameNextBtn = document.getElementById("gameNextBtn");

let currentGame = null;
let score = 0;
let currentQuestion = 0;
let questions = [];

function showGame(title, qs) {
  currentGame = title;
  questions = qs;
  score = 0;
  currentQuestion = 0;
  gameArea.classList.add("active");
  gameNextBtn.onclick = nextGameQuestion;
  renderQuestion();
}

function renderQuestion() {
  if (currentQuestion >= questions.length) {
    gameTitle.textContent = "Game Over!";
    gameQuestion.innerHTML = `You scored ${score} out of ${questions.length}!`;
    gameOptions.innerHTML = "";
    gameNextBtn.textContent = "Play Again";
    gameNextBtn.onclick = () => { gameArea.classList.remove("active"); };
    gameScore.textContent = `Final Score: ${score}`;
    return;
  }
  const q = questions[currentQuestion];
  gameTitle.textContent = currentGame;
  gameOptions.innerHTML = "";
  gameScore.textContent = `Score: ${score}`;
  gameNextBtn.style.display = "none";

  let visualHtml = "";
  if (q.colorHex) {
    visualHtml = `<div style="display:inline-block;width:80px;height:80px;border-radius:16px;background:${q.colorHex};border:3px solid #eef0ff;margin-bottom:15px;box-shadow:0 4px 15px rgba(0,0,0,0.1);"></div>`;
  }
  if (q.animalEmoji) {
    visualHtml = `<div style="font-size:4rem;margin-bottom:10px;">${q.animalEmoji}</div>`;
  }
  gameQuestion.innerHTML = (visualHtml ? visualHtml + "<br>" : "") + q.question;

  q.options.forEach(opt => {
    const btn = document.createElement("div");
    btn.className = "game-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleAnswer(btn, opt, q.answer));
    gameOptions.appendChild(btn);
  });
}

let answered = false;
function handleAnswer(btn, selected, correct) {
  if (answered) return;
  answered = true;
  if (selected === correct) {
    btn.classList.add("correct");
    score++;
    showToast("Correct! Well done!");
  } else {
    btn.classList.add("wrong");
    showToast("Oops! Try the next one!");
    document.querySelectorAll(".game-option").forEach(b => {
      if (b.textContent === correct) b.classList.add("correct");
    });
  }
  gameScore.textContent = `Score: ${score}`;
  gameNextBtn.style.display = "inline-block";
}

function nextGameQuestion() {
  answered = false;
  currentQuestion++;
  renderQuestion();
}

// ---- Color Game ----
function startColorGame() {
  const colors = [
    { name: "Red", hex: "#ff0000" },
    { name: "Blue", hex: "#0000ff" },
    { name: "Green", hex: "#008000" },
    { name: "Yellow", hex: "#ffff00" },
    { name: "Purple", hex: "#800080" },
    { name: "Orange", hex: "#ffa500" },
    { name: "Pink", hex: "#ffc0cb" },
    { name: "Brown", hex: "#a52a2a" }
  ];
  const qs = colors.map(c => {
    const opts = colors.map(x => x.name).sort(() => Math.random() - 0.5).slice(0, 4);
    if (!opts.includes(c.name)) opts[0] = c.name;
    return {
      question: `What color is this?`,
      colorHex: c.hex,
      options: opts.sort(() => Math.random() - 0.5),
      answer: c.name
    };
  }).sort(() => Math.random() - 0.5).slice(0, 5);
  showGame("Color Matching Game", qs);
}

// ---- Animal Quiz ----
function startAnimalQuiz() {
  const animals = [
    { name: "Cat", emoji: "&#128008;" },
    { name: "Dog", emoji: "&#128021;" },
    { name: "Elephant", emoji: "&#128024;" },
    { name: "Lion", emoji: "&#129409;" },
    { name: "Tiger", emoji: "&#128005;" },
    { name: "Monkey", emoji: "&#128018;" },
    { name: "Zebra", emoji: "&#129427;" },
    { name: "Giraffe", emoji: "&#129426;" }
  ];
  const qs = animals.map(a => {
    const opts = animals.filter(x => x.name !== a.name).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.name);
    opts.push(a.name);
    return {
      question: "Which animal is this?",
      animalEmoji: a.emoji,
      options: opts.sort(() => Math.random() - 0.5),
      answer: a.name
    };
  }).sort(() => Math.random() - 0.5).slice(0, 5);
  showGame("Animal Quiz", qs);
}

// ---- Number Game ----
function startNumberGame() {
  const nums = [
    { word: "One", num: 1 },
    { word: "Two", num: 2 },
    { word: "Three", num: 3 },
    { word: "Four", num: 4 },
    { word: "Five", num: 5 },
    { word: "Six", num: 6 },
    { word: "Seven", num: 7 },
    { word: "Eight", num: 8 },
    { word: "Nine", num: 9 },
    { word: "Ten", num: 10 }
  ];
  const qs = nums.map(n => {
    const opts = nums.filter(x => x.word !== n.word).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.word);
    opts.push(n.word);
    return {
      question: `Which number is ${n.num}?`,
      options: opts.sort(() => Math.random() - 0.5),
      answer: n.word
    };
  }).sort(() => Math.random() - 0.5).slice(0, 5);
  showGame("Number Challenge", qs);
}

// ---- Memory Game ----
function startMemoryGame() {
  const words = ["Cat", "Dog", "Sun", "Hat", "Ball", "Fish", "Star", "Bird"];
  const qs = words.map(w => {
    const scrambled = w.split("").sort(() => Math.random() - 0.5).join("");
    const opts = words.filter(x => x !== w).sort(() => Math.random() - 0.5).slice(0, 3);
    opts.push(w);
    return {
      question: `Unscramble: "${scrambled}"`,
      options: opts.sort(() => Math.random() - 0.5),
      answer: w
    };
  }).sort(() => Math.random() - 0.5).slice(0, 5);
  showGame("Memory Game - Word Scramble", qs);
}

// =============================================
// EXERCISES
// =============================================

// ---- Fill in the Blanks ----
function startFillBlanks() {
  const qs = [
    { question: 'The sky is ___.', options: ["Blue", "Red", "Green", "Yellow"], answer: "Blue" },
    { question: 'Cats say ___.', options: ["Meow", "Woof", "Moo", "Chirp"], answer: "Meow" },
    { question: 'We have ___ fingers on one hand.', options: ["Five", "Three", "Four", "Ten"], answer: "Five" },
    { question: 'The opposite of hot is ___.', options: ["Cold", "Warm", "Big", "Fast"], answer: "Cold" },
    { question: 'A baby dog is called a ___.', options: ["Puppy", "Kitten", "Cub", "Foal"], answer: "Puppy" }
  ];
  showGame("Fill in the Blanks", qs);
}

// ---- Multiple Choice ----
function startMultipleChoice() {
  const qs = [
    { question: "What color is grass?", options: ["Green", "Blue", "Red", "Yellow"], answer: "Green" },
    { question: "How many legs does a cat have?", options: ["4", "2", "6", "8"], answer: "4" },
    { question: "Which animal can fly?", options: ["Bird", "Fish", "Dog", "Cat"], answer: "Bird" },
    { question: "What comes after Monday?", options: ["Tuesday", "Wednesday", "Sunday", "Friday"], answer: "Tuesday" },
    { question: "Which season comes after Winter?", options: ["Spring", "Summer", "Autumn", "Winter"], answer: "Spring" }
  ];
  showGame("Choose the Correct Answer", qs);
}

// ---- Word Scramble ----
function startWordScramble() {
  const words = ["Apple", "House", "Water", "Happy", "Smile", "Dance", "Music", "Cloud"];
  const qs = words.map(w => {
    const scrambled = w.split("").sort(() => Math.random() - 0.5).join("");
    const opts = words.filter(x => x !== w).sort(() => Math.random() - 0.5).slice(0, 3);
    opts.push(w);
    return {
      question: `Unscramble: "${scrambled}"`,
      options: opts.sort(() => Math.random() - 0.5),
      answer: w
    };
  }).sort(() => Math.random() - 0.5).slice(0, 5);
  showGame("Word Scramble", qs);
}

// ---- Match the Words ----
function startMatchWords() {
  const pairs = [
    { word: "Happy", meaning: "Feeling joy" },
    { word: "Big", meaning: "Large in size" },
    { word: "Fast", meaning: "Quick speed" },
    { word: "Cold", meaning: "Low temperature" },
    { word: "Bright", meaning: "Full of light" }
  ];
  const qs = pairs.map(p => {
    const opts = pairs.filter(x => x.word !== p.word).map(x => x.meaning).sort(() => Math.random() - 0.5).slice(0, 3);
    opts.push(p.meaning);
    return {
      question: `What does "${p.word}" mean?`,
      options: opts.sort(() => Math.random() - 0.5),
      answer: p.meaning
    };
  });
  showGame("Match the Words", qs);
}
