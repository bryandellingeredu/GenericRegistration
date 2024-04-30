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
        private readonly IWebHostEnvironment _env;

        public UploadController(DataContext context, EncryptionHelper encryptionHelper, IWebHostEnvironment env)
        {
            _context = context;
            _encryptionHelper = encryptionHelper;
            _env = env; 
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

        [AllowAnonymous]
        [HttpPost("addDocumentLibraryAttachment")]
        public async Task<IActionResult> AddDocumentLibraryAttachment(
                  [FromForm] string answerAttachmentId,
                  [FromForm] string registrationId,
                  [FromForm] AddDocumentLibraryAttachment.Command command)
        {
            command.AnswerAttachmentId = Guid.Parse(answerAttachmentId);
            command.RegistrationId = Guid.Parse(registrationId);
            return HandleResult(await Mediator.Send(command));
        }
            

        [AllowAnonymous]
        [HttpPost("uploadImage")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile imageFile)

        {
            if (imageFile == null || imageFile.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            // Convert the image to a byte array
            byte[] fileBytes;
            using (var memoryStream = new MemoryStream())
            {
                await imageFile.CopyToAsync(memoryStream);
                fileBytes = memoryStream.ToArray();
            }

            Domain.Attachment attachment = new Domain.Attachment { BinaryData = fileBytes };
            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            var answerAttachment = new Domain.AnswerAttachment
            {
      
                FileType = imageFile.ContentType,
                FileName = imageFile.FileName,
                AttachmentId = attachment.Id,
            };

            _context.AnswerAttachments.Add(answerAttachment);
            await _context.SaveChangesAsync();


            // Return success response (consider returning the ID or any other relevant data for the uploaded file)

            string baseUrl;
            if (_env.IsDevelopment())
            {
                baseUrl = "https://localhost:7193";
            }
            else
            {
                baseUrl = "https://apps.armywarcollege.edu/registration";
            }

            string imageUrl = $"{baseUrl}/api/upload/image/{answerAttachment.Id}";
            return Ok(new { data = new { link = imageUrl } });
        }

        [AllowAnonymous]    
        [HttpGet("image/{id}")]
        public async Task<IActionResult> GetImage(Guid id)
        {
            var answerAttachment = await _context.AnswerAttachments.FindAsync(id); 
            
            var attachment = await _context.Attachments
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == answerAttachment.AttachmentId);

            if (attachment == null || attachment.BinaryData == null)
            {
                return NotFound();
            }

            return File(attachment.BinaryData, answerAttachment.FileType, answerAttachment.FileName);
        }

        public class DownloadRequest
        {
            public Guid Id { get; set; }
            public string EncryptedKey { get; set; }
        }
    }
}
