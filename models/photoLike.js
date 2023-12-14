import Model from "./model.js";
import UserModel from "./user.js";
import Repository from "./repository.js";

export default class PhotoLike extends Model {
  constructor() {
    super();
    this.addField('PhotoId', 'string');
    this.addField('UserId', 'string');
    this.addField('UserName', 'string');  
  }

  }
