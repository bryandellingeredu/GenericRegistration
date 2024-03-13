using Azure.Identity;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public class GraphHelper
    {
        private static Settings _settings;
        private static ClientSecretCredential _clientSecretCredential;
        private static GraphServiceClient _appClient;
        public static string GetEEMServiceAccount() => _settings.ServiceAccount;

        public static void InitializeGraph(Settings settings,
             Func<DeviceCodeInfo, CancellationToken, Task> deviceCodePrompt)
        {
            _settings = settings;
        }

        private static void EnsureGraphForAppOnlyAuth()
        {
            _ = _settings ??
              throw new System.NullReferenceException("Settings cannot be null");

            if (_clientSecretCredential == null)
            {
                _clientSecretCredential = new ClientSecretCredential(
                  _settings.TenantId, _settings.ClientId, _settings.ClientSecret);
            }

            if (_appClient == null)
            {
                _appClient = new GraphServiceClient(_clientSecretCredential,
                  new[] {
            "https://graph.microsoft.com/.default"
                  });
            }
        }

        public static async Task SendEmail(string[] emails, string subject, string body, string icalContent = null, string icalFileName = "invite.ics")
        {
            EnsureGraphForAppOnlyAuth();
            _ = _appClient ?? throw new System.NullReferenceException("Graph has not been initialized for app-only auth");

            var recipients = emails.Select(email => new Recipient
            {
                EmailAddress = new EmailAddress { Address = email }
            }).ToList();

            var message = new Message
            {
                Subject = subject,
                Body = new ItemBody
                {
                    ContentType = BodyType.Html,
                    Content = body
                },
                ToRecipients = recipients,
            };

            // Check if iCal content is provided and prepare it as an attachment
            if (!string.IsNullOrEmpty(icalContent))
            {
                byte[] icalBytes = Encoding.UTF8.GetBytes(icalContent);
                var icalAttachment = new FileAttachment
                {
                    // ODataType might not be necessary depending on your Graph SDK version
                    // ODataType = "#microsoft.graph.fileAttachment",
                    ContentBytes = icalBytes,
                    ContentType = "text/calendar",
                    Name = icalFileName
                };

                // Initialize the Attachments collection if it's null
                if (message.Attachments == null)
                {
                    message.Attachments = new List<Attachment>();
                }

                message.Attachments.Add(icalAttachment);
            }


            Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody mailbody = new()
            {
                Message = message,
                SaveToSentItems = false  
            };

            try
            {
                await _appClient.Users[_settings.ServiceAccount]
                .SendMail
                .PostAsync(mailbody);
            }
            catch (Exception ex)
            {
                throw;
            }

           
        }
    }

}
