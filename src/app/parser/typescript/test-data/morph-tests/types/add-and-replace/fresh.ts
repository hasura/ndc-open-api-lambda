/**
 * Authors working with a publishing house
 */
type Author = {
  name: string;
  age: number;
  address: string[];
  articles: Article[];
  genre: Genre;
}

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

class GenreClass {
  genre: "fiction" | "non-fiction" | "comedy" | "drama";

  public constructor(genre: "fiction" | "non-fiction" | "comedy" | "drama") {
      this.genre = genre;
  }
}

/**
* @transaction
*/
class Publisher {
  name: string;
  address: string;

  public constructor(name: string, address: string) {
      this.name = name;
      this.address = address;
  }

  publish(params: Article[]) {
      
  }
}

interface Marketing {
  article: Article;

  promote(): void;
}