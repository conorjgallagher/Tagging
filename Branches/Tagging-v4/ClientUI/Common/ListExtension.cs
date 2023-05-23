using ClientUI.Tagging.Model;
using System;
using System.Collections.Generic;

namespace ClientUI.Common
{
    public static class ListExtension
    {
        //public static Func<string, string, int> SortBy(string field, bool reverse, Func<string, string> primer)
        public static CompareCallback<TagModel> SortBy(string field, bool reverse, Func<string,string> primer) 
        {
            Func<TagModelExt, string> sortKey = delegate (TagModelExt tag)
            {
                return primer == null ? (string)tag[field] : primer((string)tag[field]);
            };

            return delegate(TagModel a, TagModel b)
            {
                string a1 = sortKey((TagModelExt)a), b1 = sortKey((TagModelExt)b);
                return string.Compare(a1, b1) * (reverse ? -1 : 1);
            };
        }
    }
}
