using System;
using System.ServiceModel;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Tagging.Plugins
{
    public class TagCountValidator
    {
        private readonly IOrganizationService service;
        private readonly Entity connection;

        public TagCountValidator(IOrganizationService service, Entity connection)
        {
            this.service = service;
            this.connection = connection;
        }

        public void Execute()
        {
            // LICENCEFREE - UNCOMMENT FOR LICENCE FREE VERSION!
            //return;
            if (connection.Contains("record1id") &&
                ((EntityReference)connection["record1id"]).LogicalName == "xrmc_tag")
            {
                const string fetchXml = "<fetch mapping='logical' aggregate='true' >" +
                                        "  <entity name='connection' >" +
                                        "    <attribute name='connectionid' aggregate='count' alias='count' />" +
                                        "    <filter type='and' >" +
                                        "      <condition attribute='record1roleid' operator='eq' uiname='Tag' uitype='connectionrole' value='{A6594384-3BD4-E211-8A32-3C4A92DBDC51}' />" +
                    //"      <condition attribute='record1roleid' operator='eq' uiname='Tag' uitype='connectionrole' value='{BCE64DEF-46EB-E211-85BC-080027EADCF2}' />" +
                                        "    </filter>" +
                                        "  </entity>" +
                                        "</fetch>";

                if (new LicenseValidator(service).ValidateLicense() == false)
                {
                    EntityCollection connections = service.RetrieveMultiple(new FetchExpression(fetchXml));
                    var tagConnectionCount = connections.Entities;
                    if (((int)((AliasedValue)tagConnectionCount[0].Attributes["count"]).Value) > 25)
                    {
                        throw new InvalidPluginExecutionException(
                            "Your system has exceeded the Tag connection limit.\r\n\r\nPlease contact xRM Consultancy (sales@xrmconsultancy.com)");
                    }
                }
            }
        }
    }
}