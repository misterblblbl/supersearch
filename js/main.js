'use strict';

/**
 * @param {HTMLElement} element - Элемент, в котором создается строка поиска
 * @constructor
 */
var SuperSearch = function(element) {
    this.element = element;
    this.input = element.querySelector('.search__input');
    this.icon = element.querySelector('.search__icon');
    this.submit = element.querySelector('.search__submit');
    this.dropDown = element.querySelector('.search__wrapper');
    this.url = element.querySelectorAll('.search__url');
    this.pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    this.address = 'http://super‐analytics.com';
    this.throttleDelay = 250;
    this.lastCall = Date.now();

    this._onSearchInput = this._onSearchInput.bind(this);
    this._onCrossClick = this._onCrossClick.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._inputIsUrl = this._inputIsUrl.bind(this);
    this._onUrlInput = this._onUrlInput.bind(this);
    this._parseUrl = this._parseUrl.bind(this);
    this._createUrl = this._createUrl.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._onBlur = this._onBlur.bind(this);

    //Обработчик ввода
    this.element.addEventListener('input', this._onSearchInput);

    //Обработчик события по клику на крестик
    this.element.addEventListener('click', this._onCrossClick);

    //Обработчик отправки формы
    this.element.addEventListener('submit', this._onSubmit);

    //Закрытие всплывающих подсказок по ECS
    document.addEventListener('keydown', this._onDocumentKeyDown);

    //Обработчик отправки формы
    this.input.addEventListener('blur', this._onBlur);
};


//Рапарсить переданный url, возвращая массив с полным url, доменным именем и url без протокола
SuperSearch.prototype._parseUrl = function(href) {
    var location = document.createElement("a");
    location.href = href;
    return [location.href, location.hostname, location.hostname + location.pathname];
};

//Проверить является ли введенный текст ссылкой
SuperSearch.prototype._inputIsUrl = function(userInput) {
    var result = userInput.match(this.pattern);
    return result !== null;
};

//Проверить элемент на переполнение
SuperSearch.prototype._isOverFlowed = function(element) {
    return element.scrollWidth > element.clientWidth;
};

//Создать адреса подсказок
SuperSearch.prototype._createUrl = function(suggestionType, query) {
    return this.address + '?' + 'suggestiontype=' + suggestionType + '&query=' + query;
};

//Проверять поле ввода с задержкой throttleDelay при любом вводе
SuperSearch.prototype._onSearchInput = function(evt) {
    evt.preventDefault();
    if(Date.now() - this.lastCall >= this.throttleDelay) {
        if(this.input.value) {
            this.lastCall = Date.now();
            this.icon.classList.add('search__icon--visible');
            this.submit.disabled = false;

            var isUrl = this._inputIsUrl(this.input.value);
            if(isUrl) {
                this._onUrlInput(this.input.value);
            } else {
                this.dropDown.classList.add('search__wrapper--closed');
            }
        } else if (!this.input.value) {
            this.icon.classList.remove('search__icon--visible');
            this.dropDown.classList.add('search__wrapper--closed');
        }
    }
};

//Если введенный текст является ссылкой — вывести подсказки
SuperSearch.prototype._onUrlInput = function(url) {
    this.dropDown.classList.remove('search__wrapper--closed');
    for(var i = 0; i < this.url.length; i++) {
        var suggestion = this.url[i].dataset.suggestion;

        var suggestionType = (suggestion.substring(0, suggestion.indexOf(' '))
        + suggestion.substring(suggestion.indexOf(' ') + 1, suggestion.length)).toLowerCase();

        this.url[i].querySelector('.search__overview').innerHTML = suggestion;

        this.url[i].querySelector('.search__value').textContent = this._parseUrl(url)[i];
        if(this._isOverFlowed(this.url[i].querySelector('.search__value'))) {
            this.url[i].querySelector('.search__value').classList.add('search__value--fade');
        }

        this.url[i].href = this._createUrl(suggestionType, this._parseUrl(url)[i]);
    }
};

//Удалить текст из поля ввода при нажатии на крестик
SuperSearch.prototype._onCrossClick = function(evt) {
    if(evt.target === this.icon) {
        this.input.value = '';
        this.icon.classList.remove('search__icon--visible');
        this.dropDown.classList.add('search__wrapper--closed');
    }
};

//Создать POST-запрос для отправки формы
SuperSearch.prototype._onSubmit = function() {
    if(this.input.value) {
        var xhr = new XMLHttpRequest();
        var body = 'formId=' + encodeURIComponent(this.element.id)
            + '&query=' + encodeURIComponent(this.input.value);
        xhr.open("POST", this.address, false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.send(body);
    }
};

//Закрыть выпадашку, если поле ввода не в фокусе
SuperSearch.prototype._onDocumentKeyDown = function(evt) {
    if(evt.keyCode === 27 && evt.target === this.input) {
        this.dropDown.classList.add('search__wrapper--closed');
        this.input.value = '';
    }
};

SuperSearch.prototype._onBlur = function() {
    if(!this.dropDown.classList.contains('search__wrapper--closed')) {
        this.dropDown.classList.add('search__wrapper--closed');
    }
};

var forms = document.querySelectorAll('.search__form');

for(var i=0; i < forms.length; i++) {
    new SuperSearch(forms[i]);
}

