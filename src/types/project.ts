import type { CaptionSegment, CaptionStyle } from './caption';

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  segments: CaptionSegment[];
  style: CaptionStyle;
  videoFileName?: string;
}
