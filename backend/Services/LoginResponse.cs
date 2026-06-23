using EquipamentosMedicosApi.DTOs;

namespace EquipamentosMedicosApi.Service;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;

    public UserResponseDTO User { get; set; } = new();
}