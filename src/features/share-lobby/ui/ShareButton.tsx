'use client'
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';

export const ShareButton = ({ code }: { code: string }) => {
  const t = useTranslations('Share');
  const [isOpen, setIsOpen] = useState(false);
  
  const getUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/lobby/${code}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getUrl());
    toast.success(t('copied'));
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)} className="px-3">
        {t('invite')}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('invite')}>
        <div className="flex flex-col items-center gap-6 p-4">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG value={getUrl()} size={200} />
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('label_code')}</p>
            <p className="text-4xl font-mono font-black tracking-widest">{code}</p>
          </div>

          <Button onClick={handleCopy} className="w-full">
            {t('copy')}
          </Button>
        </div>
      </Modal>
    </>
  );
};