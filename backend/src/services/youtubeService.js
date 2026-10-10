import axios from 'axios';

export const getYoutubeChannelInfo = async ({ videoPath, title, description }) => {
  if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
    return {
      mode: 'mock',
      message: 'YouTube API credentials are not configured. This is a mock publish response.',
      videoPath,
      title,
      description,
      published: false
    };
  }

  const response = await axios.post('https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status', {
    snippet: {
      title,
      description
    },
    status: {
      privacyStatus: 'private'
    }
  }, {
    headers: {
      Authorization: `Bearer ${process.env.YOUTUBE_CLIENT_ID}`
    }
  });

  return response.data;
};
