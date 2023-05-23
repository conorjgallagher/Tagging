using System;
using System.Collections.Generic;
using Tagging.Extended;
using Xrm.Sdk;

namespace ClientUI.Common
{
    public static class Security
    {


        public static void CheckPrivileges(Action<string,string> done)
        {
            Script.Alert("YOU MUST UPDATE THE CHECK PRIVILEGES MANUALLY!");
            /*
             *This needs to be added to the client UI manually... 


    var req = {};
    req.getMetadata = function () {
        return {
            boundParameter: null,
            parameterTypes: {},
            operationType: 0,
            operationName: "xrmc_GetTaggingRole"
        };
    };

    Xrm.WebApi.online.execute(req).then(
        function (result) {
            result.json().then(
                function success(response) {
                    done(response.TaggingRole);
                }
            );
        },
            function error(error) {
                debugger;
                var errMsg = error.message;
                this.showMessage('An error occurred loading tag list: ' + ex.message);
                this.hideLoader();
                done('');
            }
        );
    

             */


            // THIS NEXT PART IS DEPRECATED!

            //    string fetchXml = @"
            //<fetch top='50' distinct='true'>
            //  <entity name='privilege' >
            //    <filter type='and' >
            //      <condition attribute='name' operator='in' >
            //        <value>prvReadConnection</value>
            //        <value>prvCreateConnection</value>
            //        <value>prvWriteConnection</value>
            //        <value>prvDeleteConnection</value>
            //        <value>prvAppendConnection</value>
            //        <value>prvAppendToConnection</value>
            //        <value>prvReadConnectionRole</value>
            //        <value>prvAppendConnectionRole</value>
            //        <value>prvAppendToConnectionRole</value>
            //        <value>prvReadxrmc_Tag</value>
            //        <value>prvCreatexrmc_Tag</value>
            //        <value>prvWritexrmc_Tag</value>
            //        <value>prvAppendxrmc_Tag</value>
            //        <value>prvAppendToxrmc_Tag</value>
            //        <value>prvReadxrmc_TaggingConfiguration</value>
            //      </condition>
            //    </filter>
            //    <link-entity name='roleprivileges' from='privilegeid' to='privilegeid' link-type='inner' intersect='true' >
            //      <link-entity name='role' from='roleid' to='roleid' link-type='inner' >
            //        <link-entity name='role' from='parentrootroleid' to='roleid' link-type='inner' alias='parentrootrole' >
            //          <link-entity name='systemuserroles' from='roleid' to='roleid' link-type='inner' intersect='true' >
            //            <link-entity name='systemuser' from='systemuserid' to='systemuserid' link-type='inner' >
            //              <filter type='and' >
            //                <condition attribute='systemuserid' operator='eq-userid' />
            //              </filter>
            //            </link-entity>
            //          </link-entity>
            //        </link-entity>
            //      </link-entity>
            //    </link-entity>
            //  </entity>
            //</fetch>";

            //    OrganizationServiceProxy.BeginRetrieveMultiple(fetchXml, delegate (object result)
            //    {
            //        try
            //        {
            //            EntityCollection fetchResult = OrganizationServiceProxy.EndRetrieveMultiple(result, typeof(Entity));
            //            List<Entity> entities = (List<Entity>)Script.Literal("{0}.entities._internalArray", fetchResult);
            //            if (entities.Count > 0)
            //            {
            //                if (entities.Count >= 15)
            //                {
            //                    done("Tag Writer","");
            //                    return;
            //                }
            //                TaggingList<string> tagReader = new TaggingList<string>();
            //                TaggingList<string> tagAssociator = new TaggingList<string>();

            //                for (int r = 0; r < entities.Count; r++)
            //                {
            //                    string privilegeName = entities[r].GetAttributeValueString("name").ToLowerCase();
            //                    if (privilegeName == "prvreadconnection" ||
            //                        privilegeName == "prvreadconnectionrole" ||
            //                        privilegeName == "prvreadxrmc_tag" ||
            //                        privilegeName == "prvreadxrmc_taggingconfiguration"
            //                        )
            //                    {
            //                        tagReader.Add(privilegeName);
            //                        tagAssociator.Add(privilegeName);
            //                    }
            //                    if (privilegeName == "prvcreateconnection" ||
            //                        privilegeName == "prvdeleteconnection" ||
            //                        privilegeName == "prvappendconnection" ||
            //                        privilegeName == "prvappendtoconnection" ||
            //                        privilegeName == "prvwritexrmc_tag" ||
            //                        privilegeName == "prvappendxrmc_tag" ||
            //                        privilegeName == "prvappendtoxrmc_tag"
            //                        )
            //                    {
            //                        tagAssociator.Add(privilegeName);
            //                    }
            //                }
            //                if (tagAssociator.Count >= 11)
            //                {
            //                    done("Tag Associator", "");
            //                    return;
            //                }
            //                if (tagReader.Count >= 4)
            //                {
            //                    done("Tag Reader", "");
            //                    return;
            //                }
            //                done("", "");
            //            }
            //        }
            //        catch (Exception ex)
            //        {
            //            done("", "An error occurred checking privileges: " + ex.Message);
            //        }
            //    });
        }

    }
}
