import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetupWizardSchema, SetupWizardValues } from './config-schema';
import { createClient } from '@/shared/api/supabase';
import { toast } from 'sonner';

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
    shouldUnregister: false // [FIX] CRITICAL: Keep data when stepping through the wizard
  });

  // 1. Load Draft on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          form.reset(parsed);
          // toast.info("Restored previous draft"); // Optional: Feedback
        } catch (e) {
          console.error("Failed to load draft", e);
        }
      }
    }
  }, [DRAFT_KEY, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, DRAFT_KEY]);

  const saveConfiguration = async (data: SetupWizardValues) => {
    setIsSaving(true);
    try {
      // Update Lobby Name & Settings
      const { error: lobbyError } = await supabase
        .from('lobbies')
        .update({ 
          name: data.lobby_name,
          settings: data.settings, 
          status: 'voting' 
        })
        .eq('id', lobbyId);

      if (lobbyError) throw lobbyError;

      // Insert Candidates
      if (data.candidates.length > 0) {
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

      // Clear draft on success
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