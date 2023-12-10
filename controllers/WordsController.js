import Authorizations from '../authorizations.js';
import Repository from '../models/repository.js';
import WordModel from '../models/word.js';
import Controller from './Controller.js';

export default
    class WordsController extends Controller {
        constructor(HttpContext) {
            super(HttpContext, new Repository(new WordModel()), Authorizations.anonymous());
        }
    }