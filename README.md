# Ticketing System

## Local Setup Workflow

### 1. Run the Backend API
```bash
cb backend/Ticketing.Infrastructure
dotnet ef database update --startup-project=../Ticketing.API

cd ../Ticketing.API
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