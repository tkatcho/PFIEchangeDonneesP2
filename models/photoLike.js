import Model from "./model.js";
import UserModel from "./user.js";
import Repository from "../models/repository.js";
import Photo from "./photo.js";

export default class PhotoLike extends Model {
  constructor() {
    super();
    this.addField("imageId", "string");
    this.addField("userId", "string");

    this.setKey("imageId", "string");
  }
}
