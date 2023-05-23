
//If the SDK namespace object is not defined, create it.
if (typeof (XRMC) == "undefined")
{ XRMC = {}; }
// Create Namespace container for functions in this library;
XRMC.tagging = {};

jQuery.noConflict();
(function ($) {

XRMC.tagging.retainFocus = false;
XRMC.tagging.multitag = false;
XRMC.tagging.newtags = [];
XRMC.tagging.multidelete = false;
XRMC.tagging.waitforsave = false;

XRMC.tagging.buildTagCloud = function() {

    var fetchXml =
        '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">' +
            '<entity name="xrmc_tag">' +
            '<attribute name="xrmc_tagid" />' +
            '<attribute name="xrmc_name" />' +
            '<attribute name="createdon" />' +
            '<attribute name="xrmc_parent" />' +
            '<attribute name="xrmc_tagcount" />' +
            '<order attribute="xrmc_tagcount" descending="true" />' +
            '<filter type="and">' +
            '<condition attribute="statecode" operator="eq" value="0" />' +
            '<condition attribute="xrmc_tagcount" operator="gt" value="0" />' +
            '</filter>' +
            '</entity>' +
            '</fetch>';


    var encodedFetchXML = encodeURIComponent(fetchXml);

    var req = new XMLHttpRequest();
    req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/xrmc_tags?fetchXml=" + encodedFetchXML, true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"OData.Community.Display.V1.FormattedValue\"");
    req.onreadystatechange = function() {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {

                var results = JSON.parse(this.response);
                //XRMC.tagging.allTags = XrmServiceToolkit.Soap.Fetch(fetchXml);
                XRMC.tagging.allTags = results.value;
                WebResource.ParseParams();

                var allowedTags = [];
                for (var i = 0; i < XRMC.tagging.allTags.length; i++) {
                    if (tagAllowed(XRMC.tagging.allTags[i])) {
                        allowedTags.push(XRMC.tagging.allTags[i]);
                    }
                }

                allowedTags.sort(sort_by('xrmc_tagcount', false));
                XRMC.tagging.allTags = allowedTags.slice(0, 29);

                XRMC.tagging.allTags.sort(sort_by('xrmc_name', true, function (a) { return a.toUpperCase(); }));
                var items = [];
                jQuery.each(XRMC.tagging.allTags, function (i, item) {
                    var spacer;
                    if (i < XRMC.tagging.allTags.length - 1) {
                        spacer = ", ";
                    }
                    else {
                        spacer = "";
                    }
                    items.push('<a href="javascript:XRMC.tagging.openTagRecord(&quot;undefined:' + item.xrmc_tagid + '&quot;,&quot;' + oDataEscape(encodeURIComponent(htmlEncode(item.xrmc_name))) + '&quot;,&quot;xrmc_tag&quot;);" rel="' + item.xrmc_tagcount + '">' + item.xrmc_name + '</a>' + spacer);
                });  // close each()
                jQuery('#xrmc-tagCloud').append(items.join(''));
                jQuery.fn.tagcloud.defaults = {
                    size: { start: 14, end: 22, unit: 'pt' },
                    color: { start: '#00188f', end: '#f60' }
                };

                jQuery(function () {
                    jQuery('#xrmc-tagCloud a').tagcloud();
                });

            }
        }
    }
    req.send();
};

var sort_by = function (field, reverse, primer) {

    var key = function (x) { return primer ? primer(x[field]) : x[field]; };

    return function (a, b) {
        var a1 = key(a), b1 = key(b);
        return ((a1 < b1) ? -1 : (a1 > b1) ? +1 : 0) * [-1, 1][+!!reverse];
    };
};

