import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  loading,
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto relative"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <h3 className="font-serif font-semibold text-foreground">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded text-neutral-400 hover:bg-neutral-100 hover:text-foreground smooth-color"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 内容 */}
              <div className="px-5 py-4 relative">
                {children}
                {loading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                  </div>
                )}
              </div>

              {/* 底部 */}
              {footer && (
                <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
