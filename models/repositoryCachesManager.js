import * as utilities from "../utilities.js";
import * as serverVariables from "../serverVariables.js";
import {log} from "../log.js";
let repositoryCacheExpirationTime = serverVariables.get("main.repositoryCache.ExpirationTime");

// Repository file data models cache
global.repositoryCaches = [];

export default class RepositoryCachesManager {
    static add(model, data) {
        if (model != "") {
            RepositoryCachesManager.clear(model);
            repositoryCaches.push({
                model,
                data,
                Expire_Time: utilities.nowInSeconds() + repositoryCacheExpirationTime
            });
            console.log("File data of " + model + ".json added in respository cache");
        }
    }
    static clear(model) {
        repositoryCaches = repositoryCaches.filter( cache => cache.model == model);
    }
    static find(model) {
        try {
            if (model != "") {
                for (let cache of repositoryCaches) {
                    if (cache.model == model) {
                        // renew cache
                        cache.Expire_Time = utilities.nowInSeconds() + repositoryCacheExpirationTime;
                        console.log("File data of " + model + ".json retreived from respository cache");
                        return cache.data;
                    }
                }
            }
        } catch (error) {
            console.log("repository cache error!", error);
        }
        return null;
    }
    static flushExpired() {
        let now = utilities.nowInSeconds();
        for (let cache of repositoryCaches) {
            if (cache.Expire_Time < now) {
                console.log("Cached file data of " + cache.model + ".json expired");
            }
        }
        repositoryCaches = repositoryCaches.filter( cache => cache.Expire_Time > now);
    }
}
// periodic cleaning of expired cached repository data
setInterval(RepositoryCachesManager.flushExpired, repositoryCacheExpirationTime * 1000);
log(BgWhite, FgBlack, "Periodic cached repositories cleaning process started...");
