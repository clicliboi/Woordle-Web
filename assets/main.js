document.addEventListener("DOMContentLoaded", () => {
    const wordDisplay = document.getElementById("word-display");
    const scoreElement = document.getElementById("score");
    const keyboard = document.getElementById("keyboard");
    const guessContainer = document.getElementById("guess-container");
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let score = 0;

    async function fetchWords() {
      try {
        const response = await fetch('https://random-word-api.vercel.app/api?words=60&length=5');
        if (!response.ok) {
          throw new Error('Kan woorden niet ophalen.');
        }
        const words = await response.json();
        startGame(words);
      } catch (error) {
        console.error('Fout bij het ophalen van woorden:', error);
        wordDisplay.textContent = "Fout bij het laden van woorden!";
      }
    }

    function startGame(words) {
      let currentWordIndex = 0;
      let currentWord = words[currentWordIndex].toLowerCase();
      let guessedLetters = Array(currentWord.length).fill(""); 
  
      setupGuessSlots(currentWord.length);
      setupKeyboard(currentWord);
  
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
  
        for (let letter of letters) {
          const key = document.createElement("div");
          key.classList.add("key");
          key.id = letter
          key.textContent = letter;
  
          key.addEventListener("click", () => handleKeyPress(letter, word, key));
          keyboard.appendChild(key);
        }

        document.addEventListener("keyup", function(event)
        {
          if (!letters.includes(event.key)) return;

          console.log(keyboard)

          handleKeyPress(event.key, word, document.getElementById(event.key))
        })
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
            alert("Goed gedaan! Volgend woord...");
            score++;
            scoreElement.textContent = score;
  
            
            currentWordIndex++;
            if (currentWordIndex < words.length) {
              currentWord = words[currentWordIndex].toLowerCase();
              guessedLetters = Array(currentWord.length).fill("");
              setupGuessSlots(currentWord.length);
              setupKeyboard(currentWord);
            } else {
              alert("Spel voorbij! Jouw score: " + score);
            }
          }
        } else {
          
          keyElement.classList.add("incorrect");
        }
      }
    }
  
    fetchWords();
  });
  