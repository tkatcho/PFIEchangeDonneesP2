//http://rali.iro.umontreal.ca/rali/?q=fr/DEM-json

import Model from './model.js';

export default class Word extends Model {
    constructor() {
        super();

        this.addField('Val', 'string');
        this.addField('Def', 'string');
        this.addField('Con', 'string');
        this.addField('Dom', 'string');
        this.addField('Gen', 'string');

        this.setKey("Val");
    }
}