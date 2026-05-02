# RuloPass (GoodbyeDPI GUI)

RuloPass, ağ trafiği kısıtlamalarını (DPI - Deep Packet Inspection) aşmak için kullanılan popüler [GoodbyeDPI](https://github.com/ValdikSS/GoodbyeDPI) aracının modern, kullanıcı dostu ve şık bir grafik arayüzüdür (GUI). Electron, Vite, React ve TailwindCSS kullanılarak geliştirilmiştir. 

Özellikle bölgesel ağ kısıtlamalarını aşmak için tasarlanmıştır.

## Özellikler

- **Modern ve Şık Arayüz:** Cam efekti (Glassmorphism) kullanılarak tasarlanmış, şeffaf ve çerçevesiz (frameless) modern masaüstü tasarımı.
- **Kullanım Kolaylığı:** Karmaşık komut satırı argümanlarıyla uğraşmadan tek tıkla GoodbyeDPI'yi başlatma ve durdurma.
- **Gerçek Zamanlı Log Takibi:** GoodbyeDPI çıktılarını ve bağlantı durumunu arayüz üzerinden anlık olarak görüntüleme.
- **Güvenli Kapanış:** Uygulama durdurulduğunda veya kapatıldığında arka plandaki GoodbyeDPI işlemlerinin düzgünce sonlandırılması ve DNS önbelleğinin (flushdns) otomatik olarak temizlenmesi.
- **Taşınabilir Sürüm (Portable):** Kuruluma gerek kalmadan doğrudan çalıştırılabilir taşınabilir sürüme sahiptir.

## Gereksinimler

- Windows 10 veya Windows 11 (GoodbyeDPI sadece Windows'ta çalışır).
- WinDivert sürücüsünün çalışabilmesi ve ağ bağdaştırıcılarına müdahale edilebilmesi için uygulamanın **Yönetici olarak çalıştırılması (Run as Administrator)** zorunludur.

## Kurulum ve Çalıştırma

### Geliştirici Ortamı

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/rulopass.git
   cd rulopass
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run electron:dev
   ```

### Uygulamayı Derleme (Build)

Uygulamayı Windows için paketlemek (`.exe` oluşturmak) isterseniz aşağıdaki komutu kullanın:

```bash
npm run make-exe
```

Bu işlem tamamlandığında `release-build` klasörü içerisinde hem taşınabilir (portable) hem de kurulum (nsis) dosyaları oluşturulacaktır.

## Teknolojiler

- **[Electron](https://www.electronjs.org/)** - Masaüstü uygulama çatısı
- **[React](https://react.org/)** - Kullanıcı arayüzü kütüphanesi
- **[Vite](https://vitejs.dev/)** - Modern geliştirme ve derleme aracı
- **[TailwindCSS](https://tailwindcss.com/)** - Hızlı stil ve tasarım (Utility-first CSS)

## Yasal Uyarı

Bu yazılım aracılığı ile yerel ağ kısıtlamalarını aşmak tamamen kullanıcının kendi sorumluluğundadır. Yazılım sadece eğitim ve kişisel kullanım amacıyla sunulmuştur.

## Teşekkürler

- Orijinal DPI atlatma altyapısı için **[GoodbyeDPI](https://github.com/ValdikSS/GoodbyeDPI)** ve ValdikSS'e teşekkürler.
