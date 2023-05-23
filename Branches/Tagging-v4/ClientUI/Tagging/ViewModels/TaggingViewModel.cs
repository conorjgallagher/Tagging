// TaggingViewModel.cs
//

using ClientUI.Tagging.Model;
using jQueryApi;
using KnockoutApi;
using SparkleXrm;
using System;
using System.Collections.Generic;
using System.Html;
using Xrm;
using Xrm.Sdk;
using System.Runtime.CompilerServices;
using ClientUI.Model;
using ClientUI.Polyfill;
using ES6;
using Tagging.Extended;
using ClientUI.Common;

namespace ClientUI.Tagging.ViewModels
{
    public class TaggingViewModel : ViewModelBase
    {
        #region Fields
        public static string td = "#xrmc-tags";
        public static string md = "#tagMessage";
        public ListJS tagList;

        public static List<Entity> AllTags = new List<Entity>();
        public static TaggingList<string> NewTags = new TaggingList<string>();
        public static TaggingList<TagModel> RunningList = new TaggingList<TagModel>();
        public WebResourceSettings Settings = new WebResourceSettings();

        public Observable<string> Message = Knockout.Observable<string>();
        public Observable<bool> ShouldShowMessage = Knockout.Observable<bool>(false);
        public Observable<bool> waitForSave = Knockout.Observable<bool>();
        public TaggingList<TagModel> AllowedTagList = null;
        public string Loader = "";
        public bool RetainFocus = false;

        public TaggingList<MultiTagModel> UpdateList = new TaggingList<MultiTagModel>();
        public int UpdateItem;
        public static TaggingList<string> SelectedIds;
        public int UpdateTotal = 0;
        public bool MultiDelete = false;
        public string typeName;
        private Func<int, TagModel, bool> item;
        #endregion

        #region Constructors
        public TaggingViewModel()
        {
            //ParseParams();
        }
        #endregion

        #region methods
        public void Init(Action done)
        {
            if (Page.Data == null)
                Page.Data = ParentPage.Data;

            if (AllowedTagList != null && !waitForSave.GetValue())
            {
                // prevent double initialization
                return;
            }

            if (!Settings.Multitag && string.IsNullOrEmpty(Page.Data.Entity.GetId()))
            {
                ShowMessage(ResourceStrings.onCreate);
                HideLoader();
                waitForSave.SetValue(true);
                WaitForAutosave(done);
                return;
            }

            waitForSave.SetValue(false);

            InitTagging(delegate
            {
                if (Page.Data == null)
                {
                    if (!Settings.Multitag)
                    {
                        HideLoader();
                        done();
                        return;
                    }
                }

                if (IsOffline())
                {
                    ShowMessage(ResourceStrings.offline);
                    done();
                }
                else
                {
                    GetTagConnectionCount(delegate (bool result)
                        {
                            if (result)
                            {
                                ShowMessage(ResourceStrings.exceededLimit);
                                HideLoader();
                                done();
                            }
                            else
                            {
                                if (Settings.Multitag || !string.IsNullOrEmpty(Page.Data.Entity.GetId()))
                                {
                                    if (!Settings.Multitag)
                                    {
                                        jQuery.Select("#selectTagsToggle").Show();
                                    }

                                    Security.CheckPrivileges(delegate (string role, string message)
                                        {
                                            bool isTagWriter = role == "Tag Writer";
                                            bool isTagAssociator = role == "Tag Associator";
                                            bool isTagReader = role == "Tag Reader";

                                            //Tag Writer - User Can Create Tags and Create and Delete Tag Connections
                                            if (isTagWriter && !Settings.ExistingTagsOnly)
                                            {
                                                jQuery.Select(md).Hide();
                                                ReceivedTagList("&times;", true, false, done);
                                            }
                                            //Tag Associator - User Can Read Tags and Create and Delete Tag Connections
                                            else if (isTagAssociator || isTagWriter)
                                            {
                                                jQuery.Select(md).Hide();
                                                if (Settings.Multitag) jQuery.Select(".instructions").Text("Enter text below to search for existing tags");
                                                ReceivedTagList("&times;", false, false, done);
                                            }
                                            //Tag Reader - User Can Read Tags but not Create and Delete Tag Connections
                                            else if (isTagReader)
                                            {
                                                Settings.DisableListSelection = true;
                                                if (Settings.Multitag)
                                                {
                                                    jQuery.Select(".instructions").Text("");
                                                    ShowMessage(ResourceStrings.multiTagNotAllowed);
                                                }
                                                else
                                                {
                                                    jQuery.Select(md).Hide();
                                                    ReceivedTagList("", false, true, done);
                                                }
                                            }
                                            //User can't read Tags
                                            else
                                            {
                                                if (string.IsNullOrEmpty(message))
                                                {
                                                    ShowMessage(ResourceStrings.notAuthorised);
                                                }
                                                else
                                                {
                                                    ShowMessage(message);
                                                }
                                                done();
                                            }
                                        }
                                    );
                                }
                                else
                                {
                                    ShowMessage(ResourceStrings.onCreate);
                                    HideLoader();
                                    waitForSave.SetValue(true);
                                    WaitForAutosave(done);
                                }
                            }
                        }
                     );
                }
            });
        }

