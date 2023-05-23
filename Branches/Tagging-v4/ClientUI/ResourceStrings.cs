using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace ClientUI
{
    [IgnoreNamespace]

    public class ResourceStrings
    {
        public static string notAuthorised = "<span></span><div id='notAuthorised'>You do not have the correct permissions to use Tagging. Please contact your system administrator.</div>";
        public static string onCreate = "<span></span><div id='onCreate'>Tagging is only available once a record has been saved.</div>";
        public static string exceededLimit = "<span></span><div id='exceededLimit'>Your system has exceeded the Tag connection limit. Please contact xRM Consultancy (<a href='mailto:sales@xrmconsultancy.com'>sales@xrmconsultancy.com</a>) to purchase a license key.</div>";
        public static string offline = "<span></span><div id='onCreate'>Tagging is not available when offline.</div>";
        public static string multiTagNotAllowed = "<span></span><div id='notAuthorised'>Unfortunately you are not allowed to create or associate tags. Please contact your system administrator.</div>";
    }
}
