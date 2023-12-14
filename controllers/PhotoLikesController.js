import Authorizations from "../authorizations.js";
import Repository from "../models/repository.js";
import PhotoLikeModel from "../models/photoLike.js";
import UserModel from "../models/user.js"; // Import UserModel
import Controller from "./Controller.js";

export default class PhotoLikes extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new PhotoLikeModel()), Authorizations.user());
        this.userRepository = new Repository(new UserModel()); // Instantiate UserRepository
    }


        get(photoId) {
            console.log('Received photoId:', photoId);
        
            if (Authorizations.readGranted(this.HttpContext, this.authorizations)) {
                let allLikes = this.repository.getAll();
                let likesForPhoto = allLikes.filter(like => like.PhotoId === photoId);
                this.HttpContext.response.JSON(likesForPhoto);
            } else {
                this.HttpContext.response.unAuthorized("Unauthorized access");
            }
        }
        

        async post(payload) {
            console.log('Repository:', this.repository);

            if (Authorizations.writeGranted(this.HttpContext, this.authorizations)) {
                let user = this.userRepository.get(payload.UserId);
                if (user) {
                    payload.UserName = user.Name; 
                }
    
                let like = this.repository.add(payload);
                if (like) {
                    this.HttpContext.response.created(like);
                } else {
                    this.HttpContext.response.internalServerError();
                }
            } else {
                this.HttpContext.response.unAuthorized("Unauthorized access");
            }
        }

        async remove(likeId) {
            if (Authorizations.writeGranted(this.HttpContext, this.authorizations)) {
                if (this.repository.remove(likeId)) {
                    this.HttpContext.response.ok();
                } else {
                    this.HttpContext.response.notFound("Like not found.");
                }
            } else {
                this.HttpContext.response.unAuthorized("Unauthorized access");
            }
        }

    }