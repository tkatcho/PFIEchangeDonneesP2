//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This module define the http Response class
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
import CachedRequests from "./CachedRequestsManager.js";
export default class Response {
    constructor(HttpContext) {
        this.HttpContext = HttpContext;
        this.res = HttpContext.res;
        this.errorContent = "";
    }
    status(number, errorMessage = '') {
        if (errorMessage) {
            this.res.writeHead(number, { 'content-type': 'application/json', 'responseText': errorMessage });
            this.errorContent = { "error_description": errorMessage };
            return this.end(JSON.stringify(this.errorContent));
        } else {
            this.res.writeHead(number, { 'content-type': 'text/plain' });
            return this.end();
        }
    }
    end(content = null) {
        console.log("status:",this.res.statusCode, this.errorContent);
        if (content)
            this.res.end(content);
        else
            this.res.end();
        return true;
    }

  /////////////////////////////////////////////// 200 ///////////////////////////////////////////////////////

    ok() { return this.status(200); }       // ok status
    ETag(ETag) {
        this.res.writeHead(204, { 'ETag': ETag });
        this.end();
    }
    AddInCache(jsonObj, ETag, readAuthorization) {
        if (this.HttpContext.cacheable)
            CachedRequests.add(this.HttpContext.req.url, jsonObj, ETag, readAuthorization);
    }
    JSON(jsonObj, ETag = "", fromCache = false, readAuthorization = false) {
        if (ETag != "")
            this.res.writeHead(200, { 'content-type': 'application/json', 'ETag': ETag });
        else
            this.res.writeHead(200, { 'content-type': 'application/json' });
        if (jsonObj != null) {
            if (!fromCache) // prevent from cache it again
                this.AddInCache(jsonObj, ETag,  readAuthorization);
            let content = JSON.stringify(jsonObj);
            this.end(content);
        } else {
            this.end();
        }
    }

    HTML(content) {
        this.res.writeHead(200, { 'content-type': 'text/html' });
        return this.end(content);
    }
    accepted() { return this.status(202); } // accepted status
    deleted() { return this.status(202); }  // accepted status
    created(jsonObj) {                      // created status
        this.res.writeHead(201, { 'content-type': 'application/json' });
        return this.end(JSON.stringify(jsonObj));
    }
    updated(jsonObj) {                      
        this.res.writeHead(200, { 'content-type': 'application/json' });
        return this.end(JSON.stringify(jsonObj));
    }
    content(contentType, content) {         // let the browers cache locally the receiverd content
        this.res.writeHead(200, { 'content-type': contentType, "Cache-Control": "public, max-age=31536000" });
        return this.end(content);
    }
    noContent() { return this.status(204); }       // no content status

    /////////////////////////////////////////////// 400 ///////////////////////////////////////////////////////

    badRequest(errormessage = '') { return this.status(400, errormessage); }      // bad request status
    unAuthorized(errormessage = '') { return this.status(401, errormessage); }    // unAuthorized status
    forbidden(errormessage = '') { return this.status(403, errormessage); }       // forbidden status
    notFound(errormessage = '') { return this.status(404, errormessage); }        // not found status
    notAloud(errormessage = '') { return this.status(405, errormessage); }        // Method not allowed status
    conflict(errormessage = '') { return this.status(409, errormessage); }        // Conflict status
    unsupported(errormessage = '') { return this.status(415, errormessage); }     // Unsupported Media Type status
    unprocessable(errormessage = '') { return this.status(422, errormessage); }   // Unprocessable Entity status

    // Custom status
    unverifiedUser(errormessage = '') { return this.status(480, errormessage); }    // custom bad request status
    userNotFound(errormessage = '') { return this.status(481, errormessage); }    // custom bad request status
    wrongPassword(errormessage = '') { return this.status(482, errormessage); }   // custom bad request status

    /////////////////////////////////////////////// 500 ///////////////////////////////////////////////////////

    internalError(errormessage = '') { return this.status(500, errormessage); }   // internal error status
    notImplemented(errormessage = '') { return this.status(501, errormessage); }  // Not implemented
}