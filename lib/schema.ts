export type Token = {
  jp: string;
  pron: string;
  meaning: string;
};

export type RichSentence = {
  tokens: Token[];
  meaning: string;
  keyPoints?: string[];
  audio?: string;
};

export type RichLesson = {
  date: string;
  sentences: RichSentence[];
};

export type MonthlyArchive = {
  version: 1;
  month: string;
  lessons: Record<string, RichLesson>;
};
