/////////////////////////////////////////////////////////////////////
// This module define a middleware that serve static resources
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

import path from 'path';
import fs from 'fs';
import mimes from './mimes.js';

globalThis.wwwroot = 'wwwroot';
let defaultResource = 'index.html';

function isDirectory(url) {
    let extension = path.extname(url).replace('.', '');
    return extension == '';
}
function requestedStaticResource(url) {
    let isDir = isDirectory(url);
    url += isDir ? (url.slice(-1) != '/'? '/' : '' ) : '';
    let resourceName = isDir ? url + defaultResource : url;
    let resourcePath = path.join(process.cwd(), wwwroot, resourceName);
    return resourcePath;
}
function extToContentType(filePath) {
    let extension = path.extname(filePath).replace('.', '');
    let contentType = mimes(extension);
    if (contentType !== undefined)
        return contentType;
    return 'text/html';
}
export function handleStaticResourceRequest(HttpContext) {
    let filePath = requestedStaticResource(HttpContext.req.url);
    let contentType = extToContentType(filePath);
    try {
        let content = fs.readFileSync(filePath);
        console.log(contentType, filePath);
        return HttpContext.response.content(contentType, content);
    } catch (error) {
        if (error.code === 'ENOENT')
            return false;
        else
            return HttpContext.response.internalError(`Server error: ${error.code}`);
    }
}