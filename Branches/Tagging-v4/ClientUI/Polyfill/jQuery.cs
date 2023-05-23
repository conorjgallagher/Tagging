using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using ClientUI.Tagging.Model;
using jQueryApi;
using Tagging.Extended;

namespace ClientUI.Polyfill
{
    [IgnoreNamespace]
    [Imported]
    [ScriptName("$")]
    public partial class jQueryCloud
    {
        public static jQueryFn fn;
    }

    [IgnoreNamespace]
    [Imported]
    [ScriptName("fn")]
    public partial class jQueryFn
    {
        public jQueryObjectExt tagcloud;
    }

    [Imported]
    [IgnoreNamespace]
    [ScriptName("jQueryObject")]
    public partial class jQueryObjectExt : jQueryObject
    {
        public TagCloudOptions defaults;

        public void TokenInput(TaggingList<TagModel> l, TokenInputObject options)
        {
        }

        public void TokenInput(string method, object tag)
        {
        }

        public TaggingList<TagModel> GetTokens()
        {
            return null;
        }

        public void Remove(object tagModel)
        {
        }

        [ScriptName("progressbar")]
        public void ProgressBar(Progress p)
        {

        }

        internal void tagcloud()
        {
        }

        internal void click()
        {
        }
    }

    [Imported]
    [IgnoreNamespace]
    [ScriptName("Object")]
    public class Progress
    {
        public int Value;
    }

    [Imported]
    [IgnoreNamespace]
    [ScriptName("Object")]
    public class TokenInputObject
    {
        public string HintText;
        public string NoResultsText;
        public string SearchingText;
        public bool PreventDuplicates;
        public string DeleteText;
        public bool AllowFreeTagging;
        public bool AllowTabOut;
        public string TokenValue;
        public bool Disabled;
        public int ResultsLimit;
        public int MinChars;
        public string TokenDelimiter;
        public TaggingList<TagModel> PrePopulate;
        public Func<TagModel, string> TokenFormatter;
        public Action<TagModel> OnAdd;
        public Action<TagModel> OnDelete;
    }

    [Imported]
    [IgnoreNamespace]
    [ScriptName("Object")]
    public class TagCloudOptions
    {
        public TagCloudOption Size;
        public TagCloudOption Color;
    }
    [Imported]
    [IgnoreNamespace]
    [ScriptName("Object")]
    public class TagCloudOption
    {
        public object Start;
        public object End;
        public string Unit;
    }
}
