"use client";

import { AnimatePresence, motion } from "framer-motion";

type EditableFieldProps = {
  editing: boolean;
  display: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function EditableField({ editing, display, children, className }: EditableFieldProps) {
  return (
    <motion.div layout className={className}>
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {display}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
