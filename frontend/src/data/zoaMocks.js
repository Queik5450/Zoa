const ALBUM_MONKEY = '/album/image-8@2x.png';
const ALBUM_MONKEY_2 = '/album/image-9@2x.png';
const ALBUM_TOUCAN = '/album/image-11@2x.png';

export const MOCK_ALBUM_ANIMALS = [
  {
    id: 'a1',
    name: 'Mono Capuchino',
    badge: '1',
    image: ALBUM_MONKEY,
    speciesId: 'mono-capuchino',
  },
  {
    id: 'a2',
    name: 'Mono 2',
    badge: '10',
    image: ALBUM_MONKEY_2,
    speciesId: 'mono-capuchino',
  },
  {
    id: 'a3',
    name: 'Tucán',
    badge: '1k',
    image: ALBUM_TOUCAN,
    speciesId: 'tucan',
  },
  {
    id: 'a4',
    name: 'Mono Capuchino',
    badge: '1',
    image: ALBUM_MONKEY,
    speciesId: 'mono-capuchino',
  },
  {
    id: 'a5',
    name: 'Mono 2',
    badge: '10',
    image: ALBUM_MONKEY_2,
    speciesId: 'mono-capuchino',
  },
  {
    id: 'a6',
    name: 'Tucán',
    badge: '1k',
    image: ALBUM_TOUCAN,
    speciesId: 'tucan',
  },
  {
    id: 'a7',
    name: 'Mono Capuchino',
    badge: '1',
    image: ALBUM_MONKEY,
    speciesId: 'mono-capuchino',
  },
  {
    id: 'a8',
    name: 'Mono 2',
    badge: '10',
    image: ALBUM_MONKEY_2,
    speciesId: 'mono-capuchino',
  },
  {
    id: 'a9',
    name: 'Tucán',
    badge: '1k',
    image: ALBUM_TOUCAN,
    speciesId: 'tucan',
  },
  {
    id: 'a10',
    name: 'Mono 2',
    badge: '10',
    image: ALBUM_MONKEY_2,
    speciesId: 'mono-capuchino',
  },
];

export const MOCK_ALBUM_PLANTS = [
  {
    id: 'p1',
    name: 'Flor de Mayo',
    badge: '1',
    image: 'https://picsum.photos/seed/zoaP1/600/800',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p2',
    name: 'Flor de Mayo',
    badge: '10',
    image: 'https://picsum.photos/seed/zoaP2/600/800',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p3',
    name: 'Flor de Mayo',
    badge: '1k',
    image: 'https://picsum.photos/seed/zoaP3/600/800',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p4',
    name: 'Flor de Mayo',
    badge: '1',
    image: 'https://picsum.photos/seed/zoaP4/600/800',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p5',
    name: 'Flor de Mayo',
    badge: '10',
    image: 'https://picsum.photos/seed/zoaP5/600/800',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p6',
    name: 'Flor de Mayo',
    badge: '1k',
    image: 'https://picsum.photos/seed/zoaP6/600/800',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p7',
    name: 'Flor de Mayo',
    badge: '1',
    image: 'https://picsum.photos/seed/zoaP7/600/800',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p8',
    name: 'Flor de Mayo',
    badge: '10',
    image: 'https://picsum.photos/seed/zoaP8/600/800',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p9',
    name: 'Flor de Mayo',
    badge: '1k',
    image: 'https://picsum.photos/seed/zoaP9/600/800',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p10',
    name: 'Flor de Mayo',
    badge: '1',
    image: 'https://picsum.photos/seed/zoaP10/600/800',
    speciesId: 'flor-mayo',
  },
];

const MONO = {
  id: 'mono-capuchino',
  title: 'Mono capuchino',
  scientific: 'Cebus capucinus',
  tag: 'Especie',
  descriptionShort:
    'Mono capuchino es un mono que habita en selvas tropicales y se alimenta de frutos e insectos.',
  habitatShort: 'Los monos capuchinos habitan en selvas tropicales, bosques húmedos y zonas de galería.',
  recordsCount: 120,
};

export const SPECIES_DETAIL = {
  'mono-capuchino': MONO,
  tucan: {
    ...MONO,
    id: 'tucan',
    title: 'Tucán',
    scientific: 'Ramphastos sulfuratus',
    descriptionShort: 'Ave tropical reconocible por su pico grande y colorido.',
    habitatShort: 'Bosques húmedos tropicales y zonas de dosel en América Central y del Sur.',
    recordsCount: 48,
  },
  'flor-mayo': {
    ...MONO,
    id: 'flor-mayo',
    title: 'Flor de Mayo',
    scientific: 'Plumeria rubra',
    tag: 'Planta',
    descriptionShort: 'Arbusto caducifolio con flores aromáticas muy cultivadas en zonas cálidas.',
    habitatShort: 'Zonas tropicales y subtropicales; común en jardines y parques.',
    recordsCount: 32,
  },
};

export const MOCK_HOME_CARD_EXTRA = {
  name: 'Flor de Mayo',
  species: 'Plumeria rubra',
  scientificName: 'Plumeria rubra',
  authorName: '@USUARIO',
  avatarLabel: 'US',
  description:
    'La Plumeria rubra, conocida como flor de mayo, es un arbusto caducifolio muy apreciado por sus flores aromáticas.',
  location: 'Parque Nacional Canaima',
  likes: '1k',
  comments: '100',
  image: 'https://picsum.photos/seed/zoaFlor/600/800',
};
