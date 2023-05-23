using System;
using System.Collections.Generic;
using System.Html;

namespace ClientUI.Common
{
    public static class DataHelper
    {
        public static Dictionary<string, string> GetWebResourceData(string innerSeparator)
        {

            string queryString = Window.Location.Search;
            if (queryString != null && queryString != "")
            {
                string[] parameters = queryString.Substr(1).Split("&");
                foreach (string param in parameters)
                {
                    if (param.ToLowerCase().StartsWith("data="))
                    {
                        string[] dataParam = param.Replace("+", " ").Split("=");
                        return ParseDataParameter(dataParam[1], innerSeparator);
                    }
                }
            }
            return new Dictionary<string, string>();
        }

        private static Dictionary<string, string> ParseDataParameter(string data, string innerSeparator)
        {
            Dictionary<string, string> nameValuePairs = new Dictionary<string, string>();
            string[] values = ((string)Script.Literal("decodeURIComponent(decodeURIComponent({0}))", data)).Split(innerSeparator);
            foreach (string value in values)
            {
                string[] nameValuePair = value.Split("=");
                nameValuePairs[nameValuePair[0]] = nameValuePair[1];
            }

            return nameValuePairs;
        }


    }
}
