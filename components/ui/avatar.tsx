'use client'

export default function Avatar({ seed, className = "w-10 h-10" }: { seed: string, className?: string }) {
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <div className={`rounded-full overflow-hidden border-2 border-white/20 bg-gray-800 ${className}`}>
      <img 
        src={avatarUrl} 
        alt="Avatar" 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )
}