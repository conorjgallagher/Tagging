using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;


namespace Tagging.Extended
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

        public static implicit operator List<T>(TaggingList<T> operand)
        {
            return new List<T>();
        }

        public void Sort(CompareCallback<T> compareCallback)
        {

        }

        public TaggingList<T> Slice(int v1, int v2)
        {
            return null;
        }

        public string Join(string v)
        {
            return "";
        }
    }
}
