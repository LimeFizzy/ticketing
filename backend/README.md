# Ticketing Backend

To run the backend locally:

```bash
docker run -itd -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 --name postgresql postgres

cd Ticketing.API
```

Setup `appsettings.Development.json`:
```json
{
    "ConnectionStrings": {
        "DefaultConnection": "Host=postgres;Port=5432;Database=postgres;Username=postgres;Password=postgres"
    },
    "CORS": {
        "AllowedOrigins": [
            "http://localhost:3000"
        ]
    }
}
```

Lastly run the following:
```bash
dotnet run
```