XRMC.tagging.init = function (td, md) {
    if (XRMC.tagging.taglist && !XRMC.tagging.waitforsave) {
        // prevent double initialization
        return;
    }
    XRMC.tagging.waitforsave = false;
    initTagging();
    if (window.parent.Xrm.Page.data == null || typeof window.parent.Xrm.Page.data == "undefined") {
		if (!XRMC.tagging.multitag) {
			hideLoader();
			return;
		}
    }
    var notAuthorised = '<span></span><div id="notAuthorised">You do not have the correct permissions to use Tagging. Please contact your system administrator.</div>';
    var onCreate = '<span></span><div id="onCreate">Tagging is only available once a record has been saved.</div>';
    var exceededLimit = '<span></span><div id="exceededLimit">Your system has exceeded the Tag connection limit. Please contact xRM Consultancy (<a href="mailto:sales@xrmconsultancy.com">sales@xrmconsultancy.com</a>) to purchase a license key.</div>';
    var offline = '<span></span><div id="onCreate">Tagging is not available when offline.</div>';
    var multiTagNotAllowed = '<span></span><div id="notAuthorised">Unfortunately you are not allowed to create or associate tags. Please contact your system administrator.</div>';
    if (isOffline()) {
        $(md).show().html(offline);
    }
    else if (getTagConnectionCount()) {
        $(md).show().html(exceededLimit);
    }
    else {
        if (XRMC.tagging.multitag || window.parent.Xrm.Page.data.entity.getId()) {
            if (!XRMC.tagging.multitag) {
                $("#selectTagsToggle").show();
            }
            var isTagWriter = XrmServiceToolkit.Soap.IsCurrentUserRole("Tag Writer");
            var isTagAssociator = XrmServiceToolkit.Soap.IsCurrentUserRole("Tag Associator");
            var isTagReader = XrmServiceToolkit.Soap.IsCurrentUserRole("Tag Reader");
            //Tag Writer - User Can Create Tags and Create and Delete Tag Connections
            if (isTagWriter && !WebResource.settings.existingTagsOnly) {
                $(md).hide();
                receivedTagList(XRMC.tagging.taglist, "&times;", true, false);
            }
            //Tag Associator - User Can Read Tags and Create and Delete Tag Connections
            else if (isTagAssociator || isTagWriter) {
                $(md).hide();
				if (XRMC.tagging.multitag) $(".instructions").text("Enter text below to search for existing tags")
                receivedTagList(XRMC.tagging.taglist, "&times;", false, false);
            }
            //Tag Reader - User Can Read Tags but not Create and Delete Tag Connections
            else if (isTagReader) {
				if (XRMC.tagging.multitag) {
					$(".instructions").text("")
					$(md).show().html(multiTagNotAllowed);
				} else {
					$(md).hide();
					receivedTagList(XRMC.tagging.taglist, "", false, true);
				}
			}
            //User can't read Tags
            else {
				$(md).show().html(notAuthorised);
            }
        }
        else {
            $(md).show().html(onCreate);
            XRMC.tagging.waitforsave = true;
            waitForAutosave();
        }
    }
    hideLoader();


    XRMC.tagging.addTag = function (tag, loader) {
        XRMC.tagging.loader = loader;
        var tagsFound = $.grep(XRMC.tagging.taglist, function (e) {
            // Backward compatability: To support tags that were originally saved with html encoding (&amp;) decode html strings
            return prettyTag(e.name) == prettyTag(tag);
        });
        if (tagsFound.length > 0) {
            $(td).tokenInput("add", tagsFound[0]);
        }
    }

    XRMC.tagging.deleteTag = function (tag, loader) {
        XRMC.tagging.loader = loader;
        $(td).tokenInput("remove", { name: tag });
    }


    XRMC.tagging.save = function (deleteFlag) {
		$("#progressbar").width($( window ).width() - 30);
		$("#progressbar").show();
		XRMC.tagging.updateList = [];
		XRMC.tagging.updateItem = 0;
		for (var t=0; t<XRMC.tagging.newtags.length; t++) {
			for (var i=0; i<XRMC.tagging.selectedIds.length; i++) {
				XRMC.tagging.updateList.push({"tag": XRMC.tagging.newtags[t], "id": XRMC.tagging.selectedIds[i]});
			}
		}
		XRMC.tagging.updateTotal = XRMC.tagging.updateList.length;
		XRMC.tagging.multidelete = deleteFlag;
		setTimeout(recursiveSave, 1);
	};
	
    function recursiveSave() {
		var item = XRMC.tagging.updateItem;
		var total = XRMC.tagging.updateTotal;
		var current = XRMC.tagging.updateList[item];
		if (!current) {
			window.close();
			return;
		}
		if (XRMC.tagging.multidelete)
		    deleteTagExt(current.id, XRMC.tagging.typeName, current.tag);
		else
		    createTag(current.tag, current.tag, current.id, '', XRMC.tagging.typeName, getTimerValue());
        $("#progressbar").progressbar({
		  value: item * 100 / total
		});
		if (item < total) {
			XRMC.tagging.updateItem = item + 1;
			setTimeout(recursiveSave, 1);
		} else {
			window.close();
		}
	}

    function isOffline() {
        var context = Xrm.Page.context;
        if (context.client && context.client.getClient() == 'Outlook' && context.client.getClientState() == 'Offline') {
            return true;
        } else if (context.isOutlookClient && context.isOutlookClient() && !context.isOutlookOnline()) {
            return true;
        }
        return false;
    }

    function waitForAutosave() {
        if (window.parent.Xrm.Page.data.entity.getId())
            XRMC.tagging.init(td, md);
        else {
            setTimeout(waitForAutosave, 100);
        }
    }

    function getTagConnectionCount() {
        // LICENCEFREE - UNCOMMENT FOR LICENCE FREE VERSION!
        //return false;
        var fetchXml =
            "<fetch  mapping='logical' aggregate='true' >" +
                "<entity name='xrmc_taggingconfiguration'>" +
                    "<attribute name='xrmc_taggingconfigurationid' aggregate='count' alias='count' />" +
                    "<filter type='and'>" +
                        "<condition attribute='xrmc_licensekeystatus' operator='eq' value='922680000' />" +
                    "</filter>" +
                "</entity>" +
            "</fetch>";
        var validConfig = XrmServiceToolkit.Soap.Fetch(fetchXml);
        if (validConfig[0].attributes['count'].formattedValue != 1) {
            fetchXml =
                "<fetch mapping='logical' aggregate='true' >" +
                    "<entity name='connection' >" +
                        "<attribute name='connectionid' aggregate='count' alias='count' />" +
                        "<filter type='and' >" +
                            "<condition attribute='record1roleid' operator='eq' uiname='Tag' uitype='connectionrole' value='{A6594384-3BD4-E211-8A32-3C4A92DBDC51}' />" +
                        "</filter>" +
                    "</entity>" +
                "</fetch>";
            try {
                var tagConnectionCount = XrmServiceToolkit.Soap.Fetch(fetchXml);
                if (tagConnectionCount[0].attributes['count'].formattedValue > 25) {
                    return true;
                }
            } catch(e) {
                return true;
            }
        }
        return false;
    }

    function receivedTagList(taglist, deleteText, freetagging, disable) {
        getPrepopulateTags(receivedPrePopulate, taglist, deleteText, freetagging, disable);
    }

    function receivedPrePopulate(prepopulateList, taglist, deleteText, freetagging, disable) {
        XRMC.tagging.runninglist = prepopulateList;

        for (var i = 0; i < XRMC.tagging.runninglist.length; i++) {
            $("input[value='" + prettyTag(XRMC.tagging.runninglist[i].name) + "']").attr("checked", true);
        }

        $(td).tokenInput(taglist,
            {
                hintText: "Search for existing tag...",
                noResultsText: "No tags found",
                searchingText: "Searching...",
                preventDuplicates: true,
                deleteText: deleteText,
                allowFreeTagging: freetagging,
                allowTabOut: true,
                tokenValue: "name",
                disabled: disable,
                resultsLimit: WebResource.settings.resultsLimit,
                minChars: WebResource.settings.minChars,
                tokenDelimiter: "|",
                prePopulate: prepopulateList,
                tokenFormatter:
                    function (item) {
                        if (item) {
							if (item.backcolor) {
								return "<li style='background-color:" + item.backcolor + "; color:" + item.fontcolor + "; border-color:" + item.bordercolor + "'><p ondblclick='javascript:XRMC.tagging.openTagRecord(&quot;" + item.id + "&quot;,&quot;" + oDataEscape(encodeURIComponent(htmlEncode(item.name))) + "&quot;,&quot;xrmc_tag&quot;);'>" + item.name + "</p></li>";
							} else {
								return "<li><p ondblclick='javascript:XRMC.tagging.openTagRecord(&quot;" + item.id + "&quot;,&quot;" + oDataEscape(encodeURIComponent(htmlEncode(item.name))) + "&quot;,&quot;xrmc_tag&quot;);'>" + item.name + "</p></li>";
							}
						}
						return "<li><p>...</p></li>";
                    },
                onAdd: function (item) {
                    // Backward compatability: To support tags that were originally saved with html encoding (&amp;) decode html strings before re-encoding
                    var tagName = prettyTag(item.name);
                    item.savename = tagName;
                    item.name = htmlEncode(tagName);
                    if (XRMC.tagging.multitag) {
                        XRMC.tagging.newtags.push(item.name);
                        return;
                    }
                    XRMC.tagging.runninglist.push(item);
                    $("input[value='" + item.savename + "']").attr("checked", true);

                    var startTime = getTimerValue();
                    var defer1 = $.when(
                        displayLoader()
                    );

                    defer1.done(function () {
                        var itemName = item.name;
                        var saveName = item.savename;

                        setTimeout(function () {
                            var Xrm = window.parent.Xrm;
                            var entityName = Xrm.Page.data.entity.getEntityName();
                            var entityId = Xrm.Page.data.entity.getId();

                            createTag(itemName, saveName, entityId, '', entityName, startTime);
                        }, 0);
                    });
                },
                onDelete: function (item) {
                    if (XRMC.tagging.multitag) return;
                    XRMC.tagging.runninglist = XRMC.tagging.runninglist.filter(function (el) {
                        return el.name !== item.name;
                    });
                    var defer1 = $.when(
                        displayLoader()
                    );

                    defer1.done(function () {
                        try {
                            deleteTagConnection(item.id);
                            $("input[value='" + prettyTag(item.name) + "']").attr("checked", false);
                        } catch (e) {
                            $(td).data("tokenInputObject").add(item, nocallback = true);
                            alert("Access denied. Please check permissions.");
                        }
                        hideLoader();
                    });
                }
            });
    }

    function getTimerValue() {
        return (performance.now != undefined ? performance.now() : new Date().getTime());
    }

    function initTagging() {
        XRMC.tagging.taglist = [];
        var fetchXml =
            '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">' +
                '<entity name="xrmc_tag">' +
                '<attribute name="xrmc_tagid" />' +
                '<attribute name="xrmc_name" />' +
                '<attribute name="createdon" />' +
                '<attribute name="xrmc_parent" />' +
                '<attribute name="xrmc_tagcount" />' +
                '<attribute name="xrmc_synonyms" />' +
                '<attribute name="xrmc_backcolor" />' +
                '<attribute name="xrmc_fontcolor" />' +
                '<attribute name="xrmc_bordercolor" />' +
                '<order attribute="xrmc_tagcount" descending="true" />' +
                '<filter type="and">' +
                '<condition attribute="statecode" operator="eq" value="0" />' +
                '</filter>' +
                '</entity>' +
                '</fetch>';
        XRMC.tagging.allTags = XrmServiceToolkit.Soap.Fetch(fetchXml);
        
        // Now that we have the tags parse the params for parents etc
        WebResource.ParseParams();
		if (XRMC.tagging.multitag){
            WebResource.settings.resultsLimit = 10;
		}
		
        // And now figure out our allowed list
        for (var e = 0; e < XRMC.tagging.allTags.length; e++) {
            var tag = XRMC.tagging.allTags[e];
            if (tagAllowed(tag)) {
                var json = {};
                json.id = tag.id;
                json.name = tag.attributes['xrmc_name'].value;
                json.synonyms = [];
                if (tag.attributes['xrmc_synonyms']) {
                    if (tag.attributes['xrmc_synonyms'].value.indexOf(',') > -1) {
                        $.each(tag.attributes['xrmc_synonyms'].value.split(','), function () {
                            json.synonyms.push($.trim(this));
                        });
                    } else {
                        json.synonyms = [tag.attributes['xrmc_synonyms'].value.trim()];
                    }
                }
				if (tag.attributes['xrmc_backcolor']) {
					json.backcolor = tag.attributes['xrmc_backcolor'].value;
				}
				if (tag.attributes['xrmc_fontcolor']) {
					json.fontcolor = tag.attributes['xrmc_fontcolor'].value;
				}
				if (tag.attributes['xrmc_bordercolor']) {
					json.bordercolor = tag.attributes['xrmc_bordercolor'].value;
				}
				XRMC.tagging.taglist.push(json);
				if (!XRMC.tagging.multitag && !WebResource.settings.disableListSelection) {
				    $('#selectTags ul').append('<li><p class="taglabel" style="display:none;">' + json.name + '</p><input id="' + json.name + '" type="checkbox" value="' + json.name + '"><label for="' + json.name + '">' + json.name + '</label></li>');
                }
            }
        }
    }

    function getPrepopulateTags(callback, taglist, deleteText, freetagging, disable) {
        if (XRMC.tagging.multitag) {
			callback([], taglist, deleteText, freetagging, disable);
			return;
		}
        XrmServiceToolkit.Rest.RetrieveMultiple(
            "ConnectionSet",
            "$select=ConnectionId,Record1Id&$orderby=Record1Id asc&$filter=Record1RoleId/Id eq guid'A6594384-3BD4-E211-8A32-3C4A92DBDC51' and Record2Id/Id eq guid'" + window.parent.Xrm.Page.data.entity.getId() + "' ",
            function (results) {
                var prepopulateTaglist = [];
                for (var e = 0; e < results.length; e++) {
                    var tag = getTagById(results[e].Record1Id.Id);
                    if (tagAllowed(tag)) {
                        var json = {};
                        json.id = results[e].ConnectionId + ":" + results[e].Record1Id.Id;
                        json.name = results[e].Record1Id.Name;
						if (tag.attributes['xrmc_backcolor']) {
							json.backcolor = tag.attributes['xrmc_backcolor'].value;
						}
						if (tag.attributes['xrmc_fontcolor']) {
							json.fontcolor = tag.attributes['xrmc_fontcolor'].value;
						}
						if (tag.attributes['xrmc_bordercolor']) {
							json.bordercolor = tag.attributes['xrmc_bordercolor'].value;
						}
                        prepopulateTaglist.push(json);
                    }
                }
                callback(prepopulateTaglist, taglist, deleteText, freetagging, disable);
            },
            errorHandler,
            function () {
                //OnComplete handler
            },
            false
          );
    }

    function createTag(tagName, saveName, recordId, recordName, entityName, startTime) {
        // Check tag connection count
        if (getTagConnectionCount()) {
            $('.token-input-list').hide();
            $(md).show().html(exceededLimit);
            hideLoader();
            return;
        }
        //First Check if there is an existing tag in the collection
        var tag = getTagByName(tagName);
        if (tag) {
            // If the tag doesn't have a parent then it is a parent tag. Only allow it if the flag is ticked
            if (!tagAllowed(tag)) {
                deleteTag(tagName);
                return;
            }
            // Existing tag, create the connection to it
            createTagConnection(recordId, recordName, entityName, tag.attributes['xrmc_tagid'].value, tagName, startTime);
        } else {
            // No existing tag, create one before creating a connection to it
            tag = new XrmServiceToolkit.Soap.BusinessEntity("xrmc_tag");
            tag.attributes['xrmc_name'] = saveName;
            if (WebResource.settings.parents && WebResource.settings.parents.length > 0) {
                tag.attributes['xrmc_parent'] = { id: WebResource.settings.parents[0].id, logicalName: 'xrmc_tag', type: 'EntityReference' };
            }
            var tagId = XrmServiceToolkit.Soap.Create(tag);
            createTagConnection(recordId, recordName, entityName, tagId, tagName, startTime);
        }
    }

    // Update the tokenInputObject Id for the new token
    function updateTagId(tagName, newTagIds) {
        var dataupdate = $(td).data("tokenInputObject").getTokens();
        var lim = dataupdate.length;
        for (var i = 0; i < lim; i++) {
            if (dataupdate[i].name.toLowerCase() == tagName.toLowerCase()) {
                dataupdate[i].id = newTagIds;
                break;
            }
        }
    }

    function deleteTag(tagName) {
        var dataupdate = $(td).data("tokenInputObject").getTokens();
        var lim = dataupdate.length;
        for (var i = 0; i < lim; i++) {
            if (dataupdate[i].name.toLowerCase() == tagName.toLowerCase()) {
                //dataupdate.remove(dataupdate[i]);
                $(td).data("tokenInputObject").remove(dataupdate[i]);
                break;
            }
        }
    }

    function createTagConnection(recordId, recordName, entityName, tagId, tagName, startTime) {
        if (connectionExists(recordId, entityName, tagId)) {
            if (XRMC.tagging.multitag) return;
			if (getTimerValue() - startTime < 800) {
                // Let the loader gif animate for at least 1.5 seconds
                setTimeout(hideLoader, 800 - (getTimerValue() - startTime));
            } else {
                hideLoader();
            }
            return;
        }
        XRMC.tagging.retainFocus = true;
        var connection = new XrmServiceToolkit.Soap.BusinessEntity("connection");
        connection.attributes['record2id'] = { id: recordId, logicalName: entityName, type: "EntityReference" };
        connection.attributes['record1id'] = { id: tagId, logicalName: "xrmc_tag", type: "EntityReference" };
        connection.attributes['record1roleid'] = { id: 'A6594384-3BD4-E211-8A32-3C4A92DBDC51', logicalName: "connectionrole", type: "EntityReference" };

        //var connectionId;
		if (XRMC.tagging.multitag) {
			XrmServiceToolkit.Soap.Create(connection);
		} else {
			XrmServiceToolkit.Soap.Create(
				connection,
				function (id) {
					//Combine ConnectionId and Tag Record Id as the token Id
					var newTagIds = id + ":" + tagId;
					updateTagId(tagName, newTagIds);
					//connectionId = id;
					if (getTimerValue() - startTime < 800) {
						// Let the loader gif animate for at least 1.5 seconds
						setTimeout(hideLoader, 800 - (getTimerValue() - startTime));
					} else {
						hideLoader();
					}
				});
		}
    }

    function connectionExists(recordId, entityName, tagId) {
        var fetchXml =
            '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">' +
                '<entity name="connection">' +
                '<attribute name="record2id" />' +
                '<attribute name="record2roleid" />' +
                '<attribute name="connectionid" />' +
                '<order attribute="record2id" descending="false" />' +
                '<filter type="and">' +
                '<condition attribute="record2id" operator="eq" uitype="' + entityName + '" value="' + recordId + '" />' +
                '<condition attribute="record1id" operator="eq" uitype="xrmc_tag" value="' + tagId + '" />' +
                '</filter>' +
                '</entity>' +
                '</fetch>';
        var connections = XrmServiceToolkit.Soap.Fetch(fetchXml);
        if (connections.length > 0) {
            return connections[0].id;
        }
        return false;
    }

    function deleteTagConnection(connectionAndTagId) {

        // Delete the Connection
        if (connectionAndTagId) {
            var split = connectionAndTagId.split(":");
            var connectionId = split[0];
            XrmServiceToolkit.Rest.Delete(
                connectionId,
                "ConnectionSet",
                function() {
                    //alert("The tag was removed.");
                },
                errorHandler,
                false
            );
        }
    }

    function deleteTagExt(entityId, entityName, tagName) {

        // Delete the Connection
        var tag = getTagByName(tagName);
        var connectionId = connectionExists(entityId, entityName, tag.id)
        if (connectionId) {
            XrmServiceToolkit.Rest.Delete(
                connectionId,
                "ConnectionSet",
                function () {
                    //alert("The tag was removed.");
                },
                errorHandler,
                false
            );
        }
    }

    function displayLoader() {
        $(td).blur();
        if (XRMC.tagging.loader === "fullloader") {
            $("#loadingfull").show();
        } else {
            // For some reason the "last" function doesn't work unless we reference jQuery... must be a conflict some place that needs solving
            var li = jQuery("#token-input-xrmc-tags").last();
            $("#loading").css({ top: li.offset().top - 2, left: li.offset().left });
            $("#loading").show();
            $("#loading").css("display", "block");
        }
    }

    function hideLoader() {
        if (XRMC.tagging.loader === "fullloader") {
            $("#loadingfull").hide();
            XRMC.tagging.loader = "";
        } else {
            $("#loading").hide();
            if (XRMC.tagging.retainFocus) {
                $(td).focus();
                XRMC.tagging.retainFocus = false;
            }
        }
    }

};

