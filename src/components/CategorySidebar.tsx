import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

interface CategoryItem {
  name: string;
  children?: string[];
}

const categories: CategoryItem[] = [
  {
    name: "Apparel",
    children: ["T-Shirt", "Hoodies", "Sweatshirts", "Jackets", "Oversized"],
  },
  { name: "Accessories", children: ["Tote Bags", "Hand Fans","Caps", "Beanies", "Backpacks"] },
  { name: "Home & Living", children: ["Mugs", "Cushions", "Kitchen Accessories", "Bottles", "Frames", "Coasters"] }, 
  { name: "Print Products", children: ["Business Cards", "Stickers","Posters", "Notebook"] },
  { name: "Packaging", children: ["Box", "Pouch"] },
  { name: "Tech", children: ["Phone Covers","Mouse Pad","Cable Card", "Bluetooth Speaker","Wireless Charger"] },

  // { name: "Jewelry", children: ["Rings", "Necklaces", "Earrings", "Bracelets"] },
];

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric except space and hyphen
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

interface CategorySidebarProps {
  onToggleSubcategory?: (subcategoryName: string, categoryName: string) => void;
  selectedSubcategories?: Set<string>;
}

interface CategorySectionProps extends CategorySidebarProps {
  category: CategoryItem;
}

const CategorySection = ({ category, onToggleSubcategory, selectedSubcategories }: CategorySectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/30 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm text-foreground hover:text-accent transition-colors py-1"
      >
        <span>{category.name}</span>
        {category.children && (
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {isOpen && category.children && (
        <div className="pl-4 pt-1 space-y-1">
          {category.children.map((child) => {
            const isSelected = selectedSubcategories?.has(child);
            const slug = slugify(child);

            if (onToggleSubcategory) {
              return (
                <button
                  key={child}
                  onClick={() => onToggleSubcategory(child, category.name)}
                  className={`block w-full text-left text-sm transition-colors py-1 ${isSelected ? "text-primary font-medium" : "text-foreground hover:text-primary"
                    }`}
                >
                  {child}
                </button>
              );
            }

            return (
              <Link
                key={child}
                to={`/products/category/${slug}`}
                className="block w-full text-left text-sm text-foreground hover:text-primary transition-colors py-1"
              >
                {child}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CategorySidebar = ({ onToggleSubcategory, selectedSubcategories }: CategorySidebarProps) => {
  return (
    <aside className="flex-shrink-0">
      <div className="sticky top-4 bg-background">
        <nav className="space-y-0">
          {categories.map((category) => (
            <CategorySection
              key={category.name}
              category={category}
              onToggleSubcategory={onToggleSubcategory}
              selectedSubcategories={selectedSubcategories}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};