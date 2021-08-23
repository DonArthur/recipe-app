const mealsElement = document.getElementById('meals')
const favoriteContainer = document.getElementById('fav-meals')
const mealPopup = document.getElementById('meal-popup')
const mealDetailElement = document.getElementById('meal-detail')
const popupCloseBtn = document.getElementById('close-popup')
const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search')

getRandomMeal()
fetchFavMeals()

async function getRandomMeal() {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    const responseData = await response.json()
    const randomMeal = responseData.meals[0]
    addMeal(randomMeal, true)
}

async function getMealById(id) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
    const responseData = await response.json()
    const meal = responseData.meals[0]
    return meal
}

async function getMealBySearch(query) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + query)
    const data = await response.json()
    const meals = data.meals
    return meals
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div')
    meal.classList.add('meal')
    meal.innerHTML = `
    <div class="meal-header">
        ${random ? `<span class="random">Random Recipe</span>` : ``}
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn"><i class="fas fa-heart"></i></button>
    </div>
    `
    const favBtn = meal.querySelector('.meal-body .fav-btn')
    favBtn.addEventListener('click', () => {
        if (favBtn.classList.contains('active')) {
            removeMealFromLocalStorage(mealData.idMeal)
            favBtn.classList.remove('active')
        } else {
            addMealsToLocalStorage(mealData.idMeal)
            favBtn.classList.add('active')
        }
        fetchFavMeals()
    })
    meal.addEventListener('click', () => { 
        showMealDetail(mealData) 
    })
    meals.appendChild(meal)
}

function removeMealFromLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage()
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)))
}

function addMealsToLocalStorage(meal) {
    const mealIds = getMealsFromLocalStorage()
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, meal]))
}

function getMealsFromLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'))
    return mealIds === null ? [] : mealIds
}

async function fetchFavMeals() {
    favoriteContainer.innerHTML = ''
    const mealIds = getMealsFromLocalStorage()
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i]
        meal = await getMealById(mealId)
        addMealToFav(meal)
    }
}

function addMealToFav(mealData) {
    const favMeal = document.createElement('li')
    favMeal.innerHTML = `
                        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>${mealData.strMeal}</span>
                        <button class="clear"><i class="fas fa-window-close"></i></button>
                        `
    const btn = favMeal.querySelector('.clear')
    btn.addEventListener('click', () => {
        removeMealFromLocalStorage(mealData.idMeal)
        fetchFavMeals()
    })
    favMeal.addEventListener('click', () => {
        showMealDetail(mealData)
    })
    favoriteContainer.appendChild(favMeal)
}

function showMealDetail(mealData) {
    mealDetailElement.innerHTML = ''
    const mealElement = document.createElement('div')
    mealElement.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="">
    <p>${mealData.strInstructions}</p>
    `
    mealDetailElement.appendChild(mealElement)
    mealPopup.classList.remove('hidden')
}

searchBtn.addEventListener('click', async () => {
    mealsElement.innerHTML = ''
    const search = searchTerm.value
    const meals = await getMealBySearch(search)
    if (meals) {
        meals.forEach(meal => {
            addMeal(meal)
        })            
    }
})

searchTerm.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        mealsElement.innerHTML = ''
        const search = searchTerm.value
        const meals = await getMealBySearch(search)
        if (meals) {
            meals.forEach(meal => {
                addMeal(meal)
            })            
        }            
    }
})

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden')
})