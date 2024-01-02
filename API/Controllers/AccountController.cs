using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;

        public AccountController(UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }

        [CustomAuthorization]
        [HttpPost("login")]
        public async Task<ActionResult> Login()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email not found in token");
            }

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                user = new IdentityUser
                {
                    UserName = email,
                    Email = email
                };
                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest("User creation failed");
                }
            }

            return Ok();
        }

        [CustomAuthorization]
        [HttpGet]
        public async Task<ActionResult<UserDTO>> GetCurrentUser()
        {
            // Find user by email claim
            var email = User.FindFirstValue(ClaimTypes.Email);
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return NotFound("User not found");
            }

            UserDTO userDTO = new UserDTO
            {
                Mail = user.Email,
                UserName = user.UserName,
                DisplayName = User.FindFirstValue(ClaimTypes.Name)
            };

            return Ok(userDTO);
        }
    }

    public class TokenDTO
    {
        public string Token { get; set; }
    }

    public class UserDTO
    {
        public string Mail { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }
    }
}