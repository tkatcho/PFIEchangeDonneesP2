import Model from './model.js';

export default class Course extends Model {
    constructor() {
        super();

        this.addField('Title', 'string');
        this.addField('Code', 'string');
              
        this.setKey("Code");
    }
}