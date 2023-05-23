using System.Collections.Generic;
using ClientUI.Tagging.Model;
using Tagging.Extended;

namespace ClientUI.Model
{
    public class WebResourceSettings
    {
        public bool DisableListSelection;
        public int ResultsLimit;
        public int MinChars;
        public TaggingList<TagModel> Parents;
        public TaggingList<TagModel> ExcludeParents;
        public bool AllowParentSelection;
        public bool ExistingTagsOnly;
        public bool Multitag = false;
    }
}
