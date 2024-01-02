using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Protocols;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace API
{
    public class CustomAuthorizationAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var request = context.HttpContext.Request;
            var authorizationHeader = request.Headers["Authorization"].FirstOrDefault();
            string token = authorizationHeader?.Split(" ").Last();

            if (!string.IsNullOrEmpty(token))
            {
                var validatedToken = ValidateToken(token).GetAwaiter().GetResult();
                if (validatedToken != null)
                {
                    var emailClaim = validatedToken.Claims.FirstOrDefault(claim => claim.Type == "email")?.Value;
                    var nameClaim = validatedToken.Claims.FirstOrDefault(claim => claim.Type == "name")?.Value;

                    // Create a list of claims
                    var claims = new List<Claim>();
                    if (!string.IsNullOrEmpty(emailClaim))
                    {
                        claims.Add(new Claim(ClaimTypes.Email, emailClaim));
                    }
                    if (!string.IsNullOrEmpty(nameClaim))
                    {
                        claims.Add(new Claim(ClaimTypes.Name, nameClaim));
                    }

                    // Create a ClaimsIdentity and ClaimsPrincipal
                    var identity = new ClaimsIdentity(claims, JwtBearerDefaults.AuthenticationScheme);
                    var principal = new ClaimsPrincipal(identity);
                }
                else
                {
                    // Token is invalid - set the context result to 401 Unauthorized
                    context.Result = new UnauthorizedResult();
                }
            }
            else
            {
                // No token - set the context result to 401 Unauthorized
                context.Result = new UnauthorizedResult();
            }
        }

        private async Task<JwtSecurityToken> ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            // Fetch the discovery document
            var configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                "https://localhost:7014/.well-known/openid-configuration",
                new OpenIdConnectConfigurationRetriever(),
                new HttpDocumentRetriever());
            var discoveryDocument = await configurationManager.GetConfigurationAsync(CancellationToken.None);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = discoveryDocument.SigningKeys,
                ValidateIssuer = true, // Set to true if you want to validate the issuer
                ValidIssuer = "https://localhost:7014", // Replace with your issuer URL
                ValidateAudience = false, // Set to true if you have a specific audience to validate
                ValidateLifetime = false, // Validates the token expiry
                ClockSkew = TimeSpan.Zero // Optional: reduce or increase clock skew time
            };

            try
            {
                tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
                return validatedToken as JwtSecurityToken;
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as needed
                return null;
            }
        }
    }
}