XRMC.tagging.openTagRecord = function (tokenIds, tagName, entityName) {
    var serverUrl;
    var getCrmUrl = window.parent.Xrm.Page.context.getServerUrl;
    if (!getCrmUrl)
        getCrmUrl = window.parent.Xrm.Page.context.getClientUrl;
    if (getCrmUrl().endsWith("/"))
        serverUrl = getCrmUrl();
    else
        serverUrl = getCrmUrl() + "/";
    //Set features for how the window will appear
    var features = "location=no,menubar=no,status=yes,toolbar=no,resizable=yes";
    var tagId;
    var split = tokenIds.split(":");
    tagId = split[1];
    //Check we have the Tag ID and if not get it
    if (tagId === undefined) {
        // new tag added to token list which doesn't have the tagId in the item.id so need to look for it
        XrmServiceToolkit.Rest.RetrieveMultiple(
            "xrmc_tagSet",
            "$select=xrmc_name,xrmc_tagId&$filter=xrmc_name eq '" + tagName + "'&$top=1",
            function (results) {
                var firstResult = results[0];
                if (firstResult != null) {
                    //Create connection to existing tag
                    tagId = firstResult.xrmc_tagId;
                    //Open the record
                    if (window.parent.Xrm.Utility) {
                        window.parent.Xrm.Utility.openEntityForm("xrmc_tag", encodeURIComponent(tagId));
                    } else {
                        window.open(serverUrl + "main.aspx?etn=" + entityName + "&pagetype=entityrecord&id=" + encodeURIComponent(tagId), "_blank", features, false);
                    }
                } else {
                    //No existing tag
                }
            },
            errorHandler,
            function () {
                //OnComplete handler
            },
            false
        );

    } else {
        //Open the record
        if (window.parent.Xrm.Utility) {
            window.parent.Xrm.Utility.openEntityForm("xrmc_tag", encodeURIComponent(tagId));
        } else {
            window.open(serverUrl + "main.aspx?etn=" + entityName + "&pagetype=entityrecord&id=" + encodeURIComponent(tagId), "_blank", features, false);
        }
    }
};

})(jQuery);

