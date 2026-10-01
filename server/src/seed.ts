import { PrismaClient, TransactionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Starting KING DAY STORE database seed...');

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash('KingDayAdmin2026!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kingday.shop' },
    update: {},
    create: {
      name: 'KING DAY Admin',
      email: 'admin@kingday.shop',
      phone: '+919495902904',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      active: true
    }
  });
  console.log('Admin user seeded:', adminUser.email);

  // Create Categories
  const categoriesData = [
    {
      name: 'Electric Ride-Ons',
      slug: 'electric-ride-ons',
      description: 'Premium battery-operated ride-on cars, jeeps, and bikes for kids with remote control, music, and working lights.',
      imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
      sortOrder: 1,
      children: [
        { name: 'Luxury Ride-On Cars', slug: 'luxury-ride-on-cars', description: 'Licensed mini supercar ride-ons' },
        { name: '4x4 Off-Road Jeeps', slug: '4x4-off-road-jeeps', description: 'Heavy-duty 4-wheel drive electric jeeps' },
        { name: 'Superbikes & Scooters', slug: 'superbikes-scooters', description: 'Battery operated electric motorbikes' }
      ]
    },
    {
      name: 'Cycles & Trikes',
      slug: 'cycles-tricycles',
      description: 'Safe, durable, and ergonomic bicycles, tricycles, and balance bikes for growing toddlers and kids.',
      imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      sortOrder: 2,
      children: [
        { name: 'Kids Bicycles (3-8 Yrs)', slug: 'kids-bicycles', description: 'Pedal bicycles with training wheels' },
        { name: 'Toddler Tricycles', slug: 'toddler-tricycles', description: 'Parent push bar tricycles' },
        { name: 'Balance Bikes', slug: 'balance-bikes', description: 'Pedal-free learning balance bikes' }
      ]
    },
    {
      name: 'Tractors & Farm Vehicles',
      slug: 'tractors',
      description: 'Heavy duty battery operated electric tractors with detachable trailers, front loaders, and Bluetooth sound.',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      sortOrder: 3,
      children: [
        { name: 'Electric Farm Tractors', slug: 'electric-farm-tractors', description: 'Battery tractors with trailers' },
        { name: 'Front Loader Excavators', slug: 'front-loader-excavators', description: 'Working arm construction excavators' }
      ]
    },
    {
      name: 'Toys & Games',
      slug: 'toys-games',
      description: 'Fun, educational, and engaging toys that spark creativity, joy, and active play.',
      imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=800&q=80',
      sortOrder: 4,
      children: [
        { name: 'Educational & STEM Toys', slug: 'educational-stem-toys', description: 'Learning building blocks & puzzles' },
        { name: 'Remote Control Cars & Drones', slug: 'rc-cars-drones', description: 'High-speed RC vehicles' }
      ]
    },
    {
      name: 'Baby Essentials & Gear',
      slug: 'baby-essentials-gear',
      description: 'Certified safe baby strollers, high chairs, walkers, and nursery care items.',
      imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
      sortOrder: 5,
      children: [
        { name: 'Baby Strollers & Prams', slug: 'strollers-prams', description: 'Lightweight foldable strollers' },
        { name: 'Baby Walkers & Rockers', slug: 'walkers-rockers', description: 'Musical baby walkers' }
      ]
    }
  ];

  for (const cat of categoriesData) {
    const parentCategory = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        active: true
      }
    });

    if (cat.children) {
      for (const sub of cat.children) {
        await prisma.category.upsert({
          where: { slug: sub.slug },
          update: {},
          create: {
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            parentId: parentCategory.id,
            active: true
          }
        });
      }
    }
  }
  console.log('Categories seeded successfully.');

  // Fetch created categories for reference
  const rideOnCategory = await prisma.category.findUnique({ where: { slug: '4x4-off-road-jeeps' } });
  const luxuryCarCategory = await prisma.category.findUnique({ where: { slug: 'luxury-ride-on-cars' } });
  const tractorCategory = await prisma.category.findUnique({ where: { slug: 'electric-farm-tractors' } });
  const cycleCategory = await prisma.category.findUnique({ where: { slug: 'kids-bicycles' } });
  const trikeCategory = await prisma.category.findUnique({ where: { slug: 'toddler-tricycles' } });
  const strollerCategory = await prisma.category.findUnique({ where: { slug: 'strollers-prams' } });

  // Sample Products
  const products = [
    {
      name: 'Hulk WN 1166 Kids Electric Ride-On Jeep',
      slug: 'hulk-wn-1166-kids-electric-ride-on-jeep',
      sku: 'WN1166',
      brand: 'KING DAY',
      categoryId: rideOnCategory?.id || '',
      description: 'Heavy duty 4x4 monster ride-on jeep with dual 12V motors, 2.4G parental remote control, shock absorber suspension, working LED lights, and Bluetooth music audio.',
      shortDescription: 'Monster 4WD Electric Jeep with Parental Remote Control & Bluetooth Audio.',
      mrp: 14999.00,
      salePrice: 9499.00,
      discount: 36.7,
      featured: true,
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
      ],
      features: [
        '2.4G Parental Remote Control with emergency brake',
        'Dual 12V Heavy-Duty Rechargeable Battery',
        'Bluetooth, USB & AUX Music Player with built-in speakers',
        'Shock absorbing 4-wheel independent suspension',
        'Bright LED Headlights, Taillights and Fog lights'
      ],
      specs: [
        { name: 'Age Group', value: '2 - 8 Years' },
        { name: 'Weight Capacity', value: '50 kg' },
        { name: 'Speed', value: '3 - 7 km/h' },
        { name: 'Battery', value: '12V 7Ah Dual Battery' }
      ]
    },
    {
      name: 'KING DAY PowerTrak 12V Electric Farm Tractor with Detachable Trailer',
      slug: 'king-day-powertrak-12v-electric-farm-tractor',
      sku: 'KD-TRAC-12V-01',
      brand: 'KING DAY',
      categoryId: tractorCategory?.id || '',
      description: 'Authentic 12V battery-operated electric tractor with large detachable tipping trailer, 2-speed gear shift, Bluetooth music player, horns, and dual high-torque rear motors.',
      shortDescription: '12V Electric Farm Tractor with detachable trailer & Bluetooth sound player.',
      mrp: 18999.00,
      salePrice: 13999.00,
      discount: 26.3,
      featured: true,
      stock: 10,
      images: [
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80'
      ],
      features: [
        'Large capacity detachable tipping trailer for hauling toys & sand',
        'Dual 12V motors with high traction knobby tires',
        'Bluetooth FM radio & horn sounds',
        'High/Low speed switch & reverse gear'
      ],
      specs: [
        { name: 'Age Group', value: '3 - 7 Years' },
        { name: 'Weight Limit', value: '45 kg' },
        { name: 'Battery', value: '12V 7Ah' }
      ]
    },
    {
      name: 'KING DAY Commander 4x4 Monster Off-Road Electric Jeep',
      slug: 'king-day-commander-4x4-monster-jeep',
      sku: 'KD-JEEP-4X4-01',
      brand: 'KING DAY',
      categoryId: rideOnCategory?.id || '',
      description: 'The ultimate kids ride-on experience! Dual 12V motors, 4-wheel suspension, Bluetooth sound system, working headlights, leather seats, and 2.4G parental remote control.',
      shortDescription: 'Dual 12V 4WD Monster Jeep with 2.4G Parental Remote & Bluetooth Audio.',
      mrp: 24999.00,
      salePrice: 18999.00,
      discount: 24.0,
      featured: true,
      stock: 12,
      images: [
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80'
      ],
      features: [
        '2.4G Parental Remote Control with emergency stop button',
        'Dual 12V Heavy-Duty Rechargeable Battery',
        'Bluetooth, USB & AUX Music Player with built-in speakers'
      ],
      specs: [
        { name: 'Age Group', value: '2 - 8 Years' },
        { name: 'Weight Capacity', value: '50 kg' }
      ]
    },
    {
      name: 'KING DAY Speedster Luxury Roadster Ride-On Supercar',
      slug: 'king-day-speedster-luxury-roadster',
      sku: 'KD-CAR-ROADSTER-02',
      brand: 'KING DAY',
      categoryId: luxuryCarCategory?.id || '',
      description: 'Futuristic luxury roadster ride-on car with hydraulic butterfly doors, illuminated dashboard, foot accelerator, and smooth start system for toddlers.',
      shortDescription: 'Sleek luxury supercar with scissor doors & parental remote control.',
      mrp: 19999.00,
      salePrice: 14499.00,
      discount: 27.5,
      featured: true,
      stock: 8,
      images: [
        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=1000&q=80'
      ],
      features: [
        'Hydraulic Scissor Doors that open upwards',
        'Soft-start acceleration system to protect gentle necks'
      ],
      specs: [
        { name: 'Age Group', value: '2 - 6 Years' }
      ]
    },
    {
      name: 'KING DAY Panther 16-Inch Sport Kids Bicycle',
      slug: 'king-day-panther-16-inch-kids-bicycle',
      sku: 'KD-CYC-PANTHER-16',
      brand: 'KING DAY',
      categoryId: cycleCategory?.id || '',
      description: 'High-strength steel frame bicycle with removable training wheels, front caliper & rear coaster brakes, full enclosed chain guard, and water bottle holder.',
      shortDescription: '16-Inch sports bicycle with heavy-duty training wheels & dual safety brakes.',
      mrp: 8999.00,
      salePrice: 6499.00,
      discount: 27.7,
      featured: true,
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80'
      ],
      features: [
        'Adjustable seat height with quick-release clamp',
        'Pneumatic rubber anti-skid tires'
      ],
      specs: [
        { name: 'Wheel Size', value: '16 Inch' }
      ]
    }
  ];

  for (const prod of products) {
    if (!prod.categoryId) continue;

    const existing = await prisma.product.findUnique({ where: { sku: prod.sku } });
    if (!existing) {
      const createdProduct = await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku,
          brand: prod.brand,
          categoryId: prod.categoryId,
          description: prod.description,
          shortDescription: prod.shortDescription,
          mrp: prod.mrp,
          salePrice: prod.salePrice,
          discount: prod.discount,
          featured: prod.featured,
          active: true,
          images: {
            create: prod.images.map((imgUrl, index) => ({
              imageUrl: imgUrl,
              isPrimary: index === 0,
              sortOrder: index
            }))
          },
          features: {
            create: prod.features.map((feat, index) => ({
              feature: feat,
              sortOrder: index
            }))
          },
          specifications: {
            create: prod.specs.map((sp, index) => ({
              name: sp.name,
              value: sp.value,
              sortOrder: index
            }))
          },
          inventory: {
            create: {
              quantity: prod.stock,
              reservedQuantity: 0,
              availableQuantity: prod.stock,
              lowStockThreshold: 3
            }
          }
        }
      });

      // Log initial inventory transaction
      await prisma.inventoryTransaction.create({
        data: {
          productId: createdProduct.id,
          type: TransactionType.PURCHASE,
          quantity: prod.stock,
          previousQuantity: 0,
          newQuantity: prod.stock,
          note: 'Initial catalog batch stock load'
        }
      });
    }
  }

  // Seed Banners
  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.createMany({
      data: [
        {
          title: 'Electric Ride-On Super Sale',
          subtitle: 'Up to 30% OFF on 4x4 Jeeps, Tractors & Supercars with Free Home Delivery across India!',
          imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1600&q=80',
          link: '/category/electric-ride-ons',
          active: true,
          sortOrder: 1
        },
        {
          title: 'Heavy-Duty Electric Tractors',
          subtitle: 'Equipped with detachable trailers, front loaders, and 12V high traction motors.',
          imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
          link: '/category/tractors',
          active: true,
          sortOrder: 2
        }
      ]
    });
  }

  // Seed Coupons
  const couponCount = await prisma.coupon.count();
  if (couponCount === 0) {
    await prisma.coupon.createMany({
      data: [
        {
          code: 'KINGDAY10',
          type: 'PERCENTAGE',
          value: 10,
          minimumOrderAmount: 2000,
          maximumDiscount: 1500,
          active: true
        },
        {
          code: 'WELCOME500',
          type: 'FIXED_AMOUNT',
          value: 500,
          minimumOrderAmount: 4999,
          active: true
        }
      ]
    });
  }

  console.log('Database seeding completed successfully!');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .catch((e) => {
      console.error('Error during database seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
