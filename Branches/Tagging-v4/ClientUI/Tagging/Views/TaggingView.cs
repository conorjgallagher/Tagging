// TaggingView.cs
//

using SparkleXrm;
using System;
using System.Html;
using Xrm;
using jQueryApi;
using ClientUI.Polyfill;
using ClientUI.Tagging.ViewModels;
using ClientUI.Tagging.Model;
using Tagging.Extended;

//
namespace ClientUI.Tagging.Views
{

    public class TaggingView : ViewBase
    {
        public static TaggingViewModel vm;
        public static int sortA = 0;


        public static void Init()
        {

            // For debugging android
            Script.Literal("if (typeof Build !== 'undefined' && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {if (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) { WebView.setWebContentsDebuggingEnabled(true); }}");

            PageEx.MajorVersion = 2013;
            jQuery.Window.Resize(delegate (jQueryEvent e) {
                SetHeights(null);
            });

            jQuery.OnDocumentReady(delegate () {
                vm = new TaggingViewModel();
                // We need to override the sparkle template as we've packed it into tagging under the xrmc path
                ViewBase.sparkleXrmTemplatePath = "sparkle.form.templates.htm";
                ViewBase.RegisterViewModel(vm);
                //, {name: 'tagstatus', attr: 'checked' }
                vm.tagList = new ListJS("selectTags", Script.Literal(
                    "{ valueNames: ['tagname', 'taglabel', {name: 'taglabel', attr: 'for'}, {name: 'tagcheck', attr: 'id'}, {name: 'tagvalue', attr: 'value'} ], item: '<li><p class=\"tagname\" style=\"display:none;\"></p><input class=\"tagcheck tagvalue\" id=\"\" value=\"\" type=\"checkbox\" style=\"cursor: pointer;\"><label  class=\"taglabel\" for=\"\"></label></li>' }"));
                vm.Init(InitComplete);

            });
        }

