using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;

namespace API.Controllers
{
  
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly TokenService _tokenService;
        public AccountController(
            UserManager<IdentityUser> userManager, TokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        [HttpGet]
        public async Task<ActionResult<UserDTO>> GetCurrentUser()
            {
              var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));

            UserDTO userDTO = new UserDTO
            {
                Mail = user.Email,
                UserName = user.UserName,
                Token = _tokenService.CreateToken(user, ClaimTypes.GivenName),
                DisplayName = User.FindFirstValue(ClaimTypes.GivenName)
            };

            return Ok(userDTO);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDTO>> Login(GraphTokenDTO graphToken)
        {
            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", graphToken.Token);
                var response = await httpClient.GetAsync("https://graph.microsoft.com/v1.0/me");

                if (!response.IsSuccessStatusCode)
                {
                    // Handle error response
                    return BadRequest("Error fetching user data from Microsoft Graph");
                }

                var content = await response.Content.ReadAsStringAsync();
                var graphUser = JsonSerializer.Deserialize<GraphUser>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (graphUser == null)
                {
                    // Handle deserialization failure
                    return BadRequest("Error parsing user data");
                }

                var user = await _userManager.FindByEmailAsync(graphUser.Mail);

                if (user == null)
                {
                    // User not found, create a new one
                    user = new IdentityUser
                    {
                        UserName = graphUser.Mail, // Or another unique identifier
                        Email = graphUser.Mail,
                        
                    };
                    var result = await _userManager.CreateAsync(user);

                    if (!result.Succeeded)
                    {
                        // Handle the case where user creation failed
                        return BadRequest("User creation failed");
                    }

                }

                // If this point is reached, user is either found or created successfully
                UserDTO userDTO = new UserDTO {
                    Mail = user.Email,
                    UserName = user.UserName,
                    Token = _tokenService.CreateToken(user, graphUser.DisplayName),
                    DisplayName = graphUser.DisplayName
                };
                return Ok(userDTO);
            }
        }
    }

    public class GraphTokenDTO
    {
        public string Token { get; set; }
    }

    public class UserDTO
    {
        public string Mail { get; set; }
        public string UserName { get; set; }
        public string Token { get; set; }
        public string DisplayName { get; set; } 
    }

    public class GraphUser
    {
        // The primary email address of the user.
        // The exact name of the property might vary based on the Graph API response.
        // Commonly, it can be "mail" or "userPrincipalName" depending on the user type and settings.
        public string Mail { get; set; }

        // The user's display name.
        public string DisplayName { get; set; }

        // The unique identifier for the user.
        public string Id { get; set; }

        // Additional properties as needed...
    }
}
    

