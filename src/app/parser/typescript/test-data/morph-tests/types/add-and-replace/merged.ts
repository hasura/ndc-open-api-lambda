/**
 * Authors working with a publishing house
 * @save
 */
type Author = {
  name: string;
  age: number;
  address: string[];
};

/**
 * All articles. Some may have been archived
 * @interfaceType
 */
interface Article {
  title: string;
  content: string;
  authors: Author[];
  genre: Genre;
}

class ArticleClass {
  title: string;
  content: string;

  public constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
}

/**
 * definition of allowed genres
 * @definition
 */
type Genre = "fiction" | "non-fiction" | "comedy" | "drama";

/**
 * @save
 */
class GenreClass {
  genre: "fiction" | "non-fiction";

  public constructor(genre: "fiction" | "non-fiction") {
    this.genre = genre;
  }
}

/**
 * @transaction
 * @save
 */
class Publisher {
  name: string;
  address: string;
  price: number;

  public constructor(name: string, address: string, price: number) {
    this.name = name;
    this.address = address;
    this.price = price;
  }

  publish(params: Article[]) {}
}

/**
 * @save
 */
interface Marketing {
  article: Article;
  genre: Genre;
  budget: number;

  promote(): void;
}

/**
 * @save
 */
type ArticleLength = "short" | "medium" | "long";

/**
 * @save
 */
interface PublisherInterface {
  name: string;
  address: string;

  publish(params: Article[]): void;
}

/**
 * @save
 */
class MarketingClass {
  article: Article;
  genre: Genre;
  budget: number;

  public constructor(article: Article, genre: Genre, budget: number) {
    this.article = article;
    this.genre = genre;
    this.budget = budget;
  }

  promote() {}
}
