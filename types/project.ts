export type Project = {
  title: string;
  description: string;
  image: string;
  date: string;
  techs: techBadge[];
  links: {
    github?: string;
    external?: string;
  };
  openSource: boolean;
  stars?: number;
};

export type techBadge = {
  name: string;
  color: string;
};