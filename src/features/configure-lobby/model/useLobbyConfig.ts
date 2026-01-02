import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetupWizardSchema, SetupWizardValues } from './config-schema';
import { createClient } from '@/shared/api/supabase';
import { toast } from 'sonner';

// Define defaults outside component to ensure reference stability for useEffect
const DEFAULT_VALUES: SetupWizardValues = {
  lobby_name: "", 
  settings: {
    privacy: 'public',
    voting_scale: { max: 10 },
    factors: []
  },
  candidates: []
};

export const useLobbyConfig = (lobbyId: string, onComplete: (data: any) => void) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  
  const DRAFT_KEY = `draft_${lobbyId}`;

  const form = useForm<SetupWizardValues>({
    resolver: zodResolver(SetupWizardSchema) as any,
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
    shouldUnregister: false // Critical: Keep data when changing steps
  });

  // 1. Hydration Strategy: Draft -> DB -> Default
  useEffect(() => {
    const loadData = async () => {
      if (typeof window === 'undefined') return;

      // A. Try Local Draft First
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          
          // Deep Merge Logic to ensure structure integrity
          const safeData = {
            ...DEFAULT_VALUES,
            ...parsed,
            settings: {
              ...DEFAULT_VALUES.settings,
              ...(parsed.settings || {}),
              voting_scale: {
                ...DEFAULT_VALUES.settings.voting_scale,
                ...(parsed.settings?.voting_scale || {})
              }
            }
          };

          form.reset(safeData);
          toast.info("Restored previous draft");
          return;
        } catch (e) {
          console.error("Failed to parse draft", e);
          localStorage.removeItem(DRAFT_KEY);
        }
      }

      // B. If no draft, fetch from DB (Suspend & Edit Case)
      try {
        const { data: lobby } = await supabase.from('lobbies').select('*').eq('id', lobbyId).single();
        
        if (lobby) {
           const { data: candidates } = await supabase.from('candidates').select('*').eq('lobby_id', lobbyId);
           const { data: factors } = await supabase.from('factors').select('*').eq('lobby_id', lobbyId);
           
           form.reset({
             lobby_name: lobby.name || "My Lobby",
             settings: {
                ...DEFAULT_VALUES.settings,
                ...lobby.settings,
                factors: factors?.map(f => ({
                    ...f,
                    weight: Number(f.weight),
                    // Map JSONB config back to UI state
                    disabled_candidates: f.config?.disabled_for || []
                })) || []
             },
             candidates: candidates?.map(c => ({
                 ...c,
                 id: c.id // Essential for Upsert logic
             })) || []
           });
        }
      } catch (e) {
        console.error("Hydration failed", e);
      }
    };
    
    loadData();
  }, [DRAFT_KEY, lobbyId, supabase, form]);

  // 2. Save Draft Logic (Strip Images to prevent Storage/Header issues)
  useEffect(() => {
    const subscription = form.watch((value) => {
      const safeData = JSON.parse(JSON.stringify(value));
      
      // Remove Base64 images from draft to save space
      if (safeData.candidates) {
        safeData.candidates.forEach((c: any) => {
          if (c.image_url?.startsWith('data:')) c.image_url = null;
        });
      }
      if (safeData.settings?.factors) {
        safeData.settings.factors.forEach((f: any) => {
          if (f.image_url?.startsWith('data:')) f.image_url = null;
        });
      }

      localStorage.setItem(DRAFT_KEY, JSON.stringify(safeData));
    });
    return () => subscription.unsubscribe();
  }, [form, DRAFT_KEY]);

  // 3. Main Save Action
  const saveConfiguration = async (data: SetupWizardValues) => {
    setIsSaving(true);
    try {
      // A. Update Lobby Meta
      const { error: lobbyError } = await supabase
        .from('lobbies')
        .update({ 
          name: data.lobby_name,
          settings: {
             ...data.settings,
             factors: [] // Factors are stored in their own table now
          }, 
          status: 'voting' 
        })
        .eq('id', lobbyId);

      if (lobbyError) throw lobbyError;

      // B. Upsert Candidates
      if (data.candidates.length > 0) {
        // 1. Find candidates to delete
        const { data: existingCands } = await supabase.from('candidates').select('id').eq('lobby_id', lobbyId);
        const existingIds = existingCands?.map(c => c.id) || [];
        const currentIds = data.candidates.map(c => c.id).filter(Boolean);
        
        const toDelete = existingIds.filter(id => !currentIds.includes(id));
        if (toDelete.length > 0) await supabase.from('candidates').delete().in('id', toDelete);

        // 2. Upsert
        const cleanCandidates = data.candidates.map(c => ({
          ...(c.id ? { id: c.id } : {}), // Preserve ID if editing
          lobby_id: lobbyId,
          name: c.name,
          description: c.description || '',
          image_url: c.image_url || null,
          static_values: c.static_values || {}
        }));

        await supabase.from('candidates').upsert(cleanCandidates);
      }

      // C. Upsert Factors
      if (data.settings.factors.length > 0) {
         // 1. Find factors to delete
         const { data: existingFactors } = await supabase.from('factors').select('id').eq('lobby_id', lobbyId);
         const existingFIds = existingFactors?.map(f => f.id) || [];
         const currentFIds = data.settings.factors.map(f => f.id).filter(Boolean);
         
         const factorsToDelete = existingFIds.filter(id => !currentFIds.includes(id));
         if (factorsToDelete.length > 0) await supabase.from('factors').delete().in('id', factorsToDelete);

         // 2. Upsert
         const cleanFactors = data.settings.factors.map(f => ({
             ...(f.id ? { id: f.id } : {}),
             lobby_id: lobbyId,
             name: f.name,
             description: f.description,
             weight: f.weight,
             type: f.type,
             input_control: f.input_control,
             trend: f.trend,
             image_url: f.image_url,
             is_hidden: f.is_hidden,
             step: f.step,
             // Serialize disabled candidates to config JSONB
             config: { disabled_for: f.disabled_candidates || [] }
         }));

         await supabase.from('factors').upsert(cleanFactors);
      }

      // Cleanup & Callback
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Lobby Configured!");
      onComplete(data);

    } catch (e) {
      console.error(e);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    step,
    setStep,
    form,
    isSaving,
    saveConfiguration
  };
};