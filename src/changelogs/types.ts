import { ReactElement } from "react";

export interface ChangelogFeature {
  icon: ReactElement;
  title: string;
  description: string;
}

export interface ChangelogContent {
  title: string;
  features: ChangelogFeature[];
  improvements: string[];
}
