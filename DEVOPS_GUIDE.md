# Salon App - Tam DevOps və Deployment Bələdçisi (Lokal -> Oracle Cloud)

Bu sənəd **Salon App** layihəsinin lokal kompüterdən (Windows) uzaq Oracle Cloud serverinə (Ubuntu) tam avtomatlaşdırılmış şəkildə quraşdırılmasını, təhlükəsizlik qaydalarını və verilənlər bazası bağlantılarını addım-addım izah edir.

---

## 1. Oracle Cloud İnfrastrukturunun Qurulması
Layihəmiz Oracle Cloud-un "Always Free" (Həmişəlik Pulsuz) səviyyəsində qurulmuşdur.
- **Model (Shape):** `VM.Standard.E2.1.Micro` (1 OCPU, 1 GB RAM)
- **Əməliyyat Sistemi:** Canonical Ubuntu 22.04
- **Yaddaş (Boot Volume):** 150 GB (9000 IOPS)

> **Vacib:** Server yaradılarkən mütləq `SSH Private Key` (.key faylı) kompüterə yüklənilməlidir. Serverə parolla giriş Oracle tərəfindən bağlanıb.

---

## 2. Serverin Konfiqurasiyası və SWAP Yaddaş
1 GB RAM gələcəkdə Docker build-ləri zamanı yetərsiz qalıb serveri dondura biləcəyi üçün, 150 GB-lıq sərt diskin 2 GB-nı süni RAM (SWAP) kimi ayırdıq.
Serverə SSH ilə daxil olaraq aşağıdakı komandalar icra edilmişdir:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 3. Təhlükəsizlik (Firewall və VCN Qaydaları)
Layihənin internetə tam çıxışı üçün həm Oracle panelində, həm də serverin daxilində portlar açıldı.

### 3.1. Oracle VCN (Virtual Cloud Network)
- Oracle panelindən serverin `public subnet` bölməsinə keçid edilir.
- **Security Lists -> Ingress Rules** bölməsindən yeni qayda əlavə edilir:
  - Source CIDR: `0.0.0.0/0`
  - Destination Port Range: `80,8000`

### 3.2. Server Daxili (IPTables)
Ubuntu-nun daxili təhlükəsizlik divarını qırmaq üçün SSH ilə terminalda bu əmrlər verildi:
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
sudo netfilter-persistent save
```
> **Qeyd:** Database portu (`5432`) bilərəkdən haker hücumlarından qorunmaq üçün qapalı saxlanılıb!

---

## 4. Docker və Verilənlər Bazası (PostgreSQL)
Layihəni 3 fərqli hissəyə böldük (`frontend`, `backend`, `db`) və tək bir `docker-compose.yml` faylı altında birləşdirdik.

**Mühit Dəyişənləri (.env):**
GitHub-a yüklənmədiyi üçün serverdə əlimizlə `backend/.env` faylını yaratdıq:
```bash
cat << 'EOF' > backend/.env
DATABASE_URL=postgresql+asyncpg://postgres:sahinmb123@db:5432/salon_db
SECRET_KEY=supersecretkey_please_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
```

**Docker-i İşə Salmaq:**
```bash
DOCKER_BUILDKIT=0 sudo docker-compose up --build -d
```
*(BuildKit yaddaş (cache) xətalarının qarşısını almaq üçün 0 olaraq təyin edilib)*

---

## 5. Uzaqdan (Remote) Verilənlər Bazasina Qoşulmaq
`5432` portunu internetə bağladığımız üçün lokal VS Code Database Client-dan canlı bazaya yalnız təhlükəsiz tunel vasitəsilə qoşuluruq.

**Bağlantı Ayarları:**
- **SSH Tunnel Tabı:** 
  - Host: `<Server Public IP>` (Məsələn: 132.226.206.18)
  - Username: `ubuntu`
  - Auth: `Key` -> Mütləq yüklədiyiniz `.key` faylını seçin.
- **Main Tabı:**
  - Host: `127.0.0.1` (SSH artıq serverin içində olduğuna görə)
  - Port: `5432`
  - Username: `postgres`
  - Password: `<DB Parolu>`
  - Database: `salon_db`

---

## 6. GitHub Actions ilə CI/CD Avtomatlaşdırılması
Mütəmadi kod yenilənməsi üçün hər dəfə serverə girməmək adına avtomatlaşdırma qurduq.
`deploy.yml` faylı yaradıldı. Hər dəfə `main` branch-a push edəndə GitHub özü arxa planda:
1. Serverə SSH ilə qoşulur (`appleboy/ssh-action`).
2. `git pull origin main` ilə yeni kodları çəkir.
3. `docker-compose up --build -d` edərək saytı canlıda yeniləyir.

Bunun üçün GitHub Repository **Secrets** qismində `ORACLE_HOST`, `ORACLE_USERNAME`, `ORACLE_SSH_KEY` və əlavə olaraq Github **Personal Access Token (PAT)** təyin edilmişdir. Git-in hər dəfə parol istəməməsi üçün isə serverdə `git config --global credential.helper store` komandası bir dəfəlik icra edilmişdir.
