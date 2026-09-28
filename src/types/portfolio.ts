export type VideoCategory = 'Moments' | 'Mindful' | 'Making';

export interface VideoItem {
  id: string;
  title: string;
  letter: string;
  subtitle: string;
  videoUrl: string;
  category: VideoCategory;
}
