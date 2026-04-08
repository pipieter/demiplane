using System.Security.Cryptography;
using Demiplane.Model;

namespace Demiplane.Services;

public class UserService
{
    public static User GenerateUser(List<User> users)
    {
        Guid guid = Guid.NewGuid();
        string username = "Wanderer " + (users.Count + 1);
        string secret = GenerateSecretToken();
        string color = GenerateUserColor(guid);
        return new(guid.ToString(), secret, username, color, null);
    }

    private static string GenerateSecretToken()
    {
        byte[] tokenBytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToHexString(tokenBytes);
    }

    private static string GenerateUserColor(Guid guid)
    {
        byte[] bytes = guid.ToByteArray();
        byte r = (byte)((bytes[0] % 200) + 30);
        byte g = (byte)((bytes[1] % 200) + 30);
        byte b = (byte)((bytes[2] % 200) + 30);
        return $"#{r:X2}{g:X2}{b:X2}";

    }
}