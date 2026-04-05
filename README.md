# Ticketing System

## Local Setup Workflow

### 1. Run the Backend API
```bash
docker run -itd -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 --name postgresql postgres

cd Ticketing.API
```

Setup `appsettings.Development.json`:
```json
{
    "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres"
    },
    "AllowedOrigin": "http://localhost:3000"
}
```

Lastly run the following:
```bash
dotnet run
```

### 2. Run the UI & Generate SDK
To use the UI locally, you'll need the auto-generated types from the backend API.
Open a new terminal session, grab the openapi spec, compile the SDK, and start Next.js!

```bash
cd frontend

curl http://localhost:8080/swagger/v1/swagger.json -o swagger.json

npm i

npm run api:gen

npm run dev
```