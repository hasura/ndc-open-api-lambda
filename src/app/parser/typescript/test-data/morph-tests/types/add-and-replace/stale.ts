/**
 * Authors working with a publishing house
 * @save
 */
type Author = {
  name: string;
  age: number;
  address: string[];
}

const sam: Author = {
  name: "Sam",
  age: 25,
  address: ["123 Street", "456 Avenue"]
}

/**
* All articles. Some may have been archived
* @interfaceType
*/
interface Article {
  title: string;
  content: string;
  authors: Author[];
}

class ArticleClass {
  title: string;
  content: string;
  authors: Author[];

  public constructor(title: string, content: string, authors: Author[]) {
      this.title = title;
      this.content = content;
      this.authors = authors;
  }
}

/**
* definition of allowed genres
* @definition
*/
type Genre = "fiction" | "non-fiction";

/**
 * @save
 */
type ArticleLength = "short" | "medium" | "long";

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

  publish(params: Article[]) {
      
  }
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

  promote() {
    
  }
}

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
interface Marketing {
  article: Article;
  genre: Genre;
  budget: number;

  promote(): void;
}