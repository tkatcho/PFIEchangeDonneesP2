import RouteRegister from './routeRegister.js';
import AccountsController from "./controllers/AccountsController.js";

export const API_EndPoint = async function (HttpContext) {
    if (!HttpContext.path.isAPI) {
        return false;
    } else {
        let controllerName = HttpContext.path.controllerName;
        if (controllerName != undefined) {
            try {
                // dynamically import the targeted controller
                // if the controllerName does not exist the catch section will be called
                const { default: Controller } = await import('./controllers/' + controllerName + '.js');

                // instanciate the controller       
                let controller = new Controller(HttpContext);
                switch (HttpContext.req.method) {
                    case 'HEAD':
                        controller.head();
                        return true;
                    case 'GET':
                        controller.get(HttpContext.path.id);
                        return true;
                    case 'POST':
                        if (HttpContext.payload)
                            controller.post(HttpContext.payload);
                        else
                            HttpContext.response.unsupported();
                        return true;
                    case 'PUT':
                        if (HttpContext.payload)
                            controller.put(HttpContext.payload);
                        else
                            HttpContext.response.unsupported();
                        return true;
                    case 'DELETE':
                        controller.remove(HttpContext.path.id);
                        return true;
                    default:
                        HttpContext.response.notImplemented();
                        return true;
                }
            } catch (error) {
                console.log("API_EndPoint Error message: \n", error.message);
                console.log("Stack: \n", error.stack);
                HttpContext.response.notFound();
                return true;
            }
        }
        // not an API endpoint
        // must be handled by another middleware
        return false;
    }
}

// {method, ControllerName, Action}
export const Registered_EndPoint = async function (HttpContext) {
    let route = RouteRegister.find(HttpContext);
    if (route != null) {
        try {
            // dynamically import the targeted controller
            // if it does not exist the catch section will be called
            const { default: Controller } = await import('./controllers/' + HttpContext.path.controllerName + '.js');
            // instanciate the controller       
            let controller = new Controller(HttpContext);

            if (route.method === 'POST' || route.method === 'PUT') {
                if (HttpContext.payload)
                    controller[route.actionName](HttpContext.payload);
                else
                    HttpContext.response.unsupported();
            }
            else {
                controller[route.actionName](route.id);
            }
            return true;
        } catch (error) {
            console.log("Registered_EndPoint Error message: \n", error.message);
            console.log("Stack: \n", error.stack);
            HttpContext.response.notFound();
            return true;
        }
    }
    // not an registered endpoint
    // request not consumed
    // must be handled by another middleware
    return false;
}

export const TOKEN_EndPoint = function (HttpContext) {
    if (HttpContext.req.url == '/token' && HttpContext.req.method == "POST") {
        try {
            let accountsController = new AccountsController(HttpContext);
            if (HttpContext.payload)
                accountsController.login(HttpContext.payload);
            else
                HttpContext.response.badRequest();
            return true;
        } catch (error) {
            console.log("Token_EndPoint Error message: \n", error.message);
            console.log("Stack: \n", error.stack);
            HttpContext.response.notFound();
            return true;
        }
    }
    // request not consumed
    // must be handled by another middleware
    return false;

}