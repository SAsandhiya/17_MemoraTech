import { useState } from 'react';

export function Tooltip({ children, text, position = 'top', className = '' }) {
    const [show, setShow] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-neutral-800 border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-neutral-800 border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-neutral-800 border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-neutral-800 border-y-transparent border-l-transparent'
    };

    return (
        <div
            className={`relative inline-flex ${className}`}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && text && (
                <div className={`absolute z-50 ${positionClasses[position]} pointer-events-none tooltip-animate`}>
                    <div className="relative">
                        <div className="bg-neutral-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg border border-neutral-700">
                            {text}
                        </div>
                        <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
                    </div>
                </div>
            )}
        </div>
    );
}

// IconButton with built-in tooltip
export function IconButton({ icon, tooltip, onClick, disabled, className = '', active = false, position = 'top' }) {
    return (
        <Tooltip text={tooltip} position={position}>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`p-2 rounded-lg transition-colors ${active
                    ? 'bg-yellow-400 text-black'
                    : 'text-neutral-500 hover:text-yellow-400 hover:bg-neutral-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            >
                {icon}
            </button>
        </Tooltip>
    );
}