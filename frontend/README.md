# Ticketing Frontend

To use the UI locally, you need to pull the OpenAPI definition from the backend and generate the SDK.

### 1. Retrieve swagger.json & Generate
While the backend is running on port 8080, download `swagger.json` and run the generation script:

```bash
curl http://localhost:8080/swagger/v1/swagger.json -o swagger.json
npm run api:gen
```

### 2. Run the UI
```bash
npm run dev
```
