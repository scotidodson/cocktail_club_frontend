document.addEventListener('DOMContentLoaded', () => {
  const cocktailUrl = `http://localhost:3000/api/v1/cocktails`
  const ingredientUrl = `http://localhost:3000/api/v1/ingredients`
  const neonHeader = document.querySelector('.neon_text')
  const navBox = document.querySelector('.navigation')
  const pageBody = document.querySelector('.main')
  const aboutPage = document.querySelector('.item-homepage')
  const quizPage = document.querySelector('.quiz-page')
  const studyPage = document.querySelector('.study-page')
  const formPage = document.querySelector('.form-page')
  const quizBox = document.querySelector('.quiz-prompt')
  let ingredients
  let quizBoxListenerOn = false
  let score
  // ------------------------- LISTENERS ------------------------------------

    neonHeader.addEventListener('click', (event) => {
      resetHomepage()
    })

    navBox.addEventListener('click', (event) => {
    if (event.target.className === "test-btn") {
      startQuiz()
    } else if (event.target.className === "study-btn") {
      studyRecipes()
    } else if (event.target.className === "create-btn") {
      showNewCocktailForm()
    }
  })

    studyPage.addEventListener('click', (event) => {
      console.log('clicked');
      console.log(event.target);
    // if (event.target.className === "test-btn") {
    //   startQuiz()
    // } else if (event.target.className === "study-btn") {
    //   studyRecipes()
    // } else if (event.target.className === "create-btn") {
    //   showNewCocktailForm()
    // }
  })

    pageBody.addEventListener('submit', (event) => {
    event.preventDefault()
    if (event.target.className === "new-cocktail-form") {
      console.log("got it");
      let nameInput = document.querySelector('input[name="name"]').value
      addCustomCocktailName(nameInput)
    }
  })

  // ------------------------- HELPER FUNCTIONS -----------------------------

    const allDatabaseCocktails = function fetchCocktails() {
      fetch(cocktailUrl)
      .then(resp => resp.json())
      .then(cocktailData => {
        cocktails = cocktailData
        return cocktails
        })
    }() // end of fetchCocktails

    function shuffle(array) {
      let currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      return array;
    } // end of shuffle

    function chooseRandom(array) {
      let thisOne
      thisOne = array[Math.floor(Math.random() * array.length)]
      return thisOne
    } // end of chooseRandom

  // ------------------------- functions for study cocktail path ------------

    function studyRecipes(){
      let allCardsDiv
      console.log("selected study recipes");
      fetch(cocktailUrl)
      .then(resp => resp.json())
      .then(cocktailData => {
        cocktails = cocktailData
        aboutPage.hidden = true
        quizPage.hidden = true
        formPage.hidden = true
        studyPage.hidden = false
        cocktails.forEach((cocktail) => {
        renderOneCocktail(cocktail)
        // TODO -- once data is seeded, start with one recipe, then add next button to go through.
        })
      })

    } // end of studyRecipes

    function renderOneCocktail(cocktail) {
      studyPage.innerHTML += `
        <div class="item">
        <p class="study-ingredients">
        <button id="button" class="flip-btn gone">
        Flip
        </button>
        <button id="button" class="delete-btn gone">
        Hide
        </button>
        <button id="button" class="delete-btn gone">
        Delete
        </button>
        </p>
              <h2 class="name">${cocktail.name}</h2>
              <p class="study-ingredients">${renderRecipeIngredients(cocktail)}</p>
              <p class="instructions">${cocktail.instructions}</p>
        </div>
      `
      // handleFlipping()
    } // end of renderOneCocktail

    // function handleFlipping() {
    //   pageBody.addEventListener('click', ()=>{
    //     if (event.target.className === "flipper") {
    //       console.log('clicked');
    //     }
    //     // debugger
    //   })
    // }

    function renderRecipeIngredients(cocktail) {
      let ingredientList = []
      cocktail.ingredients.forEach((ingredientHash)=>{
        ingredientList.push(`${ingredientHash.amount} ${ingredientHash.ingredient}<br>`)
      })
      return ingredientList.join('')
    } // end of renderRecipeIngredients

  // ------------------------ functions for quiz path -----------------------

    function startQuiz() {
      aboutPage.hidden = true
      quizPage.hidden = false
      studyPage.hidden = true
      formPage.hidden = true
      let remainingQuizDrinks = []
      let round = 1
      let winningCocktail = null
      let roundIngredients = []
      score = 0

      allDatabaseCocktails
      winningCocktail = chooseRandom(cocktails)
      roundIngredients = getRoundIngredients(cocktails, winningCocktail)
      cocktails.forEach(c=>{
        if (c.id != winningCocktail.id) {
          remainingQuizDrinks.push(c)
        }
      })

      renderRound(remainingQuizDrinks, winningCocktail, roundIngredients, round, score)
      // pourDrink(50)
    } // end of startQuiz

    function nextRound(round, score, remainingQuizDrinks) {
      let i = 0
      round++
      roundIngredients = []

      allDatabaseCocktails
      winningCocktail = chooseRandom(cocktails)
      roundIngredients = getRoundIngredients(cocktails, winningCocktail)

      remainingQuizDrinks.forEach(c=>{
        if (c.id = winningCocktail.id) {
          remainingQuizDrinks.splice(i, 1)
        }
        i++
      })
      renderRound(remainingQuizDrinks, winningCocktail, roundIngredients, round, score)
    } // end of nextRound

    function renderRound(remainingQuizDrinks, winningCocktail, roundIngredients, round, score) {
      quizBox.innerHTML = `
          <h2>${winningCocktail.name}</h2>
          <div class="answer-container">
          ${renderAnswerButtons(roundIngredients)}
          </div>
          <br>
          <button class="check-answers" type="button" value="submit">Put it on my tab?</button>
        `
      handleResponse(remainingQuizDrinks, winningCocktail, roundIngredients, round, score, quizBox)
    } // end of renderRound

    function renderAnswerButtons(roundIngredients) {
      let answerButtons = []
      roundIngredients.forEach(i => {
        answerButtons.push(`<button class="answer-item" id="not-selected" data-name="${i}" data-type="ingredient" data-selected="false">${i}</button>`)
      })
      return answerButtons.join('')
    } // end of renderAnswerButtons

    function handleResponse(remainingQuizDrinks, winningCocktail, roundIngredients, round, score, quizBox) {
      let selected = []
      let selectedNames = []
      const checkMyAnswersBtn = document.querySelector('.check-answers')
      const ingredientButtons = document.querySelector('.answer-container')

      checkMyAnswersBtn.addEventListener('click', (event)=>{
        nodeArray = document.querySelectorAll('#selected')
        selected = Array.from(nodeArray)
          selected.forEach(element => {
            selectedNames.push(element.dataset.name)
          })
          selectedNames.sort()
        submitResponse(remainingQuizDrinks, winningCocktail, round, score, quizBox, selectedNames)
      })

      ingredientButtons.addEventListener('click', (event)=>{
        if (event.target.dataset.type === "ingredient") {
            console.log('clicked an ingredient')
            console.log(event.target.dataset.name);
            toggleTrueFalse(event)
        }
      })
    } // handleResponse

    function submitResponse(remainingQuizDrinks, winningCocktail, round, score, quizBox, selectedNames) {
      let correct = []
      let winner = false
      console.log('submitting response');
      console.log(selectedNames);

      winningCocktail.ingredients.forEach(iHash => {
        correct.push(iHash.ingredient)
      })
      correct.sort()

      if (correct.length === selectedNames.length) {
        for (var i = 0; i < correct.length; i++) {
          if (correct[i] === selectedNames[i]) {
            winner = true
          }
        }
      }

      if (winner) {
        score += 10
        quizBox.innerHTML = `
        <h2>${winningCocktail.name}</h2>
        <p>You got it!</p>
        <ul>${renderRecipeIngredients(winningCocktail)}</ul>
        <p>${winningCocktail.instructions}</p>
        <button class="next-round" type="button" value="submit">Another Round</button>
        `
      } else {
        score -= 10
        quizBox.innerHTML = `
        <h2>${winningCocktail.name}</h2>
        <p>WRONG</p>
        <p>You chose: ${selectedNames.join(', ')}</p>
        <p>Try this instead...</p>
        <ul>${renderRecipeIngredients(winningCocktail)}</ul>
        <p>${winningCocktail.instructions}</p>
        <button class="next-round" type="button" value="submit">Another Round</button>
        `
      }
      console.log(`round: ${round} score: ${score}`);
      handleEndOfRound(remainingQuizDrinks, round, score, quizBox, selectedNames)
    } // end of submitResponse

                // ** ------------------- add css change in this step +- 10 ^^^^

    function handleEndOfRound(remainingQuizDrinks, round, score, quizBox, selectedNames) {
      const nextRoundBtn = document.querySelector('.next-round')
      nextRoundBtn.addEventListener('click', (event) =>{
        if (score >= 100) {
          quizBox.innerHTML = `
          <h2>You've got a full glass!</h2>
          <h2>Dude, you're great. I love when you come in.</h2>
          <button class="play-again" type="button" value="submit">Play Again</button>
          `
          handleEndOfGame(quizBox)
        } else if (score <= 0) {
          quizBox.innerHTML = `
          <h2>You're cut off! Get out.</h2>
          <button class="play-again" type="button" value="submit">Play Again</button>
          `
          handleEndOfGame(quizBox)
        } else {
          nextRound(round, score, remainingQuizDrinks)
        }
      })
    } // end of handleEndOfRound

    function handleEndOfGame() {
      const playAgain = document.querySelector('.play-again')
      playAgain.addEventListener('click', ()=>{
        startQuiz()
      })
    }

    function toggleTrueFalse(event) {

      if (event.target.dataset.selected === "false") {
        event.target.dataset.selected = "true"
      } else {
        event.target.dataset.selected = "false"
      }
      toggleClass(event)
    } // end of toggleTrueFalse

    function toggleClass(event) {
      if (event.target.id === "not-selected") {
        event.target.setAttribute("id", "selected")
        event.target.setAttribute("class", "answer-item picked")
      } else {
        event.target.setAttribute("id", "not-selected")
        event.target.setAttribute("class", "answer-item")
      }
    } // end of toggleClass

    function getRoundIngredients(cocktailArray, chosenDrink) {
      let roundIngredients = []
      let uniqRoundIngredients = []
      let allIngredientNames = []
      let uniqIngredients = []
      let shuffledIngredients = []
      let correctIngredients = []
      // get correct ingredients
          chosenDrink.ingredients.forEach(iHash => {
            correctIngredients.push(iHash.ingredient)
          })

      // get all ingredients
          cocktailArray.forEach(c => {
              c.ingredients.forEach(iHash => {
                allIngredientNames.push(iHash.ingredient)
              })
          })

      // get unique names
          uniqIngredients = [...new Set(allIngredientNames)]
      // shuffle unique names
          shuffledIngredients = shuffle(uniqIngredients)

      // add correct to round & ensure unique vals
          roundIngredients = combineWinningWithRandom(correctIngredients, shuffledIngredients)
          uniqRoundIngredients = [...new Set(roundIngredients)]
            // TO DO this will not insure a set of 12 options each time.... need to fix

      return roundIngredients
    } // end of getRoundIngredients

    function combineWinningWithRandom(correctIngredients, shuffledIngredients) {
      let number
      let options = []
      let shuffledOptions = []
        console.log("correct:");
        console.log(correctIngredients);
      options = [...correctIngredients]
      number = (12 - correctIngredients.length)

      for (let i = 0; i < number; i++) {
        options.push(shuffledIngredients[i])
      }

      shuffledOptions = shuffle(options)
      return shuffledOptions
    } // end of combineWinningWithRandom

  // ------------------------ functions for adding a custom cocktail --------

    function showNewCocktailForm() {
      aboutPage.hidden = true
      quizPage.hidden = true
      formPage.hidden = false
      studyPage.hidden = true
    } // showNewCocktailForm

    function addCustomCocktailName(nameInput){
      let newCocktail
      fetch(cocktailUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "name": nameInput
        })
      }).then(resp => resp.json())
      .then(cocktail => {
        newCocktail = cocktail
        // should I add to the cocktails array here?
        showFirstIngredientForm(newCocktail)
      })
    } // end of addCustomCocktailName

    function showFirstIngredientForm(newCocktail) {
      console.log("added name");
      formPage.innerHTML =`
      <h3>${newCocktail.name}</h3>
      <h4 class="form-instructions">What's in it?</h4>
      <form class="add-cocktail-ingredients">
      <ul class="submitted-ingredients"></ul>
      <br>
      <br>
      <div class="adding-ingredient">
      <input name="amount" placeholder="Amount">
      <input name="ingredient" placeholder="ingredient">
      </div>
      <br>
      <br>
      <div class="ingredient-form-buttons">
      <button class="another-ingredient" type="submit">+ Ingredient</button><br><br>
      <button id="button" class="added-ingredient" type="submit" value="Submit">Next</button></div>
      <div class="save-button"></div>
      </form>
      `
      ingredientLoop(newCocktail)
    } // end of showIngredientForm

    function ingredientLoop(newCocktail) {
      let ingredientButtons = document.querySelector('.ingredient-form-buttons')
      let submittedUl = document.querySelector('.submitted-ingredients')
      let ingredientsDiv = document.querySelector('.adding-ingredient')

      ingredientButtons.addEventListener("click", (event)=> {
        let ingredientVal = document.querySelector('input[name="ingredient"]').value
        let amountVal = document.querySelector('input[name="amount"]').value
        if (ingredientVal && amountVal) {
          submitIngredient(ingredientVal, amountVal, newCocktail)
        }

        if (event.target.className === "another-ingredient") {
          submittedUl.innerHTML += `
          <li>${amountVal} ${ingredientVal}</li>
          `
          ingredientsDiv.innerHTML = `
          <input name="amount" placeholder="Amount">
          <input name="ingredient" placeholder="ingredient">
          `
        } else if (event.target.className === "added-ingredient") {
          showInstructionsForm(newCocktail)
        }
      }) // end of button listener
    } // end of ingredientLoop

    function submitIngredient(ingredientVal, amountVal, newCocktail) {
      fetch(ingredientUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "cocktail_id": newCocktail.id,
          "ingredient": ingredientVal,
          "amount": amountVal
        })
      }).then(resp => resp.json())
      .then(ingredient => {
        console.log(ingredient);
      })
    } // end of submitIngredient

    function showInstructionsForm(newCocktail) {
      console.log("move to next piece");
      let buttons = document.querySelector('.ingredient-form-buttons')
      let saveButton = document.querySelector('.save-button')
      let ingredientsDiv = document.querySelector('.adding-ingredient')
      let formHeader = document.querySelector('.form-instructions')

      formHeader.innerHTML = "How do you make it?"
      ingredientsDiv.innerHTML = `
      <input name="instructions" placeholder="instructions">
      `
      buttons.innerHTML = ""

      saveButton.innerHTML = `
      <button id="button" class="save-cocktail-button" type="submit" value="Submit">Save Cocktail</button></div>
      `
      finishCocktail(newCocktail, saveButton, ingredientsDiv)
    } // end of showInstructionsForm

    function finishCocktail(newCocktail, saveButton, ingredientsDiv) {
      let saveCocktailButton = document.querySelector('.save-cocktail-button')
      saveCocktailButton.addEventListener("click", (event) =>{
        let instructionVal = document.querySelector('input[name="instructions"]').value
        fetch(`http://localhost:3000/api/v1/cocktails/${newCocktail.id}`, {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "instructions": instructionVal
          })
        }).then(resp => resp.json())
        .then(cocktail => {
          ingredientsDiv.innerHTML = `${instructionVal}`
          saveButton.innerHTML = ""
        })
      })
    } // end of finishCocktail


  function resetHomepage() {
    aboutPage.hidden = false
    quizPage.hidden = true
    formPage.hidden = true
    studyPage.hidden = true
  }

}); // end of DOMContentLoaded
