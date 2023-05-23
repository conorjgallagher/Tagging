using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Tagging.Plugins
{
    public class ConnectionMapper
    {
        public Entity Connection { get; private set; }
        public Guid Id { get; private set; }
        public EntityReference Record2Id { get; private set; }
        public ConnectionMapper(IOrganizationService service, object target)
        {
            if (target is Entity)
            {
                Connection = (target as Entity);
            }
            else if (target is EntityReference)
            {
                var entityReference = (target as EntityReference);
                Connection = service.Retrieve("connection", entityReference.Id, new ColumnSet("record2id"));
            }
            Id = Connection.Id;
            Record2Id = Connection["record2id"] as EntityReference;
        }
    }
}