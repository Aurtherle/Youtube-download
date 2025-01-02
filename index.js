const express = require('express');
const ytdl = require('ytdl-core');

const app = express();

app.get('/', (req, res) => {
  res.send(
    '<h1>YouTube Video Info API</h1>' +
    '<p>Use the <code>/video-info</code> endpoint to get video details and download links.</p>' +
    '<p>Example: <code>/video-info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ</code></p>'
  );
});

app.get('/video-info', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const videoInfo = await ytdl.getInfo(videoUrl, {
      requestOptions: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    });

    const formats = videoInfo.formats
      .filter((format) => format.hasVideo && format.hasAudio)
      .map((format) => ({
        resolution: format.qualityLabel,
        size: format.contentLength
          ? `${(format.contentLength / 1024 / 1024).toFixed(2)} MB`
          : 'Unknown',
        url: format.url,
      }));

    if (formats.length === 0) {
      return res.status(404).json({ error: 'No downloadable formats available' });
    }

    res.json({
      title: videoInfo.videoDetails.title,
      availableFormats: formats,
    });
  } catch (error) {
    if (error.message.includes('410')) {
      return res.status(410).json({
        error: 'This video is restricted or unavailable.',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Failed to fetch video information',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
