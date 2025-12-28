
'use client'


const getAvatarColor = (seed: string) => {
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
        'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
        'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 
        'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 
        'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ seed, src, className }: { seed: string, src?: string | null, className?: string }) {
    if (src) {
        return (
            <div className={`rounded-full overflow-hidden flex items-center justify-center bg-gray-800 ${className}`}>
                <img src={src} alt={seed} className="w-full h-full object-cover" />
            </div>
        )
    }

    const colorClass = getAvatarColor(seed);
    const initials = seed.substring(0, 2).toUpperCase();

    return (
        <div className={`rounded-full flex items-center justify-center text-white font-bold shadow-inner ${colorClass} ${className}`}>
            {initials}
        </div>
    )
} 