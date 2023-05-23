var ODataPath;
var startTime; //So that the duration time can be captured.

var accountName = "Tagging Configuration";
var serverUrl;
var taggingConfigId = "";
var dbVersion = "";
var dbAcceptTermsDate = "";
var solutionVersion = "";


function fnOpenTaggingConfig() {
    window.parent.Xrm.Navigation.openForm({ entityName: "xrmc_taggingconfiguration", entityId: taggingConfigId });
}

function errorXrmc(error) {
    alert(error.message);
}


async function fnLoad() {
    var result = await retrieveMultiple("solutions", "?$select=version&$filter=uniquename eq 'ContentTagging'");
    if (result.value.length > 0) {
        solutionVersion = result.value[0].version;
    }

    result = await retrieveMultiple("xrmc_taggingconfigurations", "?$select=xrmc_termsandconditionsversion,xrmc_termsandconditionsaccepted");
    if (result.value.length > 0) {
        var taggingConfig = result.value[0];
        taggingConfigId = taggingConfig.xrmc_taggingconfigurationid;
        dbVersion = taggingConfig.xrmc_termsandconditionsversion;
        dbAcceptTermsDate = new Date(parseInt(taggingConfig.xrmc_termsandconditionsaccepted.substr(6)));
        document.getElementById("lblDate").innerText = new Date(taggingConfig.xrmc_termsandconditionsaccepted);
        document.getElementById("lblVersion").innerText = taggingConfig.xrmc_termsandconditionsversion;

    }
    if ((taggingConfigId != "") && (dbVersion == solutionVersion)) {
        document.getElementById("tblTerms").style.display = "none";
        document.getElementById("tblTagging").style.display = "";
    }
    else {
        document.getElementById("tblTerms").style.display = "";
        document.getElementById("tblTagging").style.display = "none";
    }
}

async function fnAcceptTerms() {
    var data = {
        xrmc_termsandconditionsversion: solutionVersion,
        xrmc_termsandconditionsaccepted: new Date()
    };
    if (taggingConfigId != "") {
        await updateRecord('xrmc_taggingconfigurations', taggingConfigId, data);
    } else {
        data.xrmc_name = accountName;
        await createRecord('xrmc_taggingconfigurations', data);
    }
    location.reload();
}

function updateRecord(collection, id, data) {
    executeRequest("PATCH", collection, { id: id, data: data });
}
function createRecord(collection, data) {
    executeRequest("POST", collection, { data: data });
}

function retrieveMultiple(collection, options) {
    return executeRequest("GET", collection, { options: options });
}

function executeRequest(action, collection, parameters) {//id, data, options) {
    var id = null;

    var uri = Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.0/" + collection
    if (action == "PATCH")
        uri += "(" + parameters.id + ")";
    if (action == "GET" && parameters)
        uri += (parameters.options ? parameters.options : '');

    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open(action, uri, true);
        request.setRequestHeader("OData-MaxVersion", "4.0");
        request.setRequestHeader("OData-Version", "4.0");
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                request.onreadystatechange = null;
                switch (this.status) {
                    case 200: // Success with content returned in response body.  
                    case 204: // Success with no content returned in response body.  
                    case 304: // Success with Not Modified  
                        resolve(JSON.parse(this.response));
                        break;
                    default: // All other statuses are error cases.  
                        var error;
                        try {
                            error = JSON.parse(request.response).error;
                        } catch (e) {
                            error = new Error("Unexpected Error");
                        }
                        reject(error);
                        break;
                }
            }
        };

        if (parameters && parameters.data) {
            request.send(JSON.stringify(parameters.data));
        } else {
            request.send();
        }
    });
}

