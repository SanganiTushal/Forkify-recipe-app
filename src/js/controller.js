import * as model from './model';
import recipeView from './Views/recipeView';
import searchView from './Views/searchView';
import resultsView from './Views/resultsView';
import paginationView from './Views/paginationView';
import bookmarksView from './Views/bookmarksView';
import addRecipeView from './Views/addRecipeView';
import { WINDOW_CLOSE_SEC } from "./config"

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const showRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.loadSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // Loading recipe
    await model.loadrecipe(id);

    // Rendering recipe
    recipeView.render(model.state.recipe);

    // Update bookmarkview
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};

const searchRecipe = async function () {
  try {
    resultsView.loadSpinner();
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = goToPage => {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = newServings => {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = () => {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async newRecipe => {
  try {
    // Loading Spinner
    addRecipeView.loadSpinner()

    // Uploading recipe to server
    await model.addNewRecipe(newRecipe)

    // Render new recipe view
    recipeView.render(model.state.recipe)

    // Render success message
    addRecipeView.renderMessage()

    //Render new Bookmarks view
    bookmarksView.render(model.state.bookmarks)

    // Change recipe id in url
    window.history.pushState(null, "", `#${model.state.recipe.id}`)

    // Close the form automatically after some time
    setTimeout(addRecipeView._toggleHidden(), WINDOW_CLOSE_SEC * 1000)
  } catch (err) {
    addRecipeView.renderError(err.message)
  }
  location.reload();
};

function newFeature(){
  console.log("Welcome to the Application")
}

const init = function () {
  bookmarksView.addHandlerBookmark(controlBookmarks);
  recipeView.addHandlerRender(showRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(searchRecipe);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerSubmit(controlAddRecipe);
  newFeature()
};

init();

// For getting Video Data -  https://www.googleapis.com/youtube/v3/search?key={your_key_here}&channelId={channel_id_here}&part=snippet,id&order=date&maxResults=20
// For getting channel data - https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channel_id_here}&key=[API_KEY]
// Channel ID - UCauZxHqwMe5nkFm3wSOg_Yw
// API Key - AIzaSyCPTeeW_YUBhrKMeXgysmPW25eO0AKhOiI

// Specific Video - http://www.youtube.com/watch?v={video_id_here}
// Instagram - http://www.instagram.com/tushal_ni_rasoi?igsh=MWNxaDNyYXI2cDV6eQ==
// Facebook - http://www.facebook.com/profile.php?id=61554226090826
