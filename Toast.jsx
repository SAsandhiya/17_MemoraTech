import { useEffect } from 'react';
import { HiCheck, HiX, HiInformationCircle } from 'react-icons/hi';

export function Toast({ message, type = 'info', action, onAction, onClose }) {
    useEffect(() => {
        if (!action) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [action, onClose]);

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-700',
        error: 'bg-red-50 border-red-200 text-red-700',
        info: 'bg-sky-50 border-sky-200 text-sky-700'
    };

    const icons = {
        success: <HiCheck className="w-4 h-4" />,
        error: <HiX className="w-4 h-4" />,
        info: <HiInformationCircle className="w-4 h-4" />
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[type]} shadow-md backdrop-blur-sm`}>
                {icons[type]}
                <span className="text-sm font-medium">{message}</span>
                {action && (
                    <button
                        onClick={() => {
                            onAction?.();
                            onClose();
                        }}
                        className="ml-2 px-2 py-0.5 bg-sky-600 text-white text-xs font-medium rounded hover:bg-sky-700 transition-colors"
                    >
                        {action}
                    </button>
                )}
                <button onClick={onClose} className="ml-1 text-slate-400 hover:text-slate-600">
                    <HiX className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
