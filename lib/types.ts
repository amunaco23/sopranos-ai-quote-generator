export interface Quote {
  id?: number;
  text: string;
  character: string;
  season?: number;
  episode?: number;
  episode_title?: string;
  context?: string;
  tags?: string[];
}
