import React from 'react';
import { Check, Mic, Music2 } from 'lucide-react';
import { Reciter } from '../../types';
import { VERIFIED_RECITERS } from '../../services/reciterProvider';

interface ReciterSelectorProps {
  selectedReciterId: string;
  onSelectReciter: (reciter: Reciter) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ReciterSelector: React.FC<ReciterSelectorProps> = ({
  selectedReciterId,
  onSelectReciter,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[80vh] overflow-hidden">
        
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white font-serif">
              اختيار القارئ المعتمد
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            إغلاق
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1">
          {VERIFIED_RECITERS.map(reciter => {
            const isSelected = reciter.id === selectedReciterId;
            return (
              <button
                key={reciter.id}
                onClick={() => {
                  onSelectReciter(reciter);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div>
                  <div className="text-sm font-serif">{reciter.arabicName}</div>
                  <div className="text-[11px] text-neutral-400 font-sans mt-0.5">
                    {reciter.style} • {reciter.bitrate}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
