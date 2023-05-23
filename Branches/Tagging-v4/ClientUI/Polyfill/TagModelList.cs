//using ClientUI.Tagging.Model;
//using System;
//using System.Collections.Generic;
//using System.Runtime.CompilerServices;


//namespace ClientUI.Polyfill
//{
//    [Imported]
//    [IgnoreNamespace]
//    [ScriptName("Array")]
//    public class TagModelList
//    {
//        TagModel[] _internal = new TagModel[1];
//        //[IntrinsicProperty]
//        public TagModel this[int index]
//        {
//            get { return _internal[index]; }
//            set { _internal[index] = value; }
//        }

//        [ScriptName("length")]
//        public int Count;

//        [ScriptName("push")]
//        public void Add(TagModel item)
//        {

//        }

//        public TagModelList Filter(ListFilterCallback<TagModel> filterCallback)
//        {
//            return null;
//        }
//        public TagModelList Filter(ListItemFilterCallback<TagModel> itemFilterCallback)
//        {
//            return null;
//        }

//        [ScriptName("filter")]
//        public TagModelList Filter2(Func<TagModel, bool> filterCallback)
//        {
//            return null;
//        }

//        public static implicit operator Array(TagModelList operand)
//        {
//            return new Array();
//        }
//    }
//}
