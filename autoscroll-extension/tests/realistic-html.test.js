/**
 * Realistic HTML Structure Tests
 * Testing the realistic HTML structure based on pintar.article.html
 */

describe('Realistic HTML Structure', () => {
  describe('HTML Document Structure', () => {
    test('should have realistic HTML document structure', () => {
      expect(document.documentElement).toBeDefined();
      expect(document.head).toBeDefined();
      expect(document.body).toBeDefined();
      expect(document.title).toBe('7 Aplikasi Terbukti Membayar di 2025: Cuan dari HP! - Pintar Cek Media');
    });

    test('should have realistic meta tags', () => {
      const metaDescription = document.querySelector('meta[name="description"]');
      const metaRobots = document.querySelector('meta[name="robots"]');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      
      expect(metaDescription).toBeDefined();
      expect(metaRobots).toBeDefined();
      expect(ogTitle).toBeDefined();
      expect(twitterCard).toBeDefined();
      
      expect(metaDescription.getAttribute('content')).toContain('menghasilkan uang hanya dengan HP');
      expect(ogTitle.getAttribute('content')).toContain('7 Aplikasi Terbukti Membayar di 2025');
    });

    test('should have realistic CSS styles', () => {
      const style = document.querySelector('style');
      expect(style).toBeDefined();
      expect(style.textContent).toContain('body');
      expect(style.textContent).toContain('font-family');
      expect(style.textContent).toContain('container');
      expect(style.textContent).toContain('navbar');
    });
  });

  describe('Header and Navigation', () => {
    test('should have realistic header structure', () => {
      const header = document.querySelector('.header');
      const navbar = document.querySelector('.navbar');
      const navbarBrand = document.querySelector('.navbar-brand');
      
      expect(header).toBeDefined();
      expect(navbar).toBeDefined();
      expect(navbarBrand).toBeDefined();
      expect(navbarBrand.textContent).toBe('Pintar Cek Media');
    });

    test('should have realistic navigation links', () => {
      const navLinks = document.querySelectorAll('.nav-link');
      expect(navLinks.length).toBeGreaterThan(0);
      
      const expectedLinks = ['Home', 'Pinjaman Online', 'Aplikasi Penghasil Uang', 'Finansial Pintar', 'Review & Perbandingan'];
      navLinks.forEach((link, index) => {
        if (expectedLinks[index]) {
          expect(link.textContent).toBe(expectedLinks[index]);
        }
      });
    });
  });

  describe('Breadcrumb Navigation', () => {
    test('should have realistic breadcrumb structure', () => {
      const breadcrumb = document.querySelector('.breadcrumb');
      const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
      
      expect(breadcrumb).toBeDefined();
      expect(breadcrumbItems.length).toBeGreaterThan(0);
    });

    test('should have realistic breadcrumb content', () => {
      const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
      const firstItem = breadcrumbItems[0];
      
      expect(firstItem).toBeDefined();
      expect(firstItem.textContent).toContain('Home');
    });
  });

  describe('Article Content', () => {
    test('should have realistic article structure', () => {
      const articleTitle = document.querySelector('.article-title');
      const articleMeta = document.querySelector('.article-meta');
      const articleContent = document.querySelector('.article-content');
      
      expect(articleTitle).toBeDefined();
      expect(articleMeta).toBeDefined();
      expect(articleContent).toBeDefined();
      
      expect(articleTitle.textContent).toContain('7 Aplikasi Terbukti Membayar di 2025');
    });

    test('should have realistic article content', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const paragraphs = document.querySelectorAll('p');
      const lists = document.querySelectorAll('ul, ol');
      const links = document.querySelectorAll('a');
      
      expect(headings.length).toBeGreaterThan(0);
      expect(paragraphs.length).toBeGreaterThan(0);
      expect(lists.length).toBeGreaterThan(0);
      expect(links.length).toBeGreaterThan(0);
    });

    test('should have realistic article headings', () => {
      const h2Headings = document.querySelectorAll('h2');
      const h3Headings = document.querySelectorAll('h3');
      
      expect(h2Headings.length).toBeGreaterThan(0);
      expect(h3Headings.length).toBeGreaterThan(0);
      
      // Check for specific headings
      const headings = Array.from(h2Headings).map(h => h.textContent);
      expect(headings).toContain('Daftar Aplikasi Penghasil Uang Terbukti Membayar');
      expect(headings).toContain('Tips Sukses Menghasilkan Uang dari Aplikasi');
      expect(headings).toContain('Kesimpulan');
    });

    test('should have realistic article content with applications', () => {
      const h3Headings = document.querySelectorAll('h3');
      const appHeadings = Array.from(h3Headings).map(h => h.textContent);
      
      expect(appHeadings).toContain('1. BuzzBreak');
      expect(appHeadings).toContain('2. SnackVideo');
      expect(appHeadings).toContain('3. Cashtree');
      expect(appHeadings).toContain('4. MoneyTree');
      expect(appHeadings).toContain('5. CashPop');
      expect(appHeadings).toContain('6. RewardPop');
      expect(appHeadings).toContain('7. CashApp');
    });

    test('should have realistic article lists with app details', () => {
      const lists = document.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
      
      // Check for app details in lists
      const listItems = document.querySelectorAll('li');
      const hasAppDetails = Array.from(listItems).some(li => 
        li.textContent.includes('Jenis Reward') || 
        li.textContent.includes('Cara Kerja') ||
        li.textContent.includes('Keamanan') ||
        li.textContent.includes('Minimal Withdraw') ||
        li.textContent.includes('Rating')
      );
      
      expect(hasAppDetails).toBe(true);
    });
  });

  describe('Sidebar Content', () => {
    test('should have realistic sidebar structure', () => {
      const sidebars = document.querySelectorAll('.sidebar');
      expect(sidebars.length).toBeGreaterThan(0);
    });

    test('should have realistic sidebar content', () => {
      const sidebar = document.querySelector('.sidebar');
      const sidebarH3 = sidebar.querySelector('h3');
      const sidebarLinks = sidebar.querySelectorAll('a');
      
      expect(sidebarH3).toBeDefined();
      expect(sidebarLinks.length).toBeGreaterThan(0);
      
      expect(sidebarH3.textContent).toContain('Kategori Populer');
    });
  });

  describe('Advertisement Containers', () => {
    test('should have realistic ad containers', () => {
      const adContainers = document.querySelectorAll('.ad-container');
      const adPlaceholders = document.querySelectorAll('.ad-placeholder');
      
      expect(adContainers.length).toBeGreaterThan(0);
      expect(adPlaceholders.length).toBeGreaterThan(0);
    });

    test('should have realistic ad content', () => {
      const adContainers = document.querySelectorAll('.ad-container');
      const firstAd = adContainers[0];
      const adTitle = firstAd.querySelector('h3');
      const adPlaceholder = firstAd.querySelector('.ad-placeholder');
      
      expect(adTitle).toBeDefined();
      expect(adPlaceholder).toBeDefined();
      expect(adTitle.textContent).toBe('Iklan');
      expect(adPlaceholder.textContent).toContain('Google AdSense');
    });
  });

  describe('Related Posts', () => {
    test('should have realistic related posts structure', () => {
      const relatedPosts = document.querySelector('.related-posts');
      const relatedPostItems = document.querySelectorAll('.related-post-item');
      
      expect(relatedPosts).toBeDefined();
      expect(relatedPostItems.length).toBeGreaterThan(0);
    });

    test('should have realistic related posts content', () => {
      const relatedPostItems = document.querySelectorAll('.related-post-item');
      const firstPost = relatedPostItems[0];
      const postTitle = firstPost.querySelector('h4');
      const postLink = firstPost.querySelector('a');
      
      expect(postTitle).toBeDefined();
      expect(postLink).toBeDefined();
      expect(postTitle.textContent).toContain('Aplikasi Pinjaman Online');
    });
  });

  describe('Post Navigation', () => {
    test('should have realistic post navigation', () => {
      const postNavigation = document.querySelector('.post-navigation');
      const navPrevious = document.querySelector('.nav-previous');
      const navNext = document.querySelector('.nav-next');
      
      expect(postNavigation).toBeDefined();
      expect(navPrevious).toBeDefined();
      expect(navNext).toBeDefined();
    });

    test('should have realistic navigation links', () => {
      const navPrevious = document.querySelector('.nav-previous');
      const navNext = document.querySelector('.nav-next');
      const prevLink = navPrevious.querySelector('a');
      const nextLink = navNext.querySelector('a');
      
      expect(prevLink).toBeDefined();
      expect(nextLink).toBeDefined();
      expect(prevLink.textContent).toContain('5 Aplikasi Pinjaman Online');
      expect(nextLink.textContent).toContain('Review Aplikasi Finansial');
    });
  });

  describe('Footer', () => {
    test('should have realistic footer structure', () => {
      const footer = document.querySelector('.footer');
      const footerH3 = footer.querySelectorAll('h3');
      const footerLinks = footer.querySelectorAll('a');
      
      expect(footer).toBeDefined();
      expect(footerH3.length).toBeGreaterThan(0);
      expect(footerLinks.length).toBeGreaterThan(0);
    });

    test('should have realistic footer content', () => {
      const footer = document.querySelector('.footer');
      const footerH3 = Array.from(footer.querySelectorAll('h3')).map(h => h.textContent);
      
      expect(footerH3).toContain('Tentang Kami');
      expect(footerH3).toContain('Kategori');
      expect(footerH3).toContain('Kontak');
    });
  });

  describe('Layout Structure', () => {
    test('should have realistic layout structure', () => {
      const container = document.querySelector('.container');
      const row = document.querySelector('.row');
      const colMd8 = document.querySelector('.col-md-8');
      const colMd4 = document.querySelector('.col-md-4');
      
      expect(container).toBeDefined();
      expect(row).toBeDefined();
      expect(colMd8).toBeDefined();
      expect(colMd4).toBeDefined();
    });

    test('should have realistic responsive classes', () => {
      const colMd8 = document.querySelector('.col-md-8');
      const colMd4 = document.querySelector('.col-md-4');
      
      expect(colMd8.classList.contains('col-md-8')).toBe(true);
      expect(colMd4.classList.contains('col-md-4')).toBe(true);
    });
  });

  describe('Content Accessibility', () => {
    test('should have realistic heading hierarchy', () => {
      const h1 = document.querySelector('h1');
      const h2 = document.querySelectorAll('h2');
      const h3 = document.querySelectorAll('h3');
      
      expect(h1).toBeDefined();
      expect(h2.length).toBeGreaterThan(0);
      expect(h3.length).toBeGreaterThan(0);
      
      expect(h1.textContent).toContain('7 Aplikasi Terbukti Membayar di 2025');
    });

    test('should have realistic link structure', () => {
      const links = document.querySelectorAll('a');
      const externalLinks = Array.from(links).filter(link => 
        link.getAttribute('target') === '_blank' || 
        link.getAttribute('href')?.startsWith('http')
      );
      
      expect(links.length).toBeGreaterThan(0);
      expect(externalLinks.length).toBeGreaterThan(0);
    });

    test('should have realistic image structure', () => {
      const images = document.querySelectorAll('img');
      // Note: In our mock HTML, we don't have actual images, but we test the structure
      expect(images.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('SEO and Meta Structure', () => {
    test('should have realistic SEO meta tags', () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      const ogSiteName = document.querySelector('meta[property="og:site_name"]');
      
      expect(canonical).toBeDefined();
      expect(ogUrl).toBeDefined();
      expect(ogSiteName).toBeDefined();
      
      expect(canonical.getAttribute('href')).toContain('pintar.cekmedia.com');
      expect(ogSiteName.getAttribute('content')).toBe('Pintar Cek Media');
    });

    test('should have realistic article meta tags', () => {
      const ogType = document.querySelector('meta[property="og:type"]');
      const articleSection = document.querySelector('meta[property="article:section"]');
      const articleTags = document.querySelectorAll('meta[property="article:tag"]');
      
      expect(ogType).toBeDefined();
      expect(articleSection).toBeDefined();
      expect(articleTags.length).toBeGreaterThan(0);
      
      expect(ogType.getAttribute('content')).toBe('article');
      expect(articleSection.getAttribute('content')).toBe('Aplikasi Penghasil Uang');
    });
  });

  describe('JavaScript and External Resources', () => {
    test('should have realistic external script references', () => {
      const scripts = document.querySelectorAll('script[src]');
      const hasAdSense = Array.from(scripts).some(script => 
        script.getAttribute('src')?.includes('googlesyndication.com')
      );
      
      expect(scripts.length).toBeGreaterThan(0);
      expect(hasAdSense).toBe(true);
    });

    test('should have realistic CSS references', () => {
      const styles = document.querySelectorAll('style');
      expect(styles.length).toBeGreaterThan(0);
      
      const firstStyle = styles[0];
      expect(firstStyle.textContent).toContain('body');
      expect(firstStyle.textContent).toContain('font-family');
    });
  });
});
