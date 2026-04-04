import { useCallback, useEffect, useState } from 'react';
import TaskStatus from './components/TaskStatus';
import Toast from './components/Toast';
import VideoForm from './components/VideoForm';
import VideoPlayer from './components/VideoPlayer';
import { getTasks, saveTask } from './services/firebase';
import { createTask, getTaskStatus } from './services/kieApi';

function App() {
  const [taskId, setTaskId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((nextToast) => {
    setToast(nextToast);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const tasks = await getTasks();
      setHistory(tasks.slice(0, 10));
    } catch (error) {
      showToast({ type: 'error', message: `Failed to load history: ${error.message}` });
    }
  }, [showToast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onGenerate = async ({ prompt, aspectRatio, nFrames, removeWatermark }) => {
    try {
      setLoadingGenerate(true);
      setVideoUrl('');
      setStatus(null);
      const createdTaskId = await createTask(prompt, { aspectRatio, nFrames, removeWatermark });
      setTaskId(createdTaskId);
      showToast({ type: 'success', message: 'Task created successfully.' });

      try {
        await saveTask(createdTaskId, prompt);
        loadHistory();
      } catch (error) {
        showToast({
          type: 'error',
          message: `Task created, but Firestore save failed: ${error.message}`,
        });
      }
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to create task.' });
    } finally {
      setLoadingGenerate(false);
    }
  };

  const copyTaskId = async () => {
    try {
      await navigator.clipboard.writeText(taskId);
      showToast({ type: 'success', message: 'Task ID copied to clipboard.' });
    } catch {
      showToast({ type: 'error', message: 'Failed to copy Task ID.' });
    }
  };

  const onCheckStatus = useCallback(
    async (id, showErrors = true) => {
      const normalizedId = id?.trim();
      if (!normalizedId) {
        if (showErrors) {
          showToast({ type: 'error', message: 'Please provide a task ID.' });
        }
        return;
      }

      try {
        setLoadingStatus(true);
        setStatus((prev) => ({ ...prev, state: 'processing', error: null }));
        const res = await getTaskStatus(normalizedId);
        setTaskId(normalizedId);

        if (res.state === 'success') {
          setVideoUrl(res.videoUrl);
          setStatus({ state: 'success' });
          showToast({ type: 'success', message: 'Video generation complete.' });
          return;
        }

        if (res.state === 'failed') {
          setVideoUrl('');
          setStatus({ state: 'failed', error: 'Task failed on provider side.' });
          if (showErrors) {
            showToast({ type: 'error', message: 'Task failed.' });
          }
          return;
        }

        setStatus({ state: 'processing' });
      } catch (error) {
        setStatus({ state: 'failed', error: error.message || 'Failed to fetch status.' });
        if (showErrors) {
          showToast({ type: 'error', message: error.message || 'Failed to check status.' });
        }
      } finally {
        setLoadingStatus(false);
      }
    },
    [showToast],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sora 2 Text-to-Video Generator</h1>
          <p className="text-sm text-slate-300">
            Frontend-only React app using Kie AI APIs and Firestore metadata storage.
          </p>
          <p className="text-xs text-amber-300">
            Security note: frontend environment variables are visible in browser bundles. Use restricted API keys.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg backdrop-blur">
            <h2 className="mb-4 text-xl font-semibold">Generate Video</h2>
            <VideoForm onGenerate={onGenerate} loading={loadingGenerate} />

            {taskId ? (
              <div className="mt-4 rounded-xl border border-indigo-500/50 bg-indigo-500/10 p-3">
                <p className="text-sm text-indigo-100">Task ID</p>
                <p className="mt-1 break-all font-mono text-sm text-white">{taskId}</p>
                <button
                  onClick={copyTaskId}
                  className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Copy Task ID
                </button>
              </div>
            ) : null}
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg backdrop-blur">
            <h2 className="mb-4 text-xl font-semibold">Track Task</h2>
            <TaskStatus
              taskId={taskId}
              onCheckStatus={onCheckStatus}
              statusLoading={loadingStatus}
              status={status}
            />
          </article>
        </section>

        {videoUrl ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg backdrop-blur">
            <h2 className="mb-4 text-xl font-semibold">Generated Video</h2>
            <VideoPlayer videoUrl={videoUrl} onToast={showToast} />
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg backdrop-blur">
          <h2 className="mb-4 text-xl font-semibold">Recent Firestore Tasks</h2>
          {history.length === 0 ? (
            <p className="text-sm text-slate-300">No stored tasks found yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {history.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                  <p className="font-mono text-xs text-slate-200">{item.taskId}</p>
                  <p className="mt-1 line-clamp-2 text-slate-400">{item.prompt}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}

export default App;