function errorHandler(error) {
    hideLoader();
    alert(error.message);
}

function oDataEscape(str) {
    return String(str)
        .replace(/'/g, '%27%27');
}

function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return jQuery('<div/>').text(value).html();
}

function prettyTag(rawtag) {
    return jQuery('<div/>').html(rawtag).text();
}

function getTagByName(tagName) {
    // Search the cache first...
    for (var i = 0; i < XRMC.tagging.allTags.length; i++) {
        if (XRMC.tagging.allTags[i].attributes['xrmc_name'].value == tagName) {
            return XRMC.tagging.allTags[i];
        }
    }

    // If not in cache retrieve from crm
    var fetchXml = '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">' +
        '  <entity name="xrmc_tag">' +
        '    <attribute name="xrmc_tagid" />' +
        '    <attribute name="xrmc_name" />' +
        '    <attribute name="xrmc_parent" />' +
        '    <filter type="and">' +
        '      <condition attribute="xrmc_name" operator="eq" value="' + tagName + '" />' +
        '    </filter>' +
        '  </entity>' +
        '</fetch>';
    var tags = XrmServiceToolkit.Soap.Fetch(fetchXml);
    if (tags.length > 0) {
        return tags[0];
    }
    return null;
}

function getTagById(id) {
    // Search the cache first...
    for (var i = 0; i < XRMC.tagging.allTags.length; i++) {
        if (XRMC.tagging.allTags[i].id == id) {
            return XRMC.tagging.allTags[i];
        }
    }

    // If not in cache retrieve from crm
    return XrmServiceToolkit.Soap.Retrieve('xrmc_tag', id);
}

