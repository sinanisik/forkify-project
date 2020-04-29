import { elements } from './base';

export const renderItem = item => {

    // searchView'da createButton içinde eyaptığımız gibi data attribute veriyoruz böylelikle ulaşabilmemiz
    // mümkün olacak.
    // step attribute kaçar kaçar azaltılıp artırılacağını belirliyor. Onu da value kadar veriyoruz.
    // input içine bir de class veriyoruz ki updateCount methoduyla güncelleyeceğimiz değeri bu class aracılığıyla
    // DOM'dan ulaşıp güncelleyebilelim diye.
    const markup = `
        <li class="shopping__item" data-itemid=${item.id}> 
            <div class="shopping__count">
                <input type="number" value="${item.count}" step="${item.count}" class="shopping__count-value">
                <p>${item.unit}</p>
            </div>
            <p class="shopping__description">${item.ingredient}</p>
            <button class="shopping__delete btn-tiny">
                <svg>
                    <use href="img/icons.svg#icon-circle-with-cross"></use>
                </svg>
            </button>
        </li>
    `;

    elements.shopping.insertAdjacentHTML('beforeend', markup);

};

// CSS attribute selector with []
// Yukarıda verdiğimiz data attribute'unu kullanıyoruz.
// User interface'den bir şey silmek için önce parent'ına gidiyoruz sonrasında removeChild ile siliyoruz.
export const deleteItem = id => {
    const item = document.querySelector(`[data-itemid="${id}"]`);

    item.parentElement.removeChild(item);
};
