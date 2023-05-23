var ODataPath;
var startTime; //So that the duration time can be captured.

var accountName = "Tagging Configuration";
var serverUrl;
var configId;
var dbVersion = "";
var dbAcceptTermsDate = "";


function fnOpenTaggingConfig() {
    if (window.parent.Xrm.Utility) {
        window.parent.Xrm.Utility.openEntityForm("xrmc_taggingconfiguration", configId);
    } else {
        var varUrl = GetServerUrl() + "/main.aspx?etn=xrmc_taggingconfiguration&pagetype=entityrecord&id=%7B" + configId + "%7D";
        window.open(varUrl);
    }
}

function errorXrmc(error) {
    alert(error.message);
}


function fnLoad() {
   
    var solutionVersion = getSolutionVersion();
    configId = taggingConfigCount();
    document.getElementById("lblDate").innerText = dbAcceptTermsDate;
    document.getElementById("lblVersion").innerText = dbVersion;
    if ((configId != "") && (dbVersion == solutionVersion)) {
        document.getElementById("tblTerms").style.display = "none";
        document.getElementById("tblTagging").style.display = "";
    }
    else {
        document.getElementById("tblTerms").style.display = "";
        document.getElementById("tblTagging").style.display = "none";
    }
}

function fnAcceptTerms() {
    serverUrl = GetServerUrl();
    var configId = taggingConfigCount();
    ODataPath = serverUrl + "/XRMServices/2011/OrganizationData.svc";
    startTime = new Date();
    if (configId != "")
        updateRecord(configId);
    else
        createRecord(accountName);
}

function createRecord(name) {
    var solutionVersion = getSolutionVersion();
    var currentDate = new Date();
    var xrmcTaggingconfiguration = new Object();
    xrmcTaggingconfiguration.xrmc_name = name;
    xrmcTaggingconfiguration.xrmc_termsandconditionsversion = solutionVersion;
    xrmcTaggingconfiguration.xrmc_termsandconditionsaccepted = currentDate;

    SDK.REST.createRecord(xrmcTaggingconfiguration,
                          'xrmc_taggingconfiguration',
                          TaggingReqCallBack,
                          errorXrmc); 
}


function updateRecord(id) {
    var changes = new Object();
    var currentDate = new Date();
    var solutionVersion = getSolutionVersion();
    changes.xrmc_termsandconditionsversion = solutionVersion;
    changes.xrmc_termsandconditionsaccepted = currentDate;

    SDK.REST.updateRecord(id,
                          changes,
                          'xrmc_taggingconfiguration',
                          TaggingReqCallBack,
                          errorXrmc
                         );
   
}

function TaggingReqCallBack(record) {
    fnLoad();

}

function GetServerUrl() {

    var context, crmServerUrl;
    if (typeof GetGlobalContext != "undefined") {
        context = GetGlobalContext();
    }
    else if (typeof Xrm != "undefined") {
        context = Xrm.Page.context;
    }
    else {
        if (typeof window.parent.Xrm != "undefined") {
            context = window.parent.Xrm.Page.context;
        } else {
            throw new Error("CRM context is not available.");
        }
    }

    if (context.client && context.client.getClient && context.client.getClient() == 'Outlook') {
        crmServerUrl = window.location.protocol + "//" + window.location.host;
    } else if (context.isOutlookClient && context.isOutlookClient() && !context.isOutlookOnline()) {
        crmServerUrl = window.location.protocol + "//" + window.location.host;
    } else {
        if (typeof context.getClientUrl != "undefined") {
            crmServerUrl = context.getClientUrl();
        } else {
            crmServerUrl = context.getServerUrl();
            crmServerUrl = crmServerUrl.replace(/^(http|https):\/\/([_a-zA-Z0-9\-\.]+)(:([0-9]{1,5}))?/, window.location.protocol + "//" + window.location.host);
            crmServerUrl = crmServerUrl.replace(/\/$/, ""); // remove trailing slash if any  
        }
    }

    return crmServerUrl;
}


function taggingConfigCount() {
    ODataPath = GetServerUrl() + "/XRMServices/2011/OrganizationData.svc";

    var retrieveRecordsReq = new XMLHttpRequest();
    var taggingConfigId = "";

    retrieveRecordsReq.open('GET', ODataPath + "/xrmc_taggingconfigurationSet", false);
    retrieveRecordsReq.setRequestHeader("Accept", "application/json");
    retrieveRecordsReq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    retrieveRecordsReq.send();

    var taggingconfig = JSON.parse(retrieveRecordsReq.responseText).d.results;

    if (taggingconfig[0] == null) {
       
    }
    else {
        taggingConfigId = taggingconfig[0].xrmc_taggingconfigurationId;
        dbVersion = taggingconfig[0].xrmc_termsandconditionsversion;
        dbAcceptTermsDate = new Date(parseInt(taggingconfig[0].xrmc_termsandconditionsaccepted.substr(6)));
        
    }
    return taggingConfigId;

}

function getSolutionVersion() {
    ODataPath = GetServerUrl() + "/XRMServices/2011/OrganizationData.svc";

    var retrieveRequest = new XMLHttpRequest();
    var solutionVersion = "";

    retrieveRequest.open('GET', ODataPath + "/SolutionSet?$filter=UniqueName eq 'ContentTagging'", false);
    retrieveRequest.setRequestHeader("Accept", "application/json");
    retrieveRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    retrieveRequest.send();

    var taggingSolution = JSON.parse(retrieveRequest.responseText).d.results;

    if (taggingSolution[0] == null) {

    }
    else {
        solutionVersion = taggingSolution[0].Version;
    }
    return solutionVersion;
}