function tagAllowed(tag) {
    if (WebResource.settings.parents && WebResource.settings.parents.length > 0) {
        if (WebResource.settings.allowParentSelection) {
            for (var i = 0; i < WebResource.settings.parents.length; i++) {
                if (WebResource.settings.parents[i].name == tag.attributes['xrmc_name'].value) {
                    return true;
                }
            }
        }
        for (var k = 0; k < WebResource.settings.parents.length; k++) {
            if (tag.attributes['xrmc_parent']) {
                if (WebResource.settings.parents[k].name == tag.attributes['xrmc_parent'].name) {
                    return true;
                }
                var ptag = getTagByName(tag.attributes['xrmc_parent'].name);
                if (ptag && tagAllowed(ptag)) {
                    return true;
                }
            }
        }
        return false;
    }
    if (WebResource.settings.excludeparents && WebResource.settings.excludeparents.length > 0) {
        for (i = 0; i < WebResource.settings.excludeparents.length; i++) {
            if (WebResource.settings.excludeparents[i].name == tag.attributes['xrmc_name'].value) {
                return false;
            }
        }
        for (k = 0; k < WebResource.settings.excludeparents.length; k++) {
            if (tag.attributes['xrmc_parent']) {
                if (WebResource.settings.excludeparents[k].name == tag.attributes['xrmc_parent'].name) {
                    return false;
                }
                ptag = getTagByName(tag.attributes['xrmc_parent'].name);
                if (ptag && !tagAllowed(ptag)) {
                    return false;
                }
            }
        }
    }
    return true;
}


