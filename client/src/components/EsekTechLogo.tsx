export default function EsekTechLogo() {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/manus-storage/esek-tech-logo_88d01e05.jpg" 
        alt="Esek Tech Logo" 
        className="h-8 w-8 rounded-full"
      />
      <div className="flex flex-col">
        <span className="font-bold text-sm text-slate-900 dark:text-white">Esek Tech</span>
        <span className="text-xs text-slate-600 dark:text-slate-400">CRM System</span>
      </div>
    </div>
  );
}
