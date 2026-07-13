# 🛠️ SALON APP — HƏLL OLUNAN ŞƏBƏKƏ VƏ GİRİŞ PROBLEMLƏRİ (TROUBLESHOOTING)

Bu sənəd layihənin HTTPS-ə keçidindən sonra yaranan və sistemin 50% uğurlu/uğursuz işləməsinə (atılma, 404, 401) səbəb olan problemlərin izahını və həllini özündə saxlayır. Gələcəkdə bənzər problem yarandıqda bu sənədə istinad edə bilərsiniz.

---

## 1. ⚠️ Docker DNS Round-Robin Konflikti (50% Uğurlu / 50% Uğursuzluq)

### Simptomlar:
* Saytda giriş edəndə ilk dəfə xəta atır, ikinci dəfə klikləyəndə uğurla daxil olur.
* Daxil olduqdan 2-3 saniyə sonra brauzer Network panelində bəzi sorğular (məsələn, `/me`, `/salons/`) 200 qayıtdığı halda, bəziləri 404 və ya 401 qayıdır və sizi hesabdan atır.

### Səbəb:
Serverdə həm **`salon-app`**, həm də **`hazirliq-app`** eyni Docker şəbəkəsində işləyir. Hər iki layihənin `docker-compose.yml` faylında backend servisinin adı eyni idi: **`backend`**.
Docker-in daxili DNS serveri (`127.0.0.11`) eyni adlı servislər arasında sorğuları avtomatik olaraq növbəli (Round-Robin) paylayır. Nəticədə `salon_frontend` daxilindəki Nginx sorğuları yarıbayarı `salon_backend` (port 8000) və `hazirliq_backend` (port 8001) arasında bölüşdürürdü.

### Həlli:
1. `docker-compose.yml` daxilində servis adını `backend` yerinə unikal **`salon_backend`** olaraq dəyişdirdik.
2. `frontend/nginx.conf` faylında proxy hədəflərini `backend:8000` yerinə **`salon_backend:8000`** etdik.
3. `.github/workflows/deploy.yml` deploy skriptində köhnə adları `salon_backend` ilə əvəzlədik.

---

## 2. ⚡ Login Yarış Vəziyyəti (Race Condition - 2-4 saniyə sonra avtomatik Logout)

### Simptomlar:
* Hesaba daxil olursunuz, daxil olan kimi 2-4 saniyə keçir və heç bir səbəb olmadan sizi yenidən Giriş popupuna atır.

### Səbəb:
İstifadəçi "Daxil ol" düyməsini basanda giriş sorğusu uğurla tamamlanır. Lakin yeni tokenin `localStorage`-a yazılması (`onSuccess` daxilində) bir neçə millisaniyə gecikirdi. Həmin aralıqda dərhal tetiklenen köhnə (tokensiz/expired) sorğular backend-dən **401 Unauthorized** cavabı alırdı. Brauzerdəki interceptor isə bu 401-i tutub seansın bitdiyini zənn edir və tokeni təmizləyib sizi sistemdən atırdı (`logout`).

### Həlli:
1. `AuthModal.tsx` daxilində tokenin `localStorage`-a yazılmasını `onSuccess` callback-indən çıxarıb birbaşa sorğunun cavab verdiyi ən ilk millisaniyəyə (**`mutationFn` daxilinə**) keçirdik. Beləliklə, heç bir paralel sorğu 401 ilə tokeni silə bilmir.
2. `api.ts` faylındakı interceptorda token müqayisəsini daha təhlükəsiz etdik (böyük-kiçik hərf normalize dəstəyi ilə).

---

## 3. 🚀 Deploy və Server Parametrləri (Address already in use, Git pull abort)

### Problemlər:
1. Serverdə əl ilə edilən konfiqurasiyalar (məsələn, port dəyişikliyi) deploy zamanı `git pull` ediləndə **"local changes would be overwritten by merge"** xətası verib deployu dayandırırdı.
2. Serverdə port 80-i Host Nginx (SSL) tutduğu üçün frontend konteynerinin portu mütləq **`8003:80`** olmalıdır. Standart `80:80` yazıldıqda `port already in use` xətası çıxırdı.
3. Servis adını dəyişdikdə Docker-də köhnə konteyner adı konflikt yaradırdı.

### Həlli:
1. `.github/workflows/deploy.yml` faylında `git pull` əmrindən dərhal əvvəl **`git reset --hard`** əlavə etdik ki, serverdəki yarımçıq dəyişikliklər təmizlənsin və deploy yarımçıq qalmasın.
2. `docker-compose.yml` faylında frontend portunu birbaşa **`8003:80`** olaraq saxladıq.
3. Deploy skriptində `docker compose up` əmrinə **`--remove-orphans`** əlavə etdik ki, köhnə konfliktli konteynerləri avtomatik təmizləsin.
