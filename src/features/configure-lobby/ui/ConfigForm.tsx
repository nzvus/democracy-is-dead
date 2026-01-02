import React from 'react';
import { useTranslations } from 'next-intl';
import { useLobbyConfig } from '../model/useLobbyConfig';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ImagePicker } from '@/shared/ui/image-picker';
import { CustomSelect } from '@/shared/ui/custom-select'; // [NEW]
import { CustomToggle } from '@/shared/ui/custom-toggle'; // [NEW]
import { useFieldArray, Controller } from 'react-hook-form';
import { ArrowRight, ArrowLeft, Trash2, Plus, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export const ConfigForm = ({ lobbyId, onSuccess }: { lobbyId: string, onSuccess: () => void }) => {
  const t = useTranslations('Setup');
  const tCommon = useTranslations('Common');
  
  const { step, setStep, form, isSaving, saveConfiguration } = useLobbyConfig(lobbyId, onSuccess);
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = form;
  
  const candidatesField = useFieldArray({ control, name: "candidates" });
  const factorsField = useFieldArray({ control, name: "settings.factors" });
  
  const currentFactors = watch("settings.factors");
  const constantFactors = currentFactors?.filter(f => f.type === 'constant') || [];

  const onSubmit = (data: any) => saveConfiguration(data);

  const onError = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    toast.error(t('validation_error'));
  };

  const toggleDisabledCandidate = (factorIndex: number, candidateId: string) => {
    const current = factorsField.fields[factorIndex].disabled_candidates || [];
    const newSet = new Set(current);
    if (newSet.has(candidateId)) newSet.delete(candidateId);
    else newSet.add(candidateId);
    setValue(`settings.factors.${factorIndex}.disabled_candidates`, Array.from(newSet));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-32">
      
      {/* Step Progress */}
      <div className="flex justify-center gap-3 mb-10">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-purple-900/50' : 'bg-gray-800'}`} />
        ))}
      </div>

      {/* --- STEP 1: CANDIDATES --- */}
      {step === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
             <h3 className="text-3xl font-black text-white tracking-tight">{t('step_1')}</h3>
             <p className="text-gray-400 text-sm mt-1">{t('add_candidate_desc')}</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {candidatesField.fields.map((field, index) => (
              <div key={field.id} className="glass-card p-5 relative group border-t-4 border-t-indigo-500/50 hover:border-indigo-500 transition-colors">
                <button 
                    onClick={() => candidatesField.remove(index)} 
                    className="absolute top-4 right-4 text-gray-600 hover:text-red-400 bg-black/40 p-2 rounded-lg transition-colors z-10 opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>

                <div className="flex gap-5 items-start">
                    <div className="shrink-0 w-24">
                        <Controller
                            control={control}
                            name={`candidates.${index}.image_url`}
                            render={({ field: { value, onChange } }) => (
                                <ImagePicker value={value || null} onChange={onChange} className="w-24 h-24 rounded-xl" />
                            )}
                        />
                    </div>
                    <div className="flex-1 space-y-4">
                        <Input 
                            placeholder={t('placeholder_name')} 
                            {...register(`candidates.${index}.name`)} 
                            className="glass-input font-bold text-lg" 
                        />
                        <div className="relative">
                            <textarea 
                                placeholder="Description / Tagline..." 
                                {...register(`candidates.${index}.description`)}
                                className="w-full h-20 glass-input resize-none py-2 text-xs leading-relaxed"
                            />
                        </div>
                    </div>
                </div>
              </div>
            ))}
            
            <button 
                onClick={() => candidatesField.append({ name: "", id: crypto.randomUUID() } as any)}
                className="glass-card flex flex-col items-center justify-center gap-4 min-h-[200px] border-dashed border-2 border-gray-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-gray-500 hover:text-white group cursor-pointer"
            >
                <div className="w-14 h-14 rounded-full bg-gray-800 group-hover:bg-indigo-600 flex items-center justify-center transition-colors shadow-lg">
                    <Plus size={28} />
                </div>
                <span className="font-bold text-sm tracking-widest uppercase">{t('add_candidate_btn')}</span>
            </button>
          </div>
          {errors.candidates && <p className="text-red-400 text-center bg-red-900/10 p-2 rounded">{errors.candidates.message}</p>}
        </div>
      )}

      {/* --- STEP 2: FACTORS --- */}
      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-8">
             <h3 className="text-3xl font-black text-white tracking-tight">{t('step_2')}</h3>
             <p className="text-gray-400 text-sm mt-1">{t('add_factor_desc')}</p>
          </div>

          <div className="space-y-4">
            {factorsField.fields.map((field, index) => (
               <div key={field.id} className="glass-card p-6 relative group">
                  <button onClick={() => factorsField.remove(index)} className="absolute top-4 right-4 text-gray-600 hover:text-red-400 p-2 bg-black/40 rounded-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>

                  <div className="flex gap-6 items-start">
                    <div className="shrink-0 pt-1">
                        <Controller
                            control={control}
                            name={`settings.factors.${index}.image_url`}
                            render={({ field: { value, onChange } }) => (
                                <ImagePicker value={value || null} onChange={onChange} className="w-16 h-16 rounded-xl" />
                            )}
                        />
                    </div>
                    
                    <div className="flex-1 space-y-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input placeholder="Criteria Name (e.g. Taste)" {...register(`settings.factors.${index}.name`)} className="glass-input font-bold" />
                            <Input placeholder="Description..." {...register(`settings.factors.${index}.description`)} className="glass-input text-sm" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                            <CustomSelect 
                                label={t('type_label')}
                                {...register(`settings.factors.${index}.type`)}
                                options={[
                                    { label: t('types.numerical'), value: 'numerical' },
                                    { label: t('types.constant'), value: 'constant' }
                                ]}
                            />
                            
                            {watch(`settings.factors.${index}.type`) === 'numerical' && (
                                <>
                                    <CustomSelect 
                                        label={t('control_label')}
                                        {...register(`settings.factors.${index}.input_control`)}
                                        options={[
                                            { label: t('controls.slider'), value: 'slider' },
                                            { label: t('controls.stars'), value: 'stars' },
                                            { label: t('controls.number'), value: 'number' },
                                            { label: t('controls.toggle'), value: 'toggle' }
                                        ]}
                                    />

                                    <div>
                                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t('decimal_allowed')}</label>
                                        <Controller
                                            control={control}
                                            name={`settings.factors.${index}.step`}
                                            render={({ field: { value, onChange } }) => (
                                                <CustomToggle 
                                                    checked={value === 0.1}
                                                    onChange={(checked) => onChange(checked ? 0.1 : 1)}
                                                />
                                            )}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block">{t('weight_label')}</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    {...register(`settings.factors.${index}.weight`, { valueAsNumber: true })} 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2.5 text-sm text-center font-mono focus:border-indigo-500 outline-none" 
                                />
                            </div>
                        </div>

                        {/* Disable For Selector */}
                        {watch(`settings.factors.${index}.type`) === 'numerical' && (
                            <div className="border-t border-white/5 pt-3">
                                <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block flex items-center gap-1">
                                    {t('disable_for')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {candidatesField.fields.map((cand) => {
                                        const disabledList = watch(`settings.factors.${index}.disabled_candidates`) || [];
                                        const isDisabled = disabledList.includes(cand.id);
                                        return (
                                            <button
                                                key={cand.id}
                                                type="button"
                                                onClick={() => toggleDisabledCandidate(index, cand.id)}
                                                className={`
                                                    px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                                    ${isDisabled 
                                                        ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                                                        : 'bg-black/40 border-transparent text-gray-400 hover:bg-white/5'
                                                    }
                                                `}
                                            >
                                                {cand.name || "Unnamed"}
                                            </button>
                                        );
                                    })}
                                    {candidatesField.fields.length === 0 && <span className="text-xs text-gray-600 italic">{t('add_candidates_first')}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
               </div>
            ))}
          </div>

          <Button 
            variant="secondary" 
            onClick={() => factorsField.append({ id: crypto.randomUUID(), name: "", weight: 1, type: 'numerical', input_control: 'slider', trend: 'higher_better', is_hidden: false, step: 1, disabled_candidates: [] } as any)}
            className="w-full py-6 border-dashed border-2 border-gray-700 hover:border-indigo-500/50 text-gray-400 hover:text-white bg-transparent hover:bg-indigo-500/5 transition-all"
          >
            <Plus size={20} /> {t('add_factor')}
          </Button>
        </div>
      )}

      {/* --- STEP 3: REVIEW & SETTINGS --- */}
      {step === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="glass-card p-8 max-w-2xl mx-auto text-center border-t-4 border-t-green-500/50">
            <CheckCircle size={48} className="mx-auto mb-6 text-green-400" />
            <h3 className="text-3xl font-black mb-8">{t('step_3')}</h3>
            
            <div className="space-y-8 text-left">
              <Input 
                  label={t('lobby_name')} 
                  placeholder={t('lobby_name_ph')}
                  {...register("lobby_name")} 
                  className="glass-input text-xl font-bold text-center h-14"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 block">{t('privacy_label')}</label>
                      <div className="flex bg-black/40 p-1 rounded-xl">
                        {['public', 'anonymous'].map((mode) => (
                          <label key={mode} className={`flex-1 text-center py-3 rounded-lg cursor-pointer transition-all ${watch('settings.privacy') === mode ? 'bg-indigo-600 text-white shadow-lg font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
                            <input type="radio" value={mode} {...register('settings.privacy')} className="hidden" />
                            <span className="capitalize text-sm">{mode === 'public' ? t('privacy_public') : t('privacy_anon')}</span>
                          </label>
                        ))}
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                        <Input 
                            label={t('max_scale')} 
                            type="number" 
                            {...register("settings.voting_scale.max", { valueAsNumber: true })} 
                            className="glass-input text-center font-mono"
                        />
                        <p className="text-[10px] text-gray-500 text-center">{t('max_scale_desc')}</p>
                  </div>
              </div>
            </div>
          </div>

          {/* STATIC VALUES INPUT */}
          {constantFactors.length > 0 && (
            <div className="glass-card p-6 border-t-4 border-t-yellow-500/50 max-w-4xl mx-auto">
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-100">
                    <Info size={18} className="text-yellow-500" />
                    {t('static_info_label')}
                </h4>
                <div className="space-y-3">
                    {candidatesField.fields.map((cand, idx) => (
                        <div key={cand.id} className="grid grid-cols-12 gap-4 items-center bg-black/20 p-3 rounded-xl border border-white/5">
                            <div className="col-span-4 font-bold text-sm truncate px-2">{cand.name}</div>
                            <div className="col-span-8 grid gap-2">
                                {constantFactors.map(cf => (
                                    <div key={cf.id} className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase text-gray-500 w-1/3 text-right truncate">{cf.name}:</span>
                                        <input 
                                            type="number" 
                                            step="any" 
                                            placeholder="-"
                                            {...register(`candidates.${idx}.static_values.${cf.id}`, { valueAsNumber: true })}
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-yellow-500/50 outline-none text-right font-mono"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      )}

      {/* --- FOOTER --- */}
      <div className="fixed bottom-0 left-0 w-full bg-[#030712]/90 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(prev => prev - 1 as any)} className="text-gray-400 hover:text-white">
                <ArrowLeft size={18} /> {tCommon('back')}
            </Button>
            
            {step < 3 ? (
                <Button onClick={() => setStep(prev => prev + 1 as any)} className="btn-primary px-8">
                    {tCommon('next')} <ArrowRight size={18} className="ml-2" />
                </Button>
            ) : (
                <Button 
                  onClick={handleSubmit(onSubmit, onError)} 
                  isLoading={isSaving} 
                  className="btn-primary bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-900/30 px-12 py-4 text-lg"
                >
                    {t('launch')}
                </Button>
            )}
        </div>
      </div>
    </div>
  );
};