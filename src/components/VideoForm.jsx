import { useMemo, useState } from 'react';
import { MODEL_OPTIONS, PROVIDER_OPTIONS } from '../services/kieApi';

const initialState = {
  provider: 'sora',
  model: 'sora-2-text-to-video',
  prompt: '',
  aspectRatio: 'landscape',
  nFrames: 10,
  removeWatermark: true,
  imageUrl: '',
  imageUrls: '',
  waterMark: 'kie.ai',
  watermark: 'kie.ai',
  callBackUrl: '',
  duration: 5,
  veoAspectRatio: '16:9',
  seeds: 12345,
  enableFallback: false,
  enableTranslation: true,
  generationType: 'TEXT_TO_VIDEO',
};

function VideoForm({ onGenerate, loading }) {
  const [form, setForm] = useState(initialState);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const models = useMemo(() => MODEL_OPTIONS[form.provider] || [], [form.provider]);
  const isRunway = form.provider === 'runway';
  const isVeo = form.provider === 'veo';
  const isSora = form.provider === 'sora';

  const changeProvider = (provider) => {
    update('provider', provider);
    update('model', (MODEL_OPTIONS[provider] || [])[0] || '');
  };

  const submit = (event) => {
    event.preventDefault();
    onGenerate(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">API Provider</label>
          <select
            value={form.provider}
            onChange={(e) => changeProvider(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
          >
            {PROVIDER_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Model</label>
          <select
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">Prompt</label>
        <textarea
          value={form.prompt}
          onChange={(e) => update('prompt', e.target.value)}
          rows={4}
          placeholder="Describe the video you want to generate..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
          required
        />
      </div>

      {isRunway ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Image URL (optional)</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => update('imageUrl', e.target.value)}
              placeholder="https://example.com/reference-image.jpg"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Duration (seconds)</label>
              <select
                value={form.duration}
                onChange={(e) => update('duration', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Watermark (optional)</label>
              <input
                type="text"
                value={form.waterMark}
                onChange={(e) => update('waterMark', e.target.value)}
                placeholder="kie.ai"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Callback URL (optional)</label>
              <input
                type="url"
                value={form.callBackUrl}
                onChange={(e) => update('callBackUrl', e.target.value)}
                placeholder="https://api.example.com/callback"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
              />
            </div>
          </div>
        </>
      ) : null}

      {isVeo ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Image URLs (one per line, optional)
            </label>
            <textarea
              value={form.imageUrls}
              onChange={(e) => update('imageUrls', e.target.value)}
              rows={3}
              placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Aspect Ratio</label>
              <select
                value={form.veoAspectRatio}
                onChange={(e) => update('veoAspectRatio', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Seed</label>
              <input
                type="number"
                value={form.seeds}
                onChange={(e) => update('seeds', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Watermark (optional)</label>
              <input
                type="text"
                value={form.watermark}
                onChange={(e) => update('watermark', e.target.value)}
                placeholder="kie.ai"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Callback URL (optional)</label>
              <input
                type="url"
                value={form.callBackUrl}
                onChange={(e) => update('callBackUrl', e.target.value)}
                placeholder="https://api.example.com/callback"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Generation Type</label>
              <select
                value={form.generationType}
                onChange={(e) => update('generationType', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
              >
                <option value="TEXT_TO_VIDEO">TEXT_TO_VIDEO</option>
                <option value="REFERENCE_2_VIDEO">REFERENCE_2_VIDEO</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.enableFallback}
                onChange={(e) => update('enableFallback', e.target.checked)}
                className="h-4 w-4"
              />
              Enable fallback
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.enableTranslation}
                onChange={(e) => update('enableTranslation', e.target.checked)}
                className="h-4 w-4"
              />
              Enable translation
            </label>
          </div>
        </>
      ) : null}

      {isSora ? (
        <>
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
        </>
      ) : null}

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
