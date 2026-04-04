import { useState } from 'react';

function VideoPlayer({ videoUrl, onToast }) {
  const [downloading, setDownloading] = useState(false);

  const downloadVideo = async () => {
    try {
      setDownloading(true);
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `sora-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      console.info('Video has been successfully downloaded.');
      onToast({ type: 'success', message: 'Video has been successfully downloaded.' });
    } catch (error) {
      console.error('Video download failed.', error);
      onToast({ type: 'error', message: error.message || 'Failed to download video.' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      <video controls className="w-full rounded-xl border border-slate-700 bg-black" src={videoUrl} />
      <button
        onClick={downloadVideo}
        disabled={downloading}
        className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {downloading ? 'Downloading...' : 'Download Video'}
      </button>
    </div>
  );
}

export default VideoPlayer;
