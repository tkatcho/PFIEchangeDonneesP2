import fs from "fs";
import HttpContext from './httpContext.js';
import { v1 as uuidv1 } from "uuid";
let assetsRepository = "assetsRepository";

// This method receive base64 encoded file, assign a new GUID, store it in assets path
// then return its url
export function save(base64Data) {
    if (base64Data.indexOf(";base64,") == -1)
        return base64Data; // it is not data it is a reference
    let parts = base64Data.split(";base64,");
    let ext = parts[0].split("/")[1];
    let blob = new Buffer.from(parts[1], 'base64');
    let assetPath = "";
    let assetFileName = "";
    do {
        let GUID = uuidv1();
        assetFileName = GUID + '.' + ext;
        assetPath = `./${wwwroot}/${assetsRepository}/${assetFileName}`;
    } while (fs.existsSync(assetPath));
    fs.writeFileSync(assetPath, blob);
    return assetFileName;
}
export function remove(assetToDelete) {
    if (assetToDelete != '') {
        let assetPath = `./${wwwroot}/${assetsRepository}/${assetToDelete}`;
        fs.unlinkSync(assetPath);
    }
}
export function addHostReference(asset) {
    let host = HttpContext.get().host;
    return `${host}/${assetsRepository}/${asset}`;
}
