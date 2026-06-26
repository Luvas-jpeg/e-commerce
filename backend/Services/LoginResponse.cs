using EquipamentosMedicosApi.DTOs;

namespace EquipamentosMedicosApi.Services;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;

    public UserResponseDTO User { get; set; } = new();
}