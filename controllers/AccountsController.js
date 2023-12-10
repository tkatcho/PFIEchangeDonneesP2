import UserModel from '../models/user.js';
import TokenModel from '../models/token.js';
import Repository from '../models/repository.js';
import TokenManager from '../tokensManager.js';
import * as utilities from "../utilities.js";
import Gmail from "../gmail.js";
import Controller from './Controller.js';
import Authorizations from '../authorizations.js';

export default class AccountsController extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new UserModel()), Authorizations.admin());
        this.tokensRepository = new Repository(new TokenModel());
    }
    index(id) {
        if (id != undefined) {
            if (Authorizations.readGranted(this.HttpContext, Authorizations.admin()))
                this.HttpContext.response.JSON(this.repository.get(id));
            else
                this.HttpContext.response.unAuthorized("Unauthorized access");
        }
        else {
            if (Authorizations.granted(this.HttpContext, Authorizations.admin()))
                this.HttpContext.response.JSON(this.repository.getAll(this.HttpContext.path.params), this.repository.ETag, true, Authorizations.admin());
            else
                this.HttpContext.response.unAuthorized("Unauthorized access");
        }
    }
    // POST: /token body payload[{"Email": "...", "Password": "..."}]
    login(loginInfo) {
        if (loginInfo) {
            if (this.repository != null) {
                let user = this.repository.findByField("Email", loginInfo.Email);
                if (user != null) {
                    if (user.Password == loginInfo.Password) {
                        user = this.repository.get(user.Id);
                        let newToken = TokenManager.create(user);
                        this.HttpContext.response.created(newToken);
                    } else {
                        this.HttpContext.response.wrongPassword("Wrong password.");
                    }
                } else
                    this.HttpContext.response.userNotFound("This user email is not found.");
            } else
                this.HttpContext.response.notImplemented();
        } else
            this.HttpContext.response.badRequest("Credential Email and password are missing.");
    }
    logout() {
        let userId = this.HttpContext.path.params.userId;
        if (userId) {
            TokenManager.logout(userId);
            this.HttpContext.response.accepted();
        } else {
            this.HttpContext.response.badRequest("UserId is not specified.")
        }
    }
    sendVerificationEmail(user) {
        // bypass model bindeExtraData wich hide the user verifyCode
        user = this.repository.findByField("Id", user.Id);
        let html = `
                Bonjour ${user.Name}, <br /> <br />
                Voici votre code pour confirmer votre adresse de courriel
                <br />
                <h3>${user.VerifyCode}</h3>
            `;
        const gmail = new Gmail();
        gmail.send(user.Email, 'Vérification de courriel...', html);
    }

    sendConfirmedEmail(user) {
        let html = `
                Bonjour ${user.Name}, <br /> <br />
                Votre courriel a été confirmé.
            `;
        const gmail = new Gmail();
        gmail.send(user.Email, 'Courriel confirmé...', html);
    }

    //GET : /accounts/verify?id=...&code=.....
    verify() {
        if (this.repository != null) {
            let id = this.HttpContext.path.params.id;
            let code = parseInt(this.HttpContext.path.params.code);
            let userFound = this.repository.findByField('Id', id);
            if (userFound) {
                if (userFound.VerifyCode == code) {
                    userFound.VerifyCode = "verified";
                    userFound = this.repository.update(userFound.Id, userFound);
                    if (this.repository.model.state.isValid) {
                        this.HttpContext.response.updated(userFound);
                        this.sendConfirmedEmail(userFound);
                    } else {
                        this.HttpContext.response.unprocessable();
                    }
                } else {
                    this.HttpContext.response.unverifiedUser("Verification code does not matched.");
                }
            } else {
                this.HttpContext.response.unprocessable();
            }
        } else
            this.HttpContext.response.notImplemented();
    }
    //GET : /accounts/conflict?Id=...&Email=.....
    conflict() {
        if (this.repository != null) {
            let id = this.HttpContext.path.params.Id;
            let email = this.HttpContext.path.params.Email;
            if (id && email) {
                let prototype = { Id: id, Email: email };
                this.HttpContext.response.updated(this.repository.checkConflict(prototype));
            } else
                this.HttpContext.response.updated(false);
        } else
            this.HttpContext.response.updated(false);
    }

    // POST: account/register body payload[{"Id": 0, "Name": "...", "Email": "...", "Password": "..."}]
    register(user) {
        if (this.repository != null) {
            user.Created = utilities.nowInSeconds();
            let verifyCode = utilities.makeVerifyCode(6);
            user.VerifyCode = verifyCode;
            user.Authorizations = Authorizations.user();
            let newUser = this.repository.add(user);
            if (this.repository.model.state.isValid) {
                this.HttpContext.response.created(newUser);
                newUser.Verifycode = verifyCode;
                this.sendVerificationEmail(newUser);
            } else {
                if (this.repository.model.state.inConflict)
                    this.HttpContext.response.conflict(this.repository.model.state.errors);
                else
                    this.HttpContext.response.badRequest(this.repository.model.state.errors);
            }
        } else
            this.HttpContext.response.notImplemented();
    }
    promote(user) {
        if (this.repository != null) {
            let foundUser = this.repository.findByField("Id", user.Id);
            foundUser.Authorizations.readAccess = foundUser.Authorizations.readAccess == 1 ? 2 : 1;
            foundUser.Authorizations.writeAccess = foundUser.Authorizations.writeAccess == 1 ? 2 : 1;
            let updatedUser = this.repository.update(user.Id, foundUser);
            if (this.repository.model.state.isValid)
                this.HttpContext.response.updated(updatedUser);
            else
                this.HttpContext.response.badRequest(this.repository.model.state.errors);
        } else
            this.HttpContext.response.notImplemented();
    }
    block(user) {
        if (this.repository != null) {
            let foundUser = this.repository.findByField("Id", user.Id);
            foundUser.Authorizations.readAccess = foundUser.Authorizations.readAccess == 1 ? -1 : 1;
            foundUser.Authorizations.writeAccess = foundUser.Authorizations.writeAccess == 1 ? -1 : 1;
            let updatedUser = this.repository.update(user.Id, foundUser);
            if (this.repository.model.state.isValid)
                this.HttpContext.response.updated(updatedUser);
            else
                this.HttpContext.response.badRequest(this.repository.model.state.errors);
        } else
            this.HttpContext.response.notImplemented();
    }
    // PUT:account/modify body payload[{"Id": 0, "Name": "...", "Email": "...", "Password": "..."}]
    modify(user) {
        // empty asset members imply no change and there values will be taken from the stored record
        if (Authorizations.writeGranted(this.HttpContext, Authorizations.user())) {
            if (this.repository != null) {
                user.Created = utilities.nowInSeconds();
                let foundedUser = this.repository.findByField("Id", user.Id);
                if (foundedUser != null) {
                    user.Authorizations = foundedUser.Authorizations; // user cannot change its own authorizations
                    if (user.Password == '') { // password not changed
                        user.Password = foundedUser.Password;
                    }
                    if (user.Email != foundedUser.Email) {
                        user.VerifyCode = utilities.makeVerifyCode(6);
                        this.sendVerificationEmail(user);
                    }
                    let updatedUser = this.repository.update(user.Id, user);
                    if (this.repository.model.state.isValid) {
                        this.HttpContext.response.updated(updatedUser);
                    }
                    else {
                        if (this.repository.model.state.inConflict)
                            this.HttpContext.response.conflict(this.repository.model.state.errors);
                        else
                            this.HttpContext.response.badRequest(this.repository.model.state.errors);
                    }
                } else
                    this.HttpContext.response.notFound();
            } else
                this.HttpContext.response.notImplemented();
        } else
            this.HttpContext.response.unAuthorized();
    }
    // GET:account/remove/id
    remove(id) { // warning! this is not an API endpoint
        if (Authorizations.writeGranted(this.HttpContext, Authorizations.user())) {
            this.tokensRepository.keepByFilter(token => token.User.Id != id);
            let previousAuthorization = this.authorizations;
            this.authorizations = Authorizations.user();
            super.remove(id);
            this.authorizations = previousAuthorization;
        }
    }
}