import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }


    addItem (count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count, // instead count: count, new ES6 feature
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem (id) {

        const index = this.items.findIndex(el => el.id === id);

        // [2, 4, 8] splice(1,1) -> returns [4], original array is [2,8]
        // [2, 4, 8] slice(1,1) -> returns nothing, original array is [2,4,8] (it does not mutate the original array)
        // [2, 4, 8] splice(1,2) -> returns [4, 8] original array is [2]
        // [2, 4, 8] slice(1,2) -> returns [4] original array is [2,4,8] (second parameter is not included)

         this.items.splice(index, 1); // it will mutates the original array, so it will take out the item which id is passed as an parameter
    }

    updateCount (id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}

