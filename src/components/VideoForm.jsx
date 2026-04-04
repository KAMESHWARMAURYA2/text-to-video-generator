import { useState } from 'react';

const initialState = {
  prompt: '',
  aspectRatio: 'landscape',
  nFrames: 10,
  removeWatermark: true,
};

function VideoForm({ onGenerate, loading }) {
  const [form, setForm] = useState(initialState);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    onGenerate(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">Prompt</label>
        <textarea
          value={form.prompt}
          onChange={(e) => update('prompt', e.target.value)}
          rows={4}
          placeholder="Describe the video you want Sora 2 to generate..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Aspect Ratio</label>
          <select
            value={form.aspectRatio}
            onChange={(e) => update('aspectRatio', e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
          >
            <option value="landscape">Landscape</option>
            <option value="portrait">Portrait</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Frames</label>
          <input
            type="number"
            min={1}
            max={120}
            value={form.nFrames}
            onChange={(e) => update('nFrames', Number(e.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={form.removeWatermark}
          onChange={(e) => update('removeWatermark', e.target.checked)}
          className="h-4 w-4"
        />
        Remove watermark
      </label>

      <button
        disabled={loading}
        className="w-full rounded-xl bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Generating...' : 'Generate Video'}
      </button>
    </form>
  );
}

export default VideoForm;
