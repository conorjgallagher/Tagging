// QuoteLineItemEditorView.cs
//

using ClientUI.Tagging.ViewModels;
using jQueryApi;
using SparkleXrm;
using System;
using Xrm;

//
namespace ClientUI.Tagging.Views
{

    public class TagCloudView : ViewBase
    {
        public static TaggingViewModel vm;

        public static void Init()
        {
            // For debugging android
            Script.Literal("if (typeof Build !== 'undefined' && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {if (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) { WebView.setWebContentsDebuggingEnabled(true); }}");

            PageEx.MajorVersion = 2013;

            jQuery.OnDocumentReady(delegate ()
            {
                vm = new TaggingViewModel();
                // We need to override the sparkle template as we've packed it into tagging under the xrmc path
                ViewBase.sparkleXrmTemplatePath = "sparkle.form.templates.htm";
                ViewBase.RegisterViewModel(vm);
                vm.InitTagCloud();
            });
        }
    }
}
