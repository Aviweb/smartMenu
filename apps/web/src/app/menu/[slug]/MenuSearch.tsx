"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string | null;
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

interface Props {
  categories: Category[];
}

export function MenuSearch({ categories }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allItems = categories.flatMap((c) =>
    c.menuItems.map((item) => ({ ...item, categoryName: c.name }))
  );

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  function scrollToCategory(id: string) {
    setActiveCategory(id);
    categoryRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
    );

    Object.values(categoryRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Search Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-9 pr-9 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs — hidden when searching */}
      {!query && (
        <div className="sticky top-[61px] z-10 bg-white border-b border-gray-100 overflow-x-auto">
          <div className="flex gap-1 px-4 py-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {filtered !== null && (
        <div className="px-4 py-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm mt-1">Try searching for something else</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{query}&quot;
              </p>
              <div className="space-y-3">
                {filtered.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Category Sections */}
      {!filtered && (
        <div className="pb-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              id={cat.id}
              ref={(el) => { categoryRefs.current[cat.id] = el; }}
              className="pt-6"
            >
              <h2 className="text-lg font-bold text-gray-900 px-4 pb-3 border-b border-gray-100">
                {cat.name}
              </h2>
              {cat.menuItems.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-400 text-center">
                  No items in this category
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {cat.menuItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MenuItemCard({ item }: { item: MenuItem & { categoryName?: string } }) {
  const price =
    typeof item.price === "string" ? parseFloat(item.price) : item.price;

  return (
    <div className="flex gap-3 px-4 py-4 bg-white hover:bg-gray-50 transition-colors">
      {item.imageUrl && (
        <div className="flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base leading-tight">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <span className="font-bold text-brand-600 text-base whitespace-nowrap">
            ₹{price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
