using Flow.Data;
using Flow.Data.Providers;
using Flow.Models.Domain;
using Flow.Models.Requests;
using Flow.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace Flow.Services
{
    public class SiteReferencesService : ISiteReferencesService
    {
        private IDataProvider _dataProvider = null;
        private ILookUpService _lookUpService = null;

        public SiteReferencesService(IDataProvider dataProvider, ILookUpService lookUpService)
        {
          
            _dataProvider = dataProvider;
            _lookUpService = lookUpService; 
        }

        public List<SiteReference> GetSummary()
        {

            List<SiteReference> result = null;


            _dataProvider.ExecuteCmd(
                "[dbo].[SiteReferences_Select_Summary]",
                null,
                delegate (IDataReader reader, short set)
                {
                    int startingIndex = 0;

                    SiteReference siteReference = new SiteReference();
                    siteReference.Id = reader.GetSafeInt32(startingIndex++);
                    siteReference.Name = reader.GetSafeString(startingIndex++);
                    siteReference.TotalCount = reader.GetSafeInt32(startingIndex++);

                    if (result == null)
                    {
                        result = new List<SiteReference>();
                    }

                    result.Add(siteReference);
                }
            );


            return result;
        }

        public bool Add(SiteReferenceAddRequest model)
        {
            string procName = "[dbo].[SiteReferences_Insert]";
            _dataProvider.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@ReferenceTypeId", model.ReferenceTypeId);
                col.AddWithValue("@UserId", model.UserId);
            },
            returnParameters: delegate (SqlParameterCollection returnCollection)
            {

                Console.WriteLine("");
            }
            );

            return true;
        }

        public List<LookUp> GetRefTypes()
        {

            List<LookUp> result = null;


            _dataProvider.ExecuteCmd(
                "[dbo].[ReferenceTypes_SelectAll]",
                null,
                delegate (IDataReader reader, short set)
                {
                    int startingIndex = 0;

                    LookUp referenceType = _lookUpService.MapSingleLookUp(reader, ref startingIndex);

                    if (result == null)
                    {
                        result = new List<LookUp>();
                    }

                    result.Add(referenceType);
                }
            );


            return result;
        }
    }
}
