'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface AutoSaveOptions {
  debounceMs?: number
  onSaveStart?: () => void
  onSaveComplete?: () => void
  onSaveError?: (error: Error) => void
}

interface PendingSave {
  table: string
  id: string
  data: Record<string, unknown>
  timestamp: number
}

const STORAGE_KEY = 'lifetree_pending_saves'
const SAVE_DEBOUNCE = 800

export function useAutoSave(options: AutoSaveOptions = {}) {
  const { 
    debounceMs = SAVE_DEBOUNCE, 
    onSaveStart, 
    onSaveComplete, 
    onSaveError 
  } = options
  
  const supabase = createClient()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSavesRef = useRef<Map<string, PendingSave>>(new Map())
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const loadPendingSaves = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const saves = JSON.parse(stored) as PendingSave[]
        saves.forEach(save => {
          const key = `${save.table}:${save.id}`
          pendingSavesRef.current.set(key, save)
        })
      }
    } catch {
    }
  }, [])

  const persistPendingSaves = useCallback(() => {
    try {
      const saves = Array.from(pendingSavesRef.current.values())
      if (saves.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saves))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
    }
  }, [])

  const processPendingSaves = useCallback(async () => {
    const saves = Array.from(pendingSavesRef.current.values())
    if (saves.length === 0) return

    setIsSaving(true)
    setSaveStatus('saving')
    onSaveStart?.()

    try {
      for (const save of saves) {
        const { error } = await supabase
          .from(save.table)
          .update(save.data)
          .eq('id', save.id)

        if (!error) {
          const key = `${save.table}:${save.id}`
          pendingSavesRef.current.delete(key)
        }
      }

      persistPendingSaves()
      setLastSaved(new Date())
      setSaveStatus('saved')
      onSaveComplete?.()
      
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      onSaveError?.(error as Error)
    } finally {
      setIsSaving(false)
    }
  }, [supabase, onSaveStart, onSaveComplete, onSaveError, persistPendingSaves])

  const queueSave = useCallback((table: string, id: string, data: Record<string, unknown>) => {
    const key = `${table}:${id}`
    const existingData = pendingSavesRef.current.get(key)?.data || {}
    
    pendingSavesRef.current.set(key, {
      table,
      id,
      data: { ...existingData, ...data },
      timestamp: Date.now(),
    })

    persistPendingSaves()

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setSaveStatus('saving')
    saveTimeoutRef.current = setTimeout(() => {
      processPendingSaves()
    }, debounceMs)
  }, [debounceMs, processPendingSaves, persistPendingSaves])

  const saveNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    queueSave('skill_nodes', nodeId, { position_x: x, position_y: y })
  }, [queueSave])

  const saveNodeData = useCallback((nodeId: string, data: Partial<{
    title: string
    description: string | null
    status: string
    priority: string
    category: string
    checklist: unknown[]
    due_date: string | null
    notes: string | null
    is_habit: boolean
  }>) => {
    queueSave('skill_nodes', nodeId, data)
  }, [queueSave])

  const saveTreeData = useCallback((treeId: string, data: Partial<{
    name: string
    description: string | null
    icon: string
    color: string
    last_canvas_state: unknown
  }>) => {
    queueSave('skill_trees', treeId, data)
  }, [queueSave])

  const saveCanvasViewport = useCallback((treeId: string, viewport: { x: number; y: number; zoom: number }) => {
    queueSave('skill_trees', treeId, { 
      last_canvas_state: { viewport, savedAt: Date.now() } 
    })
  }, [queueSave])

  const forceSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await processPendingSaves()
  }, [processPendingSaves])

  useEffect(() => {
    loadPendingSaves()
    processPendingSaves()
  }, [loadPendingSaves, processPendingSaves])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingSavesRef.current.size > 0) {
        persistPendingSaves()
        const saves = Array.from(pendingSavesRef.current.values())
        saves.forEach(save => {
          navigator.sendBeacon?.(
            `/api/autosave`,
            JSON.stringify(save)
          )
        })
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        forceSave()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [forceSave, persistPendingSaves])

  return {
    isSaving,
    lastSaved,
    saveStatus,
    queueSave,
    saveNodePosition,
    saveNodeData,
    saveTreeData,
    saveCanvasViewport,
    forceSave,
    pendingCount: pendingSavesRef.current.size,
  }
}
