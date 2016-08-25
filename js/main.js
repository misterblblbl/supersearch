'use strict';

var searchInput = document.querySelector('.search__input');
var searchIconCross = document.querySelector('.search__icon');
var form = document.querySelector('.search__form');

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
    this._throttleInput = this._throttleInput.bind(this);

    this.element.addEventListener('input', this._onSearchInput);
    // this.input.addEventListener('input', this._onSearchInput);
    this.element.addEventListener('click', this._onCrossClick);
    this.submit.addEventListener('submit', this._onSubmit);
};

SuperSearch.prototype._throttleInput = function(callback) {

};

SuperSearch.prototype._parseUrl = function(href) {
    var location = document.createElement("a");
    location.href = href;
    return [location.href, location.hostname, location.hostname + location.pathname];
};

SuperSearch.prototype._inputIsUrl = function(userInput) {
    var result = userInput.match(this.pattern);
    return result !== null;
};

SuperSearch.prototype._createUrl = function(suggestionType, query) {
    return this.address + '?' + 'suggestiontype=' + suggestionType + '&query=' + query;
};

SuperSearch.prototype._onSearchInput = function(evt) {
    evt.preventDefault();
    console.log('input');
    if(Date.now() - this.lastCall >= this.throttleDelay) {
        this.lastCall = Date.now();
        console.log(Date.now() - this.lastCall);
        if(this.input.value) {
            this.icon.classList.add('search__icon--visible');
            this.submit.disabled = false;

            this._onUrlInput(this._inputIsUrl(this.input.value), this.input.value);
        }
    }
};

SuperSearch.prototype._onUrlInput = function(isUrl, url) {
    if(isUrl) {
        this.dropDown.classList.remove('search__wrapper--closed');
        for(var i = 0; i < this.url.length; i++) {
            var suggestion = this.url[i].dataset.suggestion;

            var suggestionType = (suggestion.substring(0, suggestion.indexOf(' '))
                + suggestion.substring(suggestion.indexOf(' ') + 1, suggestion.length)).toLowerCase();

            this.url[i].querySelector('.search__overview').innerHTML = suggestion;

            this.url[i].querySelector('.search__value').textContent = this._parseUrl(url)[i];
            this.url[i].href = this._createUrl(suggestionType, this._parseUrl(url)[i]);
        }
    }
};

SuperSearch.prototype._onCrossClick = function(evt) {
    if(evt.target === this.icon) {
        this.input.value = '';
        this.icon.classList.remove('search__icon--visible');
        this.dropDown.classList.add('search__wrapper--closed');
    }
};

SuperSearch.prototype._onSubmit = function() {
    if(this.input.value) {
        var xhr = new XMLHttpRequest();
        var body = 'formId=' + encodeURIComponent(this.element.id)
            + '&query=' + encodeURIComponent(this.input.value);
        xhr.open("POST", this.address, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.send(body);
    }
};

var mySearch = new SuperSearch(form);