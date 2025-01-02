const express = require('express');
const ytdl = require('ytdl-core');
const app = express();

app.get('/video-info', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const videoInfo = await ytdl.getInfo(videoUrl);
    const formats = videoInfo.formats
      .filter((format) => format.hasVideo && format.hasAudio) // Only include formats with video + audio
      .map((format) => ({
        resolution: format.qualityLabel,
        size: format.contentLength ? `${(format.contentLength / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
        url: format.url,
      }));

    if (formats.length === 0) {
      return res.status(404).json({ error: 'No downloadable formats available' });
    }

    const videoDetails = {
      title: videoInfo.videoDetails.title,
      availableFormats: formats,
    };

    res.json(videoDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video information', details: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
