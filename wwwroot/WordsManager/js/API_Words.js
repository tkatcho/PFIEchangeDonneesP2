//const API_URL = "https://api-server-5.glitch.me/api/words";
const API_URL = "http://localhost:5000/api/words";
let currentHttpError = "";

function API_getcurrentHttpError () {
    return currentHttpError; 
}
function API_GetWords(query = "") {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + query,
            success: words => { currentHttpError = ""; resolve(words); },
            error: (xhr) => { console.log(xhr); resolve(null); }
        });
    });
}
function API_GetWord(wordId) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + wordId,
            success: word => { currentHttpError = ""; resolve(word); },
            error: (xhr) => { currentHttpError = xhr.responseJSON.error_description; resolve(null); }
        });
    });
}
function API_SaveWord(word, create) {
    return new Promise(resolve => {
        $.ajax({
            url: create ? API_URL :  API_URL + "/" + word.Id,
            type: create ? "POST" : "PUT",
            contentType: 'application/json',
            data: JSON.stringify(word),
            success: (/*data*/) => { currentHttpError = ""; resolve(true); },
            error: (xhr) => {currentHttpError = xhr.responseJSON.error_description; resolve(false /*xhr.status*/); }
        });
    });
}
function API_DeleteWord(id) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + id,
            type: "DELETE",
            success: () => { currentHttpError = ""; resolve(true); },
            error: (xhr) => { currentHttpError = xhr.responseJSON.error_description; resolve(false /*xhr.status*/); }
        });
    });
}