        public void InitTagCloud()
        {
            //Tag Writer - User Can Create Tags and Create and Delete Tag Connections
            Security.CheckPrivileges(delegate (string privilege, string message) {
                if (privilege == "Tag Writer" || privilege == "Tag Associator" || privilege == "Tag Reader")
                {
                    string fetchXml =
                        "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                        "<entity name='xrmc_tag'>" +
                        "<attribute name='xrmc_tagid' />" +
                        "<attribute name='xrmc_name' />" +
                        "<attribute name='createdon' />" +
                        "<attribute name='xrmc_parent' />" +
                        "<attribute name='xrmc_tagcount' />" +
                        "<order attribute='xrmc_tagcount' descending='true' />" +
                        "<filter type='and'>" +
                        "<condition attribute='statecode' operator='eq' value='0' />" +
                        "<condition attribute='xrmc_tagcount' operator='gt' value='0' />" +
                        "</filter>" +
                        "</entity>" +
                        "</fetch>";


                    string encodedFetchXML = GlobalFunctions.encodeURIComponent(fetchXml);

                    OrganizationServiceProxy.BeginRetrieveMultiple(fetchXml, delegate (object result)
                    {
                        try
                        {
                            EntityCollection fetchResult = OrganizationServiceProxy.EndRetrieveMultiple(result, typeof(Entity));
                            AllTags = (List<Entity>)Script.Literal("{0}.entities._internalArray", fetchResult);
                            //fetchResult.Entities._internalArray;

                            ParseParams(delegate (bool s)
                            {
                                TaggingList<TagModel> allowedTags = new TaggingList<TagModel>();
                                for (int i = 0; i < AllTags.Count; i++)
                                {
                                    if (TagAllowed(AllTags[i]))
                                    {
                                        TagModel json = new TagModel();
                                        json.Id = AllTags[i].Id;
                                        json.Name = AllTags[i].GetAttributeValueString("xrmc_name");
                                        json.TagCount = AllTags[i].GetAttributeValueInt("xrmc_tagcount");

                                        allowedTags.Add(json);
                                    }
                                }

                                allowedTags.Sort(ListExtension.SortBy("xrmc_tagcount", false, null));
                                allowedTags = allowedTags.Slice(0, 29);

                                TaggingList<string> items = new TaggingList<string>();
                                for (int i = 0; i < allowedTags.Count; i++)
                                {
                                    string spacer;
                                    if (i < allowedTags.Count - 1)
                                    {
                                        spacer = ", ";
                                    }
                                    else
                                    {
                                        spacer = "";
                                    }
                                    TagModel item = allowedTags[i];
                                    items.Add("<a href='javascript:ClientUI.Tagging.ViewModels.TaggingViewModel.openTagRecord(&quot;" + item.Id + "&quot;,&quot;" + oDataEscape(GlobalFunctions.encodeURIComponent(HtmlEncode(item.Name))) + "&quot;,&quot;xrmc_tag&quot;);' rel='" + item.TagCount + "'>" + item.Name + "</a>" + spacer);
                                }

                                jQuery.Select("#xrmc-tagCloud").Append(items.Join(""));
                                TagCloudOptions options = new TagCloudOptions();
                                options.Size = new TagCloudOption();
                                options.Size.Start = 14;
                                options.Size.End = 22;
                                options.Size.Unit = "pt";
                                options.Color = new TagCloudOption();
                                options.Color.Start = "#00188f";
                                options.Color.End = "#f60";
                                jQueryCloud.fn.tagcloud.defaults = options;

                                jQuery.OnDocumentReady(delegate
                                {
                                    ((jQueryObjectExt)jQuery.Select("#xrmc-tagCloud a")).tagcloud();
                                });
                            });
                        }
                        catch (Exception ex)
                        {
                            ShowMessage("Error loading tag cloud: " + ex.Message);
                        }
                    }
                    );
                }
                //User can't read Tags
                else
                {
                    ShowMessage("Not Authorised");
                }
            });
        }

        public void WaitForAutosave(Action done)
        {
            if (!string.IsNullOrEmpty(Page.Data.Entity.GetId()))
            {
                HideMessage();
                Init(done);
            }
            else
                Window.SetTimeout(delegate () { WaitForAutosave(done); }, 100);
        }

        public void ShowMessage(string message)
        {
            Message.SetValue(message);
            ShouldShowMessage.SetValue(true);
        }

        public void HideMessage()
        {
            Message.SetValue(null);
            ShouldShowMessage.SetValue(false);
        }

