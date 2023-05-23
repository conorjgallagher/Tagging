// TagModel.cs
//

using System.Collections.Generic;
using System.Runtime.CompilerServices;
using Tagging.Extended;

namespace ClientUI.Tagging.Model
{
    public class TagModel
    {
        public string Id;
        public string Name;
        public TaggingList<string> Synonyms;
        public string BackColor;
        public string FontColor;
        public string BorderColor;
        public string SaveName;

        public int? TagCount;
    }

    // In javascript you can reference properties like a dictionary, let's fake that model here
    [Imported]
    [IgnoreNamespace]
    [ScriptName("TagModel")]
    public class TagModelExt : TagModel
    {
        Dictionary<string, object> _internalD = new Dictionary<string, object>();
        [IntrinsicProperty]
        public object this[string key]
        {
            get { return _internalD[key]; }
            set { _internalD[key] = value; }
        }
    }
}
