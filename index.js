const express = require('express');
const { getVideo } = require('@neoxr/youtube-scraper');

const app = express();

// Root route for instructions
app.get('/', (req, res) => {
  res.send(
    '<h1>YouTube Video Info API</h1>' +
    '<p>Use the <code>/video-info</code> endpoint to get video details and download links.</p>' +
    '<p>Example: <code>/video-info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ</code></p>'
  );
});

// Video Info Route using @neoxr/youtube-scraper
app.get('/video-info', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Fetch video information using @neoxr/youtube-scraper
    const videoInfo = await getVideo(videoUrl);

    if (!videoInfo || !videoInfo.formats) {
      return res.status(404).json({ error: 'No video information found' });
    }

    const formats = videoInfo.formats
      .filter((format) => format.mimeType && format.url) // Valid formats with URLs
      .map((format) => ({
        quality: format.qualityLabel || 'Unknown',
        mimeType: format.mimeType,
        size: format.contentLength
          ? `${(parseInt(format.contentLength) / 1024 / 1024).toFixed(2)} MB`
          : 'Unknown',
        url: format.url,
      }));

    if (formats.length === 0) {
      return res.status(404).json({ error: 'No downloadable formats available' });
    }

    res.json({
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnails.pop()?.url || 'No thumbnail available',
      availableFormats: formats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video information', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
