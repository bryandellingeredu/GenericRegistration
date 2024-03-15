using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Graph.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using static API.Controllers.AccountController;


namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly TokenService _tokenService;

        public AccountController(UserManager<IdentityUser> userManager, TokenService tokenService)
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
                Token = _tokenService.CreateToken(user, User.FindFirstValue(ClaimTypes.GivenName)),
                DisplayName = User.FindFirstValue(ClaimTypes.GivenName)
            };

            return Ok(userDTO);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDTO>> Login(GraphTokenDTO graphToken)
        {
            var handler = new HttpClientHandler()
            {
                AllowAutoRedirect = false
            };

            using (var httpClient = new HttpClient(handler))
            {
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", graphToken.Token);
                var response = await httpClient.GetAsync("https://graph.microsoft.com/v1.0/me");

                if (!response.IsSuccessStatusCode)
                {
                    var h = new JwtSecurityTokenHandler();
                    var tokenS = h.ReadToken(graphToken.Token) as JwtSecurityToken;
                    string email = tokenS.Claims.FirstOrDefault(claim => claim.Type == "upn")?.Value;
                    string displayName = tokenS.Claims.FirstOrDefault(claim => claim.Type == "name")?.Value;

                    IdentityUser user = await _userManager.FindByEmailAsync(email);
                    if (user == null)
                    {
                        user = new IdentityUser
                        {
                            UserName = email,
                            Email = email,
                        };
                        var result = await _userManager.CreateAsync(user);
                        if (!result.Succeeded)
                        {
                            return BadRequest("User creation failed");
                        }
                    }

                    UserDTO userDTO = new UserDTO
                    {
                        Mail = user.Email,
                        UserName = user.UserName,
                        Token = _tokenService.CreateToken(user, displayName),
                        DisplayName = displayName
                    };
                    return Ok(userDTO);
                }
                else
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var graphUser = JsonSerializer.Deserialize<GraphUser>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (graphUser == null)
                    {
                        return BadRequest("Error parsing user data");
                    }

                    IdentityUser user = await _userManager.FindByEmailAsync(graphUser.Mail);
                    if (user == null)
                    {
                        user = new IdentityUser
                        {
                            UserName = graphUser.Mail,
                            Email = graphUser.Mail,
                        };
                        var result = await _userManager.CreateAsync(user);
                        if (!result.Succeeded)
                        {
                            return BadRequest("User creation failed");
                        }
                    }

                    UserDTO userDTO = new UserDTO
                    {
                        Mail = user.Email,
                        UserName = user.UserName,
                        Token = _tokenService.CreateToken(user, graphUser.DisplayName),
                        DisplayName = graphUser.DisplayName
                    };
                    return Ok(userDTO);
                }
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
        public string Mail { get; set; }
        public string DisplayName { get; set; }
        public string Id { get; set; }
    }
}

