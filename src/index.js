document.addEventListener('DOMContentLoaded', () => {
  const cocktailUrl = `http://localhost:3000/api/v1/cocktails`
  const ingredientUrl = `http://localhost:3000/api/v1/ingredients`
  const neonHeader = document.querySelector('.neon_text')
  const navBox = document.querySelector('.navigation')
  const pageBody = document.querySelector('.main')
  const aboutPage = document.querySelector('.about')
  const quizPage = document.querySelector('.quiz')
  let cocktails
  let ingredients = []

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

    function getIngredients() {
      fetch(ingredientUrl)
      .then(resp => resp.json())
      .then(ingredientData => {
        ingredientData.forEach(ingredientHash =>{
          ingredients.push(ingredientHash.ingredient)
        }) // end of forEach
      }) // end of fetch
      return ingredients
    } // end of getIngredients

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
        })
        // TODO -- once data is seeded, start with one recipe, then add next button to go through.
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
          <p class="item-about about">quiz here<br><br>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud </p>
          </div>
        </div>
      `
    } // end of startQuiz


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
