import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;

        } catch (error) {
            console.log(error);
            alert('Something went wrong:(');
        }
    }

    calcTime() {
        // Assuming that we need 15 min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];


        const newIngredients = this.ingredients.map(el => {
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // 2) Remove parantheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');


            // 3) Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng; // Since let and const are block scoped, we are initializing them outside of the block(paranthesis, and curly braces)
            if (unitIndex > -1) {
                // There is a unit
                const arrCount = arrIng.slice(0, unitIndex); // Example: 4 1/2 cups unbleached high-gluten... -> Since unitIndex is 2 because
                // cups is in the unitsShort array, slice method will take the 0. and 1st indexes of the arrIng which are 4 and 1/2
                // Ex. 4 1/2 cups, arrCount = [4, 1/2]
                // Ex. 4 cups, arrCount = [4]

                let count;
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+')); // some of the ingredient are like this: 1-1/2. So if there is a minus sign, it will be replaced with + sign
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                // Ex. 4 1/2 cups, arrCount = [4, 1/2] --> eval("4+1/2") --> 4.5 (eval acts string inside "" like javascript code that is why it is 4.5)
                // Ex. 4 cups, arrCount = [4]


                // With the code above, we implement algorithm for some edge cases.

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ') // start unitIndex + 1 of the array and until the end of it(since we did not specify second parameter, it will goes until end)
                }

            } else if (parseInt(arrIng[0], 10)) { // take the first element of the array, if the conversion is successful then it will return that number otherwise it will return NaN
                // There is NO unit, but 1st element is a number (1 bread)
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ') // the entire array except the 1st one which is a number
                }
            } else if (unitIndex === -1) {
                // There is NO unit and there is NO number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient // this is exactly equalt to ingredient: ingredient (with ES6)
                }
            }

            return objIng;
        });

        this.ingredients = newIngredients;
    }

    updateServings (type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        // Ingredients
         this.ingredients.forEach(ing => {
             ing.count = ing.count * (newServings / this.servings);
         });

        this.servings = newServings;

    }
}
