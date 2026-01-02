import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetupWizardSchema, SetupWizardValues } from './config-schema';
import { createClient } from '@/shared/api/supabase';
import { toast } from 'sonner';
import { omit } from 'lodash'; 

export const useLobbyConfig = (lobbyId: string, onComplete: () => void) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  
  const DRAFT_KEY = `draft_${lobbyId}`;

  const form = useForm<SetupWizardValues>({
    resolver: zodResolver(SetupWizardSchema) as any,
    defaultValues: {
      lobby_name: "", 
      settings: {
        privacy: 'public',
        voting_scale: { max: 10 },
        factors: []
      },
      candidates: []
    },
    mode: 'onChange',
    shouldUnregister: false 
  });

  // 1. Load Draft
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          form.reset(parsed);
          toast.info("Restored previous draft");
        } catch (e) {
          console.error("Failed to load draft", e);
        }
      }
    }
  }, [DRAFT_KEY, form]);

  // 2. Save Draft
  useEffect(() => {
    const subscription = form.watch((value) => {
      const safeData = JSON.parse(JSON.stringify(value));
      
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
  }, [form, DRAFT_KEY]); // [FIX] Added form dependency

  const saveConfiguration = async (data: SetupWizardValues) => {
    setIsSaving(true);
    try {
      const { error: lobbyError } = await supabase
        .from('lobbies')
        .update({ 
          name: data.lobby_name,
          settings: data.settings, 
          status: 'voting' 
        })
        .eq('id', lobbyId);

      if (lobbyError) throw lobbyError;

      if (data.candidates.length > 0) {
        // First delete existing candidates to prevent duplicates (simple approach)
        await supabase.from('candidates').delete().eq('lobby_id', lobbyId);

        const cleanCandidates = data.candidates.map(c => ({
          lobby_id: lobbyId,
          name: c.name,
          description: c.description || '',
          image_url: c.image_url || null,
          static_values: c.static_values || {}
        }));

        const { error: candError } = await supabase
          .from('candidates')
          .insert(cleanCandidates);

        if (candError) throw candError;
      }

      localStorage.removeItem(DRAFT_KEY);
      toast.success("Lobby Configured!");
      onComplete();
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