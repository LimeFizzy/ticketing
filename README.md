# Ticketing System

## Local Setup Workflow

### 1. Run the Backend API
#### Database
```bash
docker run -itd -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 --name postgresql postgres
```

#### Stripe
```bash
brew install stripe/stripe-cli/stripe

stripe login
stripe listen --forward-to localhost:8080/api/webhooks/stripe
```

#### `Ticketing.API/appsettings.Development.json`:
```json
{
    "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres"
    },
    "AllowedOrigin": "http://localhost:3000",
    "Stripe": {
        "SecretKey": "sk_test_XXXX",
        "PublishableKey": "pk_test_XXXX",
        "WebhookSecret": "whsec_XXXX",
        "SuccessUrl": "http://localhost:3000/tickets?order=confirmed",
        "CancelUrl": "http://localhost:3000/tickets?order=cancelled"
    }
}
```
`SecretKey` & `PublishableKey` - should be retrieved from Stripe UI; <br />
`WebhookSecret` - will be displayed, when `stripe listen` is ran.

#### API
```bash
cd Ticketing.API
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