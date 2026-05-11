FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

EXPOSE 8080

WORKDIR /app

COPY ./publish/ . 

ENTRYPOINT ["dotnet", "Ticketing.API.dll"]