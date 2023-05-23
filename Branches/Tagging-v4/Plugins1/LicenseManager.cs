using System;
using SeriousBit.Licensing;

namespace Tagging.Plugins
{
    public enum LicenseStatus
    {

        /// <remarks/>
        Valid = 922680000,

        /// <remarks/>
        NotValid = 922680001,

        /// <remarks/>
        Expired = 922680002,

    }

    public class LicenseManager
    {
        readonly string privatekey;
        readonly string publickey;
        readonly string developerkey;
        private const Int32 Valid = 922680000;
        private const Int32 NotValid = 922680001;
        private const Int32 Expired = 922680002;

        public LicenseManager(string privateKey, string publicKey, string developerKey)
        {
            privatekey = privateKey;
            publickey = publicKey;
            developerkey = developerKey;
        }

        public LicenseDetails ValidateLicense(string licenseKey)
        {

            var licensedetails = new LicenseDetails();
            var manager = new SerialsManager("SeriosuBit", developerkey)
                                         {
                                             PrivateKey = privatekey,
                                             PublicKey = publickey
                                         };
            if (manager.IsValid(licenseKey))
            {
                licensedetails.Expirydate = manager.GetExpirationDate(licenseKey);
                licensedetails.Status = Valid.ToString();
                string productInfo = manager.GetInfo(licenseKey);
                if (productInfo != "")
                {
                    if (productInfo.Split(':').Length > 2)
                    {
                        licensedetails.MaxActiveUsers = Convert.ToInt32(productInfo.Split(':')[2]);
                        licensedetails.CustomerName = productInfo.Split(':')[1];
                        licensedetails.Name = productInfo.Split(':')[0];
                        licensedetails.Licensekeyid = manager.GetID(licenseKey);
                    }
                    else
                    {
                        licensedetails.Status = NotValid.ToString();
                    }
                }
                if (licensedetails.Expirydate < DateTime.Now)
                    licensedetails.Status = Expired.ToString();

            }
            else
            {
                licensedetails.Status = NotValid.ToString();
            }
            return licensedetails;
        }


    }
}
