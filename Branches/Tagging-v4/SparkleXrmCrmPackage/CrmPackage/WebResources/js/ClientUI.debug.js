//! ClientUI.debug.js
//

(function($){

Type.registerNamespace('ClientUI.Common');

////////////////////////////////////////////////////////////////////////////////
// ClientUI.Common.DataHelper

ClientUI.Common.DataHelper = function ClientUI_Common_DataHelper() {
}
ClientUI.Common.DataHelper.getWebResourceData = function ClientUI_Common_DataHelper$getWebResourceData(innerSeparator) {
    var queryString = window.location.search;
    if (queryString != null && !!queryString) {
        var parameters = queryString.substr(1).split('&');
        var $enum1 = ss.IEnumerator.getEnumerator(parameters);
        while ($enum1.moveNext()) {
            var param = $enum1.current;
            if (param.toLowerCase().startsWith('data=')) {
                var dataParam = param.replaceAll('+', ' ').split('=');
                return ClientUI.Common.DataHelper._parseDataParameter(dataParam[1], innerSeparator);
            }
        }
    }
    return {};
}
ClientUI.Common.DataHelper._parseDataParameter = function ClientUI_Common_DataHelper$_parseDataParameter(data, innerSeparator) {
    var nameValuePairs = {};
    var values = (decodeURIComponent(decodeURIComponent(data))).split(innerSeparator);
    var $enum1 = ss.IEnumerator.getEnumerator(values);
    while ($enum1.moveNext()) {
        var value = $enum1.current;
        var nameValuePair = value.split('=');
        nameValuePairs[nameValuePair[0]] = nameValuePair[1];
    }
    return nameValuePairs;
}


////////////////////////////////////////////////////////////////////////////////
// ClientUI.Common.ListExtension

ClientUI.Common.ListExtension = function ClientUI_Common_ListExtension() {
}
ClientUI.Common.ListExtension.sortBy = function ClientUI_Common_ListExtension$sortBy(field, reverse, primer) {
    var sortKey = function(tag) {
        return (primer == null) ? tag[field] : primer(tag[field]);
    };
    return function(a, b) {
        var a1 = sortKey(a), b1 = sortKey(b);
        return String.compare(a1, b1) * ((reverse) ? -1 : 1);
    };
}


////////////////////////////////////////////////////////////////////////////////
// ClientUI.Common.Security

ClientUI.Common.Security = function ClientUI_Common_Security() {
}
ClientUI.Common.Security.checkPrivileges = function ClientUI_Common_Security$checkPrivileges(done) {
    alert('YOU MUST UPDATE THE CHECK PRIVILEGES MANUALLY!');
}


Type.registerNamespace('ClientUI.Tagging.Model');

////////////////////////////////////////////////////////////////////////////////
// ClientUI.Tagging.Model.MultiTagModel

ClientUI.Tagging.Model.MultiTagModel = function ClientUI_Tagging_Model_MultiTagModel() {
}
ClientUI.Tagging.Model.MultiTagModel.prototype = {
    tag: null,
    Id: null
}


////////////////////////////////////////////////////////////////////////////////
// ClientUI.Tagging.Model.TagModel

ClientUI.Tagging.Model.TagModel = function ClientUI_Tagging_Model_TagModel() {
}
ClientUI.Tagging.Model.TagModel.prototype = {
    id: null,
    name: null,
    synonyms: null,
    backColor: null,
    fontColor: null,
    borderColor: null,
    saveName: null,
    tagCount: null
}


Type.registerNamespace('ClientUI.Model');

////////////////////////////////////////////////////////////////////////////////
// ClientUI.Model.WebResourceSettings

ClientUI.Model.WebResourceSettings = function ClientUI_Model_WebResourceSettings() {
}
ClientUI.Model.WebResourceSettings.prototype = {
    disableListSelection: false,
    resultsLimit: 0,
    minChars: 0,
    parents: null,
    excludeParents: null,
    allowParentSelection: false,
    existingTagsOnly: false,
    multitag: false
}


Type.registerNamespace('ClientUI.Tagging.ViewModels');

////////////////////////////////////////////////////////////////////////////////
// ClientUI.Tagging.ViewModels.TaggingViewModel

ClientUI.Tagging.ViewModels.TaggingViewModel = function ClientUI_Tagging_ViewModels_TaggingViewModel() {
    this.settings = new ClientUI.Model.WebResourceSettings();
    this.message = ko.observable();
    this.shouldShowMessage = ko.observable(false);
    this.waitForSave = ko.observable();
    this.updateList = [];
    ClientUI.Tagging.ViewModels.TaggingViewModel.initializeBase(this);
}
ClientUI.Tagging.ViewModels.TaggingViewModel.openTagRecord = function ClientUI_Tagging_ViewModels_TaggingViewModel$openTagRecord(tokenIds, tagName, entityName) {
    tagName = unescape(tagName);
    var serverUrl = Xrm.Page.context.getClientUrl();
    if (!serverUrl.endsWith('/')) {
        serverUrl += '/';
    }
    var features = 'location=no,menubar=no,status=yes,toolbar=no,resizable=yes';
    var tagId;
    var split = tokenIds.split(':');
    tagId = split[1];
    if (tagId == null) {
        var fetchxml = "\r\n<fetch distinct='false' mapping='logical' output-format='xml-platform' version='1.0' top='1'>\r\n  <entity name='xrmc_tag'>\r\n    <attribute name='xrmc_name'/>\r\n    <attribute name='xrmc_parent'/>\r\n    <attribute name='xrmc_tagid'/>\r\n    <order descending='false' attribute='xrmc_name'/>\r\n    <filter type='and'>\r\n      <condition attribute='xrmc_name' value='{0}' operator='eq' />\r\n    </filter>\r\n  </entity>\r\n</fetch>";
        SparkleXrm.Sdk.OrganizationServiceProxy.beginRetrieveMultiple(String.format(fetchxml, tagName), function(result) {
            try {
                var fetchResult = SparkleXrm.Sdk.OrganizationServiceProxy.endRetrieveMultiple(result, SparkleXrm.Sdk.Entity);
                var entities = fetchResult.entities._internalArray;
                if (entities.length > 0) {
                    var firstResult = entities[0];
                    tagId = firstResult.id;
                    var options = {};
                    options['entityName'] = 'xrmc_tag';
                    options['entityId'] = tagId;
                    Xrm.Navigation.openForm(options);
                }
            }
            catch (ex) {
                var x = ex.message;
            }
        });
    }
    else {
        var options = {};
        options['entityName'] = 'xrmc_tag';
        options['entityId'] = tagId;
        Xrm.Navigation.openForm(options);
    }
}
ClientUI.Tagging.ViewModels.TaggingViewModel.prototype = {
    tagList: null,
    allowedTagList: null,
    loader: '',
    retainFocus: false,
    updateItem: 0,
    updateTotal: 0,
    multiDelete: false,
    typeName: null,
    _item$1: null,
    
    init: function ClientUI_Tagging_ViewModels_TaggingViewModel$init(done) {
        if (Xrm.Page.data == null) {
            Xrm.Page.data = window.parent.Xrm.Page.data;
        }
        if (this.allowedTagList != null && !this.waitForSave()) {
            return;
        }
        if (!this.settings.multitag && String.isNullOrEmpty(Xrm.Page.data.entity.getId())) {
            this.showMessage(ResourceStrings.onCreate);
            this.hideLoader();
            this.waitForSave(true);
            this.waitForAutosave(done);
            return;
        }
        this.waitForSave(false);
        this.initTagging(ss.Delegate.create(this, function() {
            if (Xrm.Page.data == null) {
                if (!this.settings.multitag) {
                    this.hideLoader();
                    done();
                    return;
                }
            }
            if (this.isOffline()) {
                this.showMessage(ResourceStrings.offline);
                done();
            }
            else {
                this.getTagConnectionCount(ss.Delegate.create(this, function(result) {
                    if (result) {
                        this.showMessage(ResourceStrings.exceededLimit);
                        this.hideLoader();
                        done();
                    }
                    else {
                        if (this.settings.multitag || !String.isNullOrEmpty(Xrm.Page.data.entity.getId())) {
                            if (!this.settings.multitag) {
                                $('#selectTagsToggle').show();
                            }
                            ClientUI.Common.Security.checkPrivileges(ss.Delegate.create(this, function(role, message) {
                                var isTagWriter = role === 'Tag Writer';
                                var isTagAssociator = role === 'Tag Associator';
                                var isTagReader = role === 'Tag Reader';
                                if (isTagWriter && !this.settings.existingTagsOnly) {
                                    $(ClientUI.Tagging.ViewModels.TaggingViewModel.md).hide();
                                    this.receivedTagList('&times;', true, false, done);
                                }
                                else if (isTagAssociator || isTagWriter) {
                                    $(ClientUI.Tagging.ViewModels.TaggingViewModel.md).hide();
                                    if (this.settings.multitag) {
                                        $('.instructions').text('Enter text below to search for existing tags');
                                    }
                                    this.receivedTagList('&times;', false, false, done);
                                }
                                else if (isTagReader) {
                                    this.settings.disableListSelection = true;
                                    if (this.settings.multitag) {
                                        $('.instructions').text('');
                                        this.showMessage(ResourceStrings.multiTagNotAllowed);
                                    }
                                    else {
                                        $(ClientUI.Tagging.ViewModels.TaggingViewModel.md).hide();
                                        this.receivedTagList('', false, true, done);
                                    }
                                }
                                else {
                                    if (String.isNullOrEmpty(message)) {
                                        this.showMessage(ResourceStrings.notAuthorised);
                                    }
                                    else {
                                        this.showMessage(message);
                                    }
                                    done();
                                }
                            }));
                        }
                        else {
                            this.showMessage(ResourceStrings.onCreate);
                            this.hideLoader();
                            this.waitForSave(true);
                            this.waitForAutosave(done);
                        }
                    }
                }));
            }
        }));
    },
    
    initTagCloud: function ClientUI_Tagging_ViewModels_TaggingViewModel$initTagCloud() {
        ClientUI.Common.Security.checkPrivileges(ss.Delegate.create(this, function(privilege, message) {
            if (privilege === 'Tag Writer' || privilege === 'Tag Associator' || privilege === 'Tag Reader') {
                var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" + "<entity name='xrmc_tag'>" + "<attribute name='xrmc_tagid' />" + "<attribute name='xrmc_name' />" + "<attribute name='createdon' />" + "<attribute name='xrmc_parent' />" + "<attribute name='xrmc_tagcount' />" + "<order attribute='xrmc_tagcount' descending='true' />" + "<filter type='and'>" + "<condition attribute='statecode' operator='eq' value='0' />" + "<condition attribute='xrmc_tagcount' operator='gt' value='0' />" + '</filter>' + '</entity>' + '</fetch>';
                var encodedFetchXML = encodeURIComponent(fetchXml);
                SparkleXrm.Sdk.OrganizationServiceProxy.beginRetrieveMultiple(fetchXml, ss.Delegate.create(this, function(result) {
                    try {
                        var fetchResult = SparkleXrm.Sdk.OrganizationServiceProxy.endRetrieveMultiple(result, SparkleXrm.Sdk.Entity);
                        ClientUI.Tagging.ViewModels.TaggingViewModel.allTags = fetchResult.entities._internalArray;
                        this.parseParams(ss.Delegate.create(this, function(s) {
                            var allowedTags = [];
                            for (var i = 0; i < ClientUI.Tagging.ViewModels.TaggingViewModel.allTags.length; i++) {
                                if (this.tagAllowed(ClientUI.Tagging.ViewModels.TaggingViewModel.allTags[i])) {
                                    var json = new ClientUI.Tagging.Model.TagModel();
                                    json.id = ClientUI.Tagging.ViewModels.TaggingViewModel.allTags[i].id;
                                    json.name = ClientUI.Tagging.ViewModels.TaggingViewModel.allTags[i].getAttributeValueString('xrmc_name');
                                    json.tagCount = ClientUI.Tagging.ViewModels.TaggingViewModel.allTags[i].getAttributeValueInt('xrmc_tagcount');
                                    allowedTags.push(json);
                                }
                            }
                            allowedTags.sort(ClientUI.Common.ListExtension.sortBy('xrmc_tagcount', false, null));
                            allowedTags = allowedTags.slice(0, 29);
                            var items = [];
                            for (var i = 0; i < allowedTags.length; i++) {
                                var spacer;
                                if (i < allowedTags.length - 1) {
                                    spacer = ', ';
                                }
                                else {
                                    spacer = '';
                                }
                                var item = allowedTags[i];
                                items.push("<a href='javascript:ClientUI.Tagging.ViewModels.TaggingViewModel.openTagRecord(&quot;" + item.id + '&quot;,&quot;' + this.oDataEscape(encodeURIComponent(this.htmlEncode(item.name))) + "&quot;,&quot;xrmc_tag&quot;);' rel='" + item.tagCount + "'>" + item.name + '</a>' + spacer);
                            }
                            $('#xrmc-tagCloud').append(items.join(''));
                            var options = {};
                            options.size = {};
                            options.size.start = 14;
                            options.size.end = 22;
                            options.size.unit = 'pt';
                            options.color = {};
                            options.color.start = '#00188f';
                            options.color.end = '#f60';
                            $.fn.tagcloud.defaults = options;
                            $(function() {
                                ($('#xrmc-tagCloud a')).tagcloud();
                            });
                        }));
                    }
                    catch (ex) {
                        this.showMessage('Error loading tag cloud: ' + ex.message);
                    }
                }));
            }
            else {
                this.showMessage('Not Authorised');
            }
        }));
    },
    
    waitForAutosave: function ClientUI_Tagging_ViewModels_TaggingViewModel$waitForAutosave(done) {
        if (!String.isNullOrEmpty(Xrm.Page.data.entity.getId())) {
            this.hideMessage();
            this.init(done);
        }
        else {
            window.setTimeout(ss.Delegate.create(this, function() {
                this.waitForAutosave(done);
            }), 100);
        }
    },
    
    showMessage: function ClientUI_Tagging_ViewModels_TaggingViewModel$showMessage(message) {
        this.message(message);
        this.shouldShowMessage(true);
    },
    
    hideMessage: function ClientUI_Tagging_ViewModels_TaggingViewModel$hideMessage() {
        this.message(null);
        this.shouldShowMessage(false);
    },
    
    initTagging: function ClientUI_Tagging_ViewModels_TaggingViewModel$initTagging(done) {
        this.allowedTagList = [];
        var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" + "<entity name='xrmc_tag'>" + "<attribute name='xrmc_tagid' />" + "<attribute name='xrmc_name' />" + "<attribute name='createdon' />" + "<attribute name='xrmc_parent' />" + "<attribute name='xrmc_tagcount' />" + "<attribute name='xrmc_synonyms' />" + "<attribute name='xrmc_backcolor' />" + "<attribute name='xrmc_fontcolor' />" + "<attribute name='xrmc_bordercolor' />" + "<order attribute='xrmc_tagcount' descending='true' />" + "<filter type='and'>" + "<condition attribute='statecode' operator='eq' value='0' />" + '</filter>' + '</entity>' + '</fetch>';
        SparkleXrm.Sdk.OrganizationServiceProxy.beginRetrieveMultiple(fetchXml, ss.Delegate.create(this, function(result) {
            try {
                var fetchResult = SparkleXrm.Sdk.OrganizationServiceProxy.endRetrieveMultiple(result, SparkleXrm.Sdk.Entity);
                ClientUI.Tagging.ViewModels.TaggingViewModel.allTags = fetchResult.entities._internalArray;
                this.parseParams(ss.Delegate.create(this, function(s) {
                    if (this.settings.multitag) {
                        this.settings.resultsLimit = 10;
                    }
                    for (var e = 0; e < ClientUI.Tagging.ViewModels.TaggingViewModel.allTags.length; e++) {
                        var tag = ClientUI.Tagging.ViewModels.TaggingViewModel.allTags[e];
                        if (this.tagAllowed(tag)) {
                            var json = new ClientUI.Tagging.Model.TagModel();
                            json.id = tag.id;
                            json.name = tag.getAttributeValueString('xrmc_name');
                            json.synonyms = [];
                            var synonymString = tag.getAttributeValueString('xrmc_synonyms');
                            if (!!synonymString) {
                                if (synonymString.indexOf(',') > -1) {
                                    var synonymArray = synonymString.split(',');
                                    for (var a = 0; a < synonymArray.length; a++) {
                                        json.synonyms.push(synonymArray[a].trim());
                                    }
                                }
                                else {
                                    json.synonyms.push(synonymString.trim());
                                }
                            }
                            json.backColor = tag.getAttributeValueString('xrmc_backcolor');
                            json.fontColor = tag.getAttributeValueString('xrmc_fontcolor');
                            json.borderColor = tag.getAttributeValueString('xrmc_bordercolor');
                            this.allowedTagList.push(json);
                            if (!this.settings.multitag && !this.settings.disableListSelection) {
                                var listTag = {};
                                listTag.taglabel = json.name;
                                listTag.tagname = json.name;
                                listTag.tagcheck = json.name;
                                listTag.tagvalue = json.name;
                                this.tagList.add(listTag);
                            }
                        }
                    }
                    done();
                }));
            }
            catch (ex) {
                this.showMessage(ResourceStrings.notAuthorised);
                this.hideLoader();
            }
        }));
    },
    
    getTagById: function ClientUI_Tagging_ViewModels_TaggingViewModel$getTagById(id) {
        for (var i = 0; i < ClientUI.Tagging.ViewModels.TaggingViewModel.allTags.length; i++) {
            if (ClientUI.Tagging.ViewModels.TaggingViewModel.allTags[i].id === id) {
                return ClientUI.Tagging.ViewModels.TaggingViewModel.allTags[i];
            }
        }
        return SparkleXrm.Sdk.OrganizationServiceProxy.retrieve('xrmc_tag', id, [ 'xrmc_name', 'xrmc_backcolor', 'xrmc_fontcolor', 'xrmc_bordercolor' ]);
    },
    
    getTagByName: function ClientUI_Tagging_ViewModels_TaggingViewModel$getTagByName(tagName) {
        for (var i = 0; i < ClientUI.Tagging.ViewModels.TaggingViewModel.allTags.length; i++) {
            if (ClientUI.Tagging.ViewModels.TaggingViewModel.allTags[i].getAttributeValueString('xrmc_name') === tagName) {
                return Promise.resolve(ClientUI.Tagging.ViewModels.TaggingViewModel.allTags[i]);
            }
        }
        var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" + "  <entity name='xrmc_tag'>" + "    <attribute name='xrmc_tagid' />" + "    <attribute name='xrmc_name' />" + "    <attribute name='xrmc_parent' />" + "    <filter type='and'>" + "      <condition attribute='xrmc_name' operator='eq' value='" + tagName + "' />" + '    </filter>' + '  </entity>' + '</fetch>';
        var fetchResult = SparkleXrm.Sdk.OrganizationServiceProxy.retrieveMultiple(fetchXml);
        var entities = fetchResult.entities._internalArray;
        if (entities.length > 0) {
            return Promise.resolve(entities[0]);
        }
        return Promise.resolve(null);
    },
    
    displayLoader: function ClientUI_Tagging_ViewModels_TaggingViewModel$displayLoader() {
        $(ClientUI.Tagging.ViewModels.TaggingViewModel.td).blur();
        $('#loadingfull').show();
        return $.Deferred();
    },
    
    hideLoader: function ClientUI_Tagging_ViewModels_TaggingViewModel$hideLoader() {
        $('#loadingfull').hide();
    },
    
    isOffline: function ClientUI_Tagging_ViewModels_TaggingViewModel$isOffline() {
        if (Xrm.Page.context.client != null && Xrm.Page.context.client.getClient() === 'Outlook' && Xrm.Page.context.client.getClientState() === 'Offline') {
            return true;
        }
        return false;
    },
    
    getTagConnectionCount: function ClientUI_Tagging_ViewModels_TaggingViewModel$getTagConnectionCount(done) {
        var fetchXml = "<fetch  mapping='logical' aggregate='true' >" + "<entity name='xrmc_taggingconfiguration'>" + "<attribute name='xrmc_taggingconfigurationid' aggregate='count' alias='count' />" + "<filter type='and'>" + "<condition attribute='xrmc_licensekeystatus' operator='eq' value='922680000' />" + '</filter>' + '</entity>' + '</fetch>';
        SparkleXrm.Sdk.OrganizationServiceProxy.beginRetrieveMultiple(fetchXml, ss.Delegate.create(this, function(result) {
            try {
                var fetchResult = SparkleXrm.Sdk.OrganizationServiceProxy.endRetrieveMultiple(result, SparkleXrm.Sdk.Entity);
                var entities = fetchResult.entities._internalArray;
                if (entities.length > 0) {
                    var validConfig = entities[0];
                    var c = this.getAggregateValueAsInt(validConfig, 'count');
                    if (c !== 1) {
                        fetchXml = "<fetch mapping='logical' aggregate='true' >" + "<entity name='connection' >" + "<attribute name='connectionid' aggregate='count' alias='count' />" + "<filter type='and' >" + "<condition attribute='record1roleid' operator='eq' uiname='Tag' uitype='connectionrole' value='{A6594384-3BD4-E211-8A32-3C4A92DBDC51}' />" + '</filter>' + '</entity>' + '</fetch>';
                        try {
                            SparkleXrm.Sdk.OrganizationServiceProxy.beginRetrieveMultiple(fetchXml, ss.Delegate.create(this, function(result2) {
                                var tagFetchResult = SparkleXrm.Sdk.OrganizationServiceProxy.endRetrieveMultiple(result2, SparkleXrm.Sdk.Entity);
                                var tagEntities = tagFetchResult.entities._internalArray;
                                var tagConnectionCount = tagEntities[0];
                                if (tagConnectionCount.logicalName !== 'connection') {
                                    return;
                                }
                                var cVal = this.getAggregateValueAsInt(tagConnectionCount, 'count');
                                if (cVal > 25) {
                                    done(true);
                                    return;
                                }
                                else {
                                    done(false);
                                    return;
                                }
                            }));
                        }
                        catch (e) {
                            this.showMessage('Error occurred validating tags: ' + e.message);
                            return;
                        }
                    }
                    else {
                        done(false);
                        return;
                    }
                }
            }
            catch (e) {
                this.showMessage('Error occurred validating tags: ' + e.message);
                return;
            }
        }));
    },
    
    getAggregateValueAsInt: function ClientUI_Tagging_ViewModels_TaggingViewModel$getAggregateValueAsInt(e, a) {
        var s = e.formattedValues[a];
        if (s != null) {
            return parseInt(s, 10);
        }
        var o = e.getAttributeValueOptionSet(a);
        if (o != null && o.value != null) {
            return o.value;
        }
        return e.getAttributeValueInt(a);
    },
    
    receivedTagList: function ClientUI_Tagging_ViewModels_TaggingViewModel$receivedTagList(deleteText, freetagging, disable, done) {
        this.getPrepopulateTags(ss.Delegate.create(this, this.receivedPrePopulate), deleteText, freetagging, disable, done);
    },
    
    getPrepopulateTags: function ClientUI_Tagging_ViewModels_TaggingViewModel$getPrepopulateTags(receivedPrePopulateCallback, deleteText, freetagging, disable, done) {
        if (this.settings.multitag) {
            receivedPrePopulateCallback([], deleteText, freetagging, disable, done);
            return;
        }
        var fetchXml = '';
        fetchXml = "\r\n        <fetch top='50' >\r\n          <entity name='connection' >\r\n            <attribute name='connectionid' />\r\n            <attribute name='record1id' />\r\n            <filter type='and' >\r\n              <condition attribute='record1roleid' operator='eq' value='A6594384-3BD4-E211-8A32-3C4A92DBDC51' />\r\n              <condition attribute='record2id' operator='eq' value='" + Xrm.Page.data.entity.getId() + "' />\r\n            </filter>\r\n          </entity>\r\n        </fetch>";
        SparkleXrm.Sdk.OrganizationServiceProxy.beginRetrieveMultiple(fetchXml, ss.Delegate.create(this, function(state) {
            var results = SparkleXrm.Sdk.OrganizationServiceProxy.endRetrieveMultiple(state, SparkleXrm.Sdk.Entity);
            var entities = results.entities._internalArray;
            var prepopulateTaglist = [];
            for (var e = 0; e < entities.length; e++) {
                var connection = entities[e];
                var tag = this.getTagById(connection.getAttributeValueEntityReference('record1id').id.toString());
                if (this.tagAllowed(tag)) {
                    var newTag = new ClientUI.Tagging.Model.TagModel();
                    newTag.id = connection.id + ':' + tag.id;
                    newTag.name = tag.getAttributeValueString('xrmc_name');
                    newTag.backColor = tag.getAttributeValueString('xrmc_backcolor');
                    newTag.fontColor = tag.getAttributeValueString('xrmc_fontcolor');
                    newTag.borderColor = tag.getAttributeValueString('xrmc_bordercolor');
                    prepopulateTaglist.push(newTag);
                }
            }
            receivedPrePopulateCallback(prepopulateTaglist, deleteText, freetagging, disable, done);
        }));
    },
    
    receivedPrePopulate: function ClientUI_Tagging_ViewModels_TaggingViewModel$receivedPrePopulate(prepopulateList, deleteText, freetagging, disable, done) {
        prepopulateList.sort(ClientUI.Common.ListExtension.sortBy('name', false, function(a) {
            if (!String.isNullOrEmpty(a)) {
                return a.toUpperCase();
            }
            return '';
        }));
        ClientUI.Tagging.ViewModels.TaggingViewModel.runningList = prepopulateList;
        for (var i = 0; i < ClientUI.Tagging.ViewModels.TaggingViewModel.runningList.length; i++) {
            $("input[value='" + this.prettyTag(ClientUI.Tagging.ViewModels.TaggingViewModel.runningList[i].name) + "']").attr('checked', 'true');
        }
        var ti = {};
        ti.hintText = 'Search for existing tag...';
        ti.noResultsText = 'No tags found';
        ti.searchingText = 'Searching...';
        ti.preventDuplicates = true;
        ti.deleteText = deleteText;
        ti.allowFreeTagging = freetagging;
        ti.allowTabOut = true;
        ti.tokenValue = 'name';
        ti.disabled = disable;
        ti.resultsLimit = this.settings.resultsLimit;
        ti.minChars = this.settings.minChars;
        ti.tokenDelimiter = '|';
        ti.prePopulate = prepopulateList;
        ti.tokenFormatter = ss.Delegate.create(this, function(item) {
            if (item != null) {
                if (!String.isNullOrEmpty(item.backColor)) {
                    return "<li style='background-color:" + item.backColor + '; color:' + item.fontColor + '; border-color:' + item.borderColor + "'><p ondblclick='javascript:ClientUI.Tagging.ViewModels.TaggingViewModel.openTagRecord(&quot;" + item.id + '&quot;,&quot;' + this.oDataEscape(encodeURIComponent(this.htmlEncode(item.name))) + "&quot;,&quot;xrmc_tag&quot;);'>" + item.name + '</p></li>';
                }
                else {
                    return "<li><p ondblclick='javascript:ClientUI.Tagging.ViewModels.TaggingViewModel.openTagRecord(&quot;" + item.id + '&quot;,&quot;' + this.oDataEscape(encodeURIComponent(this.htmlEncode(item.name))) + "&quot;,&quot;xrmc_tag&quot;);'>" + item.name + '</p></li>';
                }
            }
            return '<li><p>...</p></li>';
        });
        ti.onAdd = ss.Delegate.create(this, function(item) {
            var tagName = this.prettyTag(item.name);
            item.saveName = tagName;
            item.name = this.htmlEncode(tagName);
            if (this.settings.multitag) {
                ClientUI.Tagging.ViewModels.TaggingViewModel.newTags.push(item.name);
                return;
            }
            ClientUI.Tagging.ViewModels.TaggingViewModel.runningList.push(item);
            if ($("input[value='" + item.saveName + "']").length > 0) {
                $("input[value='" + item.saveName + "']").attr('checked', 'true');
            }
            else {
            }
            var startTime = this.getTimerValue();
            this.displayLoader();
            var itemName = item.name;
            var saveName = item.saveName;
            window.setTimeout(ss.Delegate.create(this, function() {
                var entityName = Xrm.Page.data.entity.getEntityName();
                var entityId = Xrm.Page.data.entity.getId();
                this.createTag(itemName, saveName, entityId, '', entityName, startTime, null);
            }), 0);
        });
        ti.onDelete = ss.Delegate.create(this, function(item) {
            if (this.settings.multitag) {
                return;
            }
            ClientUI.Tagging.ViewModels.TaggingViewModel.runningList = ClientUI.Tagging.ViewModels.TaggingViewModel.runningList.filter(function(el) {
                return el.name !== item.name;
            });
            this.displayLoader();
            try {
                this.deleteTagConnection(item.id);
                $("input[value='" + this.prettyTag(item.name) + "']").attr('checked', 'false').removeAttr('checked');
            }
            catch ($e1) {
                $(ClientUI.Tagging.ViewModels.TaggingViewModel.td).data('tokenInputObject').add(item, nocallback = true);
            }
            this.hideLoader();
        });
        var jq = $(ClientUI.Tagging.ViewModels.TaggingViewModel.td);
        jq.tokenInput(this.allowedTagList, ti);
        this.hideLoader();
        done();
    },
    
    tagAllowed: function ClientUI_Tagging_ViewModels_TaggingViewModel$tagAllowed(tag) {
        if (this.settings.parents != null && this.settings.parents.length > 0) {
            if (this.settings.allowParentSelection) {
                for (var i = 0; i < this.settings.parents.length; i++) {
                    if (this.settings.parents[i].name === tag.getAttributeValueString('xrmc_name')) {
                        return true;
                    }
                }
            }
            for (var k = 0; k < this.settings.parents.length; k++) {
                if (tag.getAttributeValueEntityReference('xrmc_Parent') != null) {
                    if (this.settings.parents[k].name === tag.getAttributeValueEntityReference('xrmc_Parent').name) {
                        return true;
                    }
                    var ptag = null;
                    this.getTagByName(tag.getAttributeValueEntityReference('xrmc_Parent').name).then(function(foundTag) {
                        ptag = foundTag;
                        return Promise.resolve(foundTag);
                    });
                    if (ptag != null && this.tagAllowed(ptag)) {
                        return true;
                    }
                }
            }
            return false;
        }
        if (this.settings.excludeParents != null && this.settings.excludeParents.length > 0) {
            for (var i = 0; i < this.settings.excludeParents.length; i++) {
                if (this.settings.excludeParents[i].name === tag.getAttributeValueString('xrmc_name')) {
                    return false;
                }
            }
            for (var k = 0; k < this.settings.excludeParents.length; k++) {
                if (tag.getAttributeValueEntityReference('xrmc_Parent') != null) {
                    if (this.settings.excludeParents[k].name === tag.getAttributeValueEntityReference('xrmc_Parent').name) {
                        return false;
                    }
                    var ptag = null;
                    this.getTagByName(tag.getAttributeValueEntityReference('xrmc_Parent').name).then(function(foundTag) {
                        ptag = foundTag;
                        return Promise.resolve(foundTag);
                    });
                    if (ptag != null && !this.tagAllowed(ptag)) {
                        return false;
                    }
                }
            }
        }
        return true;
    },
    
    createTag: function ClientUI_Tagging_ViewModels_TaggingViewModel$createTag(tagName, saveName, recordId, recordName, entityName, startTime, done) {
        this.getTagConnectionCount(ss.Delegate.create(this, function(result) {
            if (result) {
                this.showMessage(ResourceStrings.exceededLimit);
                this.hideLoader();
                if (done != null) {
                    done();
                }
                return;
            }
            this.getTagByName(tagName).then(ss.Delegate.create(this, function(tag) {
                if (tag != null) {
                    if (!this.tagAllowed(tag)) {
                        this.deleteTag(tagName);
                        if (done != null) {
                            done();
                        }
                        return Promise.resolve(null);
                    }
                    this.createTagConnection(recordId, recordName, entityName, tag.getAttributeValue('xrmc_tagid').toString(), tagName, startTime, done);
                }
                else {
                    tag = new SparkleXrm.Sdk.Entity('xrmc_tag');
                    tag.setAttributeValue('xrmc_name', saveName);
                    if (this.settings.parents != null && this.settings.parents.length > 0) {
                        tag.setAttributeValue('xrmc_Parent', new SparkleXrm.Sdk.EntityReference(new SparkleXrm.Sdk.Guid(this.settings.parents[0].id), 'xrmc_tag', this.settings.parents[0].name));
                    }
                    SparkleXrm.Sdk.OrganizationServiceProxy.beginCreate(tag, ss.Delegate.create(this, function(state) {
                        var tagId = SparkleXrm.Sdk.OrganizationServiceProxy.endCreate(state);
                        this.createTagConnection(recordId, recordName, entityName, tagId.toString(), tagName, startTime, done);
                        if (!this.settings.multitag && !this.settings.disableListSelection) {
                            var listTag = {};
                            listTag.taglabel = tagName;
                            listTag.tagname = tagName;
                            listTag.tagcheck = tagName;
                            listTag.tagvalue = tagName;
                            this.tagList.add(listTag);
                            this.tagList.sort('tagname', { order: 'asc' });
                            var checkbox = $("input[value='" + tagName + "']");
                            checkbox.attr('checked', 'true');
                        }
                    }));
                }
                return Promise.resolve(tag);
            }));
        }));
    },
    
    createTagConnection: function ClientUI_Tagging_ViewModels_TaggingViewModel$createTagConnection(recordId, recordName, entityName, tagId, tagName, startTime, done) {
        if (this.connectionExists(recordId, entityName, tagId)) {
            if (this.settings.multitag) {
                if (done != null) {
                    done();
                }
                return;
            }
            if (this.getTimerValue() - startTime < 800) {
                window.setTimeout(ss.Delegate.create(this, this.hideLoader), 800 - (this.getTimerValue() - startTime));
            }
            else {
                this.hideLoader();
            }
            if (done != null) {
                done();
            }
            return;
        }
        this.retainFocus = true;
        var connection = new SparkleXrm.Sdk.Entity('connection');
        connection.setAttributeValue('record2id', new SparkleXrm.Sdk.EntityReference(new SparkleXrm.Sdk.Guid(recordId), entityName, recordName));
        connection.setAttributeValue('record1id', new SparkleXrm.Sdk.EntityReference(new SparkleXrm.Sdk.Guid(tagId), 'xrmc_tag', tagName));
        connection.setAttributeValue('record1roleid', new SparkleXrm.Sdk.EntityReference(new SparkleXrm.Sdk.Guid('A6594384-3BD4-E211-8A32-3C4A92DBDC51'), 'connectionrole', 'Tag'));
        if (this.settings.multitag) {
            SparkleXrm.Sdk.OrganizationServiceProxy.beginCreate(connection, function(state) {
                SparkleXrm.Sdk.OrganizationServiceProxy.endCreate(state);
                if (done != null) {
                    done();
                }
            });
        }
        else {
            SparkleXrm.Sdk.OrganizationServiceProxy.beginCreate(connection, ss.Delegate.create(this, function(state) {
                var id = SparkleXrm.Sdk.OrganizationServiceProxy.endCreate(state);
                var newTagIds = id + ':' + tagId;
                this.updateTagId(tagName, newTagIds);
                if (this.getTimerValue() - startTime < 800) {
                    window.setTimeout(ss.Delegate.create(this, this.hideLoader), 800 - (this.getTimerValue() - startTime));
                }
                else {
                    this.hideLoader();
                }
                if (done != null) {
                    done();
                }
            }));
        }
    },
    
    updateTagId: function ClientUI_Tagging_ViewModels_TaggingViewModel$updateTagId(tagName, newTagIds) {
        var jo = $(ClientUI.Tagging.ViewModels.TaggingViewModel.td).data('tokenInputObject');
        var dataupdate = jo.getTokens();
        var lim = dataupdate.length;
        for (var i = 0; i < lim; i++) {
            if ((dataupdate[i].name || '').toLowerCase() === (tagName || '').toLowerCase()) {
                dataupdate[i].id = newTagIds;
                break;
            }
        }
    },
    
    connectionExists: function ClientUI_Tagging_ViewModels_TaggingViewModel$connectionExists(recordId, entityName, tagId) {
        var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" + "<entity name='connection'>" + "<attribute name='record2id' />" + "<attribute name='record2roleid' />" + "<attribute name='connectionid' />" + "<order attribute='record2id' descending='false' />" + "<filter type='and'>" + "<condition attribute='record2id' operator='eq' uitype='" + entityName + "' value='" + recordId + "' />" + "<condition attribute='record1id' operator='eq' uitype='xrmc_tag' value='" + tagId + "' />" + '</filter>' + '</entity>' + '</fetch>';
        var connections = SparkleXrm.Sdk.OrganizationServiceProxy.retrieveMultiple(fetchXml);
        var entities = connections.entities._internalArray;
        if (entities.length > 0) {
            return entities[0].id;
        }
        return false;
    },
    
    deleteTag: function ClientUI_Tagging_ViewModels_TaggingViewModel$deleteTag(tagName) {
        var jo = $(ClientUI.Tagging.ViewModels.TaggingViewModel.td).data('tokenInputObject');
        var dataupdate = jo.getTokens();
        var lim = dataupdate.length;
        for (var i = 0; i < lim; i++) {
            if ((dataupdate[i].name || '').toLowerCase() === (tagName || '').toLowerCase()) {
                jo.remove(dataupdate[i]);
                break;
            }
        }
    },
    
    deleteTagConnection: function ClientUI_Tagging_ViewModels_TaggingViewModel$deleteTagConnection(connectionAndTagId) {
        if (!String.isNullOrEmpty(connectionAndTagId)) {
            var split = connectionAndTagId.split(':');
            var connectionId = split[0];
            SparkleXrm.Sdk.OrganizationServiceProxy.beginDelete('connection', new SparkleXrm.Sdk.Guid(connectionId), function(state) {
                SparkleXrm.Sdk.OrganizationServiceProxy.endDelete(state);
            });
        }
    },
    
    prettyTag: function ClientUI_Tagging_ViewModels_TaggingViewModel$prettyTag(rawtag) {
        return $('<div/>').html(rawtag).text();
    },
    
    htmlEncode: function ClientUI_Tagging_ViewModels_TaggingViewModel$htmlEncode(value) {
        return $('<div/>').text(value).html();
    },
    
    oDataEscape: function ClientUI_Tagging_ViewModels_TaggingViewModel$oDataEscape(str) {
        return str.replaceAll("'", '%27%27');
    },
    
    getTimerValue: function ClientUI_Tagging_ViewModels_TaggingViewModel$getTimerValue() {
        return  (performance.now !== undefined ? performance.now() : new Date().getTime());
    },
    
    parseParams: function ClientUI_Tagging_ViewModels_TaggingViewModel$parseParams(callback) {
        var promises = [];
        this.settings.resultsLimit = 5;
        this.settings.minChars = 2;
        var data = ClientUI.Common.DataHelper.getWebResourceData('|');
        if (data['resultslimit'] != null) {
            this.settings.resultsLimit = parseInt(data['resultslimit'], 10);
        }
        if (data['minsearchchars'] != null) {
            this.settings.minChars = parseInt(data['minsearchchars'], 10);
        }
        if (data['parent'] != null) {
            this.settings.parents = [];
            var parents = data['parent'].split(',');
            for (var k = 0; k < parents.length; k++) {
                promises.push(this.getTagByName(parents[k]).then(ss.Delegate.create(this, function(tag) {
                    if (tag != null) {
                        var newTag = new ClientUI.Tagging.Model.TagModel();
                        newTag.id = tag.id;
                        newTag.name = tag.getAttributeValueString('xrmc_name');
                        this.settings.parents.push(newTag);
                        return Promise.resolve(newTag);
                    }
                    return Promise.resolve(null);
                })));
            }
        }
        if (data['excludeparent'] != null) {
            this.settings.excludeParents = [];
            var exparent = data['excludeparent'].split(',');
            for (var k = 0; k < exparent.length; k++) {
                promises.push(this.getTagByName(exparent[k]).then(ss.Delegate.create(this, function(tag) {
                    if (tag != null) {
                        var newTag = new ClientUI.Tagging.Model.TagModel();
                        newTag.id = tag.id;
                        newTag.name = tag.getAttributeValueString('xrmc_name');
                        this.settings.excludeParents.push(newTag);
                        return Promise.resolve(newTag);
                    }
                    return Promise.resolve(null);
                })));
            }
        }
        if (data['allowparentselection'] != null) {
            this.settings.allowParentSelection = this._parseBool$1(data['allowparentselection']);
        }
        if (data['existingtagsonly'] != null) {
            this.settings.existingTagsOnly = this._parseBool$1(data['existingtagsonly']);
        }
        if (data['disablelistselection'] != null) {
            this.settings.disableListSelection = this._parseBool$1(data['disablelistselection']);
        }
        Promise.all(promises).then(callback);
    },
    
    _parseBool$1: function ClientUI_Tagging_ViewModels_TaggingViewModel$_parseBool$1(s) {
        var ls = s.toLowerCase();
        if (ls === 'yes' || ls === 'true' || ls === '1') {
            return true;
        }
        return false;
    },
    
    addTag: function ClientUI_Tagging_ViewModels_TaggingViewModel$addTag(tag, loader) {
        this.loader = loader;
        var tagsFound = $.grep(this.allowedTagList, ss.Delegate.create(this, function(e, index) {
            return this.prettyTag((e).name) === this.prettyTag(tag);
        }));
        if (tagsFound.length > 0) {
            var td = $(ClientUI.Tagging.ViewModels.TaggingViewModel.td);
            td.tokenInput('add', tagsFound[0]);
        }
    },
    
    removeTag: function ClientUI_Tagging_ViewModels_TaggingViewModel$removeTag(tag, loader) {
        this.loader = loader;
        $("#xrmc-tags").tokenInput("remove", { name:tag });
    },
    
    save: function ClientUI_Tagging_ViewModels_TaggingViewModel$save(deleteFlag) {
        $('#processingBlanket').show();
        $('#progressbar').width($(window).width() - 30);
        $('#progressbar').show();
        this.updateList = [];
        this.updateItem = 0;
        for (var t = 0; t < ClientUI.Tagging.ViewModels.TaggingViewModel.newTags.length; t++) {
            for (var i = 0; i < ClientUI.Tagging.ViewModels.TaggingViewModel.selectedIds.length; i++) {
                var updateTag = new ClientUI.Tagging.Model.MultiTagModel();
                updateTag.tag = ClientUI.Tagging.ViewModels.TaggingViewModel.newTags[t];
                updateTag.Id = ClientUI.Tagging.ViewModels.TaggingViewModel.selectedIds[i];
                this.updateList.push(updateTag);
            }
        }
        this.updateTotal = this.updateList.length;
        this.multiDelete = deleteFlag;
        window.setTimeout(ss.Delegate.create(this, this.recursiveSave), 1);
    },
    
    recursiveSave: function ClientUI_Tagging_ViewModels_TaggingViewModel$recursiveSave() {
        var item = this.updateItem;
        var total = this.updateTotal;
        var current = this.updateList[item];
        if (current == null) {
            window.open('', '_parent', '').close();
            return;
        }
        if (this.multiDelete) {
            this.deleteTagExt(current.Id, this.typeName, current.tag, ss.Delegate.create(this, function() {
                var element = $('#progressbar');
                var p = {};
                p.value = item * 100 / total;
                element.progressbar(p);
                if (item < total) {
                    this.updateItem = item + 1;
                    window.setTimeout(ss.Delegate.create(this, this.recursiveSave), 1);
                }
                else {
                    window.open('', '_parent', '').close();
                }
            }));
        }
        else {
            this.createTag(current.tag, current.tag, current.Id, '', this.typeName, this.getTimerValue(), ss.Delegate.create(this, function() {
                var element = $('#progressbar');
                var p = {};
                p.value = item * 100 / total;
                element.progressbar(p);
                if (item < total) {
                    this.updateItem = item + 1;
                    window.setTimeout(ss.Delegate.create(this, this.recursiveSave), 1);
                }
                else {
                    window.open('', '_parent', '').close();
                }
            }));
        }
    },
    
    deleteTagExt: function ClientUI_Tagging_ViewModels_TaggingViewModel$deleteTagExt(entityId, entityName, tagName, done) {
        this.getTagByName(tagName).then(ss.Delegate.create(this, function(tag) {
            var connectionId = this.connectionExists(entityId, entityName, tag.id);
            if (connectionId != null) {
                SparkleXrm.Sdk.OrganizationServiceProxy.beginDelete('connection', new SparkleXrm.Sdk.Guid(connectionId), function(state) {
                    SparkleXrm.Sdk.OrganizationServiceProxy.endDelete(state);
                    if (done != null) {
                        done();
                    }
                });
            }
            else {
                if (done != null) {
                    done();
                }
            }
            return Promise.resolve(tag);
        }));
    }
}


Type.registerNamespace('ClientUI.Tagging.Views');

////////////////////////////////////////////////////////////////////////////////
// ClientUI.Tagging.Views.TagCloudView

ClientUI.Tagging.Views.TagCloudView = function ClientUI_Tagging_Views_TagCloudView() {
    ClientUI.Tagging.Views.TagCloudView.initializeBase(this);
}
ClientUI.Tagging.Views.TagCloudView.init = function ClientUI_Tagging_Views_TagCloudView$init() {
    if (typeof Build !== 'undefined' && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {if (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) { WebView.setWebContentsDebuggingEnabled(true); }};
    SparkleXrm.Xrm.PageEx.majorVersion = 2013;
    $(function() {
        ClientUI.Tagging.Views.TagCloudView.vm = new ClientUI.Tagging.ViewModels.TaggingViewModel();
        SparkleXrm.ViewBase.sparkleXrmTemplatePath = 'sparkle.form.templates.htm';
        SparkleXrm.ViewBase.registerViewModel(ClientUI.Tagging.Views.TagCloudView.vm);
        ClientUI.Tagging.Views.TagCloudView.vm.initTagCloud();
    });
}


////////////////////////////////////////////////////////////////////////////////
// ClientUI.Tagging.Views.MultiTagView

ClientUI.Tagging.Views.MultiTagView = function ClientUI_Tagging_Views_MultiTagView() {
    ClientUI.Tagging.Views.MultiTagView.initializeBase(this);
}
ClientUI.Tagging.Views.MultiTagView.initMultiTag = function ClientUI_Tagging_Views_MultiTagView$initMultiTag() {
    if (typeof Build !== 'undefined' && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {if (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) { WebView.setWebContentsDebuggingEnabled(true); }};
    SparkleXrm.Xrm.PageEx.majorVersion = 2013;
    var data = ClientUI.Common.DataHelper.getWebResourceData('|');
    var selectedType = data['t'];
    ClientUI.Tagging.ViewModels.TaggingViewModel.selectedIds = data['e'].split(',');
    ClientUI.Tagging.Views.MultiTagView.vm = new ClientUI.Tagging.ViewModels.TaggingViewModel();
    SparkleXrm.ViewBase.sparkleXrmTemplatePath = 'sparkle.form.templates.htm';
    SparkleXrm.ViewBase.registerViewModel(ClientUI.Tagging.Views.MultiTagView.vm);
    ClientUI.Tagging.Views.MultiTagView.vm.typeName = selectedType;
    ClientUI.Tagging.Views.MultiTagView.vm.settings.multitag = true;
    ClientUI.Tagging.Views.MultiTagView.vm.retainFocus = true;
    ClientUI.Tagging.Views.MultiTagView.vm.init(ClientUI.Tagging.Views.MultiTagView.initComplete);
}
ClientUI.Tagging.Views.MultiTagView.saveAll = function ClientUI_Tagging_Views_MultiTagView$saveAll() {
    $('#saveTags').attr('disabled', true);
    $('#deleteTags').attr('disabled', true);
    ClientUI.Tagging.Views.MultiTagView.vm.save(false);
}
ClientUI.Tagging.Views.MultiTagView.deleteAll = function ClientUI_Tagging_Views_MultiTagView$deleteAll() {
    $('#saveTags').attr('disabled', true);
    $('#deleteTags').attr('disabled', true);
    ClientUI.Tagging.Views.MultiTagView.vm.save(true);
}
ClientUI.Tagging.Views.MultiTagView.initComplete = function ClientUI_Tagging_Views_MultiTagView$initComplete() {
    $('#progresscurtain').hide();
    $('.save-button').on('click', function(e) {
        ClientUI.Tagging.Views.MultiTagView.saveAll();
    });
    $('.delete-button').on('click', function(e) {
        ClientUI.Tagging.Views.MultiTagView.deleteAll();
    });
}


////////////////////////////////////////////////////////////////////////////////
// ClientUI.Tagging.Views.TaggingView

ClientUI.Tagging.Views.TaggingView = function ClientUI_Tagging_Views_TaggingView() {
    ClientUI.Tagging.Views.TaggingView.initializeBase(this);
}
ClientUI.Tagging.Views.TaggingView.init = function ClientUI_Tagging_Views_TaggingView$init() {
    if (typeof Build !== 'undefined' && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {if (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) { WebView.setWebContentsDebuggingEnabled(true); }};
    SparkleXrm.Xrm.PageEx.majorVersion = 2013;
    $(window).resize(function(e) {
        ClientUI.Tagging.Views.TaggingView.setHeights(null);
    });
    $(function() {
        ClientUI.Tagging.Views.TaggingView.vm = new ClientUI.Tagging.ViewModels.TaggingViewModel();
        SparkleXrm.ViewBase.sparkleXrmTemplatePath = 'sparkle.form.templates.htm';
        SparkleXrm.ViewBase.registerViewModel(ClientUI.Tagging.Views.TaggingView.vm);
        ClientUI.Tagging.Views.TaggingView.vm.tagList = new List('selectTags', { valueNames: ['tagname', 'taglabel', {name: 'taglabel', attr: 'for'}, {name: 'tagcheck', attr: 'id'}, {name: 'tagvalue', attr: 'value'} ], item: '<li><p class="tagname" style="display:none;"></p><input class="tagcheck tagvalue" id="" value="" type="checkbox" style="cursor: pointer;"><label  class="taglabel" for=""></label></li>' });
        ClientUI.Tagging.Views.TaggingView.vm.init(ClientUI.Tagging.Views.TaggingView.initComplete);
    });
}
ClientUI.Tagging.Views.TaggingView.initComplete = function ClientUI_Tagging_Views_TaggingView$initComplete() {
    $('#xrmc-tags').hide();
    $('#selectTagsToggle').hide();
    $('#selectTagsToggle').mousedown(function() {
        document.activeElement.blur();
        $('#taggingcontent').hide();
        $('#selectTags').show();
        ClientUI.Tagging.Views.TaggingView.setHeights(ClientUI.Tagging.Views.TaggingView.visibleListHeight());
    });
    $('#selectTagsHide').click(function() {
        $('#selectTags').hide();
        $('#taggingcontent').show();
        $('#searchTags').val('');
        ClientUI.Tagging.Views.TaggingView.setHeights(0);
        ClientUI.Tagging.Views.TaggingView.vm.tagList.search();
        document.activeElement.blur();
    });
    ClientUI.Tagging.Views.TaggingView.vm.tagList.sort('tagname', { order: 'asc' });
    ClientUI.Tagging.Views.TaggingView.setHeights(null);
    if (!ClientUI.Tagging.Views.TaggingView.vm.settings.disableListSelection) {
        $('#token-input-xrmc-tags').on('focus', function(e) {
            $('#selectTagsToggle').show();
        });
        $('#token-input-xrmc-tags').on('blur', function(e) {
            $('#selectTagsToggle').hide();
        });
        $('#token-input-xrmc-tags').on('keypress', function(e) {
            $('#selectTagsToggle').hide();
        });
    }
    $('#saveTags').click(function(e) {
        $('#searchTags').val('');
        ClientUI.Tagging.Views.TaggingView.vm.tagList.search();
        var selectedList = [];
        $('#selectTags [type=checkbox]:checked').each(function(index, element) {
            var tag = new ClientUI.Tagging.Model.TagModel();
            tag.name = $(this).val();
            selectedList.push(tag);
        });
        var tagged = selectedList.filter(ClientUI.Tagging.Views.TaggingView.comparer(ClientUI.Tagging.ViewModels.TaggingViewModel.runningList));
        for (var i = 0; i < tagged.length; i++) {
            ClientUI.Tagging.Views.TaggingView.vm.addTag(tagged[i].name, 'fullloader');
        }
        var untagged = ClientUI.Tagging.ViewModels.TaggingViewModel.runningList.filter(ClientUI.Tagging.Views.TaggingView.comparer(selectedList));
        for (var i = 0; i < untagged.length; i++) {
            ClientUI.Tagging.Views.TaggingView.vm.removeTag(untagged[i].name, 'fullloader');
        }
        $('#selectTags').hide();
        $('#taggingcontent').show();
        document.activeElement.blur();
        ClientUI.Tagging.Views.TaggingView.setHeights(0);
    });
    $('.sort').click(function(e) {
        if (ClientUI.Tagging.Views.TaggingView.sortA === 1) {
            $(this).text('Sort \u2191');
            ClientUI.Tagging.Views.TaggingView.sortA = 0;
        }
        else {
            $(this).text('Sort \u2193');
            ClientUI.Tagging.Views.TaggingView.sortA = 1;
        }
    });
}
ClientUI.Tagging.Views.TaggingView.comparer = function ClientUI_Tagging_Views_TaggingView$comparer(otherArray) {
    return function(current) {
        return !otherArray.filter(function(other) {
            return ClientUI.Tagging.Views.TaggingView.vm.prettyTag(other.name) === ClientUI.Tagging.Views.TaggingView.vm.prettyTag(current.name);
        }).length;
    };
}
ClientUI.Tagging.Views.TaggingView.compareItems = function ClientUI_Tagging_Views_TaggingView$compareItems(current, otherArray) {
    return !otherArray.filter(function(other) {
        return ClientUI.Tagging.Views.TaggingView.vm.prettyTag(other.name) === ClientUI.Tagging.Views.TaggingView.vm.prettyTag(current.name);
    }).length;
}
ClientUI.Tagging.Views.TaggingView.visibleListHeight = function ClientUI_Tagging_Views_TaggingView$visibleListHeight() {
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    if (isEdge) {
        return document.body.scrollHeight;
    }
    return $(document).height();
}
ClientUI.Tagging.Views.TaggingView.setHeights = function ClientUI_Tagging_Views_TaggingView$setHeights(h) {
    var currentListHeight = 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';
    if (h != null) {
        currentListHeight = h;
    }
    $('#selectTags').height(currentListHeight);
    $('#selectTagContent').height(currentListHeight);
    if (isFirefox) {
        $('.list').height($('#selectTags').height() - 62);
    }
    else {
        $('.list').height($('#selectTags').height() - 59);
    }
}


Type.registerNamespace('ClientUI');

////////////////////////////////////////////////////////////////////////////////
// ResourceStrings

ResourceStrings = function ResourceStrings() {
}


ClientUI.Common.DataHelper.registerClass('ClientUI.Common.DataHelper');
ClientUI.Common.ListExtension.registerClass('ClientUI.Common.ListExtension');
ClientUI.Common.Security.registerClass('ClientUI.Common.Security');
ClientUI.Tagging.Model.MultiTagModel.registerClass('ClientUI.Tagging.Model.MultiTagModel');
ClientUI.Tagging.Model.TagModel.registerClass('ClientUI.Tagging.Model.TagModel');
ClientUI.Model.WebResourceSettings.registerClass('ClientUI.Model.WebResourceSettings');
ClientUI.Tagging.ViewModels.TaggingViewModel.registerClass('ClientUI.Tagging.ViewModels.TaggingViewModel', SparkleXrm.ViewModelBase);
ClientUI.Tagging.Views.TagCloudView.registerClass('ClientUI.Tagging.Views.TagCloudView', SparkleXrm.ViewBase);
ClientUI.Tagging.Views.MultiTagView.registerClass('ClientUI.Tagging.Views.MultiTagView', SparkleXrm.ViewBase);
ClientUI.Tagging.Views.TaggingView.registerClass('ClientUI.Tagging.Views.TaggingView', SparkleXrm.ViewBase);
ResourceStrings.registerClass('ResourceStrings');
ClientUI.Tagging.ViewModels.TaggingViewModel.td = '#xrmc-tags';
ClientUI.Tagging.ViewModels.TaggingViewModel.md = '#tagMessage';
ClientUI.Tagging.ViewModels.TaggingViewModel.allTags = [];
ClientUI.Tagging.ViewModels.TaggingViewModel.newTags = [];
ClientUI.Tagging.ViewModels.TaggingViewModel.runningList = [];
ClientUI.Tagging.ViewModels.TaggingViewModel.selectedIds = null;
ClientUI.Tagging.Views.TagCloudView.vm = null;
ClientUI.Tagging.Views.MultiTagView.vm = null;
ClientUI.Tagging.Views.TaggingView.vm = null;
ClientUI.Tagging.Views.TaggingView.sortA = 0;
ResourceStrings.notAuthorised = "<span></span><div id='notAuthorised'>You do not have the correct permissions to use Tagging. Please contact your system administrator.</div>";
ResourceStrings.onCreate = "<span></span><div id='onCreate'>Tagging is only available once a record has been saved.</div>";
ResourceStrings.exceededLimit = "<span></span><div id='exceededLimit'>Your system has exceeded the Tag connection limit. Please contact xRM Consultancy (<a href='mailto:sales@xrmconsultancy.com'>sales@xrmconsultancy.com</a>) to purchase a license key.</div>";
ResourceStrings.offline = "<span></span><div id='onCreate'>Tagging is not available when offline.</div>";
ResourceStrings.multiTagNotAllowed = "<span></span><div id='notAuthorised'>Unfortunately you are not allowed to create or associate tags. Please contact your system administrator.</div>";
})(window.xrmjQuery);


