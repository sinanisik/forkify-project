import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './Views/searchView';
import * as recipeView from './Views/recipeView';
import * as listView from './Views/listView';
import * as likesView from './Views/likesView';


import { elements, renderLoader, clearLoader } from './Views/base';

/* Global state of the app
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
 */
const state = {};

/*
 SEARCH CONTROLLER 
*/

const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {

            // 4) Search for recipes
            await state.search.getResult(); // this returns a promise (every asynchronous function returns a promise)

            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);

        } catch (error) {
            alert('Something wrong with the search...');
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// event delegation will be used here. Since there is no dom yet in the page (for example there will be no previous page button since
// we will be in the first page and we cannot go previous). That is why we use event delegation to catch the click event for that dom

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline'); // we can use closest method and say that we are only interested in ones with the class of btn-inline 

    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10); // retrieve the page number only. Since we wrote "data-goto" property on that button div, we can retrieve it easily
        // Since goToPage is coming as string we convert it into the number and give a base 10.

        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/*
 RECIPE CONTROLLER 
*/
const controlRecipe = async () => {

    // Get ID from url. Every time we click a recipe, the url changes because we give href in renderRecipe(recipe_id)
    const id = window.location.hash.replace('#', ''); // to remove the hash symbol

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);


        // Create a new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe(); /* we want this to happen asynchronously, so in the background
            and in a way that the rest of the code is only executed after we get back with the data.
            So we are going to use, of course, "await" here. And don't forget to then change the function
            to an async function. */

            /*Then after that we call getRecipe here, which, due to the fact that it's an async function,
            will return a promise. And so therefore, in here we use await to wait for the promise to get back with the resolved value.
            So here the code will stop executing and then after that we will simply calculate the time, the servings,
            and log everything to the console. */

            state.recipe.parseIngredients();

            // Calculate servings and time (call functions in Recipe.js)
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        }
        catch (error) {
            alert('Error processing recipe!');
        }
    }
};
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

/* How to basically, add the same event listener to different events. And that's useful here
because were calling the same function here for these two events.*/
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/*
- LIST CONTROLLER
*/
const controlList = () => {
    // Eğer bir liste varsa malzemeleri üstüne ekleyeceğiz. Bu yüzden öncesinde kontrol ediyoruz.
    // Create a new list IF there is none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
// Also in here, we need event delegation, because that red x button is not rendered in the page load.
/* And that's because we need to specifically find the element which contains our ID that we want to read.
And so we need to specifically find an element with a shopping item class on it close to where the click happened.
So, closest shopping item is what you're looking for. And then just as before we can use dataset,
and then the name that we gave it. */
// Go and check there is data-itemid=${item.id} attribute in listView.
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    // It will return true or false. We will test if this is the one that we clicked on
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

        // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/*
- LIKE CONTROLLER
*/
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to the UI list
        likesView.renderLike(newLike);

        // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);
        // Toggle the like button
        likesView.toggleLikeBtn(false);
        // Remove like from the UI list
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes(); // this will be empty likes object, but in order not to get error, we should create it
    
    // Restore  likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// This part is related to +, - buttons on the recipe details. Since they are not rendered when we load the page,
// we need to use event delegation. This we will use different method than delegation. 

// Handling recipe button clicks (elements.recipe is there on the load time, so we can use it for event delegation)
// We will use matches method instead closest method that we used above for .btn-inline
// * means any child. So, match any element containing btn-decrease class and all of their child. If we click svg inside of it, also matches it.
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }

    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

        // Bütün malzemelerin eklenmesini sağlayacak butonu da yine event delegation ile yapıyoruz.
        // Bu kısım da sayfa yüklendiğinde henüz sayfada render olmadığı için event delegation işini
        // matches ile halledeceğiz.
    } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }

});

