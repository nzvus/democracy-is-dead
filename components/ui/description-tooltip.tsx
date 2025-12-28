'use client'

import { ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

interface DescriptionTooltipProps {
    title: string
    description?: string
    children: ReactNode
}

export default function DescriptionTooltip({ title, description, children }: DescriptionTooltipProps) {
    if (!description) return <>{children}</>

    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <span className="cursor-help decoration-dotted underline-offset-2 hover:opacity-80 transition-opacity">
                        {children}
                    </span> 
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content 
                        sideOffset={5} 
                        className="max-w-xs bg-gray-900 border border-gray-700 text-white p-3 rounded-lg shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200"
                    >
                        <p className="font-bold text-sm mb-1 text-gray-200">{title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
                        <TooltipPrimitive.Arrow className="fill-gray-900" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    )
}