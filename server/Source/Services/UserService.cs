using System.Security.Cryptography;
using Demiplane.Model;

public class UserService
{
    public static User GenerateUser(List<User> users)
    {
        Guid guid = Guid.NewGuid();
        string username = "Wanderer " + (users.Count + 1);
        string bearer = GenerateBearerToken();
        string color = GenerateUserColor(guid);
        return new(guid.ToString(), bearer, username, color);
    }

    private static string GenerateBearerToken()
    {
        byte[] tokenBytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToHexString(tokenBytes);
    }

    private static string GenerateUserColor(Guid guid)
    {
        byte[] bytes = guid.ToByteArray();
        byte r = (byte)(bytes[0] % 200 + 30);
        byte g = (byte)(bytes[1] % 200 + 30);
        byte b = (byte)(bytes[2] % 200 + 30);
        return $"#{r:X2}{g:X2}{b:X2}";

    }
}