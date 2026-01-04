interface ProgressBarProps {
    progress: number; // Percentage 0-100
    className?: string;
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const isCompleted = clampedProgress >= 90;

    return (
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/50 ${className || ''}`}>
            <div
                className={`h-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-red-500'
                    }`}
                style={{ width: `${clampedProgress}%` }}
            />
        </div>
    );
}
