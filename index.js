const express = require('express');
const youtubedl = require('youtube-dl-exec');

const app = express();

// Root route for instructions
app.get('/', (req, res) => {
  res.send(
    '<h1>YouTube Video Info API</h1>' +
    '<p>Use the <code>/video-info</code> endpoint to get video details and download links.</p>' +
    '<p>Example: <code>/video-info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ</code></p>'
  );
});

// Video Info Route using youtube-dl-exec
app.get('/video-info', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Fetch video information using youtube-dl-exec
    const videoInfo = await youtubedl(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      quiet: true,
    });

    const formats = videoInfo.formats
      .filter((format) => format.acodec !== 'none' && format.vcodec !== 'none') // Both audio and video
      .map((format) => ({
        resolution: format.format_note || 'Unknown',
        size: format.filesize ? `${(format.filesize / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
        url: format.url,
      }));

    if (formats.length === 0) {
      return res.status(404).json({ error: 'No downloadable formats available' });
    }

    res.json({
      title: videoInfo.title,
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
