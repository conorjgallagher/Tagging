
using System;
using System.Linq;
using System.ServiceModel;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Query;

namespace Tagging.Plugins
{
    [CrmPluginRegistration("Update", "xrmc_taggingconfiguration",
        StageEnum.PreOperation, ExecutionModeEnum.Synchronous,
        "", "TaggingManagement", 1, IsolationModeEnum.Sandbox,
        Description = "Pre-Operation of Tagging Update")]
    public class Tagging : IPlugin
    {
        readonly string publicKey;
        string key;
        readonly string developerKey;
        private const Int32 Valid = 922680000;
        private const Int32 NotValid = 922680001;
        private const Int32 Expired = 922680002;
        Guid taggingGuid;
        Guid currentTaggingGuid;
        string dbVersion;
        string currentSolutionVersion;

        public Tagging(string unsecureConfig, string secureConfig)
        {
            publicKey = LicenseDetails.PublicKey;
            developerKey = LicenseDetails.DeveloperKey;
        }

        public void Execute(IServiceProvider serviceProvider)
        {

            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(context.UserId);

            #region Retrieving existing TaggingConfiguration entity record values
            var query = new QueryExpression("xrmc_taggingconfiguration");
            var cols = new ColumnSet {AllColumns = true};

            query.ColumnSet = cols;
            query.PageInfo.ReturnTotalRecordCount = true;
            EntityCollection qresult = service.RetrieveMultiple(query);
            foreach (var attributes in qresult.Entities)
            {
                taggingGuid = (Guid)attributes.Attributes["xrmc_taggingconfigurationid"];

                dbVersion = attributes.Attributes.Contains("xrmc_termsandconditionsversion")
                                ? attributes.Attributes["xrmc_termsandconditionsversion"].ToString()
                                : "";
            }

            int count = qresult.TotalRecordCount;
            #endregion

            var licenseManager = new LicenseManager("", publicKey.DecodeFrom64(), developerKey.DecodeFrom64());

            if (!context.InputParameters.Contains("Target") || !(context.InputParameters["Target"] is Entity)) return;
            
            try
            {
                var entity = (Entity)context.InputParameters["Target"];
                currentTaggingGuid = (Guid)entity.Attributes["xrmc_taggingconfigurationid"];
                if (context.Depth > 1)
                {
                    return;
                }

                //validation for only one sms configuration record can be created
                if (count == 1 && taggingGuid != currentTaggingGuid)
                {
                    throw new InvalidPluginExecutionException("Only one Tagging Configuration record can be created");
                }
                currentSolutionVersion = entity.Attributes.Contains("xrmc_termsandconditionsversion")
                                             ? entity.Attributes["xrmc_termsandconditionsversion"].ToString()
                                             : "";

                if (currentSolutionVersion == "")
                    currentSolutionVersion = dbVersion;



                if (dbVersion == currentSolutionVersion)
                {
                    if (entity.Attributes.Contains("xrmc_licensekey"))
                    {
                        key = entity.Attributes["xrmc_licensekey"].ToString();
                        LicenseDetails licenseDetails = licenseManager.ValidateLicense(key);

                        if (entity.LogicalName == "xrmc_taggingconfiguration")
                        {
                            #region Licensekey Validation
                            var keystatus = Convert.ToInt32(licenseDetails.Status);
                            if (keystatus == NotValid)
                            {
                                throw new InvalidPluginExecutionException("The license key for the Tagging solution is not valid" + Environment.NewLine + Environment.NewLine + "Please contact support@xrmconsultancy.com");
                            }
                            if (keystatus == Expired)
                            {
                                throw new InvalidPluginExecutionException("The license key for the Tagging solution has expired" + Environment.NewLine + Environment.NewLine + "Please contact support@xrmconsultancy.com");
                            }

                            if (licenseDetails.MaxActiveUsers != -1 && GetCountOfActiveUsers(service) > licenseDetails.MaxActiveUsers)
                            {
                                throw new InvalidPluginExecutionException("The license key for the Tagging solution does not cover the number of active users" + Environment.NewLine + Environment.NewLine + "Please contact support@xrmconsultancy.com");
                            }

                            if (licenseDetails.CustomerName.ToLower() != context.OrganizationName.ToLower())
                            {
                                throw new InvalidPluginExecutionException("The license key for the Tagging solution is not valid for this organization" + Environment.NewLine + Environment.NewLine + "Please contact support@xrmconsultancy.com");
                            }

                            var picklist = new OptionSetValue(keystatus);
                            if (entity.Attributes.Contains("xrmc_licensekeystatus") == false)
                            {
                                entity.Attributes.Add("xrmc_licensekeystatus", picklist);
                            }
                            if (entity.Attributes.Contains("xrmc_licensekeyexpiry") == false)
                            {
                                entity.Attributes["xrmc_licensekeyexpiry"] = licenseDetails.Expirydate;
                            }
                            if (entity.Attributes.Contains("xrmc_licensekeycustomername") == false)
                            {
                                entity.Attributes["xrmc_licensekeycustomername"] = licenseDetails.CustomerName;
                            }
                            if (entity.Attributes.Contains("xrmc_licensekeyid") == false)
                            {
                                entity.Attributes["xrmc_licensekeyid"] = licenseDetails.Licensekeyid.ToString();
                            }
                            if (entity.Attributes.Contains("xrmc_licensekeyusers") == false)
                            {
                                entity.Attributes["xrmc_licensekeyusers"] = (licenseDetails.MaxActiveUsers == -1 ? "Unlimited" : licenseDetails.MaxActiveUsers.ToString());
                            }

                            #endregion
                        }

                        else
                        {
                            throw new InvalidPluginExecutionException("Tagging configurarion entity is not found");
                        }
                    }
                }

            } //try
            catch (FaultException<OrganizationServiceFault> ex)
            {
                throw new InvalidPluginExecutionException("An error occurred in the plug-in.", ex);
            }
        }

        private int GetCountOfActiveUsers(IOrganizationService service)
        {
            using (var context = new OrganizationServiceContext(service))
            {

                var activeUsers = (from s in context.CreateQuery("systemuser")
                                  where (bool) s["isdisabled"] == false
                                  select s).ToList();

                return activeUsers.Count;
            }
        }
    }
}