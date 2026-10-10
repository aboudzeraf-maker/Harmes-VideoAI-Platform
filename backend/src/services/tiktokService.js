import axios from 'axios';

export const getTikTokProfile = async ({ videoPath, description }) => {
  if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
    return {
      mode: 'mock',
      message: 'TikTok API credentials are not configured. This is a mock publish response.',
      videoPath,
      description,
      published: false
    };
  }

  const response = await axios.post('https://open.tiktokapis.com/v2/post/publish/video/', {
    video_path: videoPath,
    description
  }, {
    headers: {
      Authorization: `Bearer ${process.env.TIKTOK_CLIENT_KEY}`
    }
  });

  return response.data;
};
