using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Services.Interfaces;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;
using System;
using System.Collections.Generic;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/sitereferences")]
    [ApiController]
    public class SiteReferencesApiController : BaseApiController
    {
        private ISiteReferencesService _service = null;
        public SiteReferencesApiController(ISiteReferencesService service
            , ILogger<SiteReferencesApiController> logger
            ) : base(logger)
        {
            _service = service;
        }

        [HttpGet("summary")]
        public ActionResult<ItemsResponse<SiteReference>> GetSummary()
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<SiteReference> list = _service.GetSummary();

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("Records Not Found");
                }
                else
                {
                    response = new ItemsResponse<SiteReference> { Items = list };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }
            return StatusCode(code, response);
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult<SuccessResponse> Add(SiteReferenceAddRequest model)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {

                bool isSuccessful = _service.Add(model);

                if (isSuccessful)
                {
                    response = new SuccessResponse();
                }
                else
                {
                    code = 404;
                    response = new ErrorResponse("Could not Add Site Reference Entry");
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }

        [HttpGet("types")]
        [AllowAnonymous]
        public ActionResult<ItemsResponse<LookUp>> GetRefTypes()
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<LookUp> list = _service.GetRefTypes();

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("Records Not Found");
                }
                else
                {
                    response = new ItemsResponse<LookUp> { Items = list };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }
            return StatusCode(code, response);
        }
    }
}