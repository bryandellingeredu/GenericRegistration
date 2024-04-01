using System.Net.Mail;
using Application.Upload;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    public class UploadController : BaseApiController
    {
        private readonly DataContext _context;

         public UploadController(DataContext context) =>  _context = context;

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFile(Guid id)
        {   
            var answerAttachment = await _context.AnswerAttachments.FindAsync(id);
            var file = await _context.Attachments.FindAsync(answerAttachment.AttachmentId);
            if (file == null)  return NotFound();
           return File(file.BinaryData, answerAttachment.FileType, answerAttachment.FileName);
        }

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
    }
}
