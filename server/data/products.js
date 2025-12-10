const products = [
  {
    title: 'Midnight Rose',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    description: 'A seductive blend of velvety rose and nocturnal spices, Midnight Rose captures the essence of mystery. Top notes of black pepper and bergamot give way to a heart of Bulgarian rose, resting on a base of amber and vanilla.',
    category: 'Floral',
    gender: 'Women',
    variants: [
        { size: '50ml', price: 120, stock: 50 },
        { size: '100ml', price: 200, stock: 30 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: true
  },
  {
    title: 'Ocean Breeze',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
    description: 'Crisp, clean, and invigorating. Ocean Breeze brings the scent of the sea to your daily life. Notes of sea salt, sage, and driftwood create a fresh profile perfect for daily wear.',
    category: 'Citrus',
    gender: 'Unisex',
    variants: [
        { size: '50ml', price: 95, stock: 100 },
        { size: '100ml', price: 160, stock: 40 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: true
  },
  {
    title: 'Golden Oud',
    image: 'https://images.unsplash.com/photo-1594035910387-fea477942698?q=80&w=1000&auto=format&fit=crop',
    description: 'An opulent masterpiece featuring authentic Agarwood. Golden Oud is a deep, woody fragrance with hints of leather and smoke, designed for those who command attention.',
    category: 'Oriental',
    gender: 'Unisex',
    variants: [
        { size: '50ml', price: 210, stock: 15 },
        { size: '100ml', price: 350, stock: 10 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: true
  },
  {
    title: 'Citrus Splash',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
    description: 'A vibrant burst of energy. Citrus Splash combines lemon, lime, and mandarin orange for a zesty opening that settles into a soft musk base.',
    category: 'Citrus',
    gender: 'Men',
    variants: [
        { size: '100ml', price: 85, stock: 60 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: false
  },
  {
    title: 'Velvet Santal',
    image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1000&auto=format&fit=crop',
    description: 'Smooth sandalwood meets creamy almond milk in this luxurious woody fragrance. Subtle, sophisticated, and enduring.',
    category: 'Woody',
    gender: 'Men',
    variants: [
        { size: '50ml', price: 150, stock: 25 },
        { size: '100ml', price: 240, stock: 20 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: true
  },
  {
    title: 'Ethereal Garden',
    image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=1000&auto=format&fit=crop',
    description: 'Walk through a garden in full bloom. Jasmine, tuberose, and honeysuckle intertwine to create a purely floral symphony.',
    category: 'Floral',
    gender: 'Women',
    variants: [
        { size: '50ml', price: 110, stock: 45 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: false
  },
  {
    title: 'Royal Amber',
    image: 'https://images.unsplash.com/photo-1512777576255-a886eed71ec0?q=80&w=1000&auto=format&fit=crop',
    description: 'Majestic and warm, Royal Amber combines resinous amber with sweet vanilla and spicy cinnamon. A truly regal scent for winter evenings.',
    category: 'Oriental',
    gender: 'Unisex',
    variants: [
        { size: '50ml', price: 180, stock: 20 },
        { size: '100ml', price: 290, stock: 15 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: false
  },
  {
    title: 'Jasmine Noir',
    image: 'https://images.unsplash.com/photo-1595425970339-2200877914f6?q=80&w=1000&auto=format&fit=crop',
    description: 'Dark, mysterious, and intoxicating. Jasmine Noir explores the darker side of the white flower, paired with almond and licorice.',
    category: 'Floral',
    gender: 'Women',
    variants: [
        { size: '50ml', price: 130, stock: 40 },
        { size: '100ml', price: 210, stock: 35 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: false
  },
  {
    title: 'Cedar Mystique',
    image: 'https://images.unsplash.com/photo-1585218356057-dc256d35543b?q=80&w=1000&auto=format&fit=crop',
    description: 'The strength of cedarwood balanced by the freshness of juniper berries. A grounding scent that connects you to nature.',
    category: 'Woody',
    gender: 'Men',
    variants: [
        { size: '100ml', price: 140, stock: 55 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: false
  },
  {
    title: 'Imperial Gold',
    image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop',
    description: 'The pinnacle of luxury. Rare saffron, gold flakes, and white oud create a scent that screams opulence and status.',
    category: 'Luxury',
    gender: 'Unisex',
    variants: [
        { size: '50ml', price: 450, stock: 5 }
    ],
    rating: 0,
    numReviews: 0,
    isFeatured: true
  }
];

export default products;