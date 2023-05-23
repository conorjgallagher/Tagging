using System.Runtime.CompilerServices;


namespace ClientUI.Polyfill
{
    [Imported]
    [IgnoreNamespace]
    [ScriptName("List")]
    public class ListJS
    {
        private string v;
        private object options;

        public ListJS(string v, object options)
        {
            this.v = v;
            this.options = options;
        }

        internal void Sort(string v1, object v2)
        {
        }

        internal void Search()
        {
        }

        internal void Add(ListJSTag tag)
        {

        }
    }

    [Imported]
    [IgnoreNamespace]
    [ScriptName("Object")]
    public class ListJSTag
    {
        public string taglabel;
        public string tagname;
        public string tagcheck;
        public string tagvalue;
        public string tagstatus;
    }
}
