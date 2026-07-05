# 🏢 Salon App - DevOps, Deployment və CI/CD Bələdçisi (YENİLƏNİB)

Bu sənəd **Salon App** layihəsinin Oracle Cloud üzərindəki production mühitini, təhlükəsizlik divarlarını (Firewall), Nginx Reverse Proxy arxitekturasını və GitHub Actions ilə qurulmuş avtomatik deployment (CI/CD) sistemini izah edir. 

Layihədə işləyən hər bir **AI Agent** və ya **Proqramçı** dəyişiklik etməzdən əvvəl bu qaydaları oxumalı və onlara ciddi əməl etməlidir.

---

## 1. Oracle Server Parametrləri & Yaddaş (SWAP)
*   **Model (Shape):** `VM.Standard.E2.1.Micro` (1 OCPU, 1 GB RAM - Always Free limitində)
*   **Əməliyyat Sistemi:** Canonical Ubuntu 22.04 LTS
*   **SWAP Yaddaş:** 1 GB RAM-ı olan zəif serverin dondurucu və ya ağır yüklənmələrə dözməsi üçün SSD üzərində **2 GB virtual yaddaş (SWAP)** ayrılıb:
    ```bash
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    ```

---

## 2. Nginx Reverse Proxy Arxitekturası (Port 80)
Serveri xarici hücumlardan qorumaq və mobil operatorların (Azercell, Bakcell və s.) port 8000 kimi qeyri-standart portları bloklamasının qarşısını almaq üçün **bütün xidmətlər Port 80 (standart HTTP) arxasına yığılıb.** 

Müştərilər və ya mobil cihazlar yalnız port 80-ə sorğu atır, Nginx isə daxili şəbəkədə sorğuları belə bölüşdürür:
*   **Saytın özü (HTML/CSS/JS):** `/` qovluğundan birbaşa Nginx tərəfindən oxunur və brauzerə verilir.
*   **API Sorğuları (`/api/v1/`):** Nginx port 80-də bu sorğuları tutub arxa planda işləyən `http://backend:8000/api/v1/` ünvanına yönləndirir.
*   **Şəkil/Media Yükləmələri (`/static/`):** Yüklənən salon və qalereya şəkilləri backend daxilində `/static/` qovluğunda saxlanılır. Nginx port 80-də bu müraciəti tutub `http://backend:8000/static/` qovluğuna yönləndirir.

Bu səbəbdən Oracle Cloud panelində **port 8000-in xaricə açılmasına ehtiyac yoxdur.** Yalnız **port 80** və SSH tunel üçün **port 22** xaricə açıqdır.

---

## 3. "Sıfır-Server-Build" Arxitekturası (Zero-Build Deployment)
1 GB RAM-ı olan serverdə `npm install` və `vite build` (React paketləməsi) etmək yaddaşı tamamilə doldurur və serverin çökməsinə (OOM - Out of Memory xətası) səbəb olurdu. Bunun qarşısını almaq üçün bu unikal arxitektura quruldu:

1.  **Lokalda Build:** Frontend kodları yerli kompüterdə cəmi 1 saniyəyə build olunur (`npm run build`) və hazır bişmiş `dist` qovluğu GitHub-a push edilir.
2.  **Sürətli Deployment:** Server heç vaxt Node.js və ya npm yükləmir. `git pull` edən kimi hazır `dist` qovluğunu götürüb birbaşa Nginx-ə bağlayır (`docker-compose.yml` volumes vasitəsilə). Serverdə build vaxtı 15 dəqiqədən **1 saniyəyə** düşüb!

---

## 4. GitHub Actions ilə CI/CD Avtomatlaşdırılması
Hər dəfə `main` budağına push (və ya merge) olunanda `.github/workflows/deploy.yml` faylı işə düşür və bu addımları yerinə yetirir:
1.  Serverə SSH vasitəsilə təhlükəsiz qoşulur.
2.  `git pull origin main` edərək lokalda bişirilmiş hazır frontend kodlarını və backend yeniliklərini çəkir.
3.  `docker-compose down` edib köhnə konteynerləri silir.
4.  `docker-compose up -d` edib sistemi 1 saniyədə yandırır (heç bir build prosesi aparılmır).
5.  **Avtomatik Miqrasiya:** Backend konteynerinin daxilində `alembic upgrade head` əmrini avtomatik icra edib verilənlər bazasındakı cədvəlləri və sütunları yeniləyir.

**Vacib:** Proqramçı və ya AI heç vaxt serverə girib əllə `git pull` və ya `alembic upgrade` yazmamalıdır. Hər şey bu CI/CD tərəfindən idarə olunur.

---

## 5. Qoşulma & Test Ayarları (Lokal vs Production)
Sistemin həm yerli kompüterdə, həm də canlı serverdə problemsiz işləməsi üçün `frontend/src/lib/api.ts` faylı uzaq API ünvanını belə təyin edir:
```typescript
baseURL: window.location.port === '5173' ? `http://${window.location.hostname}:8000` : ''
```
*   **Lokalda:** Frontend `5173` portunda işlədiyindən API sorğuları yerli kompüterdəki backend-ə (`localhost:8000`) gedir.
*   **Production-da (Canlıda):** Səhifə portsuz (yəni standart port 80-də) açıldığından sorğular relative olaraq `/api/v1` ünvanına (port 80-ə) gedir və Nginx tərəfindən backend-ə yönləndirilir.

Aynı məntiq `.tsx` daxilindəki şəkillərə də şamil edilib:
```typescript
src={`http://${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}${salon.image_url}`}
```

---

## 6. Proqramçı/AI İş axışı Qaydaları (Development Loop)
1.  **Lokalda Test et:** 
    *   Birinci terminalda backend-i yandır: `cd backend && .\venv\Scripts\activate && uvicorn app.main:app --reload`
    *   İkinci terminalda frontend-i yandır: `cd frontend && npm run dev`
    *   `http://localhost:5173` ünvanında yazdıqlarını test et.
2.  **AI Commit Qadağası:** AI Agent istifadəçidən icazəsiz heç vaxt `git commit` və ya `git push` etməməlidir. Kod dəyişikliklərini sadəcə lokalda yazıb istifadəçinin test etməsi üçün buraxmalıdır.
3.  **Deploy etmək üçün:**
    *   Hər şey lokalda işləyirsə, frontend-i build et: `cd frontend && npm run build`
    *   Bütün faylları commit et və `push` et. CI/CD sistemi 15 saniyəyə canlıdakı saytı tamamilə yeniləyəcək.
