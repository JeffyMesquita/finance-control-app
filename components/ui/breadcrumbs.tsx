import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const breadcrumbItems = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav
      className="flex items-center space-x-1 text-sm text-muted-foreground"
      aria-label="Breadcrumb"
    >
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className="flex items-center space-x-1"
      >
        {breadcrumbItems.map((item, index) => (
          <li
            key={item.href}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="flex items-center"
          >
            {index === 0 ? (
              <Link
                href={item.href}
                className="flex items-center hover:text-foreground"
                itemProp="item"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only" itemProp="name">
                  {item.label}
                </span>
              </Link>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link
                  href={item.href}
                  className="hover:text-foreground"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              </>
            )}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
