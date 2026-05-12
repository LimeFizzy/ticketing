using Ticketing.Application.Interfaces;
using Ticketing.Domain.Constants;
using Ticketing.Domain.Entities;

namespace Ticketing.Application.Services;

public interface IDataSeeder
{
    Task SeedAsync();
}

public class DataSeeder(IEventRepository eventRepository) : IDataSeeder
{
    public async Task SeedAsync()
    {
        var existingEvents = await eventRepository.GetAllAsync();
        if (existingEvents.Any()) return;

        var events = GetMockEvents();
    }

    public static List<Event> GetMockEvents()
    {
        return
        [
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Title = "Vilnius Jazz Festival",
                Category = EventCategory.Music,
                Date = DateTime.Parse("2026-06-20T19:00:00"),
                Venue = "Rotušės aikštė",
                City = "Vilnius",
                PriceFrom = 25m,
                ImageUrl = "https://placehold.co/600x400/1e3a5f/ffffff?text=Jazz+Festival",
                Description = "One of the most prestigious jazz festivals in the Baltic states, bringing together world-class musicians for three nights of unforgettable performances under the open sky in the heart of the Old Town.",
                AvailableTickets = 480,
                Featured = true,
                Disclaimers = "Outdoor event — performances continue rain or shine.|No professional cameras or recording equipment.",
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000011"),
                        Name = "Early bird",
                        Price = 25m,
                        Description = "Limited release"
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000012"),
                        Name = "Standard",
                        Price = 35m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000013"),
                        Name = "VIP lounge",
                        Price = 70m,
                        Description = "Reserved seating, complimentary drink"
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Title = "Žalgiris vs Olympiacos — EuroLeague",
                Category = EventCategory.Sports,
                Date = DateTime.Parse("2026-06-27T18:00:00"),
                Venue = "Žalgirio Arena",
                City = "Kaunas",
                PriceFrom = 35m,
                ImageUrl = "https://placehold.co/600x400/006400/ffffff?text=Zalgiris+Basketball",
                Description = "Witness the passion of Lithuanian basketball as Žalgiris Kaunas takes on Olympiacos in a crucial EuroLeague clash. The atmosphere at Žalgirio Arena is unlike anything else in European basketball.",
                AvailableTickets = 92,
                Featured = true,
                VenueMapId = "vm-zalgirio",
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000021"),
                        Name = "Upper tier",
                        Price = 35m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000022"),
                        Name = "Lower tier",
                        Price = 60m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000023"),
                        Name = "Courtside",
                        Price = 180m,
                        Description = "Front-row seating"
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                Title = "The Phantom of the Opera",
                Category = EventCategory.Theater,
                Date = DateTime.Parse("2026-07-04T19:30:00"),
                Venue = "Lietuvos Nacionalinis Operos ir Baleto Teatras",
                City = "Vilnius",
                PriceFrom = 55m,
                ImageUrl = "https://placehold.co/600x400/4a0072/ffffff?text=Phantom+of+the+Opera",
                Description = "Andrew Lloyd Webber's timeless masterpiece performed by the Lithuanian National Opera. A breathtaking production featuring stunning costumes, dramatic sets, and world-class vocal performances.",
                AvailableTickets = 220,
                Featured = false,
                Disclaimers = "Recommended age 12+. Latecomers admitted at a suitable break.|Smart-casual dress code observed.",
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000031"),
                        Name = "Balcony",
                        Price = 55m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000032"),
                        Name = "Stalls",
                        Price = 95m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000033"),
                        Name = "Private box",
                        Price = 160m,
                        Description = "Up to 4 guests"
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000004"),
                Title = "Kaunas Rock Nights",
                Category = EventCategory.Music,
                Date = DateTime.Parse("2026-07-12T20:00:00"),
                Venue = "Kaunas Sports Hall",
                City = "Kaunas",
                PriceFrom = 18m,
                ImageUrl = "https://placehold.co/600x400/8b0000/ffffff?text=Rock+Nights",
                Description = "A night of high-energy rock music featuring the best Lithuanian rock bands. Expect electric performances, crowd surfing, and an unforgettable evening of pure rock and roll.",
                AvailableTickets = 650,
                Featured = false,
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000041"),
                        Name = "General admission",
                        Price = 18m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000042"),
                        Name = "Front pit",
                        Price = 32m,
                        Description = "Standing, closer to stage"
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000005"),
                Title = "Šiauliai City Marathon",
                Category = EventCategory.Sports,
                Date = DateTime.Parse("2026-07-19T09:00:00"),
                Venue = "Šiauliai City Centre",
                City = "Šiauliai",
                PriceFrom = 12m,
                ImageUrl = "https://placehold.co/600x400/2e7d32/ffffff?text=City+Marathon",
                Description = "Join thousands of runners for the annual Šiauliai City Marathon. Courses available for all levels — 5 km, 10 km, half marathon, and full marathon. A celebration of sport and community.",
                AvailableTickets = 3000,
                Featured = false,
                Disclaimers = "Medical certificate required for the half and full marathon distances.",
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000051"),
                        Name = "5 km",
                        Price = 12m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000052"),
                        Name = "10 km",
                        Price = 18m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000053"),
                        Name = "Half marathon",
                        Price = 28m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000054"),
                        Name = "Full marathon",
                        Price = 38m
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000006"),
                Title = "Midsummer Electronic Festival",
                Category = EventCategory.Music,
                Date = DateTime.Parse("2026-06-21T22:00:00"),
                Venue = "Panevėžys Lakeside Park",
                City = "Panevėžys",
                PriceFrom = 42m,
                ImageUrl = "https://placehold.co/600x400/0d1b2a/00ffcc?text=Electronic+Festival",
                Description = "Celebrate the summer solstice with 12 hours of non-stop electronic music. Four stages, over 30 international and local DJs, and an incredible light show set against a natural lakeside backdrop.",
                AvailableTickets = 190,
                Featured = true,
                Disclaimers = "Strictly 18+. Photo ID required at the gate.",
                VenueMapId = "vm-lakeside",
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000061"),
                        Name = "General admission",
                        Price = 42m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000062"),
                        Name = "VIP",
                        Price = 95m,
                        Description = "Raised viewing deck, dedicated bar"
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000007"),
                Title = "Swan Lake — Ballet Gala",
                Category = EventCategory.Theater,
                Date = DateTime.Parse("2026-08-08T19:00:00"),
                Venue = "Klaipėda Concert Hall",
                City = "Klaipėda",
                PriceFrom = 65m,
                ImageUrl = "https://placehold.co/600x400/1a237e/ffffff?text=Swan+Lake",
                Description = "Tchaikovsky's Swan Lake performed by the renowned Klaipėda State Musical Theatre ballet company. A classic tale of love and transformation brought to life with graceful choreography and lush orchestral music.",
                AvailableTickets = 180,
                Featured = false,
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000071"),
                        Name = "Balcony",
                        Price = 65m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000072"),
                        Name = "Stalls",
                        Price = 110m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000073"),
                        Name = "Premium centre",
                        Price = 150m
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000008"),
                Title = "Lithuanian Football Cup Final",
                Category = EventCategory.Sports,
                Date = DateTime.Parse("2026-08-15T17:00:00"),
                Venue = "LFF Stadionas",
                City = "Vilnius",
                PriceFrom = 15m,
                ImageUrl = "https://placehold.co/600x400/154360/ffffff?text=Football+Cup+Final",
                Description = "The biggest football event of the Lithuanian calendar. Two of the country's finest clubs battle it out for the national cup title in front of a packed and electric atmosphere.",
                AvailableTickets = 4200,
                Featured = false,
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000081"),
                        Name = "Standing",
                        Price = 15m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000082"),
                        Name = "Seated",
                        Price = 28m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000083"),
                        Name = "Hospitality",
                        Price = 80m,
                        Description = "Lounge access, refreshments"
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000009"),
                Title = "Indie Sounds — Summer Edition",
                Category = EventCategory.Music,
                Date = DateTime.Parse("2026-09-05T18:00:00"),
                Venue = "Vilnius Brewery Gardens",
                City = "Vilnius",
                PriceFrom = 22m,
                ImageUrl = "https://placehold.co/600x400/37474f/ffcc00?text=Indie+Sounds",
                Description = "A curated evening of independent music showcasing the best emerging artists from Lithuania and the wider Baltic region. Intimate setting, great acoustics, craft beer, and good vibes.",
                AvailableTickets = 320,
                Featured = false,
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000091"),
                        Name = "General admission",
                        Price = 22m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000092"),
                        Name = "Reserved table",
                        Price = 60m,
                        Description = "Seats up to 4"
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000010"),
                Title = "A Midsummer Night's Dream",
                Category = EventCategory.Theater,
                Date = DateTime.Parse("2026-09-18T19:30:00"),
                Venue = "Vilnius Small Theatre",
                City = "Vilnius",
                PriceFrom = 30m,
                ImageUrl = "https://placehold.co/600x400/4a148c/ffd740?text=Midsummer+Dream",
                Description = "Shakespeare's beloved comedy reimagined in a contemporary Lithuanian setting. A magical production that blends folk tradition with modern theatrical innovation.",
                AvailableTickets = 95,
                Featured = false,
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000101"),
                        Name = "Standard",
                        Price = 30m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000102"),
                        Name = "Front rows",
                        Price = 48m
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000011"),
                Title = "Baltic Cycling Grand Prix",
                Category = EventCategory.Sports,
                Date = DateTime.Parse("2026-09-26T10:00:00"),
                Venue = "Trakai Historical Park",
                City = "Trakai",
                PriceFrom = 8m,
                ImageUrl = "https://placehold.co/600x400/004d40/ffffff?text=Cycling+Grand+Prix",
                Description = "A spectacular cycling race set against the stunning backdrop of Trakai Island Castle. Amateur and professional categories available. Enjoy the scenery and cheer on the cyclists.",
                AvailableTickets = 5000,
                Featured = false,
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000111"),
                        Name = "Spectator pass",
                        Price = 8m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000112"),
                        Name = "Amateur entry",
                        Price = 25m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000113"),
                        Name = "Pro entry",
                        Price = 55m
                    }
                ]
            },
            new Event
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000012"),
                Title = "Žilvinas Žilinskas Live Concert",
                Category = EventCategory.Music,
                Date = DateTime.Parse("2026-10-10T19:00:00"),
                Venue = "Siemens Arena",
                City = "Vilnius",
                PriceFrom = 85m,
                ImageUrl = "https://placehold.co/600x400/212121/e0e0e0?text=Zilvinas+Zilinskas",
                Description = "Lithuania's most celebrated pop star returns for a spectacular solo concert at Siemens Arena. An evening of hits, new material, and stunning production values. The must-see concert of the year.",
                AvailableTickets = 8500,
                Featured = false,
                TicketTypes =
                [
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000121"),
                        Name = "Upper tier",
                        Price = 85m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000122"),
                        Name = "Lower tier",
                        Price = 130m
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000123"),
                        Name = "Fan pit",
                        Price = 175m,
                        Description = "Standing, closest to stage"
                    },
                    new EventTicketType
                    {
                        Id = Guid.Parse("00000000-0000-0000-0000-000000000124"),
                        Name = "VIP package",
                        Price = 250m,
                        Description = "Meet & greet, signed merch"
                    }
                ]
            }
        ];
    }
}
