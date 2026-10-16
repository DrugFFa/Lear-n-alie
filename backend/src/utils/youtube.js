/**
 * Validates YouTube URL and securely extracts YouTube Video ID
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeId(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(urlStr.trim());
    const hostname = parsed.hostname.toLowerCase();

    // Allowed domains
    const allowedDomains = [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtu.be',
      'music.youtube.com',
    ];

    const isDomainAllowed = allowedDomains.some((d) => hostname === d || hostname.endsWith('.' + d));
    if (!isDomainAllowed) {
      return null;
    }

    let videoId = null;

    if (hostname === 'youtu.be' || hostname.endsWith('.youtu.be')) {
      // e.g. https://youtu.be/dQw4w9WgXcQ
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      videoId = pathParts[0] || null;
    } else {
      if (parsed.pathname === '/watch') {
        // e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/shorts/')) {
        // e.g. https://www.youtube.com/shorts/dQw4w9WgXcQ
        const parts = parsed.pathname.split('/shorts/')[1];
        videoId = parts ? parts.split('/')[0] : null;
      } else if (parsed.pathname.startsWith('/embed/')) {
        // e.g. https://www.youtube.com/embed/dQw4w9WgXcQ
        const parts = parsed.pathname.split('/embed/')[1];
        videoId = parts ? parts.split('/')[0] : null;
      }
    }

    // YouTube Video IDs are typically 11 characters alphanumeric and _ -
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    }

    return null;
  } catch (err) {
    return null;
  }
}
