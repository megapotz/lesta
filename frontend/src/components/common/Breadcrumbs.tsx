import { Link } from 'react-router-dom';

type BreadcrumbItem = {
  label: string;
  to?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (!items.length) {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="breadcrumbs__item">
              {item.to && !isLast ? (
                <Link to={item.to} className="breadcrumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumbs__current">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