        public static void InitComplete()
        {
            jQuery.Select("#xrmc-tags").Hide();
            jQuery.Select("#selectTagsToggle").Hide();
            jQuery.Select("#selectTagsToggle").MouseDown(delegate {
                Document.ActiveElement.Blur();
                jQuery.Select("#taggingcontent").Hide();
                jQuery.Select("#selectTags").Show();
                SetHeights(VisibleListHeight());
            });
            jQuery.Select("#selectTagsHide").Click(delegate {
                jQuery.Select("#selectTags").Hide();
                jQuery.Select("#taggingcontent").Show();
                jQuery.Select("#searchTags").Value("");
                SetHeights(0);
                vm.tagList.Search();
                Document.ActiveElement.Blur();
            });
            //vm.tagList = new ListJS("selectTags", Script.Literal("{ valueNames: ['tagname', 'taglabel', {name: 'taglabel', attr: 'for'}, {name: 'tagcheck', attr: 'id'}, {name: 'tagcheck', attr: 'value'}, {name: 'tagstatus', attr: 'checked' } ] }"));
            //vm.tagList = new ListJS("selectTags", Script.Literal(
            //    "{ valueNames: ['tagname', 'taglabel', {name: 'taglabel', attr: 'for'}, {name: 'tagcheck', attr: 'id'}, {name: 'tagcheck', attr: 'value'}, {name: 'tagstatus', attr: 'checked' } ], item: '<li><p class=\"tagname\" style=\"display:none;\"></p><input class=\"tagcheck tagstatus\" id=\"\" value=\"\" type=\"checkbox\" style=\"cursor: pointer;\"><label  class=\"taglabel\" for=\"\"></label></li>' }"));
            vm.tagList.Sort("tagname", Script.Literal("{ order: 'asc' }"));
            SetHeights(null);

            // THIS SHOULD REALLY BE CONTROLLED BY A VIEWMODEL OBSERVABLE FLAG OR SOMETHING??
            if (!vm.Settings.DisableListSelection)
            {
                jQuery.Select("#token-input-xrmc-tags").On("focus", delegate (jQueryEvent e) {
                    jQuery.Select("#selectTagsToggle").Show();
                });

                jQuery.Select("#token-input-xrmc-tags").On("blur", delegate (jQueryEvent e) {
                    jQuery.Select("#selectTagsToggle").Hide();
                });

                jQuery.Select("#token-input-xrmc-tags").On("keypress", delegate (jQueryEvent e) {
                    jQuery.Select("#selectTagsToggle").Hide();
                });
            }

            jQuery.Select("#saveTags").Click(delegate (jQueryEvent e) {
                // reset the list before saving or we lose the proper list of selected tags
                jQuery.Select("#searchTags").Value("");
                vm.tagList.Search();

                TaggingList<TagModel> selectedList = new TaggingList<TagModel>();
                jQuery.Select("#selectTags [type=checkbox]:checked").Each(delegate (int index, Element element)
                {
                    TagModel tag = new TagModel();
                    tag.Name = jQuery.This.GetValue();
                    selectedList.Add(tag);
                });
                TaggingList<TagModel> tagged = selectedList.Filter2(Comparer(TaggingViewModel.RunningList));
                for (int i = 0; i < tagged.Count; i++)
                {
                    vm.AddTag(tagged[i].Name, "fullloader");
                    //jQuery.Select("#" + tagged[i].Name).Property("checked", "true");
                }

                TaggingList<TagModel> untagged = TaggingViewModel.RunningList.Filter2(Comparer(selectedList));
                for (int i = 0; i < untagged.Count; i++)
                {
                    vm.RemoveTag(untagged[i].Name, "fullloader");
                    //jQuery.Select("#" + untagged[i].Name).Property("checked", "false");
                }
                jQuery.Select("#selectTags").Hide();
                jQuery.Select("#taggingcontent").Show();
                Document.ActiveElement.Blur();
                SetHeights(0);
            });
            jQuery.Select(".sort").Click(delegate (jQueryEvent e) {
                if (sortA == 1)
                {
                    jQuery.This.Text("Sort \u2191");
                    sortA = 0;
                }
                else
                {
                    jQuery.This.Text("Sort \u2193");
                    sortA = 1;
                }
            });

        }

        public static Func<TagModel, bool> Comparer(TaggingList<TagModel> otherArray)
        {
            return delegate (TagModel current) {
                return otherArray.Filter(delegate (TagModel other) {
                    return vm.PrettyTag(other.Name) == vm.PrettyTag(current.Name);
                    }).Count == 0;
            };
        }

        public static bool CompareItems(TagModel current, TaggingList<TagModel> otherArray)
        {
            return otherArray.Filter(delegate (TagModel other) {
                return vm.PrettyTag(other.Name) == vm.PrettyTag(current.Name);
            }).Count == 0;
        }


        public static int VisibleListHeight()
        {
            bool isIE = (bool)Script.Literal("/*@cc_on!@*/false || !!document.documentMode");
            bool isEdge = (bool)Script.Literal("!isIE && !!window.StyleMedia");
            if (isEdge)
                return Document.Body.ScrollHeight;
            return jQuery.Document.GetHeight();
        }

        public static void SetHeights(int? h)
        {
            int currentListHeight = 0;
            bool isFirefox = (bool)Script.Literal("typeof InstallTrigger !== 'undefined'");
            if (h != null) currentListHeight = (int)h; 
            jQuery.Select("#selectTags").Height(currentListHeight);
            jQuery.Select("#selectTagContent").Height(currentListHeight);
            if (isFirefox)
            {
                jQuery.Select(".list").Height(jQuery.Select("#selectTags").GetHeight() - 62);
            }
            else
            {
                jQuery.Select(".list").Height(jQuery.Select("#selectTags").GetHeight() - 59);
            }
        }
    }
}