        public void InitTagging(Action done)
        {
            AllowedTagList = new TaggingList<TagModel>();
            string fetchXml =
                        "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                        "<entity name='xrmc_tag'>" +
                        "<attribute name='xrmc_tagid' />" +
                        "<attribute name='xrmc_name' />" +
                        "<attribute name='createdon' />" +
                        "<attribute name='xrmc_parent' />" +
                        "<attribute name='xrmc_tagcount' />" +
                        "<attribute name='xrmc_synonyms' />" +
                        "<attribute name='xrmc_backcolor' />" +
                        "<attribute name='xrmc_fontcolor' />" +
                        "<attribute name='xrmc_bordercolor' />" +
                        "<order attribute='xrmc_tagcount' descending='true' />" +
                        "<filter type='and'>" +
                        "<condition attribute='statecode' operator='eq' value='0' />" +
                        "</filter>" +
                        "</entity>" +
                        "</fetch>";

            OrganizationServiceProxy.BeginRetrieveMultiple(fetchXml, delegate (object result)
            {
                try
                {
                    EntityCollection fetchResult = OrganizationServiceProxy.EndRetrieveMultiple(result, typeof(Entity));
                    AllTags = (List<Entity>)Script.Literal("{0}.entities._internalArray", fetchResult);
                    //AllTags = fetchResult.Entities._internalArray;

                    // Now that we have the tags parse the params for parents etc
                    ParseParams(delegate (bool s)
                    {

                        if (Settings.Multitag)
                        {
                            Settings.ResultsLimit = 10;
                        }

                        // And now figure out our allowed list
                        for (int e = 0; e < AllTags.Count; e++)
                        {
                            Entity tag = AllTags[e];
                            if (TagAllowed(tag))
                            {
                                TagModel json = new TagModel();
                                json.Id = tag.Id;
                                json.Name = tag.GetAttributeValueString("xrmc_name");
                                json.Synonyms = new TaggingList<string>();
                                string synonymString = tag.GetAttributeValueString("xrmc_synonyms");
                                if (synonymString != "")
                                {
                                    if (synonymString.IndexOf(',') > -1)
                                    {
                                        string[] synonymArray = synonymString.Split(",");
                                        for (int a = 0; a < synonymArray.Length; a++)
                                        {
                                            json.Synonyms.Add(synonymArray[a].Trim());
                                        }
                                    }
                                    else
                                    {
                                        json.Synonyms.Add(synonymString.Trim());
                                    }
                                }
                                json.BackColor = tag.GetAttributeValueString("xrmc_backcolor");
                                json.FontColor = tag.GetAttributeValueString("xrmc_fontcolor");
                                json.BorderColor = tag.GetAttributeValueString("xrmc_bordercolor");

                                AllowedTagList.Add(json);
                                if (!Settings.Multitag && !Settings.DisableListSelection)
                                {
                                    ListJSTag listTag = new ListJSTag();
                                    listTag.taglabel = json.Name;
                                    listTag.tagname = json.Name;
                                    listTag.tagcheck = json.Name;
                                    listTag.tagvalue = json.Name;
                                    tagList.Add(listTag);

                                    //jQuery.Select("#selectTags ul").Append("<li><p class='tagname' style='display:none;'>" + json.Name + "</p><input class='tagcheck' id='" + json.Name + "' value='" + json.Name + "' type='checkbox' style='cursor: pointer;'><label  class='taglabel' for='" + json.Name + "'>" + json.Name + "</label></li>");
                                }
                            }
                        }
                        done();
                    });
                }
                catch (Exception ex)
                {
                    // Error usually occurs here because of a permissions issue. 
                    ShowMessage(ResourceStrings.notAuthorised);
                    HideLoader();
                }
            });

        }

        public Entity GetTagById(string id)
        {
            // Search the cache first...
            for (int i = 0; i < AllTags.Count; i++)
            {
                if (AllTags[i].Id == id)
                {
                    return AllTags[i];
                }
            }

            // If not in cache retrieve from crm
            return OrganizationServiceProxy.Retrieve("xrmc_tag", id, new string[] { "xrmc_name", "xrmc_backcolor", "xrmc_fontcolor", "xrmc_bordercolor" });
        }


        public Promise GetTagByName(string tagName)
        {
            // Search the cache first...
            for (int i = 0; i < AllTags.Count; i++)
            {
                if (AllTags[i].GetAttributeValueString("xrmc_name") == tagName)
                {
                    return Promise.Resolve(AllTags[i]);
                }
            }

            // If not in cache retrieve from crm
            string fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                "  <entity name='xrmc_tag'>" +
                "    <attribute name='xrmc_tagid' />" +
                "    <attribute name='xrmc_name' />" +
                "    <attribute name='xrmc_parent' />" +
                "    <filter type='and'>" +
                "      <condition attribute='xrmc_name' operator='eq' value='" + tagName + "' />" +
                "    </filter>" +
                "  </entity>" +
                "</fetch>";


            EntityCollection fetchResult = OrganizationServiceProxy.RetrieveMultiple(fetchXml);
            List<Entity> entities = (List<Entity>)Script.Literal("{0}.entities._internalArray", fetchResult);
            if (entities.Count > 0)
            {
                return Promise.Resolve(entities[0]);
            }
            return Promise.Resolve((Entity)null);

        }
        #endregion
        public IDeferred DisplayLoader()
        {
            jQuery.Select(td).Blur();
            jQuery.Select("#loadingfull").Show();
            return jQuery.Deferred();
        }

        public void HideLoader()
        {
            jQuery.Select("#loadingfull").Hide();
        }

        public bool IsOffline()
        {
            if (Page.Context.Client != null && Page.Context.Client.GetClient() == ClientType.Outlook && Page.Context.Client.GetClientState() == ClientStateType.Offline)
            {
                return true;
            }
            return false;
        }

        public void GetTagConnectionCount(Action<bool> done)
        {
            // LICENCEFREE - UNCOMMENT FOR LICENCE FREE VERSION!
            //return false;
            string fetchXml =
                "<fetch  mapping='logical' aggregate='true' >" +
                    "<entity name='xrmc_taggingconfiguration'>" +
                        "<attribute name='xrmc_taggingconfigurationid' aggregate='count' alias='count' />" +
                        "<filter type='and'>" +
                            "<condition attribute='xrmc_licensekeystatus' operator='eq' value='922680000' />" +
                        "</filter>" +
                    "</entity>" +
                "</fetch>";


            OrganizationServiceProxy.BeginRetrieveMultiple(fetchXml, delegate (object result)
            {
                try
                {
                    EntityCollection fetchResult = OrganizationServiceProxy.EndRetrieveMultiple(result, typeof(Entity));
                    List<Entity> entities = (List<Entity>)Script.Literal("{0}.entities._internalArray", fetchResult);
                    if (entities.Count > 0)
                    {
                        Entity validConfig = entities[0];
                        int? c = GetAggregateValueAsInt(validConfig, "count");
                        if (c != 1)
                        {
                            fetchXml =
                                "<fetch mapping='logical' aggregate='true' >" +
                                    "<entity name='connection' >" +
                                        "<attribute name='connectionid' aggregate='count' alias='count' />" +
                                        "<filter type='and' >" +
                                            "<condition attribute='record1roleid' operator='eq' uiname='Tag' uitype='connectionrole' value='{A6594384-3BD4-E211-8A32-3C4A92DBDC51}' />" +
                                        "</filter>" +
                                    "</entity>" +
                                "</fetch>";
                            try
                            {
                                OrganizationServiceProxy.BeginRetrieveMultiple(fetchXml, delegate (object result2)
                                {
                                    EntityCollection tagFetchResult = OrganizationServiceProxy.EndRetrieveMultiple(result2, typeof(Entity));
                                    List<Entity> tagEntities = (List<Entity>)Script.Literal("{0}.entities._internalArray", tagFetchResult);
                                    Entity tagConnectionCount = tagEntities[0];
                                    if (tagConnectionCount.LogicalName != "connection") return;
                                    int? cVal = GetAggregateValueAsInt(tagConnectionCount, "count");
                                    if (cVal > 25)
                                    {
                                        done(true);
                                        return;
                                    } else
                                    {
                                        done(false);
                                        return;
                                    }
                                });
                            }
                            catch (Exception e)
                            {
                                ShowMessage("Error occurred validating tags: " + e.Message);
                                return;
                            }
                        }
                        else
                        {
                            done(false);
                            return;
                        }
                    }
                }
                catch (Exception e)
                {
                    ShowMessage("Error occurred validating tags: " + e.Message);
                    return;
                }
            });

        }

        /// <summary>
        /// Because of a weird api deserialise bug the aggregate object sometimes gets converted to an OptionSetValue instead of an int
        /// So having to cover this off with weird logic...
        /// </summary>
        /// <param name="e"></param>
        /// <param name="a"></param>
        /// <returns></returns>
        public int? GetAggregateValueAsInt(Entity e, string a)
        {
            string s = e.FormattedValues[a];
            if (s != null) return int.Parse(s, 10);

            OptionSetValue o = e.GetAttributeValueOptionSet(a);
            if (o != null && o.Value != null) return o.Value;

            return e.GetAttributeValueInt(a);
        }

        public void ReceivedTagList(string deleteText, bool freetagging, bool disable, Action done)
        {
            GetPrepopulateTags(ReceivedPrePopulate, deleteText, freetagging, disable, done);
        }

        public void GetPrepopulateTags(Action<TaggingList<TagModel>, string, bool, bool, Action> receivedPrePopulateCallback, string deleteText, bool freetagging, bool disable, Action done)
        {
            if (Settings.Multitag)
            {
                receivedPrePopulateCallback(new TaggingList<TagModel>(), deleteText, freetagging, disable, done);
                return;
            }
            string fetchXml = "";
            fetchXml = @"
        <fetch top='50' >
          <entity name='connection' >
            <attribute name='connectionid' />
            <attribute name='record1id' />
            <filter type='and' >
              <condition attribute='record1roleid' operator='eq' value='A6594384-3BD4-E211-8A32-3C4A92DBDC51' />
              <condition attribute='record2id' operator='eq' value='" + Page.Data.Entity.GetId() + @"' />
            </filter>
          </entity>
        </fetch>";

            OrganizationServiceProxy.BeginRetrieveMultiple(fetchXml, delegate (object state)
                {
                    EntityCollection results = OrganizationServiceProxy.EndRetrieveMultiple(state, typeof(Entity));
                    List<Entity> entities = (List<Entity>)Script.Literal("{0}.entities._internalArray", results);
                    TaggingList<TagModel> prepopulateTaglist = new TaggingList<TagModel>();
                    for (int e = 0; e < entities.Count; e++)
                    {
                        Entity connection = entities[e];
                        Entity tag = GetTagById(connection.GetAttributeValueEntityReference("record1id").Id.ToString());
                        if (TagAllowed(tag))
                        {
                            TagModel newTag = new TagModel();
                            newTag.Id = connection.Id.ToString() + ":" + tag.Id.ToString();
                            newTag.Name = tag.GetAttributeValueString("xrmc_name");
                            newTag.BackColor = tag.GetAttributeValueString("xrmc_backcolor");
                            newTag.FontColor = tag.GetAttributeValueString("xrmc_fontcolor");
                            newTag.BorderColor = tag.GetAttributeValueString("xrmc_bordercolor");
                            prepopulateTaglist.Add(newTag);
                        }
                    }
                    receivedPrePopulateCallback(prepopulateTaglist, deleteText, freetagging, disable, done);
                }
            );
        }


        public void ReceivedPrePopulate(TaggingList<TagModel> prepopulateList, string deleteText, bool freetagging, bool disable, Action done)
        {
            prepopulateList.Sort(ListExtension.SortBy("name", false, delegate (string a) {
                if (!string.IsNullOrEmpty(a))
                    return a.ToUpperCase();
                return "";
            }));
            RunningList = prepopulateList;

            for (int i = 0; i < RunningList.Count; i++)
            {
                jQuery.Select("input[value='" + PrettyTag(RunningList[i].Name) + "']").Attribute("checked", "true");
                //jQuery.Select("#" + PrettyTag(RunningList[i].Name)).Property("checked", "true");
            }

            TokenInputObject ti = new TokenInputObject();
            ti.HintText = "Search for existing tag...";
            ti.NoResultsText = "No tags found";
            ti.SearchingText = "Searching...";
            ti.PreventDuplicates = true;
            ti.DeleteText = deleteText;
            ti.AllowFreeTagging = freetagging;
            ti.AllowTabOut = true;
            ti.TokenValue = "name";
            ti.Disabled = disable;
            ti.ResultsLimit = Settings.ResultsLimit;
            ti.MinChars = Settings.MinChars;
            ti.TokenDelimiter = "|";
            ti.PrePopulate = prepopulateList;
            ti.TokenFormatter = delegate (TagModel item)
            {
                if (item != null)
                {
                    if (!string.IsNullOrEmpty(item.BackColor))
                    {
                        return "<li style='background-color:" + item.BackColor + "; color:" + item.FontColor + "; border-color:" + item.BorderColor + "'><p ondblclick='javascript:ClientUI.Tagging.ViewModels.TaggingViewModel.openTagRecord(&quot;" + item.Id + "&quot;,&quot;" + oDataEscape(GlobalFunctions.encodeURIComponent(HtmlEncode(item.Name))) + "&quot;,&quot;xrmc_tag&quot;);'>" + item.Name + "</p></li>";
                    }
                    else
                    {
                        return "<li><p ondblclick='javascript:ClientUI.Tagging.ViewModels.TaggingViewModel.openTagRecord(&quot;" + item.Id + "&quot;,&quot;" + oDataEscape(GlobalFunctions.encodeURIComponent(HtmlEncode(item.Name))) + "&quot;,&quot;xrmc_tag&quot;);'>" + item.Name + "</p></li>";
                    }
                }
                return "<li><p>...</p></li>";
            };
            ti.OnAdd = delegate (TagModel item)
            {
                // Backward compatability: To support tags that were originally saved with html encoding (&amp;) decode html strings before re-encoding
                string tagName = PrettyTag(item.Name);
                item.SaveName = tagName;
                item.Name = HtmlEncode(tagName);
                if (Settings.Multitag)
                {
                    NewTags.Add(item.Name);
                    return;
                }
                RunningList.Add(item);
                if (jQuery.Select("input[value='" + item.SaveName + "']").Length > 0)
                {
                    jQuery.Select("input[value='" + item.SaveName + "']").Attribute("checked", "true");
                }
                else
                {
                }

                int startTime = GetTimerValue();
                DisplayLoader();

                string itemName = item.Name;
                string saveName = item.SaveName;

                Window.SetTimeout(delegate ()
                {
                    string entityName = Page.Data.Entity.GetEntityName();
                    string entityId = Page.Data.Entity.GetId();

                    CreateTag(itemName, saveName, entityId, "", entityName, startTime, null);
                }, 0);
            };
            ti.OnDelete = delegate (TagModel item)
            {
                if (Settings.Multitag) return;
                RunningList = RunningList.Filter(delegate (TagModel el)
                {
                    return el.Name != item.Name;
                });

                DisplayLoader();

                try
                {
                    DeleteTagConnection(item.Id);
                    // For some reason propery doesn't remove the check in chrome, and returns a string in script#... 
                    // so just use attribute + remove attr to deal with both
                    jQuery.Select("input[value='" + PrettyTag(item.Name) + "']").Attribute("checked", "false").RemoveAttr("checked");
                }
                catch (Exception)
                {
                    Script.Literal("$(ClientUI.Tagging.ViewModels.TaggingViewModel.td).data('tokenInputObject').add(item, nocallback = true)");
                }
                HideLoader();
            };

            jQueryObjectExt jq = (jQueryObjectExt)jQuery.Select(td);
            jq.TokenInput(AllowedTagList, ti);
            HideLoader();
            done();
        }

