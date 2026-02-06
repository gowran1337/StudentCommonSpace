import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

function ConfirmModal({
  options,
  onResult,
}: {
  options: ConfirmOptions;
  onResult: (result: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onResult(false)}
      />
      {/* Dialog */}
      <div className="relative bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in">
        <h3 className="text-lg font-bold text-white mb-2">{options.title}</h3>
        <p className="text-slate-300 text-sm whitespace-pre-line mb-6">{options.message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onResult(false)}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {options.cancelText || 'Avbryt'}
          </button>
          <button
            onClick={() => onResult(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
              options.danger
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {options.confirmText || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (result: boolean) => void;
  } | null>(null);

  const confirmFn = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      setState({ options, resolve });
    });
  }, []);

  const handleResult = useCallback(
    (result: boolean) => {
      state?.resolve(result);
      setState(null);
    },
    [state]
  );

  return (
    <ConfirmContext.Provider value={{ confirm: confirmFn }}>
      {children}
      {state && <ConfirmModal options={state.options} onResult={handleResult} />}
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
