using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public static class DataSeeder
{
    public static List<Event> GetMockEvents()
    {
        return
        [
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Title = "Vilnius Jazz Festival",
                Category = EventCategory.Music,
                Date = DateTime.SpecifyKind(DateTime.Parse("2026-06-20T19:00:00"), DateTimeKind.Utc),
                Venue = "Rotušės aikštė",
                City = "Vilnius",
                PriceFrom = 25m,
                ImageUrl = "https://placehold.co/600x400/1e3a5f/ffffff?text=Jazz+Festival",
                Description = "One of the most prestigious jazz festivals in the Baltic states, bringing together world-class musicians for three nights of unforgettable performances under the open sky in the heart of the Old Town.",
                AvailableTickets = 480,
                Featured = true,
                Disclaimers = "Outdoor event — performances continue rain or shine.|No professional cameras or recording equipment.",
                Status = "published",
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000011"),
                        Name = "Early bird",
                        Price = 25m,
                        Description = "Limited release",
                        Capacity = 200
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000012"),
                        Name = "Standard",
                        Price = 35m,
                        Capacity = 200
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000013"),
                        Name = "VIP lounge",
                        Price = 70m,
                        Description = "Reserved seating, complimentary drink",
                        Capacity = 80
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Title = "Žalgiris vs Olympiacos — EuroLeague",
                Category = EventCategory.Sports,
                Date = DateTime.SpecifyKind(DateTime.Parse("2026-06-27T18:00:00"), DateTimeKind.Utc),
                Venue = "Žalgirio Arena",
                City = "Kaunas",
                PriceFrom = 35m,
                ImageUrl = "https://placehold.co/600x400/006400/ffffff?text=Zalgiris+Basketball",
                Description = "Witness the passion of Lithuanian basketball as Žalgiris Kaunas takes on Olympiacos in a crucial EuroLeague clash. The atmosphere at Žalgirio Arena is unlike anything else in European basketball.",
                AvailableTickets = 92,
                Featured = true,
                VenueMapId = "vm-zalgirio",
                Status = "published",
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000021"),
                        Name = "Upper tier",
                        Price = 35m,
                        Capacity = 800
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000022"),
                        Name = "Lower tier",
                        Price = 60m,
                        Capacity = 300
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000023"),
                        Name = "Courtside",
                        Price = 180m,
                        Description = "Front-row seating",
                        Capacity = 40
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000006"),
                Title = "Midsummer Electronic Festival",
                Category = EventCategory.Music,
                Date = DateTime.SpecifyKind(DateTime.Parse("2026-06-21T22:00:00"), DateTimeKind.Utc),
                Venue = "Panevėžys Lakeside Park",
                City = "Panevėžys",
                PriceFrom = 42m,
                ImageUrl = "https://placehold.co/600x400/0d1b2a/00ffcc?text=Electronic+Festival",
                Description = "Celebrate the summer solstice with 12 hours of non-stop electronic music. Four stages, over 30 international and local DJs, and an incredible light show set against a natural lakeside backdrop.",
                AvailableTickets = 190,
                Featured = true,
                Disclaimers = "Strictly 18+. Photo ID required at the gate.",
                VenueMapId = "vm-lakeside",
                Status = "published",
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000061"),
                        Name = "General admission",
                        Price = 42m,
                        Capacity = 200
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000062"),
                        Name = "VIP",
                        Price = 95m,
                        Description = "Raised viewing deck, dedicated bar",
                        Capacity = 50
                    }
                ]
            }
        ];
    }
}
