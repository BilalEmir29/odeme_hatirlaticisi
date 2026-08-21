# Odeme SMS Hatirlatici

Bu sistem, `payments.json` icindeki odeme tarihlerini her gun otomatik kontrol eder ve
vadesi yaklasan (varsayilan: 3 gun kala) odemeler icin telefonunuza **gercek SMS**
gonderir. Calistirma islemini GitHub Actions yapar, yani kendi bilgisayarinizin acik
kalmasina gerek yoktur ve ucretsizdir.

## 1) Netgsm hesabi ve API kullanicisi olusturma

1. netgsm.com.tr uzerinden bir hesap acin (deneme/trial kredisiyle test edebilirsiniz).
2. Online Islemler > Abonelik Islemleri > Alt Kullanici Hesaplari menusune girin.
3. "Yeni Kayit" ile bir alt kullanici olusturun ve kullanici turu olarak mutlaka
   **API Kullanicisi** secin. Buradan size ozel bir kullanici adi/sifre verilecek.
4. Hesabinizda onayli bir **gonderici adi (baslik)** tanimlanmis olmali (mesajin
   kimden geldigini gosteren isim). Bu onay 1-2 is gunu surebilir.
5. Hesabiniza bir SMS paketi tanimlayin (kucuk bir paket yeterli).

Sonunda elinizde şunlar olacak: `usercode`, `password`, `msgheader` (onayli baslik).

## 2) Bu klasoru bir GitHub reposuna yukleyin

1. github.com uzerinde yeni bir **private** repo olusturun (private secin, cunku
   odeme bilgileriniz icinde olacak).
2. Bu klasordeki tum dosyalari (`check-payments.js`, `payments.json`,
   `.github/workflows/check-payments.yml`) o repoya yukleyin.

## 3) Gizli bilgileri (secrets) tanimlayin

Repo sayfasinda: Settings > Secrets and variables > Actions > New repository secret.
Asagidaki 4 secreti tek tek ekleyin:

| Secret adi | Deger |
|---|---|
| `NETGSM_USERCODE` | Netgsm API kullanici adiniz |
| `NETGSM_PASSWORD` | Netgsm API sifreniz |
| `NETGSM_MSGHEADER` | Onayli gonderici basligi |
| `PHONE_NUMBER` | SMS'in gidecegi numara, basinda 0 olmadan (ornek: `5xxxxxxxxx`) |

Bu bilgiler GitHub'da sifrelenmis olarak saklanir, kod icine yazilmaz.

## 4) Odemelerinizi girin

`payments.json` dosyasini kendi odemelerinizle guncelleyin:

```json
[
  { "name": "Elektrik faturasi", "amount": 850, "date": "2026-08-28", "repeat": "monthly" }
]
```

`date` formati `YYYY-AA-GG` seklinde olmali. `repeat` alani su an yalnizca bilgi
amaclidir; her ay yeni vade tarihini elle guncellemeniz gerekir (otomatik tekrar
istiyorsaniz haber verin, script'e o mantigi da ekleyebilirim).

## 5) Test edin

Repo sayfasinda Actions sekmesine gidin, "Odeme SMS Kontrolu" workflow'unu secin ve
"Run workflow" butonuyla elle bir kez calistirin. Loglarda Netgsm'den donen yaniti
gorebilirsiniz. `00` ile baslayan yanit basarili gonderim demektir.

## Nasil calisiyor

- Workflow her gun Turkiye saatiyle 07:00'de otomatik tetiklenir (cron ayarini
  `.github/workflows/check-payments.yml` icinden degistirebilirsiniz).
- `check-payments.js`, `payments.json` icindeki her odeme icin kalan gun sayisini
  hesaplar; 0 ile `REMINDER_DAYS` (varsayilan 3) arasindaysa Netgsm API'sine istek
  atarak SMS gonderir.
- Hicbir odeme bilgisi Anthropic'e veya baska bir yere gitmez; tum akis sizin kendi
  GitHub hesabiniz ve Netgsm hesabiniz arasinda gerceklesir.

## Guvenlik notlari

- Repoyu **mutlaka private** yapin.
- Netgsm sifrenizi asla kod icine yazmayin, sadece GitHub Secrets'a girin.
- API erisiminde IP kisitlamasi yapmadiysaniz Netgsm panelinden buna bakabilirsiniz
  (ekstra guvenlik icin, GitHub Actions IP'leri degisken oldugundan bu adimi
  atlayabilirsiniz).
