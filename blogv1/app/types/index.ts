export interface InstagramMediaType {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  permalink: string;
}

export interface ImageSearchResult {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  image: {
    contextLink: string;
    thumbnailLink: string;
    thumbnailHeight?: number;
    thumbnailWidth?: number;
  };
  source: 'google' | 'instagram';
  score: number;
} 