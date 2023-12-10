import Authorizations from '../authorizations.js';

export default class Controller {
    constructor(HttpContext, repository = null, authorizations = null) {
        this.authorizations = authorizations ? authorizations : Authorizations.anonymous();
        this.HttpContext = HttpContext;
        this.repository = repository;
    }

    head() {
        if (Authorizations.readGranted(this.HttpContext, this.authorizations)) {
            if (this.repository != null) {
                this.HttpContext.response.ETag(this.repository.ETag);
            } else
                this.HttpContext.response.notImplemented();
        } else
            this.HttpContext.response.unAuthorized("Unauthorized access");
    }
    get(id) {
        if (Authorizations.readGranted(this.HttpContext, this.authorizations)) {
            if (this.repository != null) {
                if (id !== undefined) {
                    let data = this.repository.get(id);
                    if (data != null)
                        this.HttpContext.response.JSON(data);
                    else
                        this.HttpContext.response.notFound("Ressource not found.");
                } else
                    this.HttpContext.response.JSON(this.repository.getAll(this.HttpContext.path.params), this.repository.ETag, false, this.authorizations);
            } else
                this.HttpContext.response.notImplemented();
        } else
            this.HttpContext.response.unAuthorized("Unauthorized access");
    }
    post(data) {
        if (Authorizations.writeGranted(this.HttpContext, this.authorizations)) {
            if (this.repository != null) {
                data = this.repository.add(data);
                if (this.repository.model.state.isValid) {
                    this.HttpContext.response.created(data);
                } else {
                    if (this.repository.model.state.inConflict)
                        this.HttpContext.response.conflict(this.repository.model.state.errors);
                    else
                        this.HttpContext.response.badRequest(this.repository.model.state.errors);
                }
            } else
                this.HttpContext.response.notImplemented();
        } else
            this.HttpContext.response.unAuthorized();
    }
    put(data) {
        if (Authorizations.writeGranted(this.HttpContext, this.authorizations)) {
            if (this.repository != null) {
                if (this.HttpContext.path.id) {
                    let updatedData = this.repository.update(this.HttpContext.path.id, data);
                    if (this.repository.model.state.isValid) {
                        this.HttpContext.response.updated(updatedData);
                    } else {
                        if (this.repository.model.state.notFound) {
                            this.HttpContext.response.notFound(this.repository.model.state.errors);
                        } else {
                            if (this.repository.model.state.inConflict)
                                this.HttpContext.response.conflict(this.repository.model.state.errors)
                            else
                                this.HttpContext.response.badRequest(this.repository.model.state.errors);
                        }
                    }
                } else
                    this.HttpContext.response.badRequest("The Id of ressource is not specified in the request url.")
            } else
                this.HttpContext.response.notImplemented();
        } else
            this.HttpContext.response.unAuthorized("Unauthorized access");
    }
    remove(id) {
        if (Authorizations.writeGranted(this.HttpContext, this.authorizations)) {
            if (this.repository != null) {
                if (id) {
                    if (this.repository.remove(id))
                        this.HttpContext.response.accepted();
                    else
                        this.HttpContext.response.notFound("Ressource not found.");
                } else
                    this.HttpContext.response.badRequest("The Id in the request url is rather not specified or syntactically wrong.");
            } else
                this.HttpContext.response.notImplemented();
        } else
            this.HttpContext.response.unAuthorized("Unauthorized access");
    }
}
