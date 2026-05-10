import { type Event } from '@/types/event';

export const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Vilnius Jazz Festival',
    category: 'Music',
    date: '2026-06-20T19:00:00',
    venue: 'Rotušės aikštė',
    city: 'Vilnius',
    priceFrom: 25,
    ticketTypes: [
      {
        id: '1-early',
        name: 'Early bird',
        price: 25,
        description: 'Limited release',
      },
      { id: '1-std', name: 'Standard', price: 35 },
      {
        id: '1-vip',
        name: 'VIP lounge',
        price: 70,
        description: 'Reserved seating, complimentary drink',
      },
    ],
    imageUrl: 'https://placehold.co/600x400/1e3a5f/ffffff?text=Jazz+Festival',
    description:
      'One of the most prestigious jazz festivals in the Baltic states, bringing together world-class musicians for three nights of unforgettable performances under the open sky in the heart of the Old Town.',
    availableTickets: 480,
    featured: true,
    disclaimers: [
      'Outdoor event — performances continue rain or shine.',
      'No professional cameras or recording equipment.',
    ],
  },
  {
    id: '2',
    title: 'Žalgiris vs Olympiacos — EuroLeague',
    category: 'Sports',
    date: '2026-06-27T18:00:00',
    venue: 'Žalgirio Arena',
    city: 'Kaunas',
    priceFrom: 35,
    ticketTypes: [
      { id: '2-upper', name: 'Upper tier', price: 35 },
      { id: '2-lower', name: 'Lower tier', price: 60 },
      {
        id: '2-courtside',
        name: 'Courtside',
        price: 180,
        description: 'Front-row seating',
      },
    ],
    imageUrl:
      'https://placehold.co/600x400/006400/ffffff?text=Zalgiris+Basketball',
    description:
      'Witness the passion of Lithuanian basketball as Žalgiris Kaunas takes on Olympiacos in a crucial EuroLeague clash. The atmosphere at Žalgirio Arena is unlike anything else in European basketball.',
    availableTickets: 92,
    featured: true,
    venueMapId: 'vm-zalgirio',
  },
  {
    id: '3',
    title: 'The Phantom of the Opera',
    category: 'Theater',
    date: '2026-07-04T19:30:00',
    venue: 'Lietuvos Nacionalinis Operos ir Baleto Teatras',
    city: 'Vilnius',
    priceFrom: 55,
    ticketTypes: [
      { id: '3-balcony', name: 'Balcony', price: 55 },
      { id: '3-stalls', name: 'Stalls', price: 95 },
      {
        id: '3-box',
        name: 'Private box',
        price: 160,
        description: 'Up to 4 guests',
      },
    ],
    imageUrl:
      'https://placehold.co/600x400/4a0072/ffffff?text=Phantom+of+the+Opera',
    description:
      "Andrew Lloyd Webber's timeless masterpiece performed by the Lithuanian National Opera. A breathtaking production featuring stunning costumes, dramatic sets, and world-class vocal performances.",
    availableTickets: 220,
    featured: false,
    disclaimers: [
      'Recommended age 12+. Latecomers admitted at a suitable break.',
      'Smart-casual dress code observed.',
    ],
  },
  {
    id: '4',
    title: 'Kaunas Rock Nights',
    category: 'Music',
    date: '2026-07-12T20:00:00',
    venue: 'Kaunas Sports Hall',
    city: 'Kaunas',
    priceFrom: 18,
    ticketTypes: [
      { id: '4-ga', name: 'General admission', price: 18 },
      {
        id: '4-pit',
        name: 'Front pit',
        price: 32,
        description: 'Standing, closer to stage',
      },
    ],
    imageUrl: 'https://placehold.co/600x400/8b0000/ffffff?text=Rock+Nights',
    description:
      'A night of high-energy rock music featuring the best Lithuanian rock bands. Expect electric performances, crowd surfing, and an unforgettable evening of pure rock and roll.',
    availableTickets: 650,
    featured: false,
  },
  {
    id: '5',
    title: 'Šiauliai City Marathon',
    category: 'Sports',
    date: '2026-07-19T09:00:00',
    venue: 'Šiauliai City Centre',
    city: 'Šiauliai',
    priceFrom: 12,
    ticketTypes: [
      { id: '5-5k', name: '5 km', price: 12 },
      { id: '5-10k', name: '10 km', price: 18 },
      { id: '5-half', name: 'Half marathon', price: 28 },
      { id: '5-full', name: 'Full marathon', price: 38 },
    ],
    imageUrl: 'https://placehold.co/600x400/2e7d32/ffffff?text=City+Marathon',
    description:
      'Join thousands of runners for the annual Šiauliai City Marathon. Courses available for all levels — 5 km, 10 km, half marathon, and full marathon. A celebration of sport and community.',
    availableTickets: 3000,
    featured: false,
    disclaimers: [
      'Medical certificate required for the half and full marathon distances.',
    ],
  },
  {
    id: '6',
    title: 'Midsummer Electronic Festival',
    category: 'Music',
    date: '2026-06-21T22:00:00',
    venue: 'Panevėžys Lakeside Park',
    city: 'Panevėžys',
    priceFrom: 42,
    ticketTypes: [
      { id: '6-ga', name: 'General admission', price: 42 },
      {
        id: '6-vip',
        name: 'VIP',
        price: 95,
        description: 'Raised viewing deck, dedicated bar',
      },
    ],
    imageUrl:
      'https://placehold.co/600x400/0d1b2a/00ffcc?text=Electronic+Festival',
    description:
      'Celebrate the summer solstice with 12 hours of non-stop electronic music. Four stages, over 30 international and local DJs, and an incredible light show set against a natural lakeside backdrop.',
    availableTickets: 190,
    featured: true,
    disclaimers: ['Strictly 18+. Photo ID required at the gate.'],
    venueMapId: 'vm-lakeside',
  },
  {
    id: '7',
    title: 'Swan Lake — Ballet Gala',
    category: 'Theater',
    date: '2026-08-08T19:00:00',
    venue: 'Klaipėda Concert Hall',
    city: 'Klaipėda',
    priceFrom: 65,
    ticketTypes: [
      { id: '7-balcony', name: 'Balcony', price: 65 },
      { id: '7-stalls', name: 'Stalls', price: 110 },
      { id: '7-premium', name: 'Premium centre', price: 150 },
    ],
    imageUrl: 'https://placehold.co/600x400/1a237e/ffffff?text=Swan+Lake',
    description:
      "Tchaikovsky's Swan Lake performed by the renowned Klaipėda State Musical Theatre ballet company. A classic tale of love and transformation brought to life with graceful choreography and lush orchestral music.",
    availableTickets: 180,
    featured: false,
  },
  {
    id: '8',
    title: 'Lithuanian Football Cup Final',
    category: 'Sports',
    date: '2026-08-15T17:00:00',
    venue: 'LFF Stadionas',
    city: 'Vilnius',
    priceFrom: 15,
    ticketTypes: [
      { id: '8-standing', name: 'Standing', price: 15 },
      { id: '8-seated', name: 'Seated', price: 28 },
      {
        id: '8-hospitality',
        name: 'Hospitality',
        price: 80,
        description: 'Lounge access, refreshments',
      },
    ],
    imageUrl:
      'https://placehold.co/600x400/154360/ffffff?text=Football+Cup+Final',
    description:
      "The biggest football event of the Lithuanian calendar. Two of the country's finest clubs battle it out for the national cup title in front of a packed and electric atmosphere.",
    availableTickets: 4200,
    featured: false,
  },
  {
    id: '9',
    title: 'Indie Sounds — Summer Edition',
    category: 'Music',
    date: '2026-09-05T18:00:00',
    venue: 'Vilnius Brewery Gardens',
    city: 'Vilnius',
    priceFrom: 22,
    ticketTypes: [
      { id: '9-ga', name: 'General admission', price: 22 },
      {
        id: '9-table',
        name: 'Reserved table',
        price: 60,
        description: 'Seats up to 4',
      },
    ],
    imageUrl: 'https://placehold.co/600x400/37474f/ffcc00?text=Indie+Sounds',
    description:
      'A curated evening of independent music showcasing the best emerging artists from Lithuania and the wider Baltic region. Intimate setting, great acoustics, craft beer, and good vibes.',
    availableTickets: 320,
    featured: false,
  },
  {
    id: '10',
    title: "A Midsummer Night's Dream",
    category: 'Theater',
    date: '2026-09-18T19:30:00',
    venue: 'Vilnius Small Theatre',
    city: 'Vilnius',
    priceFrom: 30,
    ticketTypes: [
      { id: '10-std', name: 'Standard', price: 30 },
      { id: '10-front', name: 'Front rows', price: 48 },
    ],
    imageUrl: 'https://placehold.co/600x400/4a148c/ffd740?text=Midsummer+Dream',
    description:
      "Shakespeare's beloved comedy reimagined in a contemporary Lithuanian setting. A magical production that blends folk tradition with modern theatrical innovation.",
    availableTickets: 95,
    featured: false,
  },
  {
    id: '11',
    title: 'Baltic Cycling Grand Prix',
    category: 'Sports',
    date: '2026-09-26T10:00:00',
    venue: 'Trakai Historical Park',
    city: 'Trakai',
    priceFrom: 8,
    ticketTypes: [
      { id: '11-spectator', name: 'Spectator pass', price: 8 },
      { id: '11-amateur', name: 'Amateur entry', price: 25 },
      { id: '11-pro', name: 'Pro entry', price: 55 },
    ],
    imageUrl:
      'https://placehold.co/600x400/004d40/ffffff?text=Cycling+Grand+Prix',
    description:
      'A spectacular cycling race set against the stunning backdrop of Trakai Island Castle. Amateur and professional categories available. Enjoy the scenery and cheer on the cyclists.',
    availableTickets: 5000,
    featured: false,
  },
  {
    id: '12',
    title: 'Žilvinas Žilinskas Live Concert',
    category: 'Music',
    date: '2026-10-10T19:00:00',
    venue: 'Siemens Arena',
    city: 'Vilnius',
    priceFrom: 85,
    ticketTypes: [
      { id: '12-upper', name: 'Upper tier', price: 85 },
      { id: '12-lower', name: 'Lower tier', price: 130 },
      {
        id: '12-fanpit',
        name: 'Fan pit',
        price: 175,
        description: 'Standing, closest to stage',
      },
      {
        id: '12-vip',
        name: 'VIP package',
        price: 250,
        description: 'Meet & greet, signed merch',
      },
    ],
    imageUrl:
      'https://placehold.co/600x400/212121/e0e0e0?text=Zilvinas+Zilinskas',
    description:
      "Lithuania's most celebrated pop star returns for a spectacular solo concert at Siemens Arena. An evening of hits, new material, and stunning production values. The must-see concert of the year.",
    availableTickets: 8500,
    featured: false,
  },
];

export const TODAY = new Date('2026-05-06');
