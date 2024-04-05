using System.Net.Mail;
using System.Runtime.CompilerServices;
using Application.Core;
using Application.EmailLink;
using Application.Upload;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    public class UploadController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly EncryptionHelper _encryptionHelper;

        public UploadController(DataContext context, EncryptionHelper encryptionHelper)
        {
            _context = context;
            _encryptionHelper = encryptionHelper;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFile(Guid id)
        {   
            var answerAttachment = await _context.AnswerAttachments.FindAsync(id);
            var file = await _context.Attachments.FindAsync(answerAttachment.AttachmentId);
            if (file == null)  return NotFound();
           return File(file.BinaryData, answerAttachment.FileType, answerAttachment.FileName);
        }

        [AllowAnonymous]
        [HttpPost("download")]
        public async Task<IActionResult> Download([FromBody] DownloadRequest request)
        {

            //validate the key
            var encryptedKeyBytes = Convert.FromBase64String(request.EncryptedKey);
            var decryptedKey = _encryptionHelper.DecryptStringFromBytes_Aes(encryptedKeyBytes);
            var registrationLinks = await _context.RegistrationLinks.Where(x => x.RandomKey == decryptedKey).FirstOrDefaultAsync();
            if (registrationLinks != null)
            {
                var answerAttachment = await _context.AnswerAttachments.FindAsync(request.Id);
                var file = await _context.Attachments.FindAsync(answerAttachment.AttachmentId);
                if (file == null)
                {
                    return NotFound();
                }
                return File(file.BinaryData, answerAttachment.FileType, answerAttachment.FileName);

            }
            return Unauthorized();
        }


        [AllowAnonymous]
        [HttpPost("addAnswerAttachment")]
        public async Task<IActionResult> AddAnswerAttachment(
            [FromForm] string answerAttachmentId,
            [FromForm] string customQuestionId,
            [FromForm] string registrationId,
            [FromForm] AddAnswerAttachment.Command command)
        {
            command.AnswerAttachmentId = Guid.Parse(answerAttachmentId);
            command.CustomQuestionId = Guid.Parse(customQuestionId);
            command.RegistrationId = Guid.Parse(registrationId);    
            return HandleResult(await Mediator.Send(command));
        }

        public class DownloadRequest
        {
            public Guid Id { get; set; }
            public string EncryptedKey { get; set; }
        }
    }
}