var WebResource = {};
WebResource.settings = {};

WebResource.GetDataParams = function () { //Get the any query string parameters and load them  
    //into the vals array  

    var vals = new Array();
    if (location.search !== "") {
        vals = location.search.substr(1).split("&");
        for (var i in vals) {
            vals[i] = vals[i].replace(/\+/g, " ").split("=");
        }

        //look for the parameter named 'data'  
        var found = false;
        var datavals;
        for (var j in vals) {
            if (vals[j][0].toLowerCase() == "data") {
                found = true;
                datavals = decodeURIComponent(vals[j][1]).split("|");
                for (var k in datavals) {
                    datavals[k] = datavals[k].replace(/\+/g, " ").split("=");
                }
                break;
            }
        }
        if (found) { return datavals; }
    }
    return null;
};
WebResource.ParseParams = function () {
    WebResource.settings.resultsLimit = 5;
    WebResource.settings.minChars = 2;
    var data = WebResource.GetDataParams();
    for (var i in data) {
        switch (data[i][0].toLowerCase()) {
            case 'resultslimit':
                WebResource.settings.resultsLimit = parseInt(data[i][1], 10);
                break;
            case 'minsearchchars':
                WebResource.settings.minChars = parseInt(data[i][1], 10);
                break;
            case 'parent':
                WebResource.settings.parents = [];
                var parents = data[i][1].split(",");
                for (var k in parents) {
                    var tag = getTagByName(parents[k]);
                    if (tag)
                        WebResource.settings.parents.push({ id: tag.id, name: tag.attributes['xrmc_name'].value });
                }
                break;
            case 'excludeparent':
                WebResource.settings.excludeparents = [];
                var exparent = data[i][1].split(",");
                for (k in exparent) {
                    tag = getTagByName(exparent[k]);
                    if (tag)
                        WebResource.settings.excludeparents.push({ id: tag.id, name: tag.attributes['xrmc_name'].value });
                }
                break;
            case 'allowparentselection':
                if (data[i][1])
                    WebResource.settings.allowParentSelection = true;
                break;
            case 'existingtagsonly':
                if (data[i][1])
                    WebResource.settings.existingTagsOnly = true;
                break;
            case 'disablelistselection':
                if (data[i][1])
                    WebResource.settings.disableListSelection = true;
            default:
                break;
        }
    }
};

