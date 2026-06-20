import { PrismaClient, MenuItemStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Business 1: The Spice Route (Indian restaurant) ────────────────────────

  const spiceRoute = await prisma.business.upsert({
    where: { slug: "the-spice-route" },
    update: {},
    create: {
      name: "The Spice Route",
      slug: "the-spice-route",
      phone: "+91-9876543210",
      address: "12, MG Road, Bengaluru, Karnataka 560001",
      description:
        "Authentic North and South Indian cuisine crafted with traditional spices.",
      logoUrl: "https://placehold.co/200x200?text=Spice+Route",
    },
  });

  await prisma.user.upsert({
    where: { email: "owner@spiceroute.com" },
    update: {},
    create: {
      businessId: spiceRoute.id,
      name: "Ravi Sharma",
      email: "owner@spiceroute.com",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "owner",
    },
  });

  const srStarters = await prisma.category.upsert({
    where: { id: "cat-sr-starters" },
    update: {},
    create: {
      id: "cat-sr-starters",
      businessId: spiceRoute.id,
      name: "Starters",
      sortOrder: 1,
    },
  });

  const srMainCourse = await prisma.category.upsert({
    where: { id: "cat-sr-main" },
    update: {},
    create: {
      id: "cat-sr-main",
      businessId: spiceRoute.id,
      name: "Main Course",
      sortOrder: 2,
    },
  });

  const srBread = await prisma.category.upsert({
    where: { id: "cat-sr-bread" },
    update: {},
    create: {
      id: "cat-sr-bread",
      businessId: spiceRoute.id,
      name: "Breads",
      sortOrder: 3,
    },
  });

  const srDesserts = await prisma.category.upsert({
    where: { id: "cat-sr-desserts" },
    update: {},
    create: {
      id: "cat-sr-desserts",
      businessId: spiceRoute.id,
      name: "Desserts",
      sortOrder: 4,
    },
  });

  const srDrinks = await prisma.category.upsert({
    where: { id: "cat-sr-drinks" },
    update: {},
    create: {
      id: "cat-sr-drinks",
      businessId: spiceRoute.id,
      name: "Drinks",
      sortOrder: 5,
    },
  });

  const srMenuItems = [
    // Starters
    {
      id: "mi-sr-01",
      businessId: spiceRoute.id,
      categoryId: srStarters.id,
      name: "Paneer Tikka",
      description: "Marinated cottage cheese grilled in a tandoor with spiced yogurt.",
      price: "280.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 1,
    },
    {
      id: "mi-sr-02",
      businessId: spiceRoute.id,
      categoryId: srStarters.id,
      name: "Chicken Seekh Kebab",
      description: "Minced chicken with herbs and spices, skewered and grilled.",
      price: "320.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 2,
    },
    {
      id: "mi-sr-03",
      businessId: spiceRoute.id,
      categoryId: srStarters.id,
      name: "Veg Spring Rolls",
      description: "Crispy rolls stuffed with spiced vegetables.",
      price: "220.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 3,
    },
    // Main Course
    {
      id: "mi-sr-04",
      businessId: spiceRoute.id,
      categoryId: srMainCourse.id,
      name: "Butter Chicken",
      description: "Tender chicken in a rich, creamy tomato-based gravy.",
      price: "380.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 1,
    },
    {
      id: "mi-sr-05",
      businessId: spiceRoute.id,
      categoryId: srMainCourse.id,
      name: "Dal Makhani",
      description: "Slow-cooked black lentils in butter and cream sauce.",
      price: "280.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 2,
    },
    {
      id: "mi-sr-06",
      businessId: spiceRoute.id,
      categoryId: srMainCourse.id,
      name: "Palak Paneer",
      description: "Cottage cheese cubes in a smooth spiced spinach gravy.",
      price: "300.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 3,
    },
    {
      id: "mi-sr-07",
      businessId: spiceRoute.id,
      categoryId: srMainCourse.id,
      name: "Mutton Rogan Josh",
      description: "Slow-braised lamb with Kashmiri spices and aromatic whole spices.",
      price: "480.00",
      status: MenuItemStatus.OUT_OF_STOCK,
      sortOrder: 4,
    },
    // Breads
    {
      id: "mi-sr-08",
      businessId: spiceRoute.id,
      categoryId: srBread.id,
      name: "Butter Naan",
      description: "Soft leavened bread baked in tandoor, finished with butter.",
      price: "60.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 1,
    },
    {
      id: "mi-sr-09",
      businessId: spiceRoute.id,
      categoryId: srBread.id,
      name: "Garlic Naan",
      description: "Tandoor-baked bread topped with garlic and coriander.",
      price: "70.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 2,
    },
    {
      id: "mi-sr-10",
      businessId: spiceRoute.id,
      categoryId: srBread.id,
      name: "Laccha Paratha",
      description: "Multi-layered whole wheat flaky flatbread.",
      price: "65.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 3,
    },
    // Desserts
    {
      id: "mi-sr-11",
      businessId: spiceRoute.id,
      categoryId: srDesserts.id,
      name: "Gulab Jamun",
      description: "Soft milk dumplings soaked in rose-flavored sugar syrup.",
      price: "120.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 1,
    },
    {
      id: "mi-sr-12",
      businessId: spiceRoute.id,
      categoryId: srDesserts.id,
      name: "Kulfi",
      description: "Traditional Indian ice cream in pistachio and rose flavors.",
      price: "150.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 2,
    },
    // Drinks
    {
      id: "mi-sr-13",
      businessId: spiceRoute.id,
      categoryId: srDrinks.id,
      name: "Mango Lassi",
      description: "Chilled yogurt-based drink blended with fresh Alphonso mango.",
      price: "130.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 1,
    },
    {
      id: "mi-sr-14",
      businessId: spiceRoute.id,
      categoryId: srDrinks.id,
      name: "Masala Chai",
      description: "Spiced Indian tea brewed with ginger, cardamom, and cinnamon.",
      price: "60.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 2,
    },
  ];

  for (const item of srMenuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // Invoices for Spice Route
  const srInvoice1 = await prisma.invoice.upsert({
    where: { businessId_invoiceNumber: { businessId: spiceRoute.id, invoiceNumber: "SR-0001" } },
    update: {},
    create: {
      businessId: spiceRoute.id,
      invoiceNumber: "SR-0001",
      totalAmount: "1030.00",
    },
  });

  for (const row of [
    { id: "ii-sr-01-a", invoiceId: srInvoice1.id, menuItemId: "mi-sr-04", quantity: 1, unitPrice: "380.00", lineTotal: "380.00" },
    { id: "ii-sr-01-b", invoiceId: srInvoice1.id, menuItemId: "mi-sr-05", quantity: 1, unitPrice: "280.00", lineTotal: "280.00" },
    { id: "ii-sr-01-c", invoiceId: srInvoice1.id, menuItemId: "mi-sr-08", quantity: 3, unitPrice: "60.00",  lineTotal: "180.00" },
    { id: "ii-sr-01-d", invoiceId: srInvoice1.id, menuItemId: "mi-sr-13", quantity: 1, unitPrice: "130.00", lineTotal: "130.00" },
    { id: "ii-sr-01-e", invoiceId: srInvoice1.id, menuItemId: "mi-sr-12", quantity: 1, unitPrice: "150.00", lineTotal: "150.00" },
  ]) {
    await prisma.invoiceItem.upsert({ where: { id: row.id }, update: {}, create: row });
  }

  const srInvoice2 = await prisma.invoice.upsert({
    where: { businessId_invoiceNumber: { businessId: spiceRoute.id, invoiceNumber: "SR-0002" } },
    update: {},
    create: {
      businessId: spiceRoute.id,
      invoiceNumber: "SR-0002",
      totalAmount: "830.00",
    },
  });

  for (const row of [
    { id: "ii-sr-02-a", invoiceId: srInvoice2.id, menuItemId: "mi-sr-01", quantity: 1, unitPrice: "280.00", lineTotal: "280.00" },
    { id: "ii-sr-02-b", invoiceId: srInvoice2.id, menuItemId: "mi-sr-02", quantity: 1, unitPrice: "320.00", lineTotal: "320.00" },
    { id: "ii-sr-02-c", invoiceId: srInvoice2.id, menuItemId: "mi-sr-09", quantity: 2, unitPrice: "70.00",  lineTotal: "140.00" },
    { id: "ii-sr-02-d", invoiceId: srInvoice2.id, menuItemId: "mi-sr-14", quantity: 2, unitPrice: "60.00",  lineTotal: "120.00" },
    { id: "ii-sr-02-e", invoiceId: srInvoice2.id, menuItemId: "mi-sr-11", quantity: 1, unitPrice: "120.00", lineTotal: "120.00" },
  ]) {
    await prisma.invoiceItem.upsert({ where: { id: row.id }, update: {}, create: row });
  }

  console.log(`✅ Seeded business: ${spiceRoute.name}`);

  // ─── Business 2: Cafe Aroma (cafe/bakery) ───────────────────────────────────

  const cafeAroma = await prisma.business.upsert({
    where: { slug: "cafe-aroma" },
    update: {},
    create: {
      name: "Cafe Aroma",
      slug: "cafe-aroma",
      phone: "+91-9123456780",
      address: "5, Koregaon Park, Pune, Maharashtra 411001",
      description:
        "A cozy cafe serving artisan coffee, fresh pastries, and light bites.",
      logoUrl: "https://placehold.co/200x200?text=Cafe+Aroma",
    },
  });

  await prisma.user.upsert({
    where: { email: "owner@cafearoma.com" },
    update: {},
    create: {
      businessId: cafeAroma.id,
      name: "Priya Menon",
      email: "owner@cafearoma.com",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "owner",
    },
  });

  const caHotBev = await prisma.category.upsert({
    where: { id: "cat-ca-hotbev" },
    update: {},
    create: { id: "cat-ca-hotbev", businessId: cafeAroma.id, name: "Hot Beverages", sortOrder: 1 },
  });

  const caColdBev = await prisma.category.upsert({
    where: { id: "cat-ca-coldbev" },
    update: {},
    create: { id: "cat-ca-coldbev", businessId: cafeAroma.id, name: "Cold Beverages", sortOrder: 2 },
  });

  const caPastries = await prisma.category.upsert({
    where: { id: "cat-ca-pastries" },
    update: {},
    create: { id: "cat-ca-pastries", businessId: cafeAroma.id, name: "Pastries & Cakes", sortOrder: 3 },
  });

  const caSandwiches = await prisma.category.upsert({
    where: { id: "cat-ca-sandwiches" },
    update: {},
    create: { id: "cat-ca-sandwiches", businessId: cafeAroma.id, name: "Sandwiches & Wraps", sortOrder: 4 },
  });

  const caMenuItems = [
    // Hot Beverages
    {
      id: "mi-ca-01",
      businessId: cafeAroma.id,
      categoryId: caHotBev.id,
      name: "Espresso",
      description: "Single shot of rich, bold espresso.",
      price: "120.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 1,
    },
    {
      id: "mi-ca-02",
      businessId: cafeAroma.id,
      categoryId: caHotBev.id,
      name: "Cappuccino",
      description: "Espresso with steamed milk and a thick layer of foam.",
      price: "180.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 2,
    },
    {
      id: "mi-ca-03",
      businessId: cafeAroma.id,
      categoryId: caHotBev.id,
      name: "Flat White",
      description: "Double ristretto with velvety micro-foam milk.",
      price: "200.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 3,
    },
    {
      id: "mi-ca-04",
      businessId: cafeAroma.id,
      categoryId: caHotBev.id,
      name: "Matcha Latte",
      description: "Ceremonial grade matcha whisked with steamed oat milk.",
      price: "220.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 4,
    },
    // Cold Beverages
    {
      id: "mi-ca-05",
      businessId: cafeAroma.id,
      categoryId: caColdBev.id,
      name: "Cold Brew",
      description: "12-hour steeped cold brew coffee, served over ice.",
      price: "220.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 1,
    },
    {
      id: "mi-ca-06",
      businessId: cafeAroma.id,
      categoryId: caColdBev.id,
      name: "Iced Caramel Latte",
      description: "Espresso, caramel syrup, milk, and ice.",
      price: "240.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 2,
    },
    {
      id: "mi-ca-07",
      businessId: cafeAroma.id,
      categoryId: caColdBev.id,
      name: "Watermelon Cooler",
      description: "Fresh watermelon blended with mint and lemon.",
      price: "180.00",
      status: MenuItemStatus.OUT_OF_STOCK,
      sortOrder: 3,
    },
    // Pastries & Cakes
    {
      id: "mi-ca-08",
      businessId: cafeAroma.id,
      categoryId: caPastries.id,
      name: "Butter Croissant",
      description: "Flaky, laminated pastry baked fresh every morning.",
      price: "120.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 1,
    },
    {
      id: "mi-ca-09",
      businessId: cafeAroma.id,
      categoryId: caPastries.id,
      name: "Blueberry Muffin",
      description: "Moist muffin loaded with fresh blueberries.",
      price: "130.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 2,
    },
    {
      id: "mi-ca-10",
      businessId: cafeAroma.id,
      categoryId: caPastries.id,
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with a molten center, served with vanilla ice cream.",
      price: "280.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 3,
    },
    {
      id: "mi-ca-11",
      businessId: cafeAroma.id,
      categoryId: caPastries.id,
      name: "Biscoff Cheesecake",
      description: "No-bake cheesecake on a Biscoff cookie crust.",
      price: "320.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 4,
    },
    // Sandwiches & Wraps
    {
      id: "mi-ca-12",
      businessId: cafeAroma.id,
      categoryId: caSandwiches.id,
      name: "Grilled Chicken Sandwich",
      description: "Grilled chicken breast, lettuce, tomato, and chipotle mayo on sourdough.",
      price: "280.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 1,
    },
    {
      id: "mi-ca-13",
      businessId: cafeAroma.id,
      categoryId: caSandwiches.id,
      name: "Avocado Toast",
      description: "Smashed avocado with chili flakes and a poached egg on multigrain bread.",
      price: "260.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 2,
    },
    {
      id: "mi-ca-14",
      businessId: cafeAroma.id,
      categoryId: caSandwiches.id,
      name: "Falafel Wrap",
      description: "Crispy falafel, hummus, pickles, and greens in a whole wheat wrap.",
      price: "240.00",
      status: MenuItemStatus.ACTIVE,
      sortOrder: 3,
    },
  ];

  for (const item of caMenuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // Invoices for Cafe Aroma
  const caInvoice1 = await prisma.invoice.upsert({
    where: { businessId_invoiceNumber: { businessId: cafeAroma.id, invoiceNumber: "CA-0001" } },
    update: {},
    create: { businessId: cafeAroma.id, invoiceNumber: "CA-0001", totalAmount: "760.00" },
  });

  for (const row of [
    { id: "ii-ca-01-a", invoiceId: caInvoice1.id, menuItemId: "mi-ca-02", quantity: 2, unitPrice: "180.00", lineTotal: "360.00" },
    { id: "ii-ca-01-b", invoiceId: caInvoice1.id, menuItemId: "mi-ca-08", quantity: 2, unitPrice: "120.00", lineTotal: "240.00" },
    { id: "ii-ca-01-c", invoiceId: caInvoice1.id, menuItemId: "mi-ca-09", quantity: 1, unitPrice: "130.00", lineTotal: "130.00" },
    { id: "ii-ca-01-d", invoiceId: caInvoice1.id, menuItemId: "mi-ca-01", quantity: 1, unitPrice: "120.00", lineTotal: "120.00" },
  ]) {
    await prisma.invoiceItem.upsert({ where: { id: row.id }, update: {}, create: row });
  }

  const caInvoice2 = await prisma.invoice.upsert({
    where: { businessId_invoiceNumber: { businessId: cafeAroma.id, invoiceNumber: "CA-0002" } },
    update: {},
    create: { businessId: cafeAroma.id, invoiceNumber: "CA-0002", totalAmount: "1060.00" },
  });

  for (const row of [
    { id: "ii-ca-02-a", invoiceId: caInvoice2.id, menuItemId: "mi-ca-05", quantity: 2, unitPrice: "220.00", lineTotal: "440.00" },
    { id: "ii-ca-02-b", invoiceId: caInvoice2.id, menuItemId: "mi-ca-12", quantity: 1, unitPrice: "280.00", lineTotal: "280.00" },
    { id: "ii-ca-02-c", invoiceId: caInvoice2.id, menuItemId: "mi-ca-10", quantity: 1, unitPrice: "280.00", lineTotal: "280.00" },
    { id: "ii-ca-02-d", invoiceId: caInvoice2.id, menuItemId: "mi-ca-01", quantity: 1, unitPrice: "120.00", lineTotal: "120.00" },
  ]) {
    await prisma.invoiceItem.upsert({ where: { id: row.id }, update: {}, create: row });
  }

  console.log(`✅ Seeded business: ${cafeAroma.name}`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
