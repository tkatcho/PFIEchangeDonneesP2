/* https://regex-generator.olafneumann.org/ vraiment cool*/
/* String.raw pour ne pas interpréter les "\" */

//https://www.npmjs.com/package/jquery.maskedinput

let defaultRequireMessage = "Obligatoire";
let defaultInvalidMessage = "Format invalide";
let defaultCustomErrorMessage = "Champ invalide";
function initFormValidation() {
    $(".Alpha").each(function () {
        $(this).attr("pattern", String.raw`^[a-zA-Z\- 'ààâäæáãåāèéêëęėēîïīįíìôōøõóòöœùûüūúÿçćčńñÀÂÄÆÁÃÅĀÈÉÊËĘĖĒÎÏĪĮÍÌÔŌØÕÓÒÖŒÙÛÜŪÚŸÇĆČŃÑ]*$`);
    });
    $(".AlphaNum").each(function () {
        $(this).attr("pattern", String.raw`^[a-zA-Z0-9_\- 'ààâäæáãåāèéêëęėēîïīįíìôōøõóòöœùûüūúÿçćčńñÀÂÄÆÁÃÅĀÈÉÊËĘĖĒÎÏĪĮÍÌÔŌØÕÓÒÖŒÙÛÜŪÚŸÇĆČŃÑ]*$`);
    });
    $(".Email").each(function () {
        $(this).attr("pattern", String.raw`^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$`);
    });
    $(".URL").each(function () {
        $(this).attr("pattern", String.raw`(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?$`);
    });
    $(".Phone").each(function () {
        $(this).attr("pattern", String.raw`^\(\d\d\d\)\s\d\d\d-\d\d\d\d$`);
        $(this).mask("(999) 999-9999", { autoclear: false });
    });
    $(".Zipcode").each(function () {
        $(this).attr("pattern", String.raw`^[a-zA-Z][0-9]+[a-zA-Z]\s[0-9]+[a-zA-Z][0-9]+$`);
        $(this).mask("a9a 9a9", { autoclear: false });
    });

    $(".datepicker").each(function () {
        $(this).attr("pattern", String.raw`^\d\d\d\d-\d\d-\d\d$`);
        $(this).mask("9999-99-99", { autoclear: false });
    });
    $(".datepicker").datepicker({
        /*changeMonth: true,*/
        /*changeYear: true, */
        dateFormat: "yy-mm-dd",
        monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        monthNamesShort: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        dayNamesMin: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
        dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    });
    $("input[type='radio']").each(function () {
        $(this).attr(
            "onchange",
            "this.setCustomValidity(''); document.getElementsByName('" +
            $(this).attr("name") +
            "').forEach((radio) => {radio.setCustomValidity('')});"
        );
    });

    $("input[type='password']").each(function () {
        $(this).attr("pattern", String.raw`^\S{6,}$`);
    });

    $("input, select").each(function () {
        let RequireMessage = $(this).attr('RequireMessage') != null ? $(this).attr('RequireMessage') : defaultRequireMessage;
        let InvalidMessage = $(this).attr('InvalidMessage') != null ? $(this).attr('InvalidMessage') : defaultInvalidMessage;
        let CustomErrorMessage = $(this).attr('CustomErrorMessage') != null ? $(this).attr('CustomErrorMessage') : defaultCustomErrorMessage;
        $(this).on("input", function (event) {
            event.target.setCustomValidity('');
            event.target.checkValidity();
        })
        $(this).on("change", function (event) {
            event.target.setCustomValidity('');
            event.target.checkValidity();
        })
        $(this).on("keypress", function (event) {
            event.target.setCustomValidity('');
            event.target.checkValidity();
        })
        $(this).on("focus", function (event) {
            event.target.setCustomValidity('');
            event.target.checkValidity();
        })
        $(this).on("invalid", function (event) {
            let validity = event.target.validity;
            if (validity.valueMissing)
                event.target.setCustomValidity(RequireMessage);
            else
                if (validity.customError)
                    event.target.setCustomValidity(CustomErrorMessage);
                else
                    event.target.setCustomValidity(InvalidMessage);
            //console.log(event.target.name, event.target.validity);
        })
    });

    $(".MatchedInput").each(function () {
        let input = $(this);
        let matchedInput = $(`#${input.attr('matchedInputId')}`);
        matchedInput.on("change", function () { input.attr("pattern", matchedInput.val()); })
        matchedInput.on("focus", function () { input.attr("pattern", matchedInput.val()); })
        input.on("focus", function () { input.attr("pattern", matchedInput.val()); })
    })
}

let timer;
const waitTime = 500;
let conflict = false;
function remoteValidation(url) {
    let result = new Promise(resolve => {
        $.ajax({
            url: url,
            contentType: 'application/json',
            success: result => { resolve(result); },
            error: () => { resolve(false); }
        });
    })
    return result;
}
async function ConflictTestRequest(serviceUrl, fieldName) {
    let fieldControl = $('#' + fieldName);
    let testConflictURL = serviceUrl + "?" + fieldName + "=" + fieldControl.val() + "&Id=" + $("#Id").val();
    let result = await remoteValidation(testConflictURL);
    if (result)
        fieldControl[0].setCustomValidity(fieldControl.attr("CustomErrorMessage"));
    else
        fieldControl[0].setCustomValidity("");
    fieldControl[0].reportValidity();
    conflict = result;
}
function DelayedConflictTestRequest(serviceUrl, fieldName) {
    clearTimeout(timer);
    timer = setTimeout(() => { ConflictTestRequest(serviceUrl, fieldName) }, waitTime);
}
function Conflict() {
    return conflict;
}
function addConflictValidation(serviceUrl, fieldName, submitBtnId) {
    let fieldControl = $('#' + fieldName);
    fieldControl.on("keyup", () => { DelayedConflictTestRequest(serviceUrl, fieldName) });
    fieldControl.on("blur", () => { ConflictTestRequest(serviceUrl, fieldName) });
    $("#" + submitBtnId).on("click", () => { ConflictTestRequest(serviceUrl, fieldName) });
    $("#" + submitBtnId).parents('form:first').on("submit", function (e) { return !Conflict(); });
}

