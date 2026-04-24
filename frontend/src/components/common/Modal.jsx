import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handler);
    }
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-slide-up`}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all font-bold text-lg">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
      </div>
    </div>
  );
}
