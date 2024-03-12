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

        public static async Task SendEmail(string[] emails, string subject, string body)
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
