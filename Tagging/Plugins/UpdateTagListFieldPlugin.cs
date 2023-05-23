 using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace Tagging.Plugins
{
    [CrmPluginRegistration("Create", "connection",
        StageEnum.PostOperation, ExecutionModeEnum.Asynchronous,
        "", "Tagging.Plugins.UpdateTagListFieldPlugin: Create of connection", 1, IsolationModeEnum.Sandbox,
        Description = "Tagging.Plugins.UpdateTagListFieldPlugin: Create of connection")]
    [CrmPluginRegistration("Delete", "connection",
        StageEnum.PostOperation, ExecutionModeEnum.Asynchronous,
        "", "Tagging.Plugins.UpdateTagListFieldPlugin: Delete of connection", 1, IsolationModeEnum.Sandbox,
        Description = "Tagging.Plugins.UpdateTagListFieldPlugin: Delete of connection",
        Image1Type = ImageTypeEnum.PreImage,
        Image1Name = "Target"
        )]
    public class UpdateTagListFieldPlugin : Plugin
    {
        private const string TagListAttribute = "xrmc_taglistfield";
        private const string DelimiterAttribute = "xrmc_taglistdelimiter";
        private const string AddDelimiterSpaceAttribute = "xrmc_adddelimiterspace";

        public UpdateTagListFieldPlugin()
            : base(typeof(UpdateTagListFieldPlugin))
        {
            RegisteredEvents.Add(new Tuple<int, string, string, Action<LocalPluginContext>>(40, "Create", "connection", Execute));
            RegisteredEvents.Add(new Tuple<int, string, string, Action<LocalPluginContext>>(40, "Delete", "connection", Execute));
        }

        /// <summary>
        /// Executes the plug-in.
        /// </summary>
        /// <param name="context">The <see cref="Plugin.LocalPluginContext"/> which contains the
        /// <see cref="IPluginExecutionContext"/>,
        /// <see cref="IOrganizationService"/>
        /// and <see cref="ITracingService"/>
        /// </param>
        protected void Execute(LocalPluginContext context)
        {
            // We should always have a context, but protect against
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            Entity config = GetConfig(context);
            if (config == null)
            {
                // Without a config we can't do anything... exit
                return;
            }

            context.Trace("Have config... extracting field data");
            if (config.Contains(TagListAttribute) && config[TagListAttribute] != null)
            {
                var tagListFieldName = (string)config[TagListAttribute];
                context.Trace($"Tag field name: {tagListFieldName}");
                var delimiter = config.GetAttributeValue<string>(DelimiterAttribute);
                delimiter = string.IsNullOrEmpty(delimiter) ? "," : Regex.Unescape(delimiter);
                if (config.GetAttributeValue<bool>(AddDelimiterSpaceAttribute))
                {
                    delimiter += " ";
                }


                // Resolve the entity we have connected the tag to
                Entity connectedTo = ResolveConnectedEntity(context, tagListFieldName);
                if (connectedTo != null)
                {
                    // Get all tags for this record and update the tag list if it has changed
                    var tagList = string.Join(delimiter, GetAllTags(context, connectedTo));

                    if (connectedTo.Contains(tagListFieldName) == false || (string)connectedTo[tagListFieldName] != tagList)
                    {
                        context.Trace("Updating tag list...");
                        connectedTo[tagListFieldName] = tagList;
                        context.OrganizationService.Update(connectedTo);
                    }
                }
            }
            context.Trace("Finished updating tag list");

        }

        private static Entity GetConfig(LocalPluginContext localContext)
        {
            // Retrieve the config with the tag list attribute only
            localContext.Trace("Retrieving config");
            var query = new QueryExpression("xrmc_taggingconfiguration")
            {
                ColumnSet = new ColumnSet(TagListAttribute, DelimiterAttribute, AddDelimiterSpaceAttribute)
            };
            EntityCollection qresult = localContext.OrganizationService.RetrieveMultiple(query);
            return qresult.Entities.Count < 1 ? null : qresult[0];
        }

        private static Entity ResolveConnectedEntity(LocalPluginContext context, string tagListField)
        {
            Entity connection;
            if (context.PluginExecutionContext.MessageName == "Delete")
            {
                context.Trace("Resolving connection for delete plugin...");
                connection = context.PluginExecutionContext.PreEntityImages["Target"];
            }
            else
            {
                context.Trace("Resolving connection for create plugin...");
                connection = (Entity)context.PluginExecutionContext.InputParameters["Target"];
            }

            var record2Id = (EntityReference)connection["record2id"];
            if (record2Id.LogicalName == "xrmc_tag")
            {
                return null;
            }

            try
            {
                context.Trace("Retrieving connected entity...");
                return context.OrganizationService.Retrieve(
                    record2Id.LogicalName,
                    record2Id.Id,
                    new ColumnSet(tagListField));
            }
            catch
            {
                context.Trace("Field or record does not exist. Exitting");
                // Ignore. It either means the entity doesn't contain the tag list field
                // or the record got deleted before we got a chance to update the tag list
            }
            return null;
        }

        private static List<string> GetAllTags(LocalPluginContext context, Entity e)
        {
            string fetchXml = "<fetch mapping='logical'>" +
                              "  <entity name='connection' >" +
                              "    <attribute name='record1id' />" +
                              "    <filter type='and' >" +
                              "      <condition attribute='record2id' operator='eq' value='{" + e.Id + "}' />" +
                              "      <condition attribute='record1roleid' operator='eq' value='{A6594384-3BD4-E211-8A32-3C4A92DBDC51}' />" +
                              "    </filter>" +
                              "  </entity>" +
                              "</fetch>";

            context.Trace("Retrieving all tags connected to entity...");
            var connections = context.OrganizationService.RetrieveMultiple(new FetchExpression(fetchXml));

            context.Trace("Sorting tags with valid connection");
            List<string> tags =
                connections.Entities.ToList()
                    .Where(c => c.Contains("record1id"))
                    .Select(c => ((EntityReference) c["record1id"]).Name)
                    .ToList();
            tags.Sort();
            return tags;
        }
    }
}