/** Datos de ejemplo alineados con los mockups ZOA (contenido placeholder). */

export const MOCK_MAP_CHIPS = ['Especie', 'Especie', 'Especie', 'Especie'];

export const MOCK_ALBUM_ANIMALS = [
  {
    id: 'a1',
    name: 'Mono Capuchino',
    badge: '1',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
    speciesId: 'mono-capuchino',
  },
  {
    id: 'a2',
    name: 'Tucán',
    badge: '10',
    image:
      'https://images.unsplash.com/photo-1551986782-d0169e1df9fa?auto=format&fit=crop&w=600&q=80',
    speciesId: 'tucan',
  },
  {
    id: 'a3',
    name: 'Mono 2',
    badge: '1k',
    image:
      'https://images.unsplash.com/photo-1564349683136-77e92550dccc?auto=format&fit=crop&w=600&q=80',
    speciesId: 'mono-capuchino',
  },
  {
    id: 'a4',
    name: 'Mono Capuchino',
    badge: '1',
    image:
      'https://images.unsplash.com/photo-1583212292454-1fe6229606b2?auto=format&fit=crop&w=600&q=80',
    speciesId: 'mono-capuchino',
  },
];

export const MOCK_ALBUM_PLANTS = [
  {
    id: 'p1',
    name: 'Nombre Planta',
    badge: '1',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p2',
    name: 'Nombre Planta',
    badge: '10',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p3',
    name: 'Nombre Planta',
    badge: '1k',
    image:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    speciesId: 'flor-mayo',
  },
  {
    id: 'p4',
    name: 'Nombre Planta',
    badge: '1',
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
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
  image:
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
};
