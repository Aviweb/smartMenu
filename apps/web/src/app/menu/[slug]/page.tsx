import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@smartmenu/db";
import { Phone, MapPin } from "lucide-react";
import { MenuSearch } from "./MenuSearch";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!business) return { title: "Menu Not Found" };

  return {
    title: `${business.name} — Menu`,
    description: business.description || `View the menu for ${business.name}`,
  };
}

export default async function MenuPage({ params }: Props) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      description: true,
      logoUrl: true,
      slug: true,
      categories: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          sortOrder: true,
          menuItems: {
            where: { status: "ACTIVE" },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!business) notFound();

  const activeCategories = business.categories.filter(
    (c) => c.menuItems.length > 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white text-2xl font-bold">
                  {business.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {business.name}
              </h1>
              {business.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                  {business.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {business.phone}
                  </a>
                )}
                {business.address && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{business.address}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <div className="max-w-2xl mx-auto">
        {activeCategories.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl font-medium">Menu coming soon</p>
            <p className="text-sm mt-2">
              Check back later for our updated menu.
            </p>
          </div>
        ) : (
          <MenuSearch
            categories={activeCategories.map((c) => ({
              ...c,
              menuItems: c.menuItems.map((item) => ({
                ...item,
                price: Number(item.price),
              })),
            }))}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400 mt-4">
        Powered by{" "}
        <span className="font-semibold text-brand-500">SmartMenu Lite</span>
      </footer>
    </div>
  );
}
