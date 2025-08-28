export type BulletStyle = "concise" | "balanced" | "detailed";

export type Experience = {
  id: string;
  company: string;
  role: string;
  bullets: string;
  startDate?: string;
  endDate?: string;
};

export type Projects = {
  id: string;
  name: string;
  bullets: string;
};
