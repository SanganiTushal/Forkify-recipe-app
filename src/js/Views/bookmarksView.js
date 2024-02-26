import View from './view';
import previewView from './previewView';

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookarks yet! Find a recipe and bookmark it :)';
  _message = '';

  addHandlerBookmark(handler) {
    window.addEventListener('load', handler);
  }
  
  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new BookmarksView();
