export interface VideoItem {
  id: string;
  title: string;
  letter: string;
  subtitle: string;
  description: string;
  publicId: string;
  category: 'edited' | 'raw';
}
