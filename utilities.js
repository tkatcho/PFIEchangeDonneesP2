/////////////////////////////////////////////////////////////////////
// Thid module exports small general usefull functions for :
// - path parsing
// - querystring manipulations
// - time conversion
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

import queryStringParser from 'query-string';

export function capitalizeFirstLetter(s) {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}
export const nowInSeconds = () => {
    const now = new Date();
    return Math.round(now.getTime() / 1000);
}
export const deleteByIndex = (array, indexToDelete) => {
    for (let i = indexToDelete.length - 1; i >= 0; i--) {
        array.splice(indexToDelete[i], 1);
    }
}
export function removeQueryString(url) {
    let queryStringMarkerPos = url.indexOf('?');
    if (queryStringMarkerPos > -1)
        url = url.substr(0, queryStringMarkerPos);
    return url;
}
export function getQueryString(url) {
    if (url.indexOf('?') > -1)
        return url.substring(url.indexOf('?'), url.length);
    return undefined;
}
export function secondsToDateString(dateInSeconds, localizationId = 'fr-FR') {
    const hoursOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date(dateInSeconds * 1000).toLocaleDateString(localizationId, hoursOptions);
}
export function makeVerifyCode(nbDigits) {
    let code = 0;
    for (let i = 0; i < nbDigits; i++) {
        let digit = Math.trunc(Math.random() * 10);
        code = code * 10 + digit;
    }
    return code;
}
/////////////////////////////////////////////////////////////////////
// this function decompose url path
// either
// MVC pattern /controller/action/id?querystring
// or
// API pattern /api/model/id?querystring
/////////////////////////////////////////////////////////////////////
export const decomposePath = (url) => {
    let isAPI = false;
    let model = undefined;
    let controllerName = undefined;
    let action = undefined;
    let id = undefined;
    let params = null;

    let queryString = getQueryString(url);
    if (queryString != undefined)
        params = queryStringParser.parse(queryString);
    let path = removeQueryString(url).toLowerCase();

    if (path.indexOf('/api') > -1) {
        isAPI = true;
        path = path.replace('/api', '')
    }

    let urlParts = path.split("/");

    if (urlParts[1] != undefined) {
        model = urlParts[1];
        controllerName = capitalizeFirstLetter(model) + 'Controller';
    }

    if (!isAPI) {
        if (urlParts[2] != undefined && urlParts[2] != '')
            action = urlParts[2];
        else
            action = 'index';

        if (urlParts[3] != undefined) {
           // id = parseInt(urlParts[3]);
           id= urlParts[3];
        }
    } else {
        if (urlParts[2] != undefined) {
            // id = parseInt(urlParts[2]);
            id= urlParts[2];
        }
    }
    return { isAPI, model, controllerName, action, id, queryString, params };
}
