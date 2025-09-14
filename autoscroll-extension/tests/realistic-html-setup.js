/**
 * Realistic HTML Setup
 * Creates a realistic HTML structure based on pintar.article.html
 */

/**
 * Create realistic HTML structure based on real website
 */
export function createRealisticHTML() {
  const html = `
    <!DOCTYPE html>
    <html lang="en-US" prefix="og: https://ogp.me/ns#">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>7 Aplikasi Terbukti Membayar di 2025: Cuan dari HP! - Pintar Cek Media</title>
        <meta name="description" content="Di era digital 2025, menghasilkan uang hanya dengan HP bukan lagi hal mustahil. Banyak aplikasi penghasil uang yang terbukti membayar secara langsung ke saldo">
        <meta name="robots" content="follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large">
        <link rel="canonical" href="https://pintar.cekmedia.com/7-aplikasi-terbukti-membayar-di-2025-cuan-dari-hp/">
        
        <!-- Open Graph Meta Tags -->
        <meta property="og:locale" content="en_US">
        <meta property="og:type" content="article">
        <meta property="og:title" content="7 Aplikasi Terbukti Membayar di 2025: Cuan dari HP! - Pintar Cek Media">
        <meta property="og:description" content="Di era digital 2025, menghasilkan uang hanya dengan HP bukan lagi hal mustahil. Banyak aplikasi penghasil uang yang terbukti membayar secara langsung ke saldo">
        <meta property="og:url" content="https://pintar.cekmedia.com/7-aplikasi-terbukti-membayar-di-2025-cuan-dari-hp/">
        <meta property="og:site_name" content="Pintar Cek Media">
        <meta property="article:tag" content="Aplikasi Penghasil Uang">
        <meta property="article:tag" content="Cepat Cair">
        <meta property="article:tag" content="DANA">
        <meta property="article:section" content="Aplikasi Penghasil Uang">
        
        <!-- Twitter Card Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="7 Aplikasi Terbukti Membayar di 2025: Cuan dari HP! - Pintar Cek Media">
        <meta name="twitter:description" content="Di era digital 2025, menghasilkan uang hanya dengan HP bukan lagi hal mustahil. Banyak aplikasi penghasil uang yang terbukti membayar secara langsung ke saldo">
        
        <!-- Google AdSense -->
        <script src="https://pagead2.googlesyndication.com/pagead/managed/js/adsense/m202509020101/show_ads_impl_fy2021.js"></script>
        
        <!-- Styles -->
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Open Sans', Arial, sans-serif; 
                line-height: 1.6;
                color: #333;
            }
            
            .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 0 15px; 
            }
            
            .row { 
                display: flex; 
                flex-wrap: wrap; 
                margin: 0 -15px; 
            }
            
            .col-md-8 { 
                flex: 0 0 66.666667%; 
                max-width: 66.666667%; 
                padding: 0 15px; 
            }
            
            .col-md-4 { 
                flex: 0 0 33.333333%; 
                max-width: 33.333333%; 
                padding: 0 15px; 
            }
            
            /* Header Styles */
            .header { 
                background: #fff; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                position: sticky; 
                top: 0; 
                z-index: 1000; 
            }
            
            .navbar { 
                padding: 1rem 0; 
            }
            
            .navbar-brand { 
                font-size: 1.5rem; 
                font-weight: bold; 
                color: #007bff; 
                text-decoration: none; 
            }
            
            .navbar-nav { 
                display: flex; 
                list-style: none; 
                margin: 0; 
                padding: 0; 
            }
            
            .nav-item { 
                margin: 0 1rem; 
            }
            
            .nav-link { 
                color: #333; 
                text-decoration: none; 
                padding: 0.5rem 1rem; 
                border-radius: 4px; 
                transition: background-color 0.3s; 
            }
            
            .nav-link:hover { 
                background-color: #f8f9fa; 
            }
            
            /* Breadcrumb Styles */
            .breadcrumb { 
                background: #f8f9fa; 
                padding: 1rem 0; 
                margin-bottom: 2rem; 
            }
            
            .breadcrumb-item { 
                display: inline; 
            }
            
            .breadcrumb-item + .breadcrumb-item::before { 
                content: ">"; 
                margin: 0 0.5rem; 
            }
            
            /* Article Styles */
            .article-header { 
                margin-bottom: 2rem; 
            }
            
            .article-title { 
                font-size: 2.5rem; 
                font-weight: bold; 
                color: #333; 
                margin-bottom: 1rem; 
                line-height: 1.2; 
            }
            
            .article-meta { 
                color: #666; 
                font-size: 0.9rem; 
                margin-bottom: 1rem; 
            }
            
            .article-content { 
                font-size: 1.1rem; 
                line-height: 1.8; 
                margin-bottom: 2rem; 
            }
            
            .article-content h1, 
            .article-content h2, 
            .article-content h3, 
            .article-content h4, 
            .article-content h5, 
            .article-content h6 { 
                margin-top: 2rem; 
                margin-bottom: 1rem; 
                color: #333; 
            }
            
            .article-content h2 { 
                font-size: 1.8rem; 
                border-bottom: 2px solid #007bff; 
                padding-bottom: 0.5rem; 
            }
            
            .article-content h3 { 
                font-size: 1.5rem; 
                color: #007bff; 
            }
            
            .article-content p { 
                margin-bottom: 1.5rem; 
            }
            
            .article-content ul, 
            .article-content ol { 
                margin-bottom: 1.5rem; 
                padding-left: 2rem; 
            }
            
            .article-content li { 
                margin-bottom: 0.5rem; 
            }
            
            .article-content a { 
                color: #007bff; 
                text-decoration: none; 
            }
            
            .article-content a:hover { 
                text-decoration: underline; 
            }
            
            .article-content img { 
                max-width: 100%; 
                height: auto; 
                margin: 1rem 0; 
                border-radius: 8px; 
            }
            
            /* Ad Styles */
            .ad-container { 
                background: #f8f9fa; 
                border: 2px dashed #dee2e6; 
                padding: 2rem; 
                text-align: center; 
                margin: 2rem 0; 
                border-radius: 8px; 
            }
            
            .ad-container h3 { 
                color: #666; 
                margin-bottom: 1rem; 
            }
            
            .ad-placeholder { 
                background: #e9ecef; 
                padding: 1rem; 
                border-radius: 4px; 
                color: #666; 
            }
            
            /* Sidebar Styles */
            .sidebar { 
                background: #f8f9fa; 
                padding: 1.5rem; 
                border-radius: 8px; 
                margin-bottom: 2rem; 
            }
            
            .sidebar h3 { 
                color: #333; 
                margin-bottom: 1rem; 
                font-size: 1.3rem; 
            }
            
            .sidebar ul { 
                list-style: none; 
                padding: 0; 
            }
            
            .sidebar li { 
                margin-bottom: 0.5rem; 
            }
            
            .sidebar a { 
                color: #007bff; 
                text-decoration: none; 
            }
            
            .sidebar a:hover { 
                text-decoration: underline; 
            }
            
            /* Related Posts */
            .related-posts { 
                margin-top: 3rem; 
            }
            
            .related-posts h3 { 
                color: #333; 
                margin-bottom: 1.5rem; 
                font-size: 1.5rem; 
            }
            
            .related-post-item { 
                background: #fff; 
                border: 1px solid #dee2e6; 
                border-radius: 8px; 
                padding: 1rem; 
                margin-bottom: 1rem; 
                transition: box-shadow 0.3s; 
            }
            
            .related-post-item:hover { 
                box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
            }
            
            .related-post-item h4 { 
                margin: 0 0 0.5rem 0; 
                font-size: 1.1rem; 
            }
            
            .related-post-item a { 
                color: #333; 
                text-decoration: none; 
            }
            
            .related-post-item a:hover { 
                color: #007bff; 
            }
            
            /* Navigation Styles */
            .post-navigation { 
                margin: 3rem 0; 
                padding: 2rem 0; 
                border-top: 1px solid #dee2e6; 
                border-bottom: 1px solid #dee2e6; 
            }
            
            .nav-links { 
                display: flex; 
                justify-content: space-between; 
            }
            
            .nav-previous, 
            .nav-next { 
                flex: 1; 
            }
            
            .nav-next { 
                text-align: right; 
            }
            
            .nav-links a { 
                color: #007bff; 
                text-decoration: none; 
                font-weight: 500; 
            }
            
            .nav-links a:hover { 
                text-decoration: underline; 
            }
            
            /* Footer Styles */
            .footer { 
                background: #333; 
                color: #fff; 
                padding: 3rem 0 1rem; 
                margin-top: 4rem; 
            }
            
            .footer h3 { 
                color: #fff; 
                margin-bottom: 1rem; 
            }
            
            .footer a { 
                color: #ccc; 
                text-decoration: none; 
            }
            
            .footer a:hover { 
                color: #fff; 
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .col-md-8, 
                .col-md-4 { 
                    flex: 0 0 100%; 
                    max-width: 100%; 
                }
                
                .article-title { 
                    font-size: 2rem; 
                }
                
                .nav-links { 
                    flex-direction: column; 
                }
                
                .nav-next { 
                    text-align: left; 
                    margin-top: 1rem; 
                }
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <header class="header">
            <div class="container">
                <nav class="navbar">
                    <div class="row">
                        <div class="col-md-6">
                            <a href="#" class="navbar-brand">Pintar Cek Media</a>
                        </div>
                        <div class="col-md-6">
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a href="#" class="nav-link">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a href="#" class="nav-link">Pinjaman Online</a>
                                </li>
                                <li class="nav-item">
                                    <a href="#" class="nav-link">Aplikasi Penghasil Uang</a>
                                </li>
                                <li class="nav-item">
                                    <a href="#" class="nav-link">Finansial Pintar</a>
                                </li>
                                <li class="nav-item">
                                    <a href="#" class="nav-link">Review & Perbandingan</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </header>

        <!-- Breadcrumb -->
        <div class="breadcrumb">
            <div class="container">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb-item">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Aplikasi Penghasil Uang</a></li>
                        <li>7 Aplikasi Terbukti Membayar di 2025: Cuan dari HP!</li>
                    </ol>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <main class="container">
            <div class="row">
                <!-- Article Content -->
                <div class="col-md-8">
                    <article class="article-content">
                        <header class="article-header">
                            <h1 class="article-title">7 Aplikasi Terbukti Membayar di 2025: Cuan dari HP!</h1>
                            <div class="article-meta">
                                <span>Ditulis oleh: Admin</span> | 
                                <span>Tanggal: 13 Agustus 2025</span> | 
                                <span>Waktu baca: 4 menit</span>
                            </div>
                        </header>

                        <div class="article-content">
                            <p>Di era digital 2025, menghasilkan uang hanya dengan HP bukan lagi hal mustahil. Banyak aplikasi penghasil uang yang terbukti membayar secara langsung ke saldo DANA, GoPay, atau rekening bank. Berikut adalah 7 aplikasi terbaik yang sudah terbukti membayar penggunanya.</p>

                            <h2>Daftar Aplikasi Penghasil Uang Terbukti Membayar</h2>

                            <h3>1. BuzzBreak</h3>
                            <ul>
                                <li>💰 <strong>Jenis Reward:</strong> Saldo Dana dan Pulsa</li>
                                <li>💻 <strong>Cara Kerja:</strong> Membaca berita dan menonton video</li>
                                <li>🛡️ <strong>Keamanan:</strong> Terdaftar resmi dan terbukti membayar</li>
                                <li>💸 <strong>Minimal Withdraw:</strong> Rp10.000</li>
                                <li>⭐ <strong>Rating:</strong> 4.3/5</li>
                                <li>🔗 <a href="#" target="_blank">Download BuzzBreak</a></li>
                            </ul>

                            <p><strong>Review Pengguna:</strong> "Saya sudah withdraw beberapa kali, cepat cair dan aman. Recommended untuk yang ingin penghasilan tambahan." – Dwi, Yogyakarta</p>

                            <p><strong>Performance:</strong> Penggunaan ram rendah, iklan normal, baterai tahan lama.</p>

                            <hr>

                            <h3>2. SnackVideo</h3>
                            <ul>
                                <li>💰 <strong>Jenis Reward:</strong> Uang tunai langsung ke rekening atau GoPay</li>
                                <li>💻 <strong>Cara Kerja:</strong> Membuat dan menonton video pendek</li>
                                <li>🛡️ <strong>Keamanan:</strong> Legal dan populer di Indonesia</li>
                                <li>💸 <strong>Minimal Withdraw:</strong> Rp10.000</li>
                                <li>⭐ <strong>Rating:</strong> 4.5/5</li>
                                <li>🔗 <a href="#" target="_blank">Download SnackVideo</a></li>
                            </ul>

                            <p><strong>Review Pengguna:</strong> "Bikin video kreatif dan dapat cuan nyata, aplikasi stabil dan proses payout cepat." – Rian, Bekasi</p>

                            <hr>

                            <h3>3. Cashtree</h3>
                            <ul>
                                <li>💰 <strong>Jenis Reward:</strong> Pulsa, saldo OVO, dan transfer bank</li>
                                <li>💻 <strong>Cara Kerja:</strong> Install aplikasi, main game, dan buka iklan</li>
                                <li>🛡️ <strong>Keamanan:</strong> Sudah terkenal dan legal</li>
                                <li>💸 <strong>Minimal Withdraw:</strong> Rp20.000</li>
                                <li>⭐ <strong>Rating:</strong> 4.2/5</li>
                                <li>🔗 <a href="#" target="_blank">Download Cashtree</a></li>
                            </ul>

                            <p><strong>Review Pengguna:</strong> "Game-nya seru dan reward-nya lumayan, sudah beberapa kali withdraw ke OVO." – Sari, Jakarta</p>

                            <hr>

                            <h3>4. MoneyTree</h3>
                            <ul>
                                <li>💰 <strong>Jenis Reward:</strong> Saldo DANA dan transfer bank</li>
                                <li>💻 <strong>Cara Kerja:</strong> Menonton iklan dan mengisi survei</li>
                                <li>🛡️ <strong>Keamanan:</strong> Terdaftar resmi di Google Play</li>
                                <li>💸 <strong>Minimal Withdraw:</strong> Rp15.000</li>
                                <li>⭐ <strong>Rating:</strong> 4.1/5</li>
                                <li>🔗 <a href="#" target="_blank">Download MoneyTree</a></li>
                            </ul>

                            <p><strong>Review Pengguna:</strong> "Survei-nya mudah dan reward-nya cepat cair ke DANA." – Budi, Surabaya</p>

                            <hr>

                            <h3>5. CashPop</h3>
                            <ul>
                                <li>💰 <strong>Jenis Reward:</strong> Pulsa dan saldo e-wallet</li>
                                <li>💻 <strong>Cara Kerja:</strong> Main game dan buka iklan</li>
                                <li>🛡️ <strong>Keamanan:</strong> Legal dan aman</li>
                                <li>💸 <strong>Minimal Withdraw:</strong> Rp5.000</li>
                                <li>⭐ <strong>Rating:</strong> 4.0/5</li>
                                <li>🔗 <a href="#" target="_blank">Download CashPop</a></li>
                            </ul>

                            <p><strong>Review Pengguna:</strong> "Minimal withdraw rendah, cocok untuk pemula." – Lisa, Bandung</p>

                            <hr>

                            <h3>6. RewardPop</h3>
                            <ul>
                                <li>💰 <strong>Jenis Reward:</strong> Saldo GoPay dan transfer bank</li>
                                <li>💻 <strong>Cara Kerja:</strong> Menonton video dan mengisi survei</li>
                                <li>🛡️ <strong>Keamanan:</strong> Terpercaya dan legal</li>
                                <li>💸 <strong>Minimal Withdraw:</strong> Rp25.000</li>
                                <li>⭐ <strong>Rating:</strong> 4.4/5</li>
                                <li>🔗 <a href="#" target="_blank">Download RewardPop</a></li>
                            </ul>

                            <p><strong>Review Pengguna:</strong> "Reward-nya besar dan proses withdraw cepat." – Ahmad, Medan</p>

                            <hr>

                            <h3>7. CashApp</h3>
                            <ul>
                                <li>💰 <strong>Jenis Reward:</strong> Saldo DANA dan pulsa</li>
                                <li>💻 <strong>Cara Kerja:</strong> Menonton iklan dan main game</li>
                                <li>🛡️ <strong>Keamanan:</strong> Legal dan aman</li>
                                <li>💸 <strong>Minimal Withdraw:</strong> Rp10.000</li>
                                <li>⭐ <strong>Rating:</strong> 4.3/5</li>
                                <li>🔗 <a href="#" target="_blank">Download CashApp</a></li>
                            </ul>

                            <p><strong>Review Pengguna:</strong> "Aplikasi stabil dan reward-nya konsisten." – Maya, Semarang</p>

                            <h2>Tips Sukses Menghasilkan Uang dari Aplikasi</h2>

                            <ol>
                                <li><strong>Pilih Aplikasi Terpercaya:</strong> Pastikan aplikasi sudah terdaftar resmi dan memiliki review positif</li>
                                <li><strong>Konsisten:</strong> Lakukan aktivitas harian untuk mendapatkan reward maksimal</li>
                                <li><strong>Diversifikasi:</strong> Gunakan beberapa aplikasi sekaligus untuk meningkatkan pendapatan</li>
                                <li><strong>Patience:</strong> Butuh waktu untuk mengumpulkan reward yang cukup untuk withdraw</li>
                                <li><strong>Update Aplikasi:</strong> Selalu update aplikasi untuk mendapatkan fitur terbaru</li>
                            </ol>

                            <h2>Kesimpulan</h2>

                            <p>Menghasilkan uang dari aplikasi HP memang memungkinkan di era digital ini. Namun, penting untuk memilih aplikasi yang terpercaya dan legal. Dari 7 aplikasi di atas, semuanya sudah terbukti membayar penggunanya dengan berbagai metode pembayaran.</p>

                            <p>Ingat, hasil yang didapat tergantung pada konsistensi dan aktivitas yang dilakukan. Semakin aktif menggunakan aplikasi, semakin besar pula reward yang bisa didapatkan.</p>
                        </div>

                        <!-- Ad Container -->
                        <div class="ad-container">
                            <h3>Iklan</h3>
                            <div class="ad-placeholder">
                                Google AdSense - 300x250
                            </div>
                        </div>

                        <!-- Post Navigation -->
                        <nav class="post-navigation">
                            <div class="nav-links">
                                <div class="nav-previous">
                                    <a href="#">← 5 Aplikasi Pinjaman Online Terpercaya 2025</a>
                                </div>
                                <div class="nav-next">
                                    <a href="#">Review Aplikasi Finansial Terbaik 2025 →</a>
                                </div>
                            </div>
                        </nav>

                        <!-- Related Posts -->
                        <section class="related-posts">
                            <h3>Artikel Terkait</h3>
                            <div class="related-post-item">
                                <h4><a href="#">10 Aplikasi Pinjaman Online Cepat Cair 2025</a></h4>
                                <p>Daftar aplikasi pinjaman online terpercaya dengan proses cepat dan aman.</p>
                            </div>
                            <div class="related-post-item">
                                <h4><a href="#">Cara Menghasilkan Uang dari HP Tanpa Modal</a></h4>
                                <p>Panduan lengkap untuk menghasilkan uang dari smartphone tanpa modal awal.</p>
                            </div>
                            <div class="related-post-item">
                                <h4><a href="#">Review Aplikasi Finansial Terbaik 2025</a></h4>
                                <p>Perbandingan aplikasi finansial terbaik untuk mengelola keuangan pribadi.</p>
                            </div>
                        </section>
                    </article>
                </div>

                <!-- Sidebar -->
                <div class="col-md-4">
                    <aside class="sidebar">
                        <h3>Kategori Populer</h3>
                        <ul>
                            <li><a href="#">Aplikasi Penghasil Uang</a></li>
                            <li><a href="#">Pinjaman Online</a></li>
                            <li><a href="#">Finansial Pintar</a></li>
                            <li><a href="#">Review & Perbandingan</a></li>
                        </ul>
                    </aside>

                    <aside class="sidebar">
                        <h3>Artikel Terbaru</h3>
                        <ul>
                            <li><a href="#">5 Aplikasi Pinjaman Online Terpercaya 2025</a></li>
                            <li><a href="#">Cara Menghasilkan Uang dari HP Tanpa Modal</a></li>
                            <li><a href="#">Review Aplikasi Finansial Terbaik 2025</a></li>
                            <li><a href="#">Tips Mengelola Keuangan Pribadi</a></li>
                        </ul>
                    </aside>

                    <!-- Ad Container -->
                    <div class="ad-container">
                        <h3>Iklan</h3>
                        <div class="ad-placeholder">
                            Google AdSense - 300x600
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="footer">
            <div class="container">
                <div class="row">
                    <div class="col-md-4">
                        <h3>Tentang Kami</h3>
                        <p>Pintar Cek Media adalah platform terpercaya untuk informasi aplikasi dan pinjaman online terbaik di Indonesia.</p>
                    </div>
                    <div class="col-md-4">
                        <h3>Kategori</h3>
                        <ul>
                            <li><a href="#">Aplikasi Penghasil Uang</a></li>
                            <li><a href="#">Pinjaman Online</a></li>
                            <li><a href="#">Finansial Pintar</a></li>
                            <li><a href="#">Review & Perbandingan</a></li>
                        </ul>
                    </div>
                    <div class="col-md-4">
                        <h3>Kontak</h3>
                        <p>Email: info@pintar.cekmedia.com</p>
                        <p>Telepon: (021) 1234-5678</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <p style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #555;">
                            &copy; 2025 Pintar Cek Media. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    </body>
    </html>
  `;

  return html;
}

