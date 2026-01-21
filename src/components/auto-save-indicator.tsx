'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
}

export function AutoSaveIndicator({ status, lastSaved }: AutoSaveIndicatorProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
        status === 'idle' && "bg-muted/50 text-muted-foreground",
        status === 'saving' && "bg-cyan-500/10 text-cyan-500",
        status === 'saved' && "bg-emerald-500/10 text-emerald-500",
        status === 'error' && "bg-red-500/10 text-red-500"
      )}
    >
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{lastSaved ? `Saved ${formatTime(lastSaved)}` : 'Auto-save on'}</span>
          </motion.div>
        )}
        
        {status === 'saving' && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Saving...</span>
          </motion.div>
        )}
        
        {status === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>All changes saved</span>
          </motion.div>
        )}
        
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5"
          >
            <CloudOff className="w-3.5 h-3.5" />
            <span>Save failed - retrying</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