        public bool TagAllowed(Entity tag)
        {
            if (Settings.Parents != null && Settings.Parents.Count > 0)
            {
                if (Settings.AllowParentSelection)
                {
                    for (int i = 0; i < Settings.Parents.Count; i++)
                    {
                        if (Settings.Parents[i].Name == tag.GetAttributeValueString("xrmc_name"))
                        {
                            return true;
                        }
                    }
                }
                for (int k = 0; k < Settings.Parents.Count; k++)
                {
                    if (tag.GetAttributeValueEntityReference("xrmc_Parent") != null)
                    {
                        if (Settings.Parents[k].Name == tag.GetAttributeValueEntityReference("xrmc_Parent").Name)
                        {
                            return true;
                        }
                        Entity ptag = null;
                        GetTagByName(tag.GetAttributeValueEntityReference("xrmc_Parent").Name).Then(delegate (Entity foundTag) { ptag = foundTag; return Promise.Resolve(foundTag); });
                        if (ptag != null && TagAllowed(ptag))
                        {
                            return true;
                        }
                    }
                }
                return false;
            }
            if (Settings.ExcludeParents != null && Settings.ExcludeParents.Count > 0)
            {
                for (int i = 0; i < Settings.ExcludeParents.Count; i++)
                {
                    if (Settings.ExcludeParents[i].Name == tag.GetAttributeValueString("xrmc_name"))
                    {
                        return false;
                    }
                }
                for (int k = 0; k < Settings.ExcludeParents.Count; k++)
                {
                    if (tag.GetAttributeValueEntityReference("xrmc_Parent") != null)
                    {
                        if (Settings.ExcludeParents[k].Name == tag.GetAttributeValueEntityReference("xrmc_Parent").Name)
                        {
                            return false;
                        }
                        Entity ptag = null;
                        GetTagByName(tag.GetAttributeValueEntityReference("xrmc_Parent").Name).Then(delegate (Entity foundTag) { ptag = foundTag; return Promise.Resolve(foundTag); });
                        if (ptag != null && !TagAllowed(ptag))
                        {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        public void CreateTag(string tagName, string saveName, string recordId, string recordName, string entityName, int startTime, Action done)
        {
            // Check tag connection count
            GetTagConnectionCount(delegate (bool result)
                {
                    if (result)
                    {
                        ShowMessage(ResourceStrings.exceededLimit);
                        HideLoader();
                        if (done!=null) done();
                        return;
                    }
                    //First Check if there is an existing tag in the collection
                    GetTagByName(tagName).Then(delegate (Entity tag)
                    {
                        if (tag != null)
                        {
                            // If the tag doesn't have a parent then it is a parent tag. Only allow it if the flag is ticked
                            if (!TagAllowed(tag))
                            {
                                DeleteTag(tagName);
                                if (done != null) done();
                                return Promise.Resolve(null);
                            }
                            // Existing tag, create the connection to it
                            CreateTagConnection(recordId, recordName, entityName, tag.GetAttributeValue("xrmc_tagid").ToString(), tagName, startTime, done);
                        }
                        else
                        {
                            // No existing tag, create one before creating a connection to it
                            tag = new Entity("xrmc_tag");
                            tag.SetAttributeValue("xrmc_name", saveName);
                            if (Settings.Parents != null && Settings.Parents.Count > 0)
                            {
                                tag.SetAttributeValue("xrmc_Parent", new EntityReference(new Guid(Settings.Parents[0].Id), "xrmc_tag", Settings.Parents[0].Name));
                            }

                            OrganizationServiceProxy.BeginCreate(tag, delegate (object state)
                                {
                                    Guid tagId = OrganizationServiceProxy.EndCreate(state);
                                    CreateTagConnection(recordId, recordName, entityName, tagId.ToString(), tagName, startTime, done);

                                    // Add new tags to the list when they are added to the original tagging control...
                                    if (!Settings.Multitag && !Settings.DisableListSelection)
                                    {
                                        ListJSTag listTag = new ListJSTag();
                                        listTag.taglabel = tagName;
                                        listTag.tagname = tagName;
                                        listTag.tagcheck = tagName;
                                        listTag.tagvalue = tagName;
                                        tagList.Add(listTag);
                                        tagList.Sort("tagname", Script.Literal("{ order: 'asc' }"));

                                        jQueryObject checkbox = jQuery.Select("input[value='" + tagName + "']");
                                        checkbox.Attribute("checked", "true");
                                    }
                                }
                            );
                        }
                        return Promise.Resolve(tag);
                    });
                }
            );
        }

        public void CreateTagConnection(string recordId, string recordName, string entityName, string tagId, string tagName, int startTime, Action done)
        {
            if ((bool)ConnectionExists(recordId, entityName, tagId))
            {
                if (Settings.Multitag)
                {
                    if (done != null) done();
                    return;
                }
                if (GetTimerValue() - startTime < 800)
                {
                    // Let the loader gif animate for at least 1.5 seconds
                    Window.SetTimeout(HideLoader, 800 - (GetTimerValue() - startTime));
                }
                else
                {
                    HideLoader();
                }
                if (done != null) done();
                return;
            }
            RetainFocus = true;
            Entity connection = new Entity("connection");
            connection.SetAttributeValue("record2id", new EntityReference(new Guid(recordId), entityName, recordName));
            connection.SetAttributeValue("record1id", new EntityReference(new Guid(tagId), "xrmc_tag", tagName));
            connection.SetAttributeValue("record1roleid", new EntityReference(new Guid("A6594384-3BD4-E211-8A32-3C4A92DBDC51"), "connectionrole", "Tag"));
            //connection.SetAttributeValue("_record2id_value@odata.bind", new EntityReference(new Guid(recordId), entityName, recordName));
            //connection.SetAttributeValue("_record1id_value@odata.bind", new EntityReference(new Guid(tagId), "xrmc_tag", tagName));
            //connection.SetAttributeValue("_record1roleid_value@odata.bind", new EntityReference(new Guid("A6594384-3BD4-E211-8A32-3C4A92DBDC51"), "connectionrole", "Tag"));
            //Entity connectFrom = new Entity(entityName);
            //connectFrom.Id = recordId;
            //connection.SetAttributeValue("record2id", connectFrom);

            //Entity connectTo = new Entity("xrmc_tag");
            //connectTo.Id = tagId;
            //connection.SetAttributeValue("record1id", connectTo);

            //Entity role = new Entity("connectionrole");
            //role.Id = "A6594384-3BD4-E211-8A32-3C4A92DBDC51";
            //connection.SetAttributeValue("record1roleid", role);

            //var connectionId;
            if (Settings.Multitag)
            {
                OrganizationServiceProxy.BeginCreate(connection, delegate (object state)
                    {
                        OrganizationServiceProxy.EndCreate(state);
                        if (done != null) done();
                    }
                );
            }
            else
            {
                OrganizationServiceProxy.BeginCreate(connection, delegate (object state)
                    {
                        Guid id = OrganizationServiceProxy.EndCreate(state);
                        //Combine ConnectionId and Tag Record Id as the token Id
                        string newTagIds = id + ":" + tagId;
                        UpdateTagId(tagName, newTagIds);
                        //connectionId = id;
                        if (GetTimerValue() - startTime < 800)
                        {
                            // Let the loader gif animate for at least 1.5 seconds
                            Window.SetTimeout(HideLoader, 800 - (GetTimerValue() - startTime));
                        }
                        else
                        {
                            HideLoader();
                        }
                        if (done != null) done();
                    }
                );
            }
        }

        // Update the tokenInputObject Id for the new token
        public void UpdateTagId(string tagName, string newTagIds)
        {
            jQueryObjectExt jo = (jQueryObjectExt)jQuery.Select(td).GetDataValue("tokenInputObject");
            TaggingList<TagModel> dataupdate = jo.GetTokens();
            int lim = dataupdate.Count;
            for (int i = 0; i < lim; i++)
            {
                if ((dataupdate[i].Name ?? "").ToLowerCase() == (tagName ?? "").ToLowerCase())
                {
                    dataupdate[i].Id = newTagIds;
                    break;
                }
            }
        }


        public object ConnectionExists(string recordId, string entityName, string tagId)
        {
            string fetchXml =
                "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
                    "<entity name='connection'>" +
                    "<attribute name='record2id' />" +
                    "<attribute name='record2roleid' />" +
                    "<attribute name='connectionid' />" +
                    "<order attribute='record2id' descending='false' />" +
                    "<filter type='and'>" +
                    "<condition attribute='record2id' operator='eq' uitype='" + entityName + "' value='" + recordId + "' />" +
                    "<condition attribute='record1id' operator='eq' uitype='xrmc_tag' value='" + tagId + "' />" +
                    "</filter>" +
                    "</entity>" +
                    "</fetch>";

            EntityCollection connections = OrganizationServiceProxy.RetrieveMultiple(fetchXml);
            List<Entity> entities = (List<Entity>)Script.Literal("{0}.entities._internalArray", connections);
            if (entities.Count > 0)
            {
                return entities[0].Id;
            }
            return false;
        }

        public void DeleteTag(string tagName)
        {
            jQueryObjectExt jo = (jQueryObjectExt)jQuery.Select(td).GetDataValue("tokenInputObject");
            TaggingList<TagModel> dataupdate = jo.GetTokens();
            int lim = dataupdate.Count;
            for (int i = 0; i < lim; i++)
            {
                if ((dataupdate[i].Name ?? "").ToLowerCase() == (tagName ?? "").ToLowerCase())
                {
                    //dataupdate.remove(dataupdate[i]);
                    jo.Remove(dataupdate[i]);
                    break;
                }
            }
        }

        public void DeleteTagConnection(string connectionAndTagId)
        {
            // Delete the Connection
            if (!string.IsNullOrEmpty(connectionAndTagId))
            {
                string[] split = connectionAndTagId.Split(":");
                string connectionId = split[0];
                OrganizationServiceProxy.BeginDelete("connection", new Guid(connectionId), delegate (object state)
                    {
                        OrganizationServiceProxy.EndDelete(state);
                    }
                );
            }
        }


        public string PrettyTag(string rawtag)
        {
            return jQuery.FromHtml("<div/>").Html(rawtag).GetText();
        }

        public string HtmlEncode(string value)
        {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return jQuery.FromHtml("<div/>").Text(value).GetHtml();
        }

        public string oDataEscape(string str)
        {
            return str.Replace("'", "%27%27");
        }

        public int GetTimerValue()
        {
            return (int)Script.Literal(" (performance.now !== undefined ? performance.now() : new Date().getTime())");
        }

        public void ParseParams(Action<bool> callback)
        {
            TaggingList<Promise> promises = new TaggingList<Promise>();

            Settings.ResultsLimit = 5;
            Settings.MinChars = 2;
            Dictionary<string, string> data = DataHelper.GetWebResourceData("|");
            if (data["resultslimit"] != null)
                Settings.ResultsLimit = int.Parse(data["resultslimit"], 10);
            if (data["minsearchchars"] != null)
                Settings.MinChars = int.Parse(data["minsearchchars"], 10);
            if (data["parent"] != null)
            {
                Settings.Parents = new TaggingList<TagModel>();
                Array parents = data["parent"].Split(",");
                for (int k = 0; k < parents.Length; k++)
                {
                    promises.Add(GetTagByName((string)parents[k]).Then(delegate (Entity tag)
                        {
                            if (tag != null)
                            {
                                TagModel newTag = new TagModel();
                                newTag.Id = tag.Id;
                                newTag.Name = tag.GetAttributeValueString("xrmc_name");
                                Settings.Parents.Add(newTag);
                                return Promise.Resolve(newTag);
                            }
                            return Promise.Resolve(null);
                        })
                    );
                }
            }
            if (data["excludeparent"] != null)
            {
                Settings.ExcludeParents = new TaggingList<TagModel>();
                Array exparent = data["excludeparent"].Split(",");
                for (int k = 0; k < exparent.Length; k++)
                {
                    promises.Add(GetTagByName((string)exparent[k]).Then(delegate (Entity tag)
                        {
                            if (tag != null)
                            {
                                TagModel newTag = new TagModel();
                                newTag.Id = tag.Id;
                                newTag.Name = tag.GetAttributeValueString("xrmc_name");
                                Settings.ExcludeParents.Add(newTag);
                                return Promise.Resolve(newTag);
                            }
                            return Promise.Resolve(null);
                        })
                    );
                }
            }
            if (data["allowparentselection"] != null)
                Settings.AllowParentSelection = ParseBool(data["allowparentselection"]);
            if (data["existingtagsonly"] != null)
                Settings.ExistingTagsOnly = ParseBool(data["existingtagsonly"]);
            if (data["disablelistselection"] != null)
                Settings.DisableListSelection = ParseBool(data["disablelistselection"]);

            Promise.All(promises).Then3(callback);
        }

        private bool ParseBool(string s)
        {
            string ls = s.ToLowerCase();
            if (ls == "yes" || ls == "true" || ls == "1")
            {
                return true;
            }
            return false;
        }

        public void AddTag(string tag, string loader)
        {
            Loader = loader;
            Array tagsFound = jQuery.Grep((Array)AllowedTagList, delegate (object e, int index)
            {
                // Backward compatability: To support tags that were originally saved with html encoding (&amp;) decode html strings
                return PrettyTag(((TagModel)e).Name) == PrettyTag(tag);
            });
            if (tagsFound.Length > 0)
            {
                jQueryObjectExt td = (jQueryObjectExt)jQuery.Select(TaggingViewModel.td);
                td.TokenInput("add", tagsFound[0]);
            }
        }

        public void RemoveTag(string tag, string loader)
        {
            Loader = loader;
            //jQueryObjectExt td = (jQueryObjectExt)jQuery.Select(TaggingViewModel.td);
            //TagModel tagItem = new TagModel();
            //tagItem.Name = tag;
            //td.TokenInput("remove", tagItem);
            Script.Literal("$(\"#xrmc-tags\").tokenInput(\"remove\", {{ name:{1} }})", TaggingViewModel.td, tag);
                    //$(td).tokenInput("remove", { name: tag });

        }


        public void Save(bool deleteFlag)
        {
            jQuery.Select("#processingBlanket").Show();
            jQuery.Select("#progressbar").Width(jQuery.Window.GetWidth() - 30);
            jQuery.Select("#progressbar").Show();
            UpdateList = new TaggingList<MultiTagModel>();
            UpdateItem = 0;
            for (int t = 0; t < NewTags.Count; t++)
            {
                for (int i = 0; i < SelectedIds.Count; i++)
                {
                    MultiTagModel updateTag = new MultiTagModel();
                    updateTag.Tag = NewTags[t];
                    updateTag.Id = SelectedIds[i];
                    UpdateList.Add(updateTag);
                }
            }
            UpdateTotal = UpdateList.Count;
            MultiDelete = deleteFlag;
            Window.SetTimeout(RecursiveSave, 1);
        }

        public void RecursiveSave()
        {
            int item = UpdateItem;
            int total = UpdateTotal;
            MultiTagModel current = UpdateList[item];
            if (current == null)
            {
                // WE SHOULDN'T CLOSE FROM A VIEW MODEL!! THINK ABOUT THIS SHOULD BE HANDLED
                //Window.Close();
                Window.Open("", "_parent", "").Close();
                return;
            }
            if (MultiDelete)
            {
                DeleteTagExt(current.Id, typeName, current.Tag, delegate() 
                {
                    jQueryObjectExt element = (jQueryObjectExt)jQuery.Select("#progressbar");
                    Progress p = new Progress();
                    p.Value = item * 100 / total;
                    element.ProgressBar(p);
                    if (item < total)
                    {
                        UpdateItem = item + 1;
                        Window.SetTimeout(RecursiveSave, 1);
                    }
                    else
                    {
                        // WE SHOULDN'T CLOSE FROM A VIEW MODEL!! THINK ABOUT THIS SHOULD BE HANDLED
                        //Window.Close();
                        Window.Open("", "_parent", "").Close();
                    }
                });
            }
            else
            {
                CreateTag(current.Tag, current.Tag, current.Id, "", typeName, GetTimerValue(), delegate ()
                {
                    jQueryObjectExt element = (jQueryObjectExt)jQuery.Select("#progressbar");
                    Progress p = new Progress();
                    p.Value = item * 100 / total;
                    element.ProgressBar(p);
                    if (item < total)
                    {
                        UpdateItem = item + 1;
                        Window.SetTimeout(RecursiveSave, 1);
                    }
                    else
                    {
                        // WE SHOULDN'T CLOSE FROM A VIEW MODEL!! THINK ABOUT THIS SHOULD BE HANDLED
                        //Window.Close();
                        Window.Open("", "_parent", "").Close();
                    }
                });
            }
        }

        public void DeleteTagExt(string entityId, string entityName, string tagName, Action done)
        {
            // Delete the Connection
            GetTagByName(tagName)
                .Then(delegate (TagModel tag)
                {
                    string connectionId = (string)ConnectionExists(entityId, entityName, tag.Id);
                    if (connectionId != null)
                    {
                        OrganizationServiceProxy.BeginDelete("connection", new Guid(connectionId), delegate (object state)
                        {
                            OrganizationServiceProxy.EndDelete(state);
                            if (done != null) done();
                        });
                    }
                    else
                    {
                        if (done != null) done();
                    }
                    return Promise.Resolve(tag);
                });
        }
        public static void OpenTagRecord(string tokenIds, string tagName, string entityName)
        {
            tagName =  (string)Script.Literal("unescape({0})", tagName);
            string serverUrl = Page.Context.GetClientUrl();
            if (!serverUrl.EndsWith("/"))
                serverUrl += "/";
            
            //Set features for how the window will appear
            string features = "location=no,menubar=no,status=yes,toolbar=no,resizable=yes";
            string tagId;
            string[] split = tokenIds.Split(":");
            tagId = split[1];
            //Check we have the Tag ID and if not get it
            if (tagId == null)
            {
                // new tag added to token list which doesn't have the tagId in the item.id so need to look for it
                string fetchxml = @"
<fetch distinct='false' mapping='logical' output-format='xml-platform' version='1.0' top='1'>
  <entity name='xrmc_tag'>
    <attribute name='xrmc_name'/>
    <attribute name='xrmc_parent'/>
    <attribute name='xrmc_tagid'/>
    <order descending='false' attribute='xrmc_name'/>
    <filter type='and'>
      <condition attribute='xrmc_name' value='{0}' operator='eq' />
    </filter>
  </entity>
</fetch>";
                
                OrganizationServiceProxy.BeginRetrieveMultiple(string.Format(fetchxml, tagName), delegate (object result)
                {
                    try
                    {
                        EntityCollection fetchResult = OrganizationServiceProxy.EndRetrieveMultiple(result, typeof(Entity));
                        List<Entity> entities = (List<Entity>)Script.Literal("{0}.entities._internalArray", fetchResult);
                        if (entities.Count > 0)
                        {
                            Entity firstResult = entities[0];
                            tagId = firstResult.Id;
                            Dictionary<string,string> options = new Dictionary<string, string>();
                            options["entityName"] = "xrmc_tag";
                            options["entityId"] = tagId;
                            Script.Literal("Xrm.Navigation.openForm({0})", options);
                            //Navigation.OpenForm()
                            //Utility.OpenEntityForm("xrmc_tag", GlobalFunctions.encodeURIComponent(tagId), null);
                        }
                    }
                    catch (Exception ex)
                    {
                        string x = ex.Message;
                    }
                });
            }
            else
            {
                Dictionary<string, string> options = new Dictionary<string, string>();
                options["entityName"] = "xrmc_tag";
                options["entityId"] = tagId;
                Script.Literal("Xrm.Navigation.openForm({0})", options);
                //Utility.OpenEntityForm("xrmc_tag", GlobalFunctions.encodeURIComponent(tagId), null);
            }
        }
    }
}
