document.addEventListener('DOMContentLoaded', () => {
  const cocktailUrl = `http://localhost:3000/api/v1/cocktails`
  const ingredientUrl = `http://localhost:3000/api/v1/ingredients`
  const neonHeader = document.querySelector('.neon_text')
  const navBox = document.querySelector('.navigation')
  const pageBody = document.querySelector('.main')
  const aboutPage = document.querySelector('.about')
  const quizPage = document.querySelector('.quiz')
  let ingredients

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

    pageBody.addEventListener('submit', (event) => {
    event.preventDefault()
    if (event.target.className === "new-cocktail-form") {
      console.log("got it");
      let nameInput = document.querySelector('input[name="name"]').value
      // let instructionInput = document.querySelector('input[name="instructions"]').value
      // let amountInputs = document.querySelectorAll('input[name="amount"]')
      // let ingredientInputs = document.querySelectorAll('input[name="ingredient"]')
      // debugger
      addCustomCocktailName(nameInput)
      // returns newCocktailNum
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
      console.log("selected study recipes");
      fetch(cocktailUrl)
      .then(resp => resp.json())
      .then(cocktailData => {
        cocktails = cocktailData
        pageBody.innerHTML = ""
        cocktails.forEach((cocktail) => {
        renderOneCocktail(cocktail)
        // TODO -- once data is seeded, start with one recipe, then add next button to go through.
        })
      })
    } // end of studyRecipes

    function renderOneCocktail(cocktail) {
      pageBody.innerHTML += `
        <div class="item"</div>
          <h3>${cocktail.name}</h3>
          <ul>${renderRecipeIngredients(cocktail)}</ul>
          <p>${cocktail.instructions}</p>
        </div>
      `
    } // end of renderOneCocktail

    function renderRecipeIngredients(cocktail) {
      let ingredientList = []
      cocktail.ingredients.forEach((ingredientHash)=>{
        ingredientList.push(`<li>${ingredientHash.amount} ${ingredientHash.ingredient}</li>`)
      })
      return ingredientList.join('')
    } // end of renderRecipeIngredients

  // ------------------------ functions for quiz path -----------------------

    function startQuiz() {
      let round = 0
      let score = 0
      console.log("selected start quiz");
      pageBody.innerHTML = `
        <div class="quiz-container">
          <div class="quiz-item-one">
            <div id="loader">
                <div id="lemon"></div>
                <div id="straw"></div>
                <div id="glass">
                    <div id="cubes">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div id="drink"></div>
                    <span id="counter"></span>
                </div>
                <div id="coaster"></div>
                <footer>Please wait while we fill up your glass...</footer>
            </div>
          </div>
          <div class="quiz-item-two">
            <div class="item-about about">
            </div>
          </div>
        </div>
      `
      startRound(round, score)
    } // end of startQuiz

    function startRound(round, score) {
      let winningCocktail
      let roundIngredients
      let remainingQuizDrinks = []
      round++

      allDatabaseCocktails
      winningCocktail = chooseRandom(cocktails)
      roundIngredients = getRoundIngredients(cocktails, winningCocktail)
          console.log("startRound roundIngredients:");
          console.log(roundIngredients);

      // remove drink from options
      cocktails.forEach(c=>{
        if (c.id != winningCocktail.id) {
          remainingQuizDrinks.push(c)
        }
      })

      renderRound(remainingQuizDrinks, winningCocktail, roundIngredients, round, score)
    } // end of startRound

    function renderRound(remainingQuizDrinks, winningCocktail, roundIngredients, round, score) {
      console.log('now in render stage');
      // console.log(remainingQuizDrinks);
      // console.log(winningCocktail.name);
      // console.log(roundIngredients);
      // console.log(round);
      const quizBox = document.querySelector('.item-about')
      quizBox.innerHTML = `
          <h2>${winningCocktail.name}</h2>
          <p>Choose all ingredients & submit your response.</p>
          <div class="answer-container">
          ${renderAnswerButtons(roundIngredients)}
          </div>
          <button class="check-answers" type="button" value="submit">...right?</button>

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

      quizBox.addEventListener('click', (event)=>{
        console.log("clicked:")
        console.log(event.target);
        // event.target.setAttribute("class", "selected")
        if (event.target.className === "check-answers") {
          console.log('need to submit');
          selected = Array.from(event.target.parentElement.querySelectorAll('#selected'))
            selected.forEach(element => {
              selectedNames.push(element.dataset.name)
            })
            selectedNames.sort()
          submitResponse(remainingQuizDrinks, winningCocktail, round, score, quizBox, selectedNames)
          // TODO -- throw error and restart if zero selected
        } else if (event.target.dataset.type === "ingredient") {
            console.log('clicked an ingredient')
            console.log(event.target.dataset.selected);
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

      // debugger
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

    function handleEndOfRound(remainingQuizDrinks, round, score, quizBox, selectedNames) {

    }

    function toggleTrueFalse(event) {
      // if (event.target.dataset.selected = "false") {
      //   event.target.dataset.selected = "true"
      // } else {
      //   event.target.dataset.selected = "false"
      // }
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
      } else {
        event.target.setAttribute("id", "not-selected")
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
      console.log("show me the form");
      pageBody.innerHTML =`
      <form class="new-cocktail-form">
      <input name="name" placeholder="Cocktail Name"> <br><br>
      <button id="button" class="added-name-btn" type="submit" value="Submit">Next</button>
      </form>
      `
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
      pageBody.innerHTML =`
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
    pageBody.innerHTML = `
        <p class="item-about about">ABOUT Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

        <div class="row quiz" hidden>
          <div class="column">
            <div id="loader">
                <div id="lemon"></div>
                <div id="straw"></div>
                <div id="glass">
                    <div id="cubes">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div id="drink"></div>
                    <span id="counter"></span>
                </div>
                <div id="coaster"></div>
            </div>
            <footer>Please wait while<br>we fill up your glass...</footer>
          </div>
          <div class="column">

          </div>
        </div>
    `
  }

}); // end of DOMContentLoaded




// function renderIngredientForm() {
  //   getIngredients()
  //   let ingredientForm = `
  //       <input name="amount" placeholder="Amount">
  //       <select name="ingredient">
  //         ${getIngredientDropdowns()}
  //       </select> <br>`
  //   return ingredientForm
  // } // end of renderIngredientForm
  //
  // function getIngredientDropdowns() {
    //   getIngredients()
    //   let ingredientDropdown = []
    //   ingredients.forEach(ingredient=>{
      //     ingredientDropdown.push(`
        //         <option value="${ingredient.ingredient}">${ingredient.ingredient}</option>`)
        //   })
        //   return ingredientDropdown.join('')
        // } // end of getIngredientDropdowns


// const allIngredients = function fetchIngredients() {
  //
  //   fetch(ingredientUrl)
  //   .then(resp => resp.json())
  //   .then(ingredientData => {
    //     ingredients = ingredientData
    //     return ingredients
    //     // debugger
    //   }) // end of fetch
    // }() // end of getIngredients



  // function cleanIngredients(allIngredients) {
  //   allIngredients.forEach(ingredientHash =>{
  //     ingredients.push(ingredientHash.ingredient)
  //   }) // end of forEach
  //   uniqIngredients = [...new Set(ingredients)]
  //   return uniqIngredients
  // }
