import { VideoCategory, VideoItem } from '@/types/portfolio';

const createVideoItems = (
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

export const VIDEOS_BY_CATEGORY: Record<VideoCategory, VideoItem[]> = {
  Moments: createVideoItems(
    'Moments',
    [
      '1 line 1.mp4',
      '1 line 2.mp4',
      '1 line 3.mp4',
      '2 line 1.MP4',
      '2 line 2.MOV',
      '2 line 3.mp4'
    ]
  ),
  Mindful: createVideoItems(
    'Mindful',
    [
      '1 line 1.MOV',
      '1 line 2.MP4',
      '1 line 3.MP4',
      '2 line 1.MOV',
      '2 line 2.MP4',
      '2 line 3.MP4'
    ]
  ),
  Making: createVideoItems(
    'Making',
    ['IMG_0708.mov', 'IMG_0863.mov', 'IMG_1039.mov', 'IMG_1884.mov', 'IMG_7917.MOV', 'IMG_8021.mov']
  )
};
