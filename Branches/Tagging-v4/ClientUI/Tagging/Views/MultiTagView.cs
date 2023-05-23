// TaggingView.cs
//

using SparkleXrm;
using System;
using Xrm;
using jQueryApi;
using ClientUI.Tagging.ViewModels;
using ClientUI.Tagging.Model;
using Tagging.Extended;
using Xrm.Sdk;
using ClientUI.Common;
using System.Collections.Generic;

//
namespace ClientUI.Tagging.Views
{

    public class MultiTagView : ViewBase
    {
        public static TaggingViewModel vm;

        public static void InitMultiTag()
        {
            // For debugging android
            Script.Literal("if (typeof Build !== 'undefined' && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {if (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) { WebView.setWebContentsDebuggingEnabled(true); }}");

            PageEx.MajorVersion = 2013;

            Dictionary<string, string> data = DataHelper.GetWebResourceData("|");
            string selectedType = data["t"];

            TaggingViewModel.SelectedIds = (TaggingList<string>)(object)data["e"].Split(",");

            vm = new TaggingViewModel();
            // We need to override the sparkle template as we've packed it into tagging under the xrmc path
            ViewBase.sparkleXrmTemplatePath = "sparkle.form.templates.htm";
            ViewBase.RegisterViewModel(vm);
            vm.typeName = selectedType;
            vm.Settings.Multitag = true;
            vm.RetainFocus = true;
            vm.Init(InitComplete);
        }

        public static void SaveAll()
        {
            Script.Literal("$('#saveTags').attr('disabled', true)");
            Script.Literal("$('#deleteTags').attr('disabled', true)");
            vm.Save(false);
        }

        public static void DeleteAll()
        {
            Script.Literal("$('#saveTags').attr('disabled', true)");
            Script.Literal("$('#deleteTags').attr('disabled', true)");
            vm.Save(true);
        }

        public static void InitComplete()
        {
            jQuery.Select("#progresscurtain").Hide();

            jQuery.Select(".save-button").On("click", delegate (jQueryEvent e)
            {
                SaveAll();
            });

            jQuery.Select(".delete-button").On("click", delegate (jQueryEvent e)
            {
                DeleteAll();
            });

        }
    }
}
