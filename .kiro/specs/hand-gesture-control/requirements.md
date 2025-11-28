# Requirements Document

## Introduction

Sistem kontrol berbasis gesture tangan adalah aplikasi web yang memungkinkan pengguna mengontrol komputer menggunakan gerakan tangan yang dideteksi melalui webcam. Sistem ini menggunakan MediaPipe Hands atau MediaPipe Gesture Recognizer untuk mendeteksi dan mengenali gesture tangan secara real-time, kemudian memetakan gesture tersebut menjadi aksi fungsional seperti navigasi slide, scroll, klik mouse, dan kontrol volume. Aplikasi dirancang modular dan scalable agar mudah dikembangkan dengan gesture tambahan.

## Glossary

- **Gesture Control System**: Sistem perangkat lunak yang mendeteksi dan mengenali gesture tangan untuk mengontrol komputer
- **MediaPipe Hands**: Library machine learning dari Google untuk deteksi dan tracking tangan real-time
- **MediaPipe Gesture Recognizer**: Model MediaPipe untuk mengenali gesture tangan yang telah didefinisikan
- **WebRTC**: Web Real-Time Communication, teknologi untuk mengakses webcam di browser
- **Gesture Event Handler**: Fungsi callback yang dipanggil ketika gesture tertentu terdeteksi
- **Smoothing Filter**: Algoritma untuk mengurangi noise dan fluktuasi dalam deteksi gesture
- **Threshold**: Nilai batas minimum untuk kecepatan atau jarak gerakan agar gesture dianggap valid
- **Fallback Mode**: Mode idle ketika tangan tidak terdeteksi oleh sistem
- **Landmark**: Titik-titik koordinat pada tangan yang dideteksi oleh MediaPipe (21 titik per tangan)
- **Pinch Gesture**: Gesture mendekatkan ibu jari dan telunjuk
- **Swipe Gesture**: Gesture menggerakkan tangan ke arah tertentu dengan kecepatan tertentu

## Requirements

### Requirement 1

**User Story:** Sebagai pengguna, saya ingin sistem dapat mendeteksi tangan saya melalui webcam, sehingga saya dapat mengontrol komputer tanpa menyentuh perangkat input fisik

#### Acceptance Criteria

1. WHEN pengguna membuka aplikasi, THE Gesture Control System SHALL meminta izin akses webcam dari browser
2. WHEN izin webcam diberikan, THE Gesture Control System SHALL mengaktifkan video stream dari webcam dengan resolusi minimal 640x480 pixels
3. THE Gesture Control System SHALL mendeteksi tangan kiri dan tangan kanan secara bersamaan dalam frame video
4. WHEN tangan terdeteksi, THE Gesture Control System SHALL mengidentifikasi 21 landmark points pada setiap tangan dengan akurasi minimal 85%
5. WHEN tidak ada tangan terdeteksi selama 2 detik, THE Gesture Control System SHALL masuk ke fallback mode dan menghentikan pemrosesan gesture

### Requirement 2

**User Story:** Sebagai pengguna, saya ingin sistem mengenali gesture swipe untuk navigasi, sehingga saya dapat berpindah slide atau halaman dengan gerakan tangan

#### Acceptance Criteria

1. WHEN pengguna menggerakkan tangan ke kiri dengan kecepatan minimal 0.5 meter per detik, THE Gesture Control System SHALL memicu event handler onSwipeLeft()
2. WHEN pengguna menggerakkan tangan ke kanan dengan kecepatan minimal 0.5 meter per detik, THE Gesture Control System SHALL memicu event handler onSwipeRight()
3. WHEN pengguna menggerakkan tangan ke atas dengan kecepatan minimal 0.5 meter per detik, THE Gesture Control System SHALL memicu event handler onSwipeUp()
4. WHEN pengguna menggerakkan tangan ke bawah dengan kecepatan minimal 0.5 meter per detik, THE Gesture Control System SHALL memicu event handler onSwipeDown()
5. THE Gesture Control System SHALL menerapkan smoothing filter dengan window size 5 frames untuk mengurangi false positive pada deteksi swipe

### Requirement 3

**User Story:** Sebagai pengguna, saya ingin sistem mengenali gesture push forward untuk simulasi klik mouse, sehingga saya dapat berinteraksi dengan elemen UI tanpa menyentuh mouse

#### Acceptance Criteria

1. WHEN pengguna menggerakkan tangan maju ke arah kamera dengan perubahan z-coordinate minimal 0.15 unit, THE Gesture Control System SHALL memicu event handler onPushForward()
2. THE Gesture Control System SHALL menghitung perubahan z-coordinate berdasarkan perubahan ukuran bounding box tangan
3. WHEN gesture push forward terdeteksi, THE Gesture Control System SHALL menunggu 500 milliseconds sebelum mendeteksi gesture push forward berikutnya untuk mencegah multiple triggers
4. THE Gesture Control System SHALL menerapkan threshold kecepatan minimal 0.3 unit per detik untuk membedakan push forward dari gerakan tangan biasa

### Requirement 4

**User Story:** Sebagai pengguna, saya ingin sistem mengenali gesture pinch untuk drag and drop dan kontrol volume, sehingga saya dapat melakukan manipulasi objek dan pengaturan dengan presisi

#### Acceptance Criteria

1. WHEN jarak antara landmark ibu jari (tip) dan telunjuk (tip) kurang dari 0.05 unit, THE Gesture Control System SHALL mendeteksi pinch gesture sebagai active
2. WHEN pinch gesture active dan pengguna menggerakkan tangan, THE Gesture Control System SHALL memicu event handler onPinchDrag() dengan parameter koordinat gerakan
3. WHEN pinch gesture active dan pengguna menggerakkan tangan ke kiri atau kanan, THE Gesture Control System SHALL memicu event handler onPinchVolumeControl() dengan parameter direction dan magnitude
4. WHEN jarak antara ibu jari dan telunjuk melebihi 0.08 unit setelah pinch active, THE Gesture Control System SHALL mendeteksi pinch gesture sebagai released
5. THE Gesture Control System SHALL menerapkan smoothing filter pada perhitungan jarak pinch dengan exponential moving average alpha 0.3

### Requirement 5

**User Story:** Sebagai pengguna, saya ingin sistem mengenali gesture statis seperti OK sign dan peace sign, sehingga saya dapat memicu aksi spesifik seperti membuka menu atau screenshot

#### Acceptance Criteria

1. WHEN pengguna membentuk gesture OK (ibu jari dan telunjuk membentuk lingkaran, jari lain terbuka) selama minimal 500 milliseconds, THE Gesture Control System SHALL memicu event handler onOKGesture()
2. WHEN pengguna membentuk gesture peace (telunjuk dan jari tengah terbuka, jari lain tertutup) selama minimal 500 milliseconds, THE Gesture Control System SHALL memicu event handler onPeaceGesture()
3. WHEN pengguna membuka telapak tangan (semua jari terbuka dan terpisah) selama minimal 800 milliseconds, THE Gesture Control System SHALL memicu event handler onOpenPalmGesture()
4. THE Gesture Control System SHALL menggunakan MediaPipe Gesture Recognizer untuk mendeteksi gesture statis dengan confidence threshold minimal 0.7
5. THE Gesture Control System SHALL menerapkan debouncing 1000 milliseconds setelah gesture statis terdeteksi untuk mencegah multiple triggers

### Requirement 6

**User Story:** Sebagai developer, saya ingin sistem memiliki arsitektur modular dengan event handler yang dapat dikonfigurasi, sehingga saya dapat dengan mudah menambahkan gesture baru atau mengubah aksi yang dipicu

#### Acceptance Criteria

1. THE Gesture Control System SHALL menyediakan gesture configuration object yang memetakan gesture name ke event handler function
2. THE Gesture Control System SHALL memisahkan gesture detection logic dari gesture action logic dalam modul terpisah
3. WHEN developer mendefinisikan gesture baru dalam configuration object, THE Gesture Control System SHALL secara otomatis meregistrasi gesture tersebut tanpa mengubah core detection code
4. THE Gesture Control System SHALL menyediakan API untuk menambahkan custom gesture detector dengan signature function(landmarks, previousLandmarks)
5. THE Gesture Control System SHALL menyediakan dokumentasi template untuk menambahkan gesture baru dengan minimal 3 contoh implementasi

### Requirement 7

**User Story:** Sebagai pengguna, saya ingin sistem berjalan dengan performa smooth 30-60 FPS, sehingga pengalaman kontrol gesture terasa responsif dan tidak lag

#### Acceptance Criteria

1. THE Gesture Control System SHALL memproses video frame dengan frame rate minimal 30 FPS pada komputer dengan spesifikasi mid-range (Intel i5 atau setara, 8GB RAM)
2. THE Gesture Control System SHALL membatasi resolusi video input maksimal 1280x720 pixels untuk optimasi performa
3. WHEN CPU usage melebihi 80%, THE Gesture Control System SHALL menurunkan frame rate processing menjadi 20 FPS untuk menjaga stabilitas
4. THE Gesture Control System SHALL menggunakan requestAnimationFrame untuk sinkronisasi rendering dengan browser refresh rate
5. THE Gesture Control System SHALL menerapkan lazy loading untuk MediaPipe models agar waktu initial load tidak melebihi 5 detik

### Requirement 8

**User Story:** Sebagai pengguna, saya ingin sistem dapat berjalan offline dan dapat diexport sebagai desktop app, sehingga saya dapat menggunakan aplikasi tanpa koneksi internet dan dengan performa lebih baik

#### Acceptance Criteria

1. THE Gesture Control System SHALL menyediakan opsi untuk mendownload MediaPipe models secara lokal untuk penggunaan offline
2. WHEN aplikasi berjalan offline, THE Gesture Control System SHALL memuat models dari local storage atau bundled files
3. THE Gesture Control System SHALL menyediakan konfigurasi Electron untuk packaging aplikasi sebagai standalone desktop app untuk Windows, macOS, dan Linux
4. WHEN aplikasi berjalan sebagai Electron app, THE Gesture Control System SHALL menggunakan native APIs untuk akses webcam dengan latency lebih rendah
5. THE Gesture Control System SHALL menyediakan build script untuk generate executable files dengan ukuran maksimal 150MB

### Requirement 9

**User Story:** Sebagai pengguna, saya ingin sistem memiliki mekanisme smoothing dan threshold yang dapat dikonfigurasi, sehingga deteksi gesture tidak terlalu sensitif terhadap noise atau gerakan kecil yang tidak disengaja

#### Acceptance Criteria

1. THE Gesture Control System SHALL menyediakan configuration parameter untuk smoothing window size dengan default value 5 frames
2. THE Gesture Control System SHALL menyediakan configuration parameter untuk velocity threshold dengan default value 0.5 unit per second
3. THE Gesture Control System SHALL menyediakan configuration parameter untuk distance threshold dengan default value 0.05 unit
4. THE Gesture Control System SHALL menyediakan configuration parameter untuk gesture hold duration dengan default value 500 milliseconds
5. WHEN pengguna mengubah configuration parameters, THE Gesture Control System SHALL menerapkan perubahan secara real-time tanpa restart aplikasi

### Requirement 10

**User Story:** Sebagai pengguna, saya ingin melihat visual feedback dari deteksi tangan dan gesture, sehingga saya dapat memahami apakah sistem mendeteksi gerakan saya dengan benar

#### Acceptance Criteria

1. THE Gesture Control System SHALL menampilkan video feed dari webcam dengan overlay visualization
2. WHEN tangan terdeteksi, THE Gesture Control System SHALL menggambar 21 landmark points pada video overlay dengan warna berbeda untuk setiap jari
3. WHEN tangan terdeteksi, THE Gesture Control System SHALL menggambar skeleton connections antar landmarks dengan garis berwarna
4. WHEN gesture terdeteksi, THE Gesture Control System SHALL menampilkan nama gesture dan confidence score pada video overlay selama 1000 milliseconds
5. THE Gesture Control System SHALL menyediakan toggle button untuk menyembunyikan atau menampilkan visualization overlay
