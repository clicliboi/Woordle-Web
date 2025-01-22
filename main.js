document.addEventListener("DOMContentLoaded", () => {
  const wordDisplay = document.getElementById("word-display");
  const scoreElement = document.getElementById("score");
  const keyboard = document.getElementById("keyboard");
  const guessContainer = document.getElementById("guess-container");
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");
  const popupButton = document.getElementById("popup-button");
  const attemptsElement = document.getElementById("attempts");
  const timerElement = document.getElementById("timer");
  const namePopup = document.getElementById("name-popup");
  const nameInput = document.getElementById("name-input");
  const nameSubmitButton = document.getElementById("name-submit-button");
  const leaderboard = document.getElementById("leaderboard");
  const leaderboardList = document.getElementById("leaderboard-list");

  let playerName = "";
  let score = 0;
  const maxAttempts = 5;
  let attemptsLeft = maxAttempts;
  let timer;
  let timeLeft = 60;
  let gameActive = false;
  let currentWordIndex = 0;
  let words = [];

  nameSubmitButton.addEventListener("click", () => {
    playerName = nameInput.value.trim();
    if (playerName) {
      namePopup.classList.add("hidden");
      fetchWords();
    } else {
      alert("Voer een geldige naam in!");
    }
  });

  popupButton.addEventListener("click", () => {
    location.reload();
  });

  async function fetchWords() {
    try {
      const response = await fetch('https://random-word-api.vercel.app/api?words=60&length=5');
      if (!response.ok) throw new Error('Kan woorden niet ophalen.');
      words = await response.json();
      startGame();
    } catch (error) {
      console.error('Fout bij het ophalen van woorden:', error);
      wordDisplay.textContent = "Fout bij het laden van woorden!";
    }
  }

  function showPopup(message) {
    popupMessage.textContent = message;
    popup.classList.remove("hidden");
    clearInterval(timer);
    if (message.includes("Probeer opnieuw")) {
      saveScore(); // Sla de score op als het spel voorbij is
    }
  }

  function startTimer() {
    updateTimerDisplay();
    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        endGame("Tijd is om! Probeer opnieuw.");
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    timerElement.textContent = `Tijd over: ${timeLeft}s`;
  }

  function updateAttemptsDisplay() {
    attemptsElement.textContent = `Pogingen over: ${attemptsLeft}`;
  }

  function startGame() {
    gameActive = true;
    score = 0;
    currentWordIndex = 0;
    attemptsLeft = maxAttempts;
    nextWord();
    startTimer();
  }

  function nextWord() {
    if (currentWordIndex >= words.length) {
      endGame(`Spel voorbij! Jouw score: ${score}`);
      return;
    }

    const currentWord = words[currentWordIndex].toLowerCase();
    const guessedLetters = Array(currentWord.length).fill("");

    setupGuessSlots(currentWord.length);
    setupKeyboard(currentWord);
    attemptsLeft = maxAttempts;
    updateAttemptsDisplay();

    function setupGuessSlots(wordLength) {
      guessContainer.innerHTML = "";
      for (let i = 0; i < wordLength; i++) {
        const slot = document.createElement("div");
        slot.classList.add("letter-slot");
        guessContainer.appendChild(slot);
      }
    }

    function setupKeyboard(word) {
      keyboard.innerHTML = "";
      const letters = "abcdefghijklmnopqrstuvwxyz";

      for (let letter of letters) {
        const key = document.createElement("div");
        key.classList.add("key");
        key.textContent = letter;

        key.addEventListener("click", () => handleKeyPress(letter, word, key));
        keyboard.appendChild(key);
      }
    }

    function handleKeyPress(letter, word, keyElement) {
      if (!gameActive) return;

      if (word.includes(letter)) {
        keyElement.classList.add("correct");
        for (let i = 0; i < word.length; i++) {
          if (word[i] === letter) {
            guessedLetters[i] = letter;
            guessContainer.children[i].textContent = letter;
          }
        }

        if (guessedLetters.join("") === word) {
          score++;
          scoreElement.textContent = score;
          currentWordIndex++;
          clearKeyboardListeners();
          setTimeout(nextWord, 1000);
        }
      } else {
        keyElement.classList.add("incorrect");
        attemptsLeft--;
        updateAttemptsDisplay();
        if (attemptsLeft === 0) {
          currentWordIndex++;
          clearKeyboardListeners();
          setTimeout(nextWord, 1000);
        }
      }
    }

    function clearKeyboardListeners() {
      const keys = keyboard.querySelectorAll(".key");
      keys.forEach(key => {
        const newKey = key.cloneNode(true);
        key.parentNode.replaceChild(newKey, key);
      });
    }
  }

  function endGame(message) {
    gameActive = false;
    showPopup(message);
  }

  async function saveScore() {
    const response = await fetch('leaderboard.php', {
      method: 'POST',
      body: new URLSearchParams({
        name: playerName,
        score: score
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.ok) {
      const responseText = await response.text();
      console.log(responseText); // Debugging: controleer de server response
      loadLeaderboard(); // Laad de leaderboard opnieuw na score opslaan
    } else {
      console.error("Er is iets mis gegaan bij het opslaan van de score.");
    }
  }

  async function loadLeaderboard() {
    const response = await fetch('leaderboard.php');
    if (response.ok) {
      const leaderboardData = await response.json();
      leaderboardList.innerHTML = "";
      leaderboardData.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
      });
    } else {
      console.error("Er is iets mis gegaan bij het laden van de leaderboard.");
    }
  }

  loadLeaderboard(); // Laad de leaderboard bij het laden van de pagina
});