/**
 * Setup realistic browser environment with real HTML structure
 */
export function setupRealisticBrowserWithHTML() {
  // Create realistic HTML structure
  const html = createRealisticHTML();
  
  // Set document HTML
  document.documentElement.innerHTML = html;
  
  // Mock realistic screen properties with better error handling
  try {
    Object.defineProperty(screen, 'width', {
      value: 1920,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(screen, 'height', {
      value: 1080,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(screen, 'availWidth', {
      value: 1920,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(screen, 'availHeight', {
      value: 1040,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(screen, 'colorDepth', {
      value: 24,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(screen, 'pixelDepth', {
      value: 24,
      writable: true,
      configurable: true
    });
  } catch (error) {
    // JSDOM limitation - screen properties are read-only
    console.warn('Cannot mock screen properties in JSDOM environment');
  }
  
  // Mock realistic navigator properties with better error handling
  try {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(navigator, 'languages', {
      value: ['en-US', 'en'],
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(navigator, 'cookieEnabled', {
      value: true,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 8,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      writable: true,
      configurable: true
    });
  } catch (error) {
    // JSDOM limitation - navigator properties are read-only
    console.warn('Cannot mock navigator properties in JSDOM environment');
  }
  
  // Mock realistic window properties
  Object.defineProperty(window, 'innerWidth', {
    value: 1920,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(window, 'innerHeight', {
    value: 1080,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(window, 'outerWidth', {
    value: 1920,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(window, 'outerHeight', {
    value: 1080,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(window, 'devicePixelRatio', {
    value: 1,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(window, 'scrollX', {
    value: 0,
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(window, 'scrollY', {
    value: 0,
    writable: true,
    configurable: true
  });
  
  // Mock getBoundingClientRect with realistic values based on real HTML structure
  Element.prototype.getBoundingClientRect = jest.fn(function() {
    const rect = {
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0
    };
    
    // Customize based on element class and tag
    if (this.classList) {
      if (this.classList.contains('article-title')) {
        rect.width = 800;
        rect.height = 60;
      }
      if (this.classList.contains('article-content')) {
        rect.width = 800;
        rect.height = 2000;
      }
      if (this.classList.contains('sidebar')) {
        rect.width = 300;
        rect.height = 400;
      }
      if (this.classList.contains('ad-container')) {
        rect.width = 300;
        rect.height = 250;
      }
      if (this.classList.contains('related-post-item')) {
        rect.width = 800;
        rect.height = 100;
      }
      if (this.classList.contains('nav-link')) {
        rect.width = 120;
        rect.height = 40;
      }
    }
    
    // Customize based on tag name
    if (this.tagName === 'H1') {
      rect.width = 800;
      rect.height = 60;
    }
    if (this.tagName === 'H2') {
      rect.width = 800;
      rect.height = 50;
    }
    if (this.tagName === 'H3') {
      rect.width = 800;
      rect.height = 40;
    }
    if (this.tagName === 'P') {
      rect.width = 800;
      rect.height = 30;
    }
    if (this.tagName === 'UL' || this.tagName === 'OL') {
      rect.width = 800;
      rect.height = 200;
    }
    if (this.tagName === 'LI') {
      rect.width = 800;
      rect.height = 25;
    }
    if (this.tagName === 'A') {
      rect.width = 100;
      rect.height = 20;
    }
    
    return rect;
  });
  
  // Mock scrollIntoView
  Element.prototype.scrollIntoView = jest.fn(function(options = {}) {
    const rect = this.getBoundingClientRect();
    const scrollY = window.scrollY + rect.top - (options.block === 'center' ? window.innerHeight / 2 : 0);
    window.scrollTo(0, scrollY);
  });
}

/**
 * Get realistic test elements from the HTML structure
 */
export function getRealisticTestElements() {
  return {
    // Navigation elements
    navLinks: document.querySelectorAll('.nav-link'),
    navbar: document.querySelector('.navbar'),
    
    // Article elements
    articleTitle: document.querySelector('.article-title'),
    articleContent: document.querySelector('.article-content'),
    articleMeta: document.querySelector('.article-meta'),
    
    // Content elements
    headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
    paragraphs: document.querySelectorAll('p'),
    lists: document.querySelectorAll('ul, ol'),
    listItems: document.querySelectorAll('li'),
    links: document.querySelectorAll('a'),
    images: document.querySelectorAll('img'),
    
    // Sidebar elements
    sidebars: document.querySelectorAll('.sidebar'),
    sidebarLinks: document.querySelectorAll('.sidebar a'),
    
    // Ad elements
    adContainers: document.querySelectorAll('.ad-container'),
    adPlaceholders: document.querySelectorAll('.ad-placeholder'),
    
    // Related content
    relatedPosts: document.querySelectorAll('.related-post-item'),
    relatedPostLinks: document.querySelectorAll('.related-post-item a'),
    
    // Navigation
    postNavigation: document.querySelector('.post-navigation'),
    navPrevious: document.querySelector('.nav-previous'),
    navNext: document.querySelector('.nav-next'),
    
    // Footer
    footer: document.querySelector('.footer'),
    footerLinks: document.querySelectorAll('.footer a'),
    
    // Breadcrumb
    breadcrumb: document.querySelector('.breadcrumb'),
    breadcrumbItems: document.querySelectorAll('.breadcrumb-item'),
    
    // Main content
    main: document.querySelector('main'),
    container: document.querySelector('.container'),
    row: document.querySelector('.row'),
    colMd8: document.querySelector('.col-md-8'),
    colMd4: document.querySelector('.col-md-4')
  };
}

export default {
  createRealisticHTML,
  setupRealisticBrowserWithHTML,
  getRealisticTestElements
};
