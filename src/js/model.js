import { API_URL, RES_PER_PAGE, KEY } from './config';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const setRecipe = data => {
  let { recipe } = data.data;
  return {
    id: recipe.id,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    cookingTime: recipe.cooking_time,
    title: recipe.title,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    ...recipe.key && { key: recipe.key },
  }
}

export const loadrecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = setRecipe(data)
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  state.search.query = query;
  try {
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...rec.key && { key: rec.key },
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = recipe => {
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookmark = id => {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

export const addNewRecipe = async newRecipe => {
  try {
    const ingArray = Object.entries(newRecipe).filter(ing => ing[0].startsWith("ingredient") && ing[1] !== "")
    const ingredients = ingArray.map(ing => {
      const details = ing[1].trim().split(",")
      if (details.length !== 3) throw new Error("Please provide valid ingredients format")
      const [quantity, unit, description] = details
      return { quantity: quantity ? +quantity : null, unit, description }
    })
    const data = {
      title: newRecipe.title,
      cooking_time: newRecipe.cookingTime,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: newRecipe.servings,
      ingredients
    }
    const recipe = await AJAX(`https://forkify-api.herokuapp.com/api/v2/recipes?key=${KEY}`, data)
    state.recipe = setRecipe(recipe)
    addBookmark(state.recipe)
  } catch (err) {
    throw err;
  }
}

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();
