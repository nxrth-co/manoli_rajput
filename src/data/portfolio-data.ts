import { VideoCategory, VideoItem } from '@/types/portfolio';
import cloudinaryVideos from './cloudinary-videos.json';

const createFallbackVideoItems = (
  category: VideoCategory,
  filenames: string[]
): VideoItem[] =>
  filenames.map((filename, index) => {
    const number = String(index + 1).padStart(2, '0');
    const encodedFilename = encodeURIComponent(filename);

    return {
      id: `${category.toLowerCase()}-${number}`,
      title: `${category} ${number}`,
      letter: number,
      subtitle: `${category} ${number}`,
      videoUrl: `/videos/${category}/${encodedFilename}`,
      category
    };
  });

export const VIDEO_CATEGORIES: VideoCategory[] = ['Moments', 'Mindful', 'Making'];

const getCategoryVideos = (
  category: VideoCategory,
  filenames: string[]
): VideoItem[] => {
  const remoteItems = (cloudinaryVideos as unknown as Record<string, VideoItem[]>)[category];

  if (remoteItems && remoteItems.length === filenames.length) {
    return remoteItems.map((item, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        id: item.id || `${category.toLowerCase()}-${number}`,
        title: item.title || `${category} ${number}`,
        letter: item.letter || number,
        subtitle: item.subtitle || `${category} ${number}`,
        videoUrl: item.videoUrl,
        category
      };
    });
  }

  return createFallbackVideoItems(category, filenames);
};

export const VIDEOS_BY_CATEGORY: Record<VideoCategory, VideoItem[]> = {
  Moments: getCategoryVideos('Moments', [
    '1 line 1.mp4',
    '1 line 2.mp4',
    '1 line 3.mp4',
    '2 line 1.MP4',
    '2 line 2.MOV',
    '2 line 3.mp4'
  ]),
  Mindful: getCategoryVideos('Mindful', [
    '1 line 1.MOV',
    '1 line 2.MP4',
    '1 line 3.MP4',
    '2 line 1.MOV',
    '2 line 2.MP4',
    '2 line 3.MP4'
  ]),
  Making: getCategoryVideos('Making', [
    'IMG_0708.mov',
    'IMG_0863.mov',
    'IMG_1039.mov',
    'IMG_1884.mov',
    'IMG_7917.MOV',
    'IMG_8021.mov'
  ])
};
