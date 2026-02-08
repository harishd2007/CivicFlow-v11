
import React, { useState } from 'react';
import { Camera, MapPin, Send, Loader2, Sparkles, Trash2, Edit3 } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { IssueCategory, Location } from '../types';
import { analyzeIssueImage } from '../services/geminiService';

interface Props {
  onSubmit: (data: any) => void;
  translations: any;
}

const mapCategoryKey = (val: string) => val.toLowerCase().replace(/\s/g, '');

export const ReportForm: React.FC<Props> = ({ onSubmit, translations: t }) => {
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [description, setDescription] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const addr = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: addr
        });
        setManualAddress(addr);
        setIsGettingLocation(false);
      }, (error) => {
        alert("Unable to retrieve location. Please grant permission.");
        setIsGettingLocation(false);
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(reader.result as string);
        
        // AI Analysis
        setIsAnalyzing(true);
        try {
          const analysis = await analyzeIssueImage(base64);
          if (analysis.category) setCategory(analysis.category);
          if (analysis.description) setDescription(analysis.description);
        } catch (err) {
          console.error("AI Analysis failed", err);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description || (!location && !manualAddress)) {
      alert("Please complete all fields!");
      return;
    }
    
    const finalLocation = location || { lat: 0, lng: 0, address: manualAddress };
    if (manualAddress) finalLocation.address = manualAddress;

    onSubmit({ category, description, location: finalLocation, imageUrl: image });
    // Reset
    setCategory('');
    setDescription('');
    setLocation(null);
    setManualAddress('');
    setImage(null);
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl -z-10 rounded-full"></div>
      
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 lovable text-indigo-400">
        <Sparkles className="w-6 h-6" />
        {t.newReport}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl p-6 bg-slate-800/30 hover:bg-slate-800/50 transition-colors relative group">
          {image ? (
            <div className="relative w-full">
              <img src={image} alt="Report preview" className="w-full h-48 object-cover rounded-xl" />
              <button 
                type="button" 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <div className="p-4 bg-indigo-600/20 rounded-full group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-indigo-400" />
              </div>
              <span className="text-slate-400 font-medium">{t.capturePhoto}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center rounded-2xl">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
              <p className="text-xs text-indigo-300 font-medium animate-pulse">{t.analyzing}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                category === cat.value 
                  ? `border-indigo-500 bg-indigo-500/10 text-indigo-400` 
                  : 'border-slate-700 bg-slate-800/40 text-slate-400 grayscale hover:grayscale-0'
              }`}
            >
              <div className={`p-2 rounded-lg mb-2 ${cat.color} bg-opacity-20`}>{cat.icon}</div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {t[mapCategoryKey(cat.value)] || cat.value}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t.description}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.placeholderDesc}
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-slate-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> {t.manualAddress}
          </label>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder={t.placeholderAddress}
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${
              location 
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-indigo-500'
            }`}
          >
            {isGettingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
            {location ? t.locationLocked : t.detectLocation}
          </button>
          
          <div className="flex-1 p-4 bg-slate-800/40 rounded-xl border-2 border-slate-700 flex items-center text-xs text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
            {location ? location.address : t.gpsDetect}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-xl font-bold text-white shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          {t.submit}
          <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};
