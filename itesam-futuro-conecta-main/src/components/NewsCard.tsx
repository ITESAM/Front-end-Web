import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsCardProps {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  date: string;
  category: string;
  subcategory: string;
  author: string;
  tags: string[];
  isHighlighted?: boolean;
}

const NewsCard = ({
  slug,
  title,
  excerpt,
  image,
  imageAlt,
  date,
  category,
  subcategory,
  author,
  tags,
  isHighlighted,
}: NewsCardProps) => {
  return (
    <article
      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group focus-within:shadow-xl"
      aria-labelledby={`${slug}-title`}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center px-3 py-1 font-medium bg-secondary/10 text-secondary rounded-full">
            {category}
          </span>
          <span aria-label="Subcategoria">{subcategory}</span>
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" aria-hidden="true" />
            <span>{date}</span>
          </div>
        </div>
        <h3 id={`${slug}-title`} className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">Por {author}</p>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{excerpt}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
        <Button
          variant={isHighlighted ? "secondary" : "link"}
          className={isHighlighted ? "mt-auto" : "p-0 h-auto"}
          asChild
        >
          <Link to={`/noticias/${slug}`} aria-label={`Leia mais sobre ${title}`}>
            {isHighlighted ? "Ler agora" : "Leia mais →"}
          </Link>
        </Button>
      </div>
    </article>
  );
};

export default NewsCard;
