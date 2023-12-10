import Model from './model.js';

export default class Bookmark extends Model {
    constructor() {
        super();

        this.addField('Title', 'string');
        this.addField('Url', 'url');
        this.addField('Category', 'string');
              
        this.setKey("Title");
    }
}