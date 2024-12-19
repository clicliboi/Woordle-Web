document.addEventListener("DOMContentLoaded", () => {
  const wordDisplay = document.getElementById("word-display");
  const scoreElement = document.getElementById("score");
  const keyboard = document.getElementById("keyboard");
  const guessContainer = document.getElementById("guess-container");
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");
  const popupButton = document.getElementById("popup-button");
  const attemptsElement = document.getElementById("attempts");
  let score = 0;
  let maxAttempts = 5;
  let attemptsLeft = maxAttempts;

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

  function startGame(words) {
    let currentWordIndex = 0;
    let currentWord = words[currentWordIndex].toLowerCase();
    let guessedLetters = Array(currentWord.length).fill("");

    setupGuessSlots(currentWord.length);
    setupKeyboard(currentWord);
    updateAttempts();

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
        updateAttempts();

        if (attemptsLeft === 0) {
          showPopup(`Helaas, je hebt verloren. Het woord was: ${word}.`);
          setTimeout(nextWord, 1000);
        }
      }
    }

    function updateAttempts() {
      attemptsElement.textContent = `Pogingen over: ${attemptsLeft}`;
    }

    function nextWord() {
      currentWordIndex++;
      if (currentWordIndex < words.length) {
        currentWord = words[currentWordIndex].toLowerCase();
        guessedLetters = Array(currentWord.length).fill("");
        setupGuessSlots(currentWord.length);
        setupKeyboard(currentWord);
        attemptsLeft = maxAttempts;
        updateAttempts();
      } else {
        showPopup(`Spel voorbij! Jouw score: ${score}`);
      }
    }
  }

  fetchWords();
});
