import TokenManager from './tokensManager.js';

export default class Authorizations {
    // 0 anonymous, 1 user, 2 admin
    static anonymous() {
        return { readAccess: 0, writeAccess: 0 };
    }
    static anonymousReadOnly() {
        return { readAccess: 0, writeAccess: 2 };
    }
    static userReadOnly() {
        return { readAccess: 1, writeAccess: 2 };
    }
    static user() {
        return { readAccess: 1, writeAccess: 1 };
    }
    static admin() {
        return { readAccess: 2, writeAccess: 2 };
    }
    static granted(HttpContext, authorizations) {
        if (authorizations) {
            if (authorizations.readAccess == 0 && authorizations.writeAccess == 0) return true;
            // Extract bearer token from head of the http request
            if (HttpContext.req.headers["authorization"] != undefined) {
                let token = HttpContext.req.headers["authorization"].replace('Bearer ', '');
                token = TokenManager.find(token);
                if (token)
                    return (token.User.Authorizations.readAccess >= authorizations.readAccess &&
                        token.User.Authorizations.writeAccess >= authorizations.writeAccess);
                else
                    return false;
            } else
                return false;
        }
        return true;
    }
    static readGranted(HttpContext, authorizations) {
        if (authorizations) {
            if (authorizations.readAccess == 0) return true;
            // Extract bearer token from head of the http request
            if (HttpContext.req.headers["authorization"] != undefined) {
                let token = HttpContext.req.headers["authorization"].replace('Bearer ', '');
                token = TokenManager.find(token, false/* do not renew token */);
                if (token)
                    return (token.User.Authorizations.readAccess >= authorizations.readAccess);
                else
                    return false;
            } else
                return false;
        }
        return true;
    }
    static writeGranted(HttpContext, authorizations) {
        if (authorizations) {
            if (authorizations.readAccess == 0) return true;
            // Extract bearer token from head of the http request
            if (HttpContext.req.headers["authorization"] != undefined) {
                let token = HttpContext.req.headers["authorization"].replace('Bearer ', '');
                token = TokenManager.find(token);
                if (token)
                    return (token.User.Authorizations.writeAccess >= authorizations.writeAccess);
                else
                    return false;
            } else
                return false;
        }
        return true;
    }
}