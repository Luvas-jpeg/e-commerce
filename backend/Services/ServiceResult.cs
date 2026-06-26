namespace EquipamentosMedicosApi.Services;

public class ServiceResult<T>
{
    public bool Success {get; set;}
    public string? Error {get; set;}
    public T? Data {get;set;}

    public static ServiceResult<T> Ok(T data)
    {
        return new ServiceResult<T> {Success = true, Data = data};
    }

    public static ServiceResult<T> Fail(string error)
    {
        return new ServiceResult<T> {Success = false, Error = error};
    }
}