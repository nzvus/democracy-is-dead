'use client'
import { useModalStore } from '@/shared/model/modal-store';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';

export const GlobalModalWrapper = () => {
  const { isOpen, title, content, type, onConfirm, closeModal } = useModalStore();
  const t = useTranslations('Modals');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={title || ""}>
      <div className="space-y-6">
        <div className="text-gray-300 leading-relaxed">
          {content}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          {type === 'confirm' && (
            <Button variant="ghost" onClick={closeModal}>
              {t('cancel_btn')}
            </Button>
          )}
          <Button 
            variant={type === 'alert' ? 'danger' : 'primary'} 
            onClick={handleConfirm}
          >
            {type === 'confirm' ? t('confirm_btn') : t('close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 