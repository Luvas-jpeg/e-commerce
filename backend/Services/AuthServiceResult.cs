namespace EquipamentosMedicosApi.Services;

public class AuthServiceResult<T>
{
    public bool Success { get; set; }

    public string? Error { get; set; }

    public T? Data { get; set; }

    public static AuthServiceResult<T> Ok(T data)
    {
        return new AuthServiceResult<T>
        {
            Success = true,
            Data = data
        };
    }

    public static AuthServiceResult<T> Fail(string error)
    {
        return new AuthServiceResult<T>
        {
            Success = false,
            Error = error
        };
    }
}