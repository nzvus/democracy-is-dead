import React from 'react';
import { useTranslations } from 'next-intl';
import { useLobbyConfig } from '../model/useLobbyConfig';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { UniversalImagePicker } from '@/shared/ui/image-picker'; 
import { useFieldArray, Controller } from 'react-hook-form';
import { ArrowRight, ArrowLeft, Trash2, Plus, GripVertical, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { CheckSquare, Square } from 'lucide-react';

export const ConfigForm = ({ lobbyId, onSuccess }: { lobbyId: string, onSuccess: () => void }) => {
  const t = useTranslations('Setup');
  const tCommon = useTranslations('Common');
  
  const { step, setStep, form, isSaving, saveConfiguration } = useLobbyConfig(lobbyId, onSuccess);
  const { register, control, handleSubmit, watch, formState: { errors }, setValue } = form;
  
  const candidatesField = useFieldArray({ control, name: "candidates" });
  const factorsField = useFieldArray({ control, name: "settings.factors" });

  const currentFactors = watch("settings.factors");
  const constantFactors = currentFactors?.filter(f => f.type === 'constant') || [];

  const onSubmit = (data: any) => saveConfiguration(data);

  const toggleDisabledCandidate = (factorIndex: number, candidateId: string) => {
    const current = factorsField.fields[factorIndex].disabled_candidates || [];
    const newSet = new Set(current);
    if (newSet.has(candidateId)) newSet.delete(candidateId);
    else newSet.add(candidateId);
    setValue(`settings.factors.${factorIndex}.disabled_candidates`, Array.from(newSet));
  };

  const onError = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    toast.error(t('validation_error'));
  };
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-32">
      
      <div className="flex justify-center gap-3 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-800'}`} />
        ))}
      </div>

      {/* --- STEP 1: CANDIDATES --- */}
      {step === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-6">
             <h3 className="text-2xl font-bold text-white">{t('step_1')}</h3>
             <p className="text-gray-400 text-sm">{t('add_candidate_desc')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {candidatesField.fields.map((field, index) => (
              <div key={field.id} className="glass-card p-6 space-y-4 relative group border-t-4 border-t-indigo-500/50">
                <button onClick={() => candidatesField.remove(index)} className="absolute top-4 right-4 text-gray-600 hover:text-red-400 bg-black/20 p-2 rounded-lg transition-colors z-10">
                    <Trash2 size={16} />
                </button>

                <div className="flex gap-4">
                    <div className="shrink-0">
                        <Controller
                            control={control}
                            name={`candidates.${index}.image_url`}
                            render={({ field: { value, onChange } }) => (
                                <UniversalImagePicker value={value || null} onChange={onChange} />
                            )}
                        />
                    </div>
                    <div className="flex-1 space-y-3">
                        <Input placeholder={t('placeholder_name')} {...register(`candidates.${index}.name`)} className="glass-input font-bold text-lg" />
                        <Input placeholder="Description..." {...register(`candidates.${index}.description`)} className="glass-input text-xs" />
                    </div>
                </div>
              </div>
            ))}
            
            <button 
                onClick={() => candidatesField.append({ name: "", id: crypto.randomUUID() } as any)}
                className="glass-card flex flex-col items-center justify-center gap-3 min-h-[200px] border-dashed border-2 border-gray-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-gray-500 hover:text-white group cursor-pointer"
            >
                <Plus size={24} />
                <span className="font-bold">{t('add_candidate_btn')}</span>
            </button>
          </div>
          {errors.candidates && <p className="text-red-400 text-center">{errors.candidates.message}</p>}
        </div>
      )}

      {/* --- STEP 2: FACTORS --- */}
      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          <div className="text-center mb-6">
             <h3 className="text-2xl font-bold text-white">{t('step_2')}</h3>
             <p className="text-gray-400 text-sm">{t('add_factor_desc')}</p>
          </div>

          <div className="space-y-4">
            {factorsField.fields.map((field, index) => (
               <div key={field.id} className="glass-card p-6 relative group">
                  <button onClick={() => factorsField.remove(index)} className="absolute top-4 right-4 text-gray-600 hover:text-red-400 p-2 bg-black/20 rounded-lg z-10">
                    <Trash2 size={16} />
                  </button>

                  <div className="flex gap-4 items-start">
                    <div className="shrink-0 pt-2">
                        <Controller
                            control={control}
                            name={`settings.factors.${index}.image_url`}
                            render={({ field: { value, onChange } }) => (
                                <UniversalImagePicker value={value || null} onChange={onChange} className="w-16 h-16" />
                            )}
                        />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input placeholder="Criteria Name" {...register(`settings.factors.${index}.name`)} className="glass-input font-bold" />
                            <Input placeholder="Description..." {...register(`settings.factors.${index}.description`)} className="glass-input text-sm" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/20 p-4 rounded-xl">
                            <div>
                                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t('type_label')}</label>
                                <select {...register(`settings.factors.${index}.type`)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white">
                                    <option value="numerical">{t('types.numerical')}</option>
                                    <option value="constant">{t('types.constant')}</option>
                                </select>
                            </div>
                            
                            {watch(`settings.factors.${index}.type`) === 'numerical' && (
                                <>
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t('control_label')}</label>
                                        <select {...register(`settings.factors.${index}.input_control`)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500">
                                            <option value="slider">{t('controls.slider')}</option>
                                            <option value="stars">{t('controls.stars')}</option>
                                            <option value="number">{t('controls.number')}</option>
                                            <option value="toggle">{t('controls.toggle')}</option>
                                        </select>
                                    </div>

                                    {/* Decimal Toggle */}
                                    <div className="flex items-end pb-2">
                                        <label className="flex items-center gap-2 cursor-pointer w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 px-3 hover:bg-gray-800 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="accent-indigo-500 w-4 h-4"
                                                onChange={(e) => {
                                                    const val = e.target.checked ? 0.1 : 1;
                                                    setValue(`settings.factors.${index}.step`, val);
                                                }}
                                                checked={watch(`settings.factors.${index}.step`) === 0.1}
                                            />
                                            <span className="text-xs text-gray-300 font-bold">{t('decimal_allowed')}</span>
                                        </label>
                                    </div>

                                    {/* Disable For... */}
                                    <div className="col-span-2 md:col-span-4 mt-2 border-t border-white/5 pt-2">
                                      <label className="text-[10px] uppercase text-gray-500 font-bold mb-2 block">{t('disable_for')}</label>
                                      <div className="flex flex-wrap gap-2">
                                        {candidatesField.fields.map((cand) => {
                                          const isDisabled = watch(`settings.factors.${index}.disabled_candidates`)?.includes(cand.id);
                                          return (
                                            <button
                                              key={cand.id}
                                              type="button"
                                              onClick={() => toggleDisabledCandidate(index, cand.id)}
                                              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors ${isDisabled ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                                            >
                                              {isDisabled ? <CheckSquare size={12} /> : <Square size={12} />}
                                              {cand.name || "Unnamed"}
                                            </button>
                                          );
                                        })}
                                        {/* [FIX] Used Key for string */}
                                        {candidatesField.fields.length === 0 && <span className="text-xs text-gray-600 italic">{t('add_candidates_first')}</span>}
                                      </div>
                                    </div>  
                                </>
                            )}

                            <div>
                                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t('weight_label')}</label>
                                <input type="number" step="0.1" {...register(`settings.factors.${index}.weight`, { valueAsNumber: true })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white text-center" />
                            </div>
                        </div>
                    </div>
                  </div>
               </div>
            ))}
          </div>

          <Button 
            variant="secondary" 
            onClick={() => factorsField.append({ id: crypto.randomUUID(), name: "", weight: 1, type: 'numerical', input_control: 'slider', trend: 'higher_better', is_hidden: false, step: 1, disabled_candidates: [] } as any)}
            className="w-full py-4 border-dashed border-2 border-gray-700 text-gray-400 hover:text-white"
          >
            <Plus size={20} /> {t('add_factor')}
          </Button>
        </div>
      )}

      {/* --- STEP 3: REVIEW & STATIC VALUES --- */}
      {step === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="glass-card p-8 max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-6">{t('step_3')}</h3>
            
            <div className="space-y-6 text-left">
              <Input 
                  label={t('lobby_name')} 
                  placeholder={t('lobby_name_ph')}
                  {...register("lobby_name")} 
                  className="glass-input text-lg font-bold text-center"
              />

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-3 block text-center">{t('privacy_label')}</label>
                <div className="flex justify-center gap-4">
                  {['public', 'anonymous'].map((mode) => (
                    <label key={mode} className={`px-6 py-3 rounded-xl cursor-pointer transition-all ${watch('settings.privacy') === mode ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400'}`}>
                      <input type="radio" value={mode} {...register('settings.privacy')} className="hidden" />
                      <span className="capitalize font-bold">{mode === 'public' ? t('privacy_public') : t('privacy_anon')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STATIC VALUES INPUT (Only if constant factors exist) */}
          {constantFactors.length > 0 && (
            <div className="glass-card p-6 border-t-4 border-t-yellow-500/50">
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Info size={18} className="text-yellow-500" />
                    {t('static_info_label')}
                </h4>
                <div className="space-y-6">
                    {candidatesField.fields.map((cand, idx) => (
                        <div key={cand.id} className="grid grid-cols-12 gap-4 items-center bg-black/20 p-3 rounded-xl">
                            <div className="col-span-4 font-bold text-sm truncate">{cand.name}</div>
                            <div className="col-span-8 grid gap-2">
                                {constantFactors.map(cf => (
                                    <div key={cf.id} className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase text-gray-500 w-1/3 text-right">{cf.name}:</span>
                                        <input 
                                            type="number" 
                                            step="any" 
                                            placeholder="Value"
                                            {...register(`candidates.${idx}.static_values.${cf.id}`, { valueAsNumber: true })}
                                            className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-indigo-500 outline-none"
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
      <div className="fixed bottom-0 left-0 w-full bg-[#030712]/90 backdrop-blur-lg border-t border-gray-800 p-6 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(prev => prev - 1 as any)}>
                <ArrowLeft size={18} /> {tCommon('back')}
            </Button>
            
            {step < 3 ? (
                <Button onClick={() => setStep(prev => prev + 1 as any)} className="btn-primary">
                    {tCommon('next')} <ArrowRight size={18} />
                </Button>
            ) : (
                <Button 
                  onClick={handleSubmit(onSubmit, onError)} 
                  isLoading={isSaving} 
                  className="btn-primary bg-green-600 hover:bg-green-500 shadow-green-900/20 px-10"
                >
                    {t('launch')}
                </Button>
            )}
        </div>
      </div>
    </div>
  );
};