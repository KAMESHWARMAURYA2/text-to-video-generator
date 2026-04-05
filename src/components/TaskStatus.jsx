import { useEffect, useRef, useState } from 'react';

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
  );
}

function TaskStatus({
  onCheckStatus,
  statusLoading,
  status,
  taskId: activeTaskId,
  provider,
  providerOptions,
  onProviderChange,
}) {
  const [taskIdInput, setTaskIdInput] = useState(activeTaskId || '');
  const [autoPoll, setAutoPoll] = useState(true);
  const pollRef = useRef(null);

  useEffect(() => {
    if (activeTaskId) setTaskIdInput(activeTaskId);
  }, [activeTaskId]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    if (autoPoll && taskIdInput && status?.state === 'processing') {
      pollRef.current = setInterval(() => {
        onCheckStatus(taskIdInput, false);
      }, 5000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [autoPoll, status?.state, taskIdInput, onCheckStatus]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">API Provider for status check</label>
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
        >
          {providerOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={taskIdInput}
          onChange={(e) => setTaskIdInput(e.target.value)}
          placeholder="Enter task ID"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-indigo-400 transition focus:ring"
        />
        <button
          onClick={() => onCheckStatus(taskIdInput, true)}
          disabled={statusLoading}
          className="rounded-xl bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {statusLoading ? 'Checking...' : 'Check Status'}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={autoPoll}
          onChange={(e) => setAutoPoll(e.target.checked)}
          className="h-4 w-4"
        />
        Auto poll every 5 seconds while processing
      </label>

      {status && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
          <p>
            <strong>Status:</strong> {status.state}
            {status.state === 'processing' ? (
              <span className="ml-2 inline-flex">
                <Spinner />
              </span>
            ) : null}
          </p>
          {status.error ? <p className="mt-2 text-red-300">{status.error}</p> : null}
        </div>
      )}
    </div>
  );
}

export default TaskStatus;
