'use client'
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useTranslations } from 'next-intl';

interface SmartTooltipProps {
  children: React.ReactNode;
  content?: string | null;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const SmartTooltip = ({ children, content, side = 'top' }: SmartTooltipProps) => {
  const t = useTranslations('Tooltips');
  
  if (!content) return <>{children}</>;

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className="cursor-help">{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={5}
            className="z-50 max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-xs text-gray-200 border border-gray-700 shadow-xl animate-in fade-in zoom-in-95"
          >
            <span className="font-bold text-indigo-400">{t('desc_prefix')}</span>
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};