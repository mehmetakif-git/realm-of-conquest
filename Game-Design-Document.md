
⚔️ REALM OF CONQUEST ⚔️
Fetih Diyarı
GAME DESIGN DOCUMENT
Versiyon 1.0
Tarih: Aralık 2024
Browser Tabanlı MMORPG
Sıra Tabanlı Savaş Sistemi
"Bu açık dünyada hükmedenler arasında yerini al.
Haritalara saldır, en iyisi olmak için savaş.
Arkadaşlarınla birleş, bu dünyaya hükmet!"
İlham Kaynakları: Silkroad Online, Metin2, Knight Online, Rise Online, Conquer Online
 

 
1. OYUN GENEL BAKIŞ
1.1 Oyun Konsepti
Realm of Conquest, klasik MMORPG deneyimini modern browser teknolojisiyle buluşturan, tamamen ücretsiz oynanan (Free-to-Play), Pay-to-Win unsurlarından arındırılmış bir sıra tabanlı (turn-based) rol yapma oyunudur.
Oyuncular, beş farklı sınıftan birini seçerek fantastik bir dünyada maceraya atılır. Kervan ticareti, dungeon keşifleri, lonca savaşları ve PvP mücadeleleriyle dolu bu açık dünyada tek bir amaç vardır: Hükmetmek!
1.2 Temel Özellikler
•	Browser tabanlı - indirme gerektirmez
•	Sıra tabanlı (turn-based) stratejik savaş sistemi
•	5 benzersiz sınıf, 10 uzmanlaşma dalı
•	AFK farming desteği
•	Kervan ticareti ve Haydut/Koruyucu sistemi
•	Lonca savaşları ve bölge kontrolü
•	Cross-server dungeon sistemi
•	Kapsamlı ekonomi: Ticaret, Pazar, Craft
•	Pay-to-Win YOK - Sadece kozmetik monetizasyon
1.3 Hedef Kitle
•	Yaş: 16-35
•	Nostaljik MMORPG hayranları (Metin2, Silkroad, Knight Online oyuncuları)
•	Mobil ve masaüstü oyuncular
•	Strateji seven, uzun vadeli hedefleri olan oyuncular
•	P2W'den kaçınan, emek-ödül dengesine önem veren oyuncular
1.4 Platform ve Teknoloji
Bileşen	Teknoloji
Platform	Web Browser (Chrome, Firefox, Safari, Edge)
Frontend	React + TypeScript + PixiJS + Rive
Backend	Go (Golang)
Veritabanı	PostgreSQL (Supabase) + Redis
İletişim	WebSocket (real-time) + REST API
Hosting	AWS / DigitalOcean + CloudFlare CDN
Animasyon	Rive (vektör tabanlı)
1.5 Monetizasyon Modeli
Oyun tamamen FREE-TO-PLAY olacak ve PAY-TO-WIN unsurları kesinlikle içermeyecektir.
Gelir Kaynakları:
•	Kozmetik itemler (kostümler, mount skinleri, pet skinleri)
•	Battle Pass (sezonluk, sadece kozmetik ödüller)
•	Convenience itemler (küçük bufflar, envanter genişletme)
•	Premium üyelik (sadece zaman tasarrufu, güç avantajı YOK)
YASAKLI İTEMLER:
•	Doğrudan güç artışı sağlayan itemler
•	+Basma başarı oranı artıran itemler
•	Exclusive silah/zırh satışı
•	Level atlama, EXP boost satışı
 
2. SINIF SİSTEMİ
2.1 Genel Bakış
Oyunda 5 ana sınıf bulunmaktadır. Her sınıf, 30. seviyede iki farklı uzmanlaşma dalından birini seçmek zorundadır. Uzmanlaşma seçimi kalıcıdır ve geri alınamaz.
2.2 Ana Sınıflar
Sınıf	Rol	HP	MP	Özellik
⚔️ Savaşçı	Tank/Melee DPS	120	40	Yüksek dayanıklılık
🏹 Okçu	Ranged DPS	80	60	Yüksek kritik
🔮 Büyücü	Burst/AoE	60	120	Çok yüksek hasar
✨ Şifacı	Support/Heal	90	100	Takım desteği
🗡️ Ninja	Assassin	70	70	Hız ve kaçış
2.3 Uzmanlaşma Dalları
Her sınıfın bir uzmanlaşması Kırmızı Puşe (saldırgan), diğeri Mavi Puşe (koruyucu) için tasarlanmıştır:
Ana Sınıf	🔴 Kırmızı Uzmanlaşma	🔵 Mavi Uzmanlaşma
⚔️ Savaşçı	Berserker (Öfke & DPS)	Paladin (Tank & Buff)
🏹 Okçu	Keskin Nişancı (Tek Hedef)	Tuzakçı (AoE & Kontrol)
🔮 Büyücü	Kara Büyücü (DoT & Drain)	Elementalist (Element Ustası)
✨ Şifacı	Druid (Agresif Destek)	Rahip (Pure Heal)
🗡️ Ninja	Suikastçı (Burst & Stealth)	Gölge Dansçı (Evasion)
 
2.4 Sınıf Detayları
2.4.1 SAVAŞÇI ⚔️
Ön saflarda savaşan, yüksek dayanıklılığa sahip yakın dövüş uzmanı.
Base İstatistikler: HP: 120 | MP: 40 | ATK: 25 | DEF: 30 | SPD: 10 | Kritik: %5
Ana Sınıf Skilleri (LV 1-30):
Açılış	Skill	MP	Etki
LV 1	Kılıç Darbesi	10	%180 fiziksel hasar
LV 5	Savaş Duruşu	15	+40% DEF (4 tur)
LV 10	Dönen Kılıç	20	%120 hasar (tüm düşman)
LV 15	Parçalayıcı	25	%220 hasar + zırh kırma
LV 20	Demir İrade	30	3 tur %50 hasar azalt
LV 25	★ Kahramanın Çağrısı	50	Tüm takım +30% ATK/DEF (5 tur)
🔴 BERSERKER (Kırmızı Puşe Uzmanlaşması):
Konsept: Kontrolsüz öfke, HP düştükçe güçlenen yıkıcı savaşçı.
Skill	MP	Etki
Öfke Darbesi	15	%200 hasar (HP düştükçe +%100'e kadar bonus)
Kan Çılgınlığı	25	+60% ATK, -30% DEF (5 tur)
Kasırga	30	%150 hasar (AoE) + kendine %10 hasar
Kemik Kırıcı	35	%280 hasar + 3 tur stun şansı %40
Ölüme Meydan	40	1 HP'de hayatta kal + 2 tur ölümsüz
★ Ragnarök	60	%400 hasar (AoE), HP %30 altındayken %600
Kırmızı Puşe Buffu: +25% Hasar, HP %50 altında +40% ekstra, Korku debuff verme
Mavi Puşe Debuffu: -15% tüm statlar
🔵 PALADİN (Mavi Puşe Uzmanlaşması):
Konsept: Kutsal koruyucu, takımı koruyan ve destekleyen tank.
Skill	MP	Etki
Kutsal Kılıç	15	%160 hasar + %30 HP şifa (kendine)
Koruyucu Aura	25	Tüm takım +35% DEF (5 tur)
Işık Yargısı	30	%130 hasar (AoE) + undead'e x2
Meydan Okuma	20	Tüm düşmanlar 3 tur sana saldırır
Kutsal Kalkan	35	Bir hedefe %60 HP kalkan
★ İlahi Müdahale	80	Tüm takım 2 tur hasar almaz + full şifa
Mavi Puşe Buffu: +30% DEF, Haydutlara +20% Hasar, Takıma +10% DEF aura
Kırmızı Puşe Debuffu: -20% DEF, -10% Hasar
 
2.4.2 OKÇU 🏹
Uzak mesafeden yüksek hasar veren, kritik vuruş uzmanı.
Base İstatistikler: HP: 80 | MP: 60 | ATK: 30 | DEF: 15 | SPD: 20 | Kritik: %15
Ana Sınıf Skilleri (LV 1-30):
Açılış	Skill	MP	Etki
LV 1	Keskin Atış	8	%170 fiziksel hasar
LV 5	Kartal Gözü	12	+50% Kritik şansı (3 tur)
LV 10	Ok Yağmuru	20	%100 hasar (tüm düşman)
LV 15	Delici Ok	25	%200 hasar, DEF ignore %50
LV 20	Geri Sıçrama	15	Kaçış + sonraki saldırı +50%
LV 25	★ Fırtına Oku	40	%250 hasar + 3 düşmana zincir
🔴 KESKİN NİŞANCI:
Konsept: Tek atış, tek ölüm. Kritik ve tek hedef burst uzmanı.
Skill	MP	Etki
Kafa Atışı	20	%220 hasar, %60 kritik şansı
Odaklanma	25	Sonraki saldırı %100 kritik + %50 hasar
Saçma Ok	30	%90 hasar x 5 rastgele hedef
Zırh Delici	35	%240 hasar, DEF tamamen ignore
Kamuflaj	30	2 tur hedef alınamaz
★ Öldürücü Atış	60	%500 hasar (5 tur bekleme)
Kırmızı Puşe Buffu: +30% Kritik Hasarı, İlk saldırı +50%, DEF %30 ignore
🔵 TUZAKÇI:
Konsept: Alan kontrolü, tuzak ve debuff uzmanı.
Skill	MP	Etki
Zehirli Ok	18	%140 hasar + 5 tur zehir (%8/tur)
Tuzak Kur	20	Saldıran düşman %120 hasar alır
Ağ Atışı	25	2 düşman 2 tur hareket edemez
Patlayıcı Tuzak	35	%200 hasar (AoE) gecikmeli
Duman Bombası	30	Tüm takım %40 kaçış (2 tur)
★ Ölüm Tarlası	55	5 tuzak kur, her biri %150 hasar
Mavi Puşe Buffu: Tuzak hasarı +40%, Haydut radarı, Kervan çevresine otomatik tuzak
 
2.4.3 BÜYÜCÜ 🔮
Yüksek büyü hasarı veren, AoE ve burst uzmanı.
Base İstatistikler: HP: 60 | MP: 120 | ATK: 40 | DEF: 10 | SPD: 12 | Kritik: %10
Ana Sınıf Skilleri (LV 1-30):
Açılış	Skill	MP	Etki
LV 1	Ateş Topu	12	%180 büyü hasarı
LV 5	Büyü Kalkanı	15	%50 hasar emici kalkan
LV 10	Buz Fırtınası	25	%110 hasar (AoE) + yavaşlatma
LV 15	Şimşek Çarpması	30	%210 hasar + 2 hedefe zincir
LV 20	Teleport	20	Kaçış + MP %20 regen
LV 25	★ Meteor Yağmuru	60	%180 hasar (AoE) x 3 tur
🔴 KARA BÜYÜCÜ:
Konsept: Karanlık güçler, HP drain ve DoT uzmanı.
Skill	MP	Etki
Ruh Emici	20	%160 hasar, %60'ı HP olarak al
Lanet	25	Hedef 5 tur: -30% ATK, -30% DEF
Karanlık Patlama	35	%140 AoE + 4 tur DoT (%10/tur)
Hayat Transferi	30 HP	HP'nin %30'unu ver, %200 hasar
Gölge Kaçış	30	2 tur dokunulmaz + her tur %5 HP drain
★ Ölüm Çağrısı	70	%400 hasar + ölen düşman patlayarak AoE
Kırmızı Puşe Buffu: +25% Büyü Hasarı, %20 Lifesteal, DoT +50%
🔵 ELEMENTALİST:
Konsept: Element ustası, combo sistemi ile güçlenen büyücü.
Skill	MP	Etki
Element Değişimi	15	Sonraki büyü seçilen element + %30 hasar
Element Zırhı	25	Seçilen elemente %80 direnç (5 tur)
Ateş Duvarı	35	3 tur boyunca her tur %80 AoE
Mutlak Sıfır	40	Tek hedef 2 tur dondur + %180 hasar
Şimşek Zinciri	35	%100 hasar, 5 hedefe zincir
★ Element Füzyonu	80	%350 hasar (AoE), 3 farklı element = %500
Mavi Puşe Buffu: +20% Büyü Direnci, Takıma büyü kalkanı, Haydutlara yavaşlatma
 
2.4.4 ŞİFACI ✨
Takımı iyileştiren ve destekleyen, buff/debuff uzmanı.
Base İstatistikler: HP: 90 | MP: 100 | ATK: 15 | DEF: 20 | SPD: 15 | Kritik: %5
Ana Sınıf Skilleri (LV 1-30):
Açılış	Skill	MP	Etki
LV 1	Şifa Işığı	15	%180 HP şifa (tek hedef)
LV 5	Kutsama	20	+35% ATK (tek hedef, 4 tur)
LV 10	Işık Çemberi	30	%100 HP şifa (tüm takım)
LV 15	Arınma	25	Tüm debuff temizle + %50 HP
LV 20	Koruyucu Işık	35	Tek hedef 2 tur hasar almaz
LV 25	★ Diriliş	60	Ölü oyuncuyu %80 HP ile dirilt
🔴 DRUİD:
Konsept: Vahşi doğa güçleri, agresif destek ve yansıma hasarı.
Skill	MP	Etki
Yenilenme	25	5 tur boyunca %25 HP regen
Vahşi Ruh	30	Tüm takım +40% ATK + %20 hız (4 tur)
Doğanın Hediyesi	35	Tüm takım 4 tur %20 HP regen
Diken Zırhı	25	Hedefe saldıran %15 hasar alır (5 tur)
Doğa ile Bir	40	Kendine %60 HP + debuff temizle
★ Hayat Ağacı	80	5 tur: Tüm takım %30 HP + ölümden koruma
Kırmızı Puşe Buffu: +20% ATK, Yansıma hasarı +50%, Hasar büyüleri açık
🔵 RAHİP:
Konsept: Saf şifacı, takımı ölümsüz tutan kutsal destek.
Skill	MP	Etki
Büyük Şifa	30	%280 HP şifa (tek hedef)
Kutsal Zırh	35	Hedef +50% DEF + debuff bağışıklığı (3 tur)
Toplu Şifa	45	%150 HP şifa (tüm takım)
Mucize	60	Tek hedefi %100 HP'ye getir
İlahi Koruma	50	Tüm takım 1 tur hasar almaz
★ Kutsal Diriliş	100	Tüm ölü takım arkadaşlarını %100 HP dirilt
Mavi Puşe Buffu: +40% Şifa Gücü, Yakın ally ölümden korunur, Debuff süreleri -%50
 
2.4.5 NİNJA 🗡️
Gölgelerde hareket eden, hız ve kaçış uzmanı suikastçı.
Base İstatistikler: HP: 70 | MP: 70 | ATK: 35 | DEF: 12 | SPD: 30 | Kritik: %25
Ana Sınıf Skilleri (LV 1-30):
Açılış	Skill	MP	Etki
LV 1	Hızlı Kesim	8	%160 hasar, her zaman önce vurur
LV 5	Gölge Adım	15	2 tur görünmezlik + %30 kaçış
LV 10	Kunai Yağmuru	20	%80 hasar x 4 rastgele hedef
LV 15	Çift Bıçak	22	2x %120 hasar
LV 20	Duman Perdesi	25	Tüm takım %50 kaçış (2 tur)
LV 25	★ Gölge Klonları	50	3 klon, her biri 2 tur %60 hasar verir
🔴 SUİKASTÇI:
Konsept: Gölgelerden ölüm, görünmezlikten yıkıcı hasar.
Skill	MP	Etki
Sessiz Ölüm	25	%240 hasar, görünmezken %400
Gölgelere Karış	30	3 tur görünmezlik + sonraki saldırı +%100
Zehirli Bıçaklar	35	3 hedefe %100 hasar + ölümcül zehir
İnfaz	40	HP %25 altındaki hedefi anında öldür
Kaçış Ustası	25	Hasar alınca %60 kaçış + görünmezlik
★ Gölge Dansı	70	5 kez rastgele hedefe %150 hasar + görünmez kal
Kırmızı Puşe Buffu: Görünmezlikten +60% hasar, Sessiz saldırı (uyarı yok), Zehir x2
🔵 GÖLGE DANSÇI:
Konsept: Kaçış ustası, ölmesi çok zor savunmacı ninja.
Skill	MP	Etki
Kayan Bıçak	20	%180 hasar + %40 kaçış kazanır (1 tur)
Hayalet Form	30	4 tur %60 kaçış şansı
Bin Kesik	35	%40 hasar x 8 vuruş
Karşı Saldırı	25	3 tur: Kaçırılan her saldırı için %100 hasar
Ayna Görüntüsü	40	3 kopya, her biri 1 saldırı emer
★ Sonsuz Gölge	80	5 tur: Her tur %100 AoE + %70 kaçış
Mavi Puşe Buffu: Kaçış şansı +30%, Ally'ye kaçış transferi, Karşı saldırı aktif
 
3. SEVİYE VE İLERLEME SİSTEMİ
3.1 Seviye Yapısı
Maksimum seviye 120'dir. Seviye 120'ye ulaştıktan sonra Cap (Rebirth) sistemi açılır.
Seviye Aralığı	Zorluk	Tahmini Süre	Özellik
1-10	Çok Kolay	1-2 saat	Tutorial
11-20	Kolay	3-4 saat	Temel sistemler
21-30	Normal	6-8 saat	Uzmanlaşma seçimi
31-50	Orta	15-20 saat	Dungeon açılır
51-80	Zor	40-50 saat	PvP ve Lonca
81-100	Çok Zor	60-80 saat	End-game içerik
101-120	Hardcore	100+ saat	Cap hazırlığı
3.2 Sistem Açılışları
Her 10 seviyede yeni bir sistem açılır:
Seviye	Açılan Sistem	Açıklama
10	🗺️ Dünya Haritası	Farklı bölgelere seyahat
20	💰 Pazar Yeri	Oyuncular arası ticaret
30	⭐ Uzmanlaşma	Sınıf dalı seçimi (kalıcı)
40	🏰 Dungeon	5 kişilik zorunlu grup içerikleri
50	⚔️ PvP Arena	1v1, 3v3 ranked savaşlar
60	🛡️ Lonca	Lonca kurma/katılma
70	🐉 Boss Raid	Haftalık 10+ kişilik raid
80	🔨 Craft	Efsanevi item üretimi
90	🏆 Lonca Savaşları	Bölge kontrolü
100	🌟 Efsanevi Dungeon	En zor içerik
110	👑 Sıralama	Sunucu çapında liderlik
120	♻️ Cap/Rebirth	Yeniden doğuş sistemi
3.3 Cap (Rebirth) Sistemi
Seviye 120'ye ulaşan oyuncular Cap sistemine erişir:
•	Cap 0 → Cap 1: LV 1'e dön, +5 tüm base stat, özel rozet
•	Cap 1 → Cap 2: LV 1'e dön, +5 tüm base stat, özel kostüm
•	Cap 2 → Cap 3: LV 1'e dön, +5 tüm base stat, özel skill efekti
Her Cap'te önceki skilleri ve ekipmanları korursun, sadece seviye sıfırlanır.
3.4 Stat Dağılımı
Her seviyede 1 stat puanı kazanılır. Toplam 119 puan (LV 1'de 0).
Stat	Etki	Önerilen Sınıflar
STR	Fiziksel hasar +2, HP +5	Savaşçı, Ninja
AGI	Kritik +0.5%, Kaçış +0.3%, Hız +1	Okçu, Ninja
INT	Büyü hasarı +3, MP +8	Büyücü, Şifacı
VIT	HP +15, DEF +1	Savaşçı (Paladin)
WIS	Şifa +2%, MP regen +1	Şifacı
3.5 Skill Puanı Sistemi
Her seviyede 1 skill puanı kazanılır. Her skill max 10 seviyeye yükseltilebilir.
•	6 Skill × 10 Max = 60 puan (ana sınıf full için)
•	Uzmanlaşma sonrası: Yeni 6 skill için 60 puan daha
•	Her sınıfta 1 Signature Skill (★) en güçlü yetenektir
 
4. SAVAŞ SİSTEMİ
4.1 Temel Mekanik
Oyun sıra tabanlı (turn-based) savaş sistemi kullanır. Her tur, hız (SPD) değerine göre sıralama belirlenir.
4.1.1 Tur Sırası
•	En yüksek SPD → İlk hareket eder
•	Eşit SPD → Rastgele seçim
•	Ninja sınıfı: Hızlı Kesim skill'i her zaman önce vurur
4.1.2 Aksiyon Tipleri
•	Saldırı: Temel fiziksel/büyü saldırısı
•	Skill: Özel yetenek kullanımı (MP harcar)
•	İtem: Potion veya tüketim malzemesi kullan
•	Savunma: Bu tur %50 hasar azaltma
•	Kaçış: PvE'de kaçma şansı (PvP'de yok)
4.2 Hasar Formülleri
Tüm hesaplamalar sunucu tarafında yapılır (server-authoritative).
4.2.1 Fiziksel Hasar
Base Hasar = ATK × Skill Çarpanı
Final Hasar = Base Hasar × (100 / (100 + Hedef DEF))
Örnek: 100 ATK, %150 skill, 50 DEF hedef → 100 × 1.5 × (100/150) = 100 hasar
4.2.2 Büyü Hasarı
Base Hasar = INT × Skill Çarpanı × 1.2
Büyü Direnci ile azaltılır (DEF yerine)
4.2.3 Kritik Vuruş
Kritik Şansı = Base Kritik + (AGI × 0.5%)
Kritik Hasar = Normal Hasar × 1.5 (veya skill'e göre)
4.2.4 Kaçış
Kaçış Şansı = Base Kaçış + (AGI × 0.3%) + Buff Bonusları
Kaçırılan saldırı 0 hasar verir
4.3 Durum Etkileri (Status Effects)
Durum	Etki	Süre
Zehir	Her tur %X HP kaybı	3-5 tur
Yanık	Her tur %X HP kaybı + DEF düşer	2-4 tur
Donma	Hareket edemez	1-2 tur
Yavaşlama	SPD %30-50 düşer	2-3 tur
Stun	Hareket edemez (kırılabilir)	1 tur
Körleşme	İsabet %30-50 düşer	2-3 tur
Sessizlik	Skill kullanamaz	1-2 tur
Taunt	Sadece taunt eden hedefe saldırabilir	2-3 tur
4.4 AFK Savaş Sistemi
Oyuncular otomatik savaş modunu aktifleştirebilir:
•	AI, oyuncunun skill setine göre otomatik savaşır
•	Öncelik: 1. Signature Skill, 2. En yüksek hasar, 3. Buff
•	Her 15-30 dakikada captcha kontrolü
•	Captcha başarısızlığında AFK durur
 
5. DUNGEON SİSTEMİ
5.1 Zorunlu 5 Kişi Kuralı
Tüm dungeon'lara giriş için 5 farklı sınıftan birer oyuncu ZORUNLUDUR:
•	⚔️ Savaşçı (Tank) - Zorunlu
•	🏹 Okçu (DPS) - Zorunlu
•	🔮 Büyücü (DPS/AoE) - Zorunlu
•	✨ Şifacı (Healer) - Zorunlu
•	🗡️ Ninja (DPS/Utility) - Zorunlu
Bu sistem sayesinde her sınıf değerli ve gereklidir.
5.2 Dungeon Türleri
Dungeon	Min LV	Giriş/Gün	Özellik
Goblin Mağarası	40	5	Başlangıç dungeon
Karanlık Orman	50	4	Zehir temalı
Buzul Tapınağı	60	3	Donma mekaniği
Volkan Kalesi	70	3	Yanık mekaniği
Şeytan Kulesi	80	2	Çok aşamalı
Ejderha Yuvası	90	2	Boss odaklı
Karanlık Diyar	100	1	En zor içerik
Efsanevi Zindan	110	1/hafta	Cross-server
5.3 Zorluk Seviyeleri
Zorluk	Mob Gücü	Loot Kalitesi	Bonus
Normal	x1.0	Temel	-
Hard	x1.5	Uncommon+	+20% EXP
Nightmare	x2.5	Rare+	+50% EXP
Hell	x4.0	Epic+	+100% EXP
5.4 Loot Sistemi
•	Kişisel loot: Her oyuncu kendi lootunu görür
•	Takım bonusu: 5 farklı sınıf = +20% loot şansı
•	Farklı uzmanlaşmalar = +10% ekstra bonus
•	Boss garantili drop: Her boss en az 1 Rare item düşürür
5.5 Cross-Server Dungeon
Seviye 110+ oyuncular sunucular arası dungeon'lara katılabilir:
•	Farklı sunuculardan oyuncularla eşleşme
•	Özel ödüller (sadece cross-server'da)
•	Haftalık sıralama ve sezon ödülleri
 
6. KERVAN VE TİCARET SİSTEMİ
6.1 Kervan Sistemi Genel Bakış
Silkroad Online'dan esinlenen kervan sistemi, oyunun ana ekonomik mekanizmasıdır.
6.1.1 Kervan Türleri
Kervan	Yatırım	Başarı Ödülü	HP	Guard
🟤 Bronz	1,000 G	1,500 G (+50%)	5,000	1
⚪ Gümüş	5,000 G	8,000 G (+60%)	15,000	2
🟡 Altın	20,000 G	36,000 G (+80%)	40,000	3
💎 Elmas	100,000 G	200,000 G (+100%)	100,000	4
👑 Kraliyet	500,000 G	1,250,000 G (+150%)	250,000	5
6.1.2 Kervan Rotaları
Rota	Süre	Tehlike	Bonus
Başlangıç Köyü → Kasaba	10 dk	⭐	-
Kasaba → Şehir	20 dk	⭐⭐	+10%
Şehir → Başkent	35 dk	⭐⭐⭐	+25%
Başkent → Liman	50 dk	⭐⭐⭐⭐	+50%
Liman → Ejderha Adası	75 dk	⭐⭐⭐⭐⭐	+100%
6.2 Puşe (Bayrak) Sistemi
6.2.1 Kırmızı Puşe (Haydut) 🔴
Kervanlara saldıran, yüksek risk yüksek ödül arayan oyuncular için.
Avantajlar:
•	Başarılı saldırıda kervan değerinin %40-60'ı
•	PvP EXP kazanımı
•	Haydut özel itemleri için puan
Dezavantajlar:
•	Şehirlere giriş yasak
•	Haritada görünür (herkes konumunu görür)
•	NPC devriyeleri saldırır
•	Ölüm cezası 2x (EXP/Gold kaybı)
•	-15% DEF debuff
6.2.2 Mavi Puşe (Koruyucu) 🔵
Kervanları koruyan, güvenli gelir arayan oyuncular için.
Avantajlar:
•	Koruma ücreti: Kervan değerinin %10-15'i
•	+20% DEF bonus
•	Haydut radarı (yakındaki kırmızıları gör)
•	Hızlı diriliş (kervan yanında)
Dezavantajlar:
•	İlk saldıramaz (sadece karşılık)
•	Kervandan uzaklaşamaz (100m limit)
6.3 Uzmanlaşma Puşe Bonusları
Doğru uzmanlaşma + doğru puşe = ekstra bonus:
Sınıf	🔴 Kırmızı Bonus	🔵 Mavi Bonus
Berserker	Kervan HP'sine x1.5 hasar	- (debuff alır)
Paladin	- (debuff alır)	Kervana gelen hasar -%20
Keskin Nişancı	Koruyuculara +25% hasar	- (debuff alır)
Tuzakçı	- (debuff alır)	Kervan çevresine otomatik tuzak
Kara Büyücü	AoE büyüler kervana x1.3 hasar	- (debuff alır)
Elementalist	- (debuff alır)	Kervan çevresinde element kalkanı
Druid	Takıma sürekli HoT + ATK buff	- (debuff alır)
Rahip	- (debuff alır)	Kervan HP regen + takım full heal
Suikastçı	Koruyucuyu öldürünce +30s görünmez	- (debuff alır)
Gölge Dansçı	- (debuff alır)	Kervana %25 kaçış şansı
6.4 Guard Kiralama Sistemi
Kervan sahipleri NPC muhafız kiralayabilir:
Guard	Kira/Saat	Güç	Özellik
🟤 Çaylak Muhafız	500 G	⭐	Temel koruma
⚪ Deneyimli Muhafız	2,000 G	⭐⭐	Stun yeteneği
🔵 Elit Muhafız	8,000 G	⭐⭐⭐	AoE saldırı
🟣 Şövalye	25,000 G	⭐⭐⭐⭐	Taunt + Heal
🟡 Kraliyet Muhafızı	100,000 G	⭐⭐⭐⭐⭐	Tüm yetenekler
6.5 AFK Koruma Sistemi
Mavi Puşeli oyuncular 'Koruyucu Panosu'na kaydolabilir:
•	Aktif saatlerini ve ücretlerini belirler
•	Kervan sahibi panodan koruyucu seçer
•	Koruyucu offline olsa bile AI kontrollü savaşır
•	Kazanç otomatik hesaba geçer
•	Online'a göre %80 verimlilik
 
7. TAKSİ (POWER LEVELING) SİSTEMİ
7.1 Harita Giriş Gereksinimleri
Her haritaya giriş için iki koşul vardır:
•	1. Minimum Seviye: Karakterin seviyesi yeterli olmalı
•	2. Gear Score: Ekipmanların toplam güç puanı yeterli olmalı
Harita	Min LV	Min GS	Mob LV	EXP
🌲 Başlangıç Ormanı	1	0	1-10	x1.0
🏜️ Kum Çölü	10	50	10-20	x1.0
🌊 Kıyı Bölgesi	20	150	20-35	x1.0
⛰️ Dağ Geçidi	35	400	35-50	x1.1
🌋 Volkan Vadisi	50	800	50-65	x1.2
❄️ Buzul Diyarı	65	1,500	65-80	x1.3
🏚️ Terk Edilmiş Şehir	80	3,000	80-95	x1.4
👹 Şeytan Toprakları	95	5,500	95-110	x1.5
🐉 Ejderha Yuvası	110	9,000	110-120	x1.7
⚫ Karanlık Diyar	120	15,000	120+	x2.0
7.2 Taksi Sistemi
Güçlü oyuncular, zayıf oyuncuları yüksek level haritalara taşıyarak hızlı EXP kazandırır.
7.2.1 Taksi Kuralları
•	Şoför gereksinimleri karşılamalı (LV + Gear Score)
•	Yolcu şoförün partisinde olmalı
•	Yolcu savaşa katılmasa da EXP alır (%60)
•	Max 4 yolcu (5 kişilik parti)
•	Min 15, Max 50 level farkı olmalı
7.2.2 EXP Dağılımı
Taksi modunda (sadece şoför savaşır):
•	Şoför: %20 EXP (zaten yüksek level)
•	Yolcu 1-4: Her biri %20 EXP
•	Yolcu açısından: ~6x daha hızlı level
7.3 Anti-Abuse Önlemleri
Taksi suistimalini önlemek için:
•	Şoför: Günde max 4 saat taksi
•	Yolcu: Günde max 2 saat taksi
•	Aynı 2 hesap arası max 3 taksi/hafta
•	IP/cihaz aynıysa taksi yapılamaz
•	Her 30 dakikada yolcuya captcha
•	Güvenilirlik puanı düşükse kısıtlama
 
8. LONCA SİSTEMİ
8.1 Sunucu Başına 10 Lonca
Her sunucuda tam olarak 10 lonca bulunur - her biri farklı bir uzmanlık alanında:
#	Lonca Tipi	Uzmanlık Alanı
1	⚔️ Savaşçı Loncası	PvP, Arena, Oyuncu öldürme
2	🛡️ Koruyucu Loncası	Mavi Puşe, Kervan koruma
3	🏴‍☠️ Haydut Loncası	Kırmızı Puşe, Kervan saldırısı
4	🏰 Dungeon Loncası	PvE, Boss, Raid
5	🎣 Balıkçı Loncası	Balık tutma, Yemek üretimi
6	⛏️ Madenci Loncası	Maden çıkarma, Cevher
7	🔨 Zanaat Loncası	Craft, Item üretimi
8	💰 Tüccar Loncası	Ticaret, Kervan, Pazar
9	🕊️ Barış Loncası	Sosyal, Yardım, Mentorluk
10	⛓️ Mahkum Loncası	Hapishane, Zindan farm
Kurallar:
•	Her uzmanlıktan SADECE 1 lonca var
•	Yeni lonca açılamaz (10 sabit)
•	Lonca kapanırsa aynı uzmanlıkta yeni lonca kurulabilir
•	Üye limiti: Max 200 kişi/lonca
8.2 İttifak ve Düşmanlık
8.2.1 Dost Lonca (Max 1)
•	Seçim için TÜM üyelerin %70'i onaylamalı
•	Bir kez seçilince 30 GÜN değiştirilemez
•	İptal için yine %70 onay + 7 gün bekleme
Dost Lonca Bonusları:
•	Ortak parti EXP +10%
•	Kontrol edilen bölgelerde vergi yok
•	Ortak sohbet kanalı
8.2.2 Düşman Lonca (Max 3)
•	Seçim için Lonca Lideri + %50 onay
•	Bir kez seçilince 14 GÜN değiştirilemez
•	Her yerde PvP açık
Düşman Lonca Etkileri:
•	Güvenli bölgeler hariç sürekli PvP
•	Düşman öldürme +50% onur puanı
•	Haritada düşman görünür
8.3 Bölge Kontrolü ve Vergi
Loncalar harita bölgelerini kontrol edebilir:
8.3.1 Bölge Savaşı
•	Her Cumartesi 20:00 - 22:00
•	Saldıran lonca 48 saat önce ilan etmeli
•	Kontrol noktasını 10 dakika kesintisiz tutan kazanır
•	Kazanan 1 hafta bölge kontrolü alır
8.3.2 Vergi Sistemi
Kontrol edilen bölgedeki aktivitelerden vergi:
Aktivite	Vergi Oranı	Açıklama
⚔️ Mob Farm	%5	Gold drop'tan
🎣 Balık Tutma	%8	Balık satışından
⛏️ Madencilik	%8	Cevher satışından
🏰 Dungeon	%3	Loot değerinden
🐪 Kervan Geçişi	%2	Kervan değerinden
💎 +Basma	%10	Başarılı upgrade'den
Dost lonca ve kendi lonca üyeleri vergi ödemez.
8.4 Lonca Seviyeleri
LV	Gereken EXP	Üye Limiti	Açılan Özellik
1	0	20	Temel bonuslar
2	10,000	30	Lonca sohbeti
3	30,000	40	Lonca deposu
4	70,000	50	Lonca binası
5	150,000	65	Orta bonuslar
6	300,000	80	Lonca dükkanı
7	500,000	100	Lonca görevi+
8	800,000	120	Lonca arenası
9	1,200,000	150	Lonca etkinliği
10	2,000,000	200	Max bonuslar
 
9. BALIK TUTMA VE HAPİSHANE SİSTEMİ
9.1 Balık Tutma Sistemi
AFK-friendly, ancak PvP riski içeren kaynak toplama sistemi.
9.1.1 Balık Bölgeleri
Bölge Tipi	PvP Durumu	Balık Kalitesi	Risk
🟢 Güvenli Sular	PvP YOK	Normal/Uncommon	Yok
🟡 Tartışmalı Sular	PvP VAR (debuff'lı)	Rare'a kadar	Orta
🔴 Vahşi Sular	PvP VAR (az debuff)	Epic'e kadar	Yüksek
⚫ Karanlık Deniz	PvP VAR (debuff YOK)	Legendary	Ekstrem
9.1.2 Balık PvP Kuralları
Balık tutarken saldırıya uğrayan oyuncu korunur:
Saldırgan 'Hain Saldırı' Debuffı alır:
•	-25% ATK
•	-20% DEF
•	Kritik şansı %50 azalır
•	Hız -30% (her zaman ikinci vurur)
Toplam: Saldırgan ~%40-50 dezavantajlı başlar
9.2 Hapishane Sistemi
Ceza sistemi - ama sıkıcı değil, özel farm alanı!
9.2.1 Hapse Girme Yolları
•	5 kez üst üste PvP kaybetme (10 dk)
•	3 başarısız kervan saldırısı/gün (15 dk)
•	Infamy 200+ iken ölme (30 dk)
•	Şehir içi PvP denemesi (20 dk)
•	Hile/Bug abuse tespiti (24 saat+)
9.2.2 Hapishane Aktiviteleri
Hapiste özel farm alanları var:
•	⛏️ Maden Ocağı: Sadece hapiste bulunan cevherler
•	🎣 Yeraltı Nehri: Özel balık türleri
•	⚔️ Avlu PvP: Serbest dövüş, ölüm cezası yok
•	🏆 Arena: Her 30 dakikada turnuva
•	🚪 Kaçış Tüneli: Her 2 saatte kaçış eventi
•	🐉 Haftalık Boss: Cuma 20:00 özel boss
9.2.3 Hapise Özel İtemler
Item	Malzeme	Etki
Mahkum Yüzüğü	50 Zindan Taşı	+10% Hapiste EXP
Karanlık Kolye	20 Karanlık Kristal	+5% tüm stat (kalıcı)
Özgürlük Madalyonu	5 Mahkum Elması	Sonraki hapis süresi -%50
Lanetli Silah Taşı	1 Lanetli Opal	Silaha +15 ATK
Bu itemlar SADECE hapiste farm yapılarak elde edilir!
9.3 Karma Sistemi
İyi ve kötü davranışları izleyen puan sistemi:
Aksiyon	Karma	Etki
Kervan koruma (başarılı)	+10	-
Haydut öldürme	+5	-
Yeni oyuncuya yardım	+3	-
Kervan saldırısı	-15	Kötü şöhret
Masum oyuncu öldürme	-20	Aranan statüsü
Balıkçıya saldırı	-10	-
 
10. EK SİSTEMLER
10.1 +Basma (Upgrade) Sistemi
Metin2 tarzı ekipman geliştirme sistemi:
Seviye	Başarı	Başarısızlık	Bonus
+1 → +3	%90	Seviye düşmez	+3% stat/seviye
+4 → +6	%70	Seviye düşmez	+5% stat/seviye
+7 → +9	%50	-1 seviye	+8% stat/seviye
+10 → +12	%30	-2 seviye	+12% stat/seviye
+13 → +14	%15	-3 veya kırılır	+18% stat/seviye
+15	%5	Kırılır (%50)	+25% + özel efekt
Koruma İtemleri:
•	Koruma Mührü: Başarısızlıkta seviye düşmez
•	Yıkım Kalkanı: Item kırılmaz
•	Şans Taşı: Başarı oranı +10%
10.2 Pet ve Mount Sistemi
10.2.1 Petler
Nadirlik	Örnek	Bonus
Common	Kedi, Köpek	+3% EXP
Uncommon	Tilki, Baykuş	+5% EXP, +3% Drop
Rare	Kurt, Kartal	+8% EXP, +5% Drop, pasif skill
Epic	Kaplan, Anka	+12% EXP, +8% Drop, aktif skill
Legendary	Ejderha Yavrusu	+15% tüm, güçlü skill
10.2.2 Mountlar
Nadirlik	Örnek	Hız Bonusu
Common	Eşek, Katır	+20% hareket
Uncommon	At	+35% hareket
Rare	Savaş Atı	+50% hareket + stat
Epic	Kaplan, Ayı	+70% hareket + skill
Legendary	Ejderha, Unicorn	+100% hareket + uçuş
10.3 Ev Sistemi
•	🏚️ Kulübe (Ücretsiz) - 5 slot
•	🏠 Ev (10,000 Gold) - 15 slot
•	🏡 Malikane (100,000 Gold) - 30 slot
•	🏰 Şato (1,000,000 Gold) - 50 slot
•	👑 Saray (10,000,000 Gold) - 100 slot
Ev Özellikleri: Yatak (rested EXP), Depo, Atölye, Bahçe, Eğitim Kuklası
10.4 Battle Pass / Sezon Sistemi
•	Her sezon 3 ay sürer
•	100 seviyeli Battle Pass
•	Ücretsiz yol: Temel ödüller
•	Premium yol: Kozmetikler, +20% EXP boost
•	Her sezon özel tema (Ejderha, Korsan, Karanlık vs.)
10.5 Günlük Giriş Ödülleri
•	7 gün üst üste: Haftalık ödül + %10 EXP (1 gün)
•	14 gün: Rare Item Kutusu
•	21 gün: Epic Şans Kutusu
•	28 gün: Legendary Pet Şansı
Bir gün kaçırırsan seri sıfırlanır!
 
11. GÜVENLİK VE ANTİ-ABUSE
11.1 Server-Authoritative Mimari
Tüm oyun mantığı sunucuda çalışır:
•	Client sadece görüntüler, hesaplama YAPMAZ
•	Tüm hasar, loot, hareket sunucuda hesaplanır
•	Client manipülasyonu imkansız
11.2 Multi-Account Önleme
•	IP Adresi: Aynı IP'den max 2 hesap
•	Cihaz Parmak İzi: Browser fingerprint kontrolü
•	Davranış Analizi: Benzer pattern tespiti
•	Telefon Doğrulama: Her telefon = max 1 hesap
11.3 Bot ve Hile Tespiti
•	Captcha: Her 15-30 dakikada rastgele
•	Pattern Analizi: Mükemmel zamanlama = şüpheli
•	Zaman Kontrolü: 7/24 aktif = şüpheli
•	Hız Kontrolü: Anormal ilerleme = inceleme
11.4 Güvenilirlik Puanı
Her hesabın 0-1000 arası güvenilirlik puanı:
Puan Aralığı	Durum	Etki
0-100	ÇOK DÜŞÜK	Ticaret ve taksi yasak
101-300	DÜŞÜK	Günlük limitler x0.5
301-500	NORMAL	Normal oyun
501-700	İYİ	Günlük limitler x1.2
701-900	ÇOK İYİ	Limitler x1.5, öncelikli işlem
901-1000	ELİT	Limitler x2, özel rozet
11.5 Rate Limiting
•	API: Saniyede max 10 istek
•	Chat: Dakikada max 30 mesaj
•	Ticaret: Saatte max 50 işlem
•	Dungeon girişi: Günlük limitler
 
12. TEKNİK MİMARİ
12.1 Teknoloji Stack
Katman	Teknoloji
Frontend Framework	React 18 + TypeScript
2D Rendering	PixiJS 8
Animasyon	Rive
State Management	Zustand
UI Styling	TailwindCSS
Build Tool	Vite
Backend	Go (Golang) 1.22+
WebSocket	Gorilla WebSocket
HTTP Router	Chi Router
Database	PostgreSQL (Supabase)
Cache	Redis
CDN	CloudFlare
Hosting	AWS / DigitalOcean
Container	Docker + Kubernetes
12.2 Neden Bu Stack?
Unity WebGL vs Bizim Stack:
Kriter	Unity WebGL	React+Pixi+Rive
İlk Yükleme	50-200 MB	2 MB
Açılış Süresi	30+ saniye	3 saniye
Mobil Uyum	Sorunlu	Mükemmel
Güncelleme	Tümü indirilir	Sadece değişenler
Bakım	Unity lisansı	Açık kaynak
12.3 Rive Animasyon Avantajı
•	Sprite Sheet: 1 karakter = 500+ resim, 5-10 MB
•	Rive: 1 karakter = 1 dosya, 50-200 KB
•	Sonsuz FPS (60, 120, 144...)
•	State Machine ile otomatik geçişler
•	Dinamik renk değişimi (kostüm sistemi)
12.4 Sunucu Mimarisi
Her sunucu bağımsız çalışır:
•	Game Server 1, 2, 3... (sharding)
•	Her sunucu kendi veritabanı bölümü
•	Cross-server: Özel dungeon ve etkinlikler için
•	Load Balancer ile yük dağıtımı
•	Auto-scaling ile dinamik kapasite
 
13. SONUÇ VE ÖZET
13.1 Oyun Özeti
Realm of Conquest, nostaljik MMORPG deneyimini modern teknoloji ile buluşturan, browser tabanlı, sıra tabanlı savaş sistemine sahip bir rol yapma oyunudur.
13.2 Temel Değerler
•	PAY-TO-WIN YOK: Sadece emek ile ilerleme
•	FARM = KAZANÇ: Çalışan kazanır
•	TOPLULUK: Zorunlu takım oyunu, lonca sistemi
•	DENGE: Her sınıf değerli ve gerekli
•	GÜVENLİK: Hileye geçit yok
13.3 Benzersiz Özellikler
•	Kervan + Haydut/Koruyucu sistemi (Silkroad)
•	+Basma geliştirme sistemi (Metin2)
•	5 sınıf zorunlu dungeon sistemi
•	10 uzmanlaşmış lonca/sunucu
•	Hapishane = ceza + özel farm alanı
•	Taksi sistemi ile topluluk desteği
•	Puşe-Uzmanlaşma eşleşmesi
13.4 Hedefler
•	Lansman: MVP ile 1 sunucu
•	3 ay: 3 sunucu, ilk sezon
•	6 ay: 5+ sunucu, cross-server
•	1 yıl: 10+ sunucu, mobil uygulama

— DOKÜMAN SONU —
Versiyon 1.0 | Aralık 2024
