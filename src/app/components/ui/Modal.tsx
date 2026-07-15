"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  children: React.ReactNode;
  onClose(): void;
};

export default function Modal({
  open,
  children,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: .9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .9 }}
            className="fixed left-1/2 top-1/2 z-[60] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[36px] border border-white/10 bg-[#07101d] p-10"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}