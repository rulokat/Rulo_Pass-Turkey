import { useState, useEffect, useRef } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Power, Activity, X, Minus, RefreshCw } from 'lucide-react';


function App() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error_admin'>('disconnected');
  const [logs, setLogs] = useState<string[]>([]);
  const [profile, setProfile] = useState('-5 --set-ttl 5 --dns-addr 77.88.8.8 --dns-port 1253 --dnsv6-addr 2a02:6b8::feed:0ff --dnsv6-port 1253');
  const [pingState, setPingState] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const initialMount = useRef(true);

  const addSystemLog = (msg: string) => {
    setLogs(prev => [...prev, msg].slice(-50));
  };

  useEffect(() => {
    if (window.electron) {
      window.electron.onStatusChange((newStatus: any) => {
        setStatus(newStatus);
      });

      window.electron.onLog((log: string) => {
        // Sadece backend'den gelen kritik hataları göster, gereksiz stdout kalabalığını gizle
        if (log.includes('Error') || log.includes('Failed') || log.includes('Access is denied') || log.includes('Hata')) {
          addSystemLog("Sistem Hatası: " + log.trim());
        }
      });
    }
  }, []);

  // Status değişimlerine göre akıllı loglar
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    if (status === 'connected') {
      addSystemLog("RuloPass tüneli aktif edildi. Güvenli bağlantı sağlandı.");
      setPingState('testing');
    } else if (status === 'disconnected') {
      addSystemLog("Bağlantınız güvenli değil. Servis durduruldu.");
      setPingState('idle');
    } else if (status === 'error_admin') {
      addSystemLog("Kritik Hata: Uygulamanın ağ ayarlarını değiştirebilmesi için Yönetici (Administrator) izni gerekiyor.");
      setPingState('idle');
    }
  }, [status]);

  // Ping test mantığı ve ping logları
  useEffect(() => {
    let interval: any;
    if (status === 'connected') {
      const checkAccess = async () => {
        try {
          // Sadece ilk testte log at
          setPingState(prev => {
            if (prev === 'testing') addSystemLog("Erişim testi başlatılıyor (pornhub.com)...");
            return prev;
          });

          await fetch('https://www.pornhub.com', { mode: 'no-cors', cache: 'no-store' });
          
          setPingState(prev => {
            if (prev !== 'success') addSystemLog("Erişim testi başarılı: pornhub.com sorunsuz açılıyor.");
            return 'success';
          });
        } catch (e) {
          setPingState(prev => {
            if (prev !== 'failed') addSystemLog("Erişim testi başarısız: Site engellemesi aşılamadı.");
            return 'failed';
          });
        }
      };
      
      if (pingState === 'testing') {
        checkAccess();
      }
      interval = setInterval(checkAccess, 5000);
    }
    return () => clearInterval(interval);
  }, [status, pingState]);

  const toggleConnection = async () => {
    if (!window.electron) return;

    if (status === 'disconnected' || status === 'error_admin') {
      setStatus('connecting');
      setLogs([]); // Bağlanırken logları temizle
      addSystemLog("Sistem bağlanıyor. Ağ arayüzü hazırlanıyor...");
      const res = await window.electron.startDpi(profile);
      if (!res?.success && res?.message) {
        setStatus('error_admin');
        addSystemLog(`Başlatma Hatası: ${res.message}`);
      }
    } else {
      addSystemLog("Bağlantı kesiliyor...");
      await window.electron.stopDpi();
      setStatus('disconnected');
    }
  };

  const handleMinimize = () => {
    window.electron?.minimize();
  };

  const handleClose = () => {
    window.electron?.close();
  };

  return (
    <div className="w-screen h-screen bg-transparent flex flex-col overflow-hidden select-none relative">
      
      {/* Mutlak Üst Taşıma Alanı (Sıfıra Sıfır) */}
      <div className="absolute top-0 left-0 w-full h-10 z-50" style={{ WebkitAppRegion: 'drag' } as any}></div>

      {/* Ana Panel - Margin olmadan direkt kapla, Opak Arkaplan */}
      <div className="w-full h-full relative z-10 flex flex-col p-6 border border-slate-700/50 bg-[#0f172a] shadow-2xl rounded-xl">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6 relative z-50 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
              <Shield className="w-5 h-5 text-primary" />
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">RuloPass</span>
            </h1>
            
            {/* Ping Indicator */}
            {status === 'connected' && (
              <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 border border-white/5">
                  <div className={`w-2 h-2 rounded-full ${
                    pingState === 'success' ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 
                    pingState === 'failed' ? 'bg-danger' : 'bg-slate-500 animate-pulse'
                  }`}></div>
                  <span className="text-[10px] font-medium text-slate-300">
                    {pingState === 'success' ? 'Pornhub.com' : 
                     pingState === 'failed' ? 'Erişim Yok' : 'Test Ediliyor'}
                  </span>
                </div>
                <button
                  onClick={() => setPingState('testing')}
                  className="p-1 rounded-full hover:bg-white/10 transition text-slate-500 hover:text-slate-300"
                  title="Ping testini yenile"
                >
                  <RefreshCw className={`w-3 h-3 ${pingState === 'testing' ? 'animate-spin text-primary' : ''}`} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <button onClick={handleMinimize} className="p-1.5 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-danger/20 transition text-slate-400 hover:text-danger">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Status Area */}
        <div className="flex flex-col items-center justify-center py-4 shrink-0">
          <button
            onClick={toggleConnection}
            className={`relative group flex items-center justify-center w-28 h-28 rounded-full mb-4 transition-all duration-300 ${
              status === 'connected' ? 'bg-success/20 text-success shadow-[0_0_40px_rgba(16,185,129,0.4)]' :
              status === 'connecting' ? 'bg-primary/20 text-primary animate-pulse' :
              status === 'error_admin' ? 'bg-danger/20 text-danger shadow-[0_0_40px_rgba(239,68,68,0.4)]' :
              'bg-slate-800 hover:bg-white/5 text-slate-400 shadow-xl'
            }`}
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            <div className={`absolute inset-0 rounded-full border-2 ${
              status === 'connected' ? 'border-success/50 scale-110' :
              status === 'error_admin' ? 'border-danger/50 scale-110' :
              'border-white/10 group-hover:border-primary/50'
            } transition-all duration-500`}></div>
            
            {status === 'connected' ? <ShieldCheck className="w-10 h-10" /> :
             status === 'error_admin' ? <ShieldAlert className="w-10 h-10" /> :
             <Power className="w-10 h-10" />}
          </button>
          
          <h2 className="text-xl font-semibold text-white mb-1">
            {status === 'connected' ? 'Koruma Aktif' :
             status === 'connecting' ? 'Bağlanıyor...' :
             status === 'error_admin' ? 'Yönetici İzni Gerekli' :
             'Koruma Kapalı'}
          </h2>
          
          <p className="text-xs text-slate-400 text-center max-w-[250px]">
            {status === 'connected' ? 'İnternet trafiğiniz şu an sansürsüz ve optimize edilmiş durumda.' :
             status === 'error_admin' ? 'WinDivert başlatılamadı. Uygulamayı yönetici (Administrator) olarak çalıştırın.' :
             'Sınırsız internet erişimi için butona tıklayın.'}
          </p>
        </div>

        {/* Profile Selector */}
        <div className="w-full mt-4 shrink-0" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Profil Seçimi</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-primary/50 transition-colors"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            disabled={status !== 'disconnected'}
          >
            <option value="-5 --set-ttl 5 --dns-addr 77.88.8.8 --dns-port 1253 --dnsv6-addr 2a02:6b8::feed:0ff --dnsv6-port 1253">Türkiye Genel + DNS Yönlendirme (Önerilen)</option>
            <option value="-e 1 -q --reverse-frag --dns-addr 1.1.1.1 --dns-port 53">Türkiye Alternatif + Cloudflare DNS</option>
            <option value="-e 1 -q --reverse-frag">Sadece RuloPass Bypass (Eğer kendi DNS'iniz varsa)</option>
            <option value="-e 1 -q --set-ttl 4 --dns-addr 77.88.8.8 --dns-port 1253">Superonline Özel (TTL 4)</option>
          </select>
        </div>

        {/* Logs Preview */}
        <div className="w-full flex-1 min-h-0 mt-4 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-1 overflow-hidden relative" style={{ WebkitAppRegion: 'no-drag' } as any}>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 text-slate-600 h-full justify-center absolute inset-0">
              <Activity className="w-4 h-4" /> 
              <span className="text-[10px]">Sistem hazır. Kayıtlar bekleniyor.</span>
            </div>
          ) : (
            <div className="overflow-y-auto h-full pr-1 font-mono text-[10px] text-slate-400 space-y-1.5 scrollbar-thin flex flex-col-reverse">
              {logs.slice().reverse().map((log, i) => (
                <div key={i} className="whitespace-pre-wrap border-b border-white/5 pb-1 break-words">
                  <span className="text-primary/70 mr-2">[{new Date().toLocaleTimeString('tr-TR', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" })}]</span>
                  <span className={log.includes('Hata') || log.includes('başarısız') || log.includes('güvenli değil') ? 'text-danger/90' : log.includes('başarılı') || log.includes('aktif') ? 'text-success/90' : 'text-slate-300'}>{log}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
