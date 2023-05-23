using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;


namespace ClientUI.Polyfill
{
    [Imported]
    [IgnoreNamespace]
    [ScriptName("Array")]
    public class TaggingList<T>
    {
        T[] _internal = new T[1];
        [IntrinsicProperty]
        public T this[int index]
        {
            get { return _internal[index]; }
            set { _internal[index] = value; }
        }

        [ScriptName("length")]
        public int Count;

        [ScriptName("push")]
        public void Add(T item)
        {

        }

        public TaggingList<T> Filter(ListFilterCallback<T> filterCallback)
        {
            return null;
        }
        public TaggingList<T> Filter(ListItemFilterCallback<T> itemFilterCallback)
        {
            return null;
        }

        [ScriptName("filter")]
        public TaggingList<T> Filter2(Func<T, bool> filterCallback)
        {
            return null;
        }

        public static implicit operator Array(TaggingList<T> operand)
        {
            return operand._internal;
        }
    }
}
