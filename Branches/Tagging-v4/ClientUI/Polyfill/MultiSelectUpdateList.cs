//using ClientUI.Tagging.Model;
//using System.Collections.Generic;
//using System.Runtime.CompilerServices;


//namespace ClientUI.Polyfill
//{
//    [Imported]
//    [IgnoreNamespace]
//    [ScriptName("Array")]
//    public class MultiSelectUpdateList
//    {
//        MultiSelectModel[] _internal = new MultiSelectModel[1];
//        //[IntrinsicProperty]
//        public MultiSelectModel this[int index]
//        {
//            get { return _internal[index]; }
//            set { _internal[index] = value; }
//        }

//        [ScriptName("length")]
//        public int Count;

//        [ScriptName("push")]
//        public void Add(MultiSelectModel item)
//        {

//        }

//        public MultiSelectUpdateList Filter(ListFilterCallback<MultiSelectModel> filterCallback)
//        {
//            return null;
//        }
//        public MultiSelectUpdateList Filter(ListItemFilterCallback<MultiSelectModel> itemFilterCallback)
//        {
//            return null;
//        }
//    }
//}
