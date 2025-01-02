const express = require('express');
const { exec } = require('child_process');  // To run yt-dlp commands

const app = express();

// Root route for instructions
app.get('/', (req, res) => {
  res.send(
    '<h1>YouTube Video Info API</h1>' +
    '<p>Use the <code>/video-info</code> endpoint to get video details and download links.</p>' +
    '<p>Example: <code>/video-info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ</code></p>'
  );
});

// Video Info Route using yt-dlp
app.get('/video-info', (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Build the yt-dlp command to fetch video info
  const command = `yt-dlp -j --no-warnings --quiet ${videoUrl}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch video information', details: stderr });
    }

    try {
      const videoInfo = JSON.parse(stdout);  // yt-dlp outputs JSON data
      const formats = videoInfo.formats
        .filter((format) => format.has_audio && format.has_video)
        .map((format) => ({
          resolution: format.quality,
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
    } catch (parseError) {
      res.status(500).json({ error: 'Error parsing video information', details: parseError.message });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
