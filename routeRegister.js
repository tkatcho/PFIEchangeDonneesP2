// Used to register custom routes
// must be used to support MVC controllers routes
global.registeredRoutes = [];

export default class RouteRegister {
    static add(method, modelName, actionName = "index") {
        registeredRoutes.push({
            method,
            modelName,
            actionName
        });
    }
    static find(httpContext) {
        let path = httpContext.path;
        let foundRoute = null;
        registeredRoutes.forEach(route => {
            if (route.method == httpContext.req.method) {
                if (path.model != undefined && path.model == route.modelName) {
                    if (path.action != undefined && path.action == route.actionName) {
                        route.id = path.id;
                        foundRoute = route;
                    }
                }
            }
        });
        return foundRoute;
    }
}