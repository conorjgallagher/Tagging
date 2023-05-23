using System;
using System.Text;

namespace Tagging.Plugins
{
    public static class StringExtensionMethods
    {
        public static string DecodeFrom64(this string encodedData)
        {
            byte[] encodedDataAsBytes = Convert.FromBase64String(encodedData);
            string returnValue = Encoding.ASCII.GetString(encodedDataAsBytes);
            return returnValue;
        }

    }
}
