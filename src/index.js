document.addEventListener('DOMContentLoaded', () => {
  const cocktailUrl = `http://localhost:3000/api/v1/cocktails`
  const ingredientUrl = `http://localhost:3000/api/v1/ingredients`

  const neonHeader = document.querySelector('.neon_text')
  const navBox = document.querySelector('.navigation')
  const pageBody = document.querySelector('.main')

  const aboutPage = document.querySelector('#about-page')
  const quizPage = document.querySelector('.quiz-page')
  const studyPage = document.querySelector('.study-page')
  const formPage = document.querySelector('.form-page')
  const quizBox = document.querySelector('.quiz-prompt')

  const drinkFooter = document.querySelector('footer')
  const drinkDiv = document.querySelector('#drink')
  const drinkStyle = drinkDiv.style

  const lemon = document.querySelector('#lemon')
  const lemonStyle = lemon.style

  const straw = document.querySelector('#straw')
  const strawStyle = straw.style

  let ingredients
  let quizBoxListenerOn = false
  let falseIngredients = ["Bacon", "Butter", "Eucalyptus", "Paprika", "Matcha", "Camel's Milk"]
  let score
  let round
  let cocktailClicked
  
  // ------------------------- LISTENERS ------------------------------------

    neonHeader.addEventListener('click', (event) => {
      resetHomepage()
    })

    navBox.addEventListener('click', (event) => {
    if (event.target.className === "test-btn") {
      // debugger
      if (round) {
          alert("You're already playing - finish your game!")
      } else {
        toggleView(quizPage)
        startQuiz()
      }
    } else if (event.target.className === "study-btn") {
      toggleView(studyPage)
      studyRecipes()
    } else if (event.target.className === "create-btn") {
      toggleView(formPage)
    }
  })

    studyPage.addEventListener('click', ()=>{
      if (event.target.className === "hide-btn") {
        cocktailClicked = event.target.dataset.id
        event.target.parentElement.parentElement.parentElement.hidden = true
      } else if (event.target.className === "delete-btn") {
        cocktailClicked = event.target.dataset.id
        event.target.parentElement.parentElement.parentElement.hidden = true
        cocktailClicked = parseInt(cocktailClicked)
        deleteCocktail(cocktailClicked)
      }
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

    function chooseRandom(array, remainingQuizDrinks) {
      let thisOne
      thisOne = array[Math.floor(Math.random() * array.length)]
        if (remainingQuizDrinks.length > 0) {
          if (remainingQuizDrinks.includes(thisOne)) {
            chooseRandom(array, remainingQuizDrinks)
          }
        }
      return thisOne
    } // end of chooseRandom

    function toggleView(pageToShow) {
      switch (pageToShow) {
        case quizPage:
        aboutPage.hidden = true
        quizPage.hidden = false
        studyPage.hidden = true
        studyPage.innerHTML = ""
        formPage.hidden = true
          break;
        case studyPage:
        aboutPage.hidden = true
        quizPage.hidden = true
        studyPage.hidden = false
        formPage.hidden = true
          break;
        case formPage:
        aboutPage.hidden = true
        quizPage.hidden = true
        studyPage.hidden = true
        studyPage.innerHTML = ""
        formPage.hidden = false
          break;
        default:
        aboutPage.hidden = false
        quizPage.hidden = true
        studyPage.hidden = true
        studyPage.innerHTML = ""
        formPage.hidden = true
      }
    } // end of toggleView

  // ------------------------- functions for study cocktail path ------------

    function studyRecipes(){
      let allCardsDiv
        fetch(cocktailUrl)
        .then(resp => resp.json())
        .then(cocktailData => {
          cocktails = cocktailData
          toggleView(studyPage)
            cocktails.forEach((cocktail) => {
            renderOneCocktail(cocktail)
            // TODO -- once data is seeded, start with one recipe, then add next button to go through.
            })
        })
    } // end of studyRecipes

    function renderOneCocktail(cocktail) {
      studyPage.innerHTML += `
        <div class="item" data-id="${cocktail.id}">
          <div class="recipe-front" data-id="${cocktail.id}">
              ${returnCardButtons(cocktail)}
              <h2 class="name" data-id="${cocktail.id}">${cocktail.name}</h2>
          </div>
          <div class="recipe-back" data-id="${cocktail.id}">
              <p class="study-ingredients" data-id="${cocktail.id}">${renderRecipeIngredients(cocktail)}</p>
              <p class="instructions" data-id="${cocktail.id}">${cocktail.instructions}</p>
          </div>
        </div>
      `
    } // end of renderOneCocktail

    // function handleFlipping(event) {
    //   console.log(event.target);
    // }

    function returnCardButtons(cocktail) {
      return `<p class="study-ingredients">
      <button id="gone" class="hide-btn" data-id="${cocktail.id}">
      //
      </button>
      <button id="gone" class="delete-btn" data-id="${cocktail.id}">
      x
      </button>
      </p>`
      // <button id="gone" class="hide-btn" data-id="${cocktail.id}">
      // //
      // </button>
    } // end of returnCardButtons

    function renderRecipeIngredients(cocktail) {
      let ingredientList = []
      cocktail.ingredients.forEach((ingredientHash)=>{
        ingredientList.push(`${ingredientHash.amount} ${ingredientHash.ingredient}<br>`)
      })
      return ingredientList.join('')
    } // end of renderRecipeIngredients

    function deleteCocktail(cocktailClicked) {

      fetch(`http://localhost:3000/api/v1/cocktails/${cocktailClicked}`, {
        method: "DELETE"
      })
    }

  // ------------------------ functions for quiz path -----------------------

    function startQuiz() {
      let remainingQuizDrinks = []
      round = 1
      score = 50
      adjustDrinkLevel(score)

      roundToRender(round, score, remainingQuizDrinks)
    } // end of startQuiz

    function nextRound(round, score, remainingQuizDrinks) {
      round++
      roundToRender(round, score, remainingQuizDrinks)
    } // end of nextRound

    function roundToRender(round, score, remainingQuizDrinks) {

        let roundIngredients = []
        let winningCocktail = null
        allDatabaseCocktails
        winningCocktail = chooseRandom(cocktails, remainingQuizDrinks)
        roundIngredients = getRoundIngredients(cocktails, winningCocktail)
        remainingQuizDrinks.push(winningCocktail)
      toggleView(quizPage)
      renderRound(remainingQuizDrinks, winningCocktail, roundIngredients, round, score)
    } // end of roundToRender

    function renderRound(remainingQuizDrinks, winningCocktail, roundIngredients, round, score) {
      quizBox.innerHTML = `
          <h2>${winningCocktail.name}</h2>
          <div class="answer-container">
          ${renderAnswerButtons(roundIngredients)}
          </div>
          <br>
          <button class="check-answers" type="button" value="submit">Put it on my tab?</button>
        `
      handleResponse(remainingQuizDrinks, winningCocktail, roundIngredients, round, score)
    } // end of renderRound

    function renderAnswerButtons(roundIngredients) {
      let answerButtons = []
      roundIngredients.forEach(i => {
        answerButtons.push(`<button class="answer-item" id="not-selected" data-name="${i}" data-type="ingredient" data-selected="false">${i}</button>`)
      })
      return answerButtons.join('')
    } // end of renderAnswerButtons

    function handleResponse(remainingQuizDrinks, winningCocktail, roundIngredients, round, score) {
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
        submitResponse(remainingQuizDrinks, winningCocktail, round, score, selectedNames)
      })

      ingredientButtons.addEventListener('click', (event)=>{
        if (event.target.dataset.type === "ingredient") {
            console.log('clicked an ingredient')
            console.log(event.target.dataset.name);
            toggleTrueFalse(event)
        }
      })
    } // handleResponse

    function submitResponse(remainingQuizDrinks, winningCocktail, round, score, selectedNames) {
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
      adjustDrinkLevel(score)
      handleEndOfRound(remainingQuizDrinks, round, score, selectedNames)
    } // end of submitResponse

    function adjustDrinkLevel(score) {
      let level = 100 - score
      let current = parseInt(drinkStyle.top) || 50
      let changer

      if (score == 100) {
        level = 5
        strawStyle.opacity = .8
      } else if (score == 10){
        drinkFooter.innerHTML = ""
        drinkFooter.innerHTML = "You're almost out..."
      } else if (score == 0) {
        lemonStyle.display = "none"
        drinkFooter.innerHTML = "No more for you."
      }

      if (level == 80 || level == 50) {
        drinkFooter.innerHTML = "I'll pour more...<br>if you can tell me what's in it."
      }

      changer = setInterval(()=>{
          if( level < current ){
            current-= .25
            drinkStyle.top = `${current}%`
          } else if (current < level ) {
            current+= .25
            drinkStyle.top = `${current}%`
          } else if (level === current) {
            clearInterval(changer)
          }
      }, 20)

      // drinkStyle.top = `${level}%`
    } // end of adjustDrinkLevel

    function handleEndOfRound(remainingQuizDrinks, round, score, selectedNames) {
      const nextRoundBtn = document.querySelector('.next-round')
      nextRoundBtn.addEventListener('click', (event) =>{
        if (score >= 100) {
          quizBox.innerHTML = `
          <h2>You've got a full glass!</h2>
          <h2>You can sit at my bar any time.</h2>
          <button class="play-again" type="button" value="submit">Play Again</button>
          `
          handleEndOfGame(quizBox)
        } else if (score <= 0) {
          quizBox.innerHTML = `
          <h2>You're cut off! Get out.</h2>
          <button class="play-again" type="button" value="submit">Play Again</button>
          `
          handleEndOfGame()
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
    } // end of handleEndOfGame

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

    function getRoundIngredients(cocktails, winningCocktail) {
      let roundIngredients = []
      let uniqRoundIngredients = []
      let allIngredientNames = []
      let uniqIngredients = []
      let shuffledIngredients = []
      let correctIngredients = []

      // get correct ingredients
          winningCocktail.ingredients.forEach(iHash => {
            correctIngredients.push(iHash.ingredient)
          })
      // get all ingredients
          cocktails.forEach(c => {
              c.ingredients.forEach(iHash => {
                allIngredientNames.push(iHash.ingredient)
              })
          })

      // get unique options
          allIngredientNames.sort()
          uniqIngredients = [...new Set(allIngredientNames)]

      // shuffle unique names
          shuffledIngredients = shuffle(uniqIngredients)
          console.log(shuffledIngredients[0]);

      // add correct to round & ensure unique vals
          roundIngredients = combineWinningWithRandom(correctIngredients, shuffledIngredients)
          uniqRoundIngredients = [...new Set(roundIngredients)]
      // back to 12 if needed
          if (uniqRoundIngredients.length < 12) {
            let need = null
            let x
            need = 12 - uniqRoundIngredients.length
            falseIngredients = shuffle(falseIngredients)

            for (x = 0; x < need; x++) {
              uniqRoundIngredients.push(falseIngredients[x])
            }
            uniqRoundIngredients = shuffle(uniqRoundIngredients)
          }
      return uniqRoundIngredients
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
      <h3>Making:<br> ${newCocktail.name}</h3>
      <br><br>
      <h4 class="form-instructions">What's in it?</h4>
      <form class="add-cocktail-ingredients">
      <ul class="submitted-ingredients"></ul>
      <br>
      <br>
      <div class="adding-ingredient">
      <input name="amount" type="text" placeholder="Amount">
      <input name="ingredient" type="text" placeholder="ingredient">
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
          <p class="form-ingredients">${amountVal} ${ingredientVal}</p>
          `
          ingredientsDiv.innerHTML = `
          <input name="amount" placeholder="Amount"  type="text">
          <input name="ingredient" placeholder="ingredient"  type="text">
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
      <input name="instructions"  type="text" placeholder="instructions">
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
    toggleView(aboutPage)
  }

}); // end of DOMContentLoaded
