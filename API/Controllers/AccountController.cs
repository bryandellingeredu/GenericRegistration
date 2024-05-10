using API.Services;
using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph.Models;
using System.Data;
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
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly TokenService _tokenService;

        public AccountController(UserManager<IdentityUser> userManager, TokenService tokenService, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _roleManager = roleManager; 
        }

        [HttpGet]
        public async Task<ActionResult<UserDTO>> GetCurrentUser()
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
            var roles = await _userManager.GetRolesAsync(user);
            UserDTO userDTO = new UserDTO
            {
                Mail = user.Email,
                UserName = user.UserName,
                Token = await _tokenService.CreateToken(user, User.FindFirstValue(ClaimTypes.GivenName)),
                DisplayName = User.FindFirstValue(ClaimTypes.GivenName),
                Roles = roles.ToArray()
            };

            return Ok(userDTO);
        }

        [HttpGet("listAdmins")]
        [Authorize(Roles = "Administrators")]
        public async Task<ActionResult<UserDTO[]>> listAdmins()
        {
            var role = await _roleManager.FindByNameAsync("Administrators");
            if (role == null)
            {
                return BadRequest("Role does not exist");
            }
            var usersInRole = await _userManager.GetUsersInRoleAsync("Administrators");

            var userDTOs = usersInRole.Select(user => new UserDTO
            {
                Mail = user.Email,
                UserName = user.UserName,
                Token = string.Empty,
                DisplayName = user.UserName,
                Roles = new string[] { "Administrators" }
            }).ToArray();

            return Ok(userDTOs);
        }

        [HttpGet("listEmails")]
        public async Task<ActionResult<List<string>>> ListEmails()
        {
            var userEmails = (await _userManager.Users
             .Select(user => user.Email)
             .ToListAsync())
             .OrderBy(email => email, StringComparer.OrdinalIgnoreCase)
             .ToList();

            return Ok(userEmails);  
        }
  



        [HttpPost("addAdmin")]
        [Authorize(Roles = "Administrators")]
        public async Task<ActionResult> AddAdmin([FromBody] AdminRequest request)
        {
            string email = request.Email;
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
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
                        }else{
                            await _userManager.AddToRoleAsync(user, "Administrators");
                             return Ok();
                        }
                    }
            }
            var roles = await _userManager.GetRolesAsync(user);
            var isAdmin = roles.Contains("Administrators");
            if (!isAdmin) {
                await _userManager.AddToRoleAsync(user, "Administrators");
            }
            return Ok();

        }

        [HttpPost("removeAdmin")]
        [Authorize(Roles = "Administrators")]
        public async Task<ActionResult> RemoveAdmin([FromBody] AdminRequest request)
        {
            string email = request.Email;
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return BadRequest("User does not exist");
            }
            var roles = await _userManager.GetRolesAsync(user);
            var isAdmin = roles.Contains("Administrators");
            if (isAdmin)
            {
                await _userManager.RemoveFromRoleAsync(user, "Administrators");
            }
            return Ok();

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
                    if (!await _roleManager.RoleExistsAsync("Administrators"))
                    {
                        await _roleManager.CreateAsync(new IdentityRole("Administrators"));
                    }

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

                    if (user.Email.Equals("bryan.dellinger.civ@armywarcollege.edu"))
                    {
                        if (!await _userManager.IsInRoleAsync(user, "Administrators"))
                        {
                            await _userManager.AddToRoleAsync(user, "Administrators");
                        }
                    }
                    var roles = await _userManager.GetRolesAsync(user);
                    UserDTO userDTO = new UserDTO
                    {
                        Mail = user.Email,
                        UserName = user.UserName,
                        Token = await _tokenService.CreateToken(user, displayName),
                        DisplayName = displayName,
                        Roles = roles.ToArray()
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

                    if (!await _roleManager.RoleExistsAsync("Administrators"))
                    {
                        await _roleManager.CreateAsync(new IdentityRole("Administrators"));
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

                    if (user.Email.Equals("bryan.dellinger.civ@armywarcollege.edu"))
                    {
                        if (!await _userManager.IsInRoleAsync(user, "Administrators"))
                        {
                            await _userManager.AddToRoleAsync(user, "Administrators");
                        }
                    }
                    var roles = await _userManager.GetRolesAsync(user);

                    UserDTO userDTO = new UserDTO
                    {
                        Mail = user.Email,
                        UserName = user.UserName,
                        Token = await _tokenService.CreateToken(user, graphUser.DisplayName),
                        DisplayName = graphUser.DisplayName,
                        Roles = roles.ToArray()
                    };
                    return Ok(userDTO);
                }
            }
        }

    }

    public class AdminRequest
    {
        public string Email { get; set; }
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
        public string[] Roles { get; set; }
    }

    public class GraphUser
    {
        public string Mail { get; set; }
        public string DisplayName { get; set; }
        public string Id { get; set; }
    }
}

