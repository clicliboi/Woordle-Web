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
  let maxAttempts = 5;
  let attemptsLeft = maxAttempts;
  let timer;
  let timeLeft = 30;
  let gameActive = false;

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
    popup.classList.add("hidden");
  });

  async function fetchWords() {
    try {
      const response = await fetch('https://random-word-api.vercel.app/api?words=60&length=5');
      if (!response.ok) throw new Error('Kan woorden niet ophalen.');
      const words = await response.json();
      startGame(words);
    } catch (error) {
      console.error('Fout bij het ophalen van woorden:', error);
      wordDisplay.textContent = "Fout bij het laden van woorden!";
    }
  }

  function showPopup(message) {
    popupMessage.textContent = message;
    popup.classList.remove("hidden");
  }

  function startTimer() {
    timeLeft = 30;
    updateTimerDisplay();
    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        endGame("Tijd is om!");
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    timerElement.textContent = `Tijd over: ${timeLeft}s`;
  }

  function updateAttemptsDisplay() {
    attemptsElement.textContent = `Pogingen over: ${attemptsLeft}`;
  }

  function saveScore() {
    fetch("https://example.com/save-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName, score }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Score kon niet worden opgeslagen.");
        return response.json();
      })
      .then((data) => {
        console.log("Score opgeslagen:", data);
        fetchLeaderboard();
      })
      .catch((error) => {
        console.error("Fout bij het opslaan van de score:", error);
      });
  }

  function fetchLeaderboard() {
    fetch("https://example.com/get-leaderboard")
      .then((response) => {
        if (!response.ok) throw new Error("Leaderboard kon niet worden opgehaald.");
        return response.json();
      })
      .then((data) => {
        displayLeaderboard(data);
      })
      .catch((error) => {
        console.error("Fout bij het ophalen van het leaderboard:", error);
      });
  }

  function displayLeaderboard(data) {
    leaderboardList.innerHTML = "";
    data.forEach((entry) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${entry.name}: ${entry.score}`;
      leaderboardList.appendChild(listItem);
    });
    leaderboard.classList.remove("hidden");
  }

  function endGame(message) {
    gameActive = false;
    showPopup(message);
    saveScore();
    disableKeyboard();
  }

  function disableKeyboard() {
    const keys = keyboard.querySelectorAll(".key");
    keys.forEach((key) => {
      key.classList.add("disabled");
      key.removeEventListener("click", handleKeyPress);
    });
  }

  function startGame(words) {
    gameActive = true;
    let currentWordIndex = 0;
    let currentWord = words[currentWordIndex].toLowerCase();
    let guessedLetters = Array(currentWord.length).fill("");

    setupGuessSlots(currentWord.length);
    setupKeyboard(currentWord);
    startTimer();
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
          showPopup(`Goed gedaan! Het woord was: ${word}.`);
          score++;
          scoreElement.textContent = score;

          setTimeout(nextWord, 1000);
        }
      } else {
        keyElement.classList.add("incorrect");
        attemptsLeft--;
        updateAttemptsDisplay();
        if (attemptsLeft === 0) {
          endGame(`Helaas, je hebt verloren. Het woord was: ${word}.`);
        }
      }
    }

    function nextWord() {
      if (!gameActive) return;

      currentWordIndex++;
      if (currentWordIndex < words.length) {
        currentWord = words[currentWordIndex].toLowerCase();
        guessedLetters = Array(currentWord.length).fill("");
        setupGuessSlots(currentWord.length);
        setupKeyboard(currentWord);
        attemptsLeft = maxAttempts;
        updateAttemptsDisplay();
      } else {
        endGame(`Spel voorbij! Jouw score: ${score}`);
      }
    }
  }
});
