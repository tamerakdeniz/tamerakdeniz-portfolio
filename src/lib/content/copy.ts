import type { Loc } from './portfolio';

const l = (en: string, tr: string): Loc => ({ en, tr });

export const CHAPTERS = [
  { id: 'surface', index: '00', depth: 0, name: l('Surface', 'Yüzey') },
  { id: 'about', index: '01', depth: 10, name: l('The Human', 'İnsan') },
  { id: 'work', index: '02', depth: 20, name: l('Selected Works', 'Seçili İşler') },
  { id: 'lab', index: '03', depth: 30, name: l('Inside the Lab', 'Laboratuvarın İçi') },
  { id: 'engineering', index: '04', depth: 40, name: l('Engineering DNA', 'Mühendislik DNA’sı') },
  { id: 'journey', index: '05', depth: 50, name: l('The Journey', 'Yolculuk') },
  { id: 'contact', index: '06', depth: 60, name: l('Beyond the Known', 'Bilinenin Ötesi') },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]['id'];

export const PROJECT_CATEGORIES: Record<string, Loc> = {
  web: l('Web', 'Web'),
  ai: l('AI', 'Yapay zekâ'),
  startup: l('Startup', 'Girişim'),
  opensource: l('Open source', 'Açık kaynak'),
  desktop: l('Desktop', 'Masaüstü'),
  mobile: l('Mobile', 'Mobil'),
  extension: l('Browser extension', 'Tarayıcı eklentisi'),
  practice: l('Practice', 'Alıştırma'),
  test: l('Test', 'Test'),
};

export const SKILL_CATEGORIES: Record<string, Loc> = {
  backend: l('Backend', 'Backend'),
  frontend: l('Frontend', 'Frontend'),
  mobile: l('Mobile', 'Mobil'),
  database: l('Data', 'Veri'),
  devops: l('DevOps & cloud', 'DevOps ve bulut'),
  ai: l('AI & ML', 'Yapay zekâ'),
  tools: l('Tools', 'Araçlar'),
  other: l('Practice', 'Pratik'),
};

export const JOURNEY_TYPES: Record<string, Loc> = {
  work: l('Work', 'İş'),
  education: l('Education', 'Eğitim'),
  certification: l('Certification', 'Sertifika'),
};

export const COPY = {
  skip: l('Skip to content', 'İçeriğe geç'),
  nav: {
    work: l('Work', 'İşler'),
    about: l('About', 'Hakkımda'),
    lab: l('Lab', 'Laboratuvar'),
    contact: l('Contact', 'İletişim'),
    archive: l('Archive', 'Arşiv'),
    recruiter: l('Recruiter view', 'İşe alım görünümü'),
    recruiterShort: l('Recruiter', 'İşe alım'),
    explore: l('Explore view', 'Keşif görünümü'),
    exploreShort: l('Explore', 'Keşif'),
    menu: l('Menu', 'Menü'),
    close: l('Close', 'Kapat'),
    search: l('Search', 'Ara'),
    cv: l('CV', 'Özgeçmiş'),
    primary: l('Primary', 'Ana menü'),
    chapters: l('Chapters', 'Bölümler'),
    language: l('Language', 'Dil'),
    index: l('Index', 'Dizin'),
    indexTitle: l('Expedition index', 'Keşif dizini'),
    openIndex: l('Open the expedition index', 'Keşif dizinini açın'),
    closeIndex: l('Close the index', 'Dizini kapatın'),
    here: l('You are here', 'Buradasınız'),
    expedition: l('The expedition', 'Keşif'),
    backToExpedition: l('Back to the expedition', 'Keşfe dönün'),
    askArchive: l('Ask the archive — AI experiment', 'Arşive sorun — yapay zekâ deneyi'),
    elsewhere: l('Also on this site', 'Sitede ayrıca'),
    rail: l('Depth', 'Derinlik'),
  },
  chapterNotes: {
    surface: l('Who I am, the work and the CV, at a glance.', 'Kim olduğum, işlerim ve özgeçmişim, tek bakışta.'),
    about: l('A field journal: diving, building, learning.', 'Bir saha defteri: dalış, üretmek, öğrenmek.'),
    work: l('Selected projects, up close.', 'Yakından seçilmiş projeler.'),
    lab: l('Every other experiment — and an assistant you can question.', 'Diğer tüm deneyler ve soru sorabileceğiniz bir asistan.'),
    engineering: l('How this site is built, drawn from its own code.', 'Bu sitenin nasıl kurulduğu, kendi kodundan çizildi.'),
    journey: l('Education and work, in a dive log.', 'Eğitim ve iş, bir dalış kaydında.'),
    contact: l('Back to the horizon — and a way to reach me.', 'Ufka dönüş ve bana ulaşmanın yolu.'),
  },
  cv: {
    title: l('Curriculum vitae', 'Özgeçmiş'),
    download: l('Download PDF', 'PDF indir'),
    openTab: l('Open in a new tab', 'Yeni sekmede açın'),
    mobile: l(
      'PDF previews are unreliable on phones. Download the file or open it in a new tab.',
      'Telefonlarda PDF önizlemesi güvenilir değil. Dosyayı indirin ya da yeni sekmede açın.'
    ),
    close: l('Close', 'Kapat'),
  },
  hero: {
    titleA: l('Beyond', 'Yüzeyin'),
    titleB: l('the', ''),
    titleSerif: l('surface.', 'ötesinde.'),
    lede: l(
      'I build software, explore ideas, and turn complex problems into useful products.',
      'Yazılım geliştiriyor, fikirlerin peşine düşüyor ve karmaşık problemleri işe yarayan ürünlere dönüştürüyorum.'
    ),
    explore: l('Explore selected work', 'Seçili işleri keşfet'),
    viewCv: l('View CV', 'Özgeçmişi gör'),
    scroll: l('Scroll to descend', 'İnmek için kaydırın'),
    descending: l('Descending to', 'İniş:'),
    figure: l('Fig. 00 — A contour map of curiosity', 'Şekil 00 — Merakın eş yükselti haritası'),
  },
  human: {
    titleA: l('Curiosity takes me', 'Merak beni'),
    titleSerif: l('deeper.', 'derine götürüyor.'),
    more: l('Read the longer story', 'Hikâyenin devamını okuyun'),
    diverCaption: l(
      'Fig. 1.1 — Off the keyboard: scuba diving, which I also teach as an instructor.',
      'Şekil 1.1 — Klavyeden uzakta: eğitmen olarak da sürdürdüğüm tüplü dalış.'
    ),
    portraitCaption: l('Fig. 1.2 — Tamer Akdeniz.', 'Şekil 1.2 — Tamer Akdeniz.'),
    journal: l('Field journal', 'Saha defteri'),
    page: l('p. 01', 's. 01'),
    diverNote: l('me, off the keyboard — I also teach diving', 'klavyeden uzakta ben — dalış eğitmenliği de yapıyorum'),
    portraitNote: l('Tamer, Istanbul', 'Tamer, İstanbul'),
    diverAlt: l(
      'Tamer Akdeniz scuba diving, seen from below against open blue water',
      'Tamer Akdeniz tüplü dalışta, açık mavi suda aşağıdan görünüyor'
    ),
    portraitAlt: l('Portrait of Tamer Akdeniz', 'Tamer Akdeniz’in portresi'),
    parallel: l(
      'Diving and software ask for the same habits: prepare before you go down, stay responsible for the people relying on you, and come back up with what you learned.',
      'Dalış ve yazılım aynı alışkanlıkları ister: inmeden önce hazırlanmak, size güvenenlere karşı sorumlu kalmak ve öğrendiklerinizle yüzeye dönmek.'
    ),
  },
  work: {
    titleA: l('Evidence,', 'Sıfatlar değil,'),
    titleSerif: l('not adjectives.', 'kanıtlar.'),
    intro: l(
      'A few projects up close. Everything else I have published lives in the lab archive.',
      'Yakından birkaç proje. Yayınladığım diğer her şey laboratuvar arşivinde.'
    ),
    archive: l('Full archive', 'Tüm arşiv'),
    oneLine: l('In one sentence', 'Tek cümlede'),
    builtWith: l('Built with', 'Kullanılanlar'),
    kind: l('Kind', 'Tür'),
    caseStudy: l('Read the project file', 'Proje dosyasını okuyun'),
    live: l('Live site', 'Canlı site'),
    source: l('Source code', 'Kaynak kod'),
    demo: l('Demo', 'Demo'),
    markCaption: l('Project mark', 'Proje logosu'),
    imagery: l('Project imagery as supplied by the project.', 'Proje görselleri, projeden alındığı gibi.'),
    noFeatured: l('No project is featured right now — the full archive is in the lab.', 'Şu anda öne çıkan proje yok; tüm arşiv laboratuvarda.'),
    plate: l('Plate', 'Levha'),
    conceptual: l(
      'Conceptual plate drawn from the project brief, with the project mark as supplied. Not an interface screenshot.',
      'Proje tanımından çizilmiş kavramsal levha; proje logosu olduğu gibi kullanıldı. Arayüz ekran görüntüsü değildir.'
    ),
    markOnly: l('Project mark, shown as supplied.', 'Proje logosu, olduğu gibi.'),
    scrollHint: l('Scroll to turn the plate', 'Levhayı çevirmek için kaydırın'),
  },
  lab: {
    titleA: l('Ideas in', 'Hareket hâlindeki'),
    titleSerif: l('motion.', 'fikirler.'),
    intro: l(
      'The rest of the published work: client sites, experiments, practice apps and tools. Every row opens its own project file.',
      'Yayınlanan diğer işler: müşteri siteleri, deneyler, alıştırma uygulamaları ve araçlar. Her satır kendi proje dosyasını açar.'
    ),
    colNo: l('No.', 'No.'),
    colProject: l('Project', 'Proje'),
    colKind: l('Kind', 'Tür'),
    colStack: l('Built with', 'Teknolojiler'),
    colAccess: l('Access', 'Erişim'),
    accessLive: l('Live', 'Canlı'),
    accessSource: l('Source', 'Kaynak'),
    archive: l('Open the full archive with filters', 'Filtreli tüm arşivi açın'),
    askRow: l('Ask the archive', 'Arşive sorun'),
    askSub: l('AI experiment — answers only from this site', 'Yapay zekâ deneyi — yalnızca bu siteden yanıtlar'),
    specimen: l('Specimen', 'Örnek'),
    open: l('Open the project file', 'Proje dosyasını açın'),
    hint: l('Hover a row, or use ↑ ↓, to inspect it.', 'İncelemek için bir satırın üzerine gelin ya da ↑ ↓ kullanın.'),
    rowsLabel: l('Projects and the assistant', 'Projeler ve asistan'),
    projectsLabel: l('Projects', 'Projeler'),
    assistantTitle: l('Ask the archive', 'Arşive sorun'),
    assistantBody: l(
      'An experiment running on this site: a Gemini-backed assistant that answers only from the content you can read here. It can be wrong — the pages remain the source of truth.',
      'Bu sitede çalışan bir deney: yalnızca burada okuyabildiğiniz içerikten yanıt veren, Gemini destekli bir asistan. Yanılabilir; asıl kaynak her zaman sayfalardır.'
    ),
  },
  engineering: {
    titleA: l('How I', 'Nasıl'),
    titleSerif: l('build.', 'inşa ediyorum.'),
    intro: l(
      'Areas I keep returning to. Technologies are listed only where they appear in my published projects or experience — each pillar links to the work behind it.',
      'Sürekli geri döndüğüm alanlar. Teknolojiler yalnızca yayınlanmış projelerimde ya da deneyimimde yer aldığı ölçüde listeleniyor; her başlık arkasındaki işe bağlanıyor.'
    ),
    related: l('Seen in', 'Görüldüğü yer'),
    mapTitle: l('Fig. 4.1 — This site, as built', 'Şekil 4.1 — Bu site, kurulduğu hâliyle'),
    mapIntro: l(
      'Drawn from this repository, not from a template. Select a part to see what it does, what it talks to, and where it lives in the code.',
      'Bir şablondan değil, bu depodan çizildi. Bir parçayı seçin: ne yaptığını, kiminle konuştuğunu ve kodda nerede durduğunu görün.'
    ),
    connects: l('Talks to', 'Bağlantıları'),
    inCode: l('In the code', 'Kodda'),
    pillarsTitle: l('Areas I keep returning to', 'Sürekli geri döndüğüm alanlar'),
    loopCaption: l(
      'Fig. 4.1 — A conceptual loop: how I like to work, not a claim about every project.',
      'Şekil 4.1 — Kavramsal bir döngü: çalışmayı sevdiğim biçim, her proje için bir iddia değil.'
    ),
    loop: [
      l('Problem', 'Problem'),
      l('Design', 'Tasarım'),
      l('Build', 'İnşa'),
      l('Validate', 'Doğrulama'),
      l('Iterate', 'Yineleme'),
    ],
  },
  journey: {
    titleA: l('The field', 'Saha'),
    titleSerif: l('log.', 'kaydı.'),
    intro: l(
      'Education, programmes and work, in the order I keep them. Some of them overlap — that is how it happened.',
      'Eğitim, programlar ve iş deneyimi, kendi sıralamamla. Bazıları zaman olarak örtüşüyor; gerçekte de öyle oldu.'
    ),
    now: l('Now', 'Bugün'),
    computer: l('Dive log', 'Dalış kaydı'),
    entry: l('Entry', 'Kayıt'),
    deeper: l('Scroll deeper to go further back', 'Daha geriye gitmek için derine inin'),
    chart: l('Education and work over time', 'Zaman içinde eğitim ve iş'),
    more: l('Read more', 'Devamını okuyun'),
    downloadCv: l('Download CV (PDF)', 'Özgeçmişi indirin (PDF)'),
    linkedin: l('Experience on LinkedIn', 'LinkedIn’deki deneyim'),
  },
  contact: {
    titleA: l('There’s always more', 'Yüzeyin altında'),
    titleSerif: l('beneath the surface.', 'her zaman daha fazlası var.'),
    lede: l('Have a problem worth exploring? Let’s talk.', 'Keşfetmeye değer bir probleminiz mi var? Konuşalım.'),
    emailLabel: l('Write to me', 'Bana yazın'),
    elsewhere: l('Elsewhere', 'Diğer kanallar'),
    back: l('Back to the surface', 'Yüzeye dönün'),
    ascend: l('Return to the surface', 'Yüzeye çıkın'),
    copy: l('Copy address', 'Adresi kopyalayın'),
    copied: l('Copied', 'Kopyalandı'),
    reach: l('Reach me', 'Bana ulaşın'),
    formToggle: l('Or leave a message here', 'Ya da buradan mesaj bırakın'),
    formTitle: l('Leave a message', 'Mesaj bırakın'),
    name: l('Name', 'Ad'),
    email: l('Email', 'E-posta'),
    subject: l('Subject', 'Konu'),
    message: l('Message', 'Mesaj'),
    send: l('Send message', 'Mesajı gönderin'),
    sending: l('Sending…', 'Gönderiliyor…'),
    success: l('Thank you — your message has arrived. I’ll reply by email.', 'Teşekkürler — mesajınız ulaştı. E-postayla yanıt vereceğim.'),
    error: l(
      'The message could not be sent. Please try again or email me directly.',
      'Mesaj gönderilemedi. Lütfen tekrar deneyin ya da doğrudan e-posta gönderin.'
    ),
    busy: l(
      'Another message arrived a moment ago. Please wait a few seconds and send again, or email me directly.',
      'Az önce başka bir mesaj ulaştı. Lütfen birkaç saniye bekleyip tekrar gönderin ya da doğrudan e-posta gönderin.'
    ),
    preview: l(
      'This is a preview deployment, so messages are not sent from here. Please email me directly.',
      'Bu bir önizleme sürümü; mesajlar buradan gönderilmez. Lütfen doğrudan e-posta gönderin.'
    ),
    required: l('This field is required.', 'Bu alan zorunludur.'),
    invalidEmail: l('Enter a valid email address.', 'Geçerli bir e-posta adresi girin.'),
  },
  footer: {
    rights: l('All rights reserved.', 'Tüm hakları saklıdır.'),
    admin: l('Admin', 'Yönetim'),
  },
  project: {
    archive: l('Archive', 'Arşiv'),
    file: l('Project file', 'Proje dosyası'),
    of: l('of', '/'),
    archived: l('Archived project', 'Arşivlenmiş proje'),
    period: l('Period', 'Dönem'),
    contribution: l('My part', 'Katkım'),
    gallery: l('Screens and diagrams', 'Ekranlar ve diyagramlar'),
    brief: l('The brief', 'Özet'),
    strata: l('Stack by layer', 'Katmanlara göre teknoloji'),
    strataNote: l(
      'Grouped from the technologies declared for this project. It shows what was used, not how the parts connect.',
      'Bu proje için belirtilen teknolojilerden gruplandı. Neyin kullanıldığını gösterir; parçaların nasıl bağlandığını değil.'
    ),
    links: l('Links', 'Bağlantılar'),
    prev: l('Previous project', 'Önceki proje'),
    next: l('Next project', 'Sonraki proje'),
    back: l('Back to all work', 'Tüm işlere dönün'),
    role: l('Role', 'Rol'),
    status: l('Status', 'Durum'),
    year: l('Year', 'Yıl'),
    notes: l('Field notes', 'Saha notları'),
  },
  archive: {
    titleA: l('The', 'Tüm'),
    titleSerif: l('archive.', 'arşiv.'),
    intro: l(
      'Everything published, in the order I keep it. Filter by kind; every entry opens its own project file.',
      'Yayınlanan her şey, kendi sıralamamla. Türe göre filtreleyin; her kayıt kendi proje dosyasını açar.'
    ),
    all: l('All', 'Tümü'),
    filter: l('Filter by kind', 'Türe göre filtrele'),
    showing: l('Showing', 'Gösterilen'),
    projects: l('projects', 'proje'),
    empty: l('Nothing in this category yet.', 'Bu kategoride henüz bir şey yok.'),
  },
  about: {
    eyebrow: l('About', 'Hakkımda'),
    titleA: l('The longer', 'Hikâyenin'),
    titleSerif: l('story.', 'devamı.'),
    intro: l(
      'Who I am, what I use, and where I have been — told in my own words, without ratings or counters.',
      'Kim olduğum, neler kullandığım ve nerelerden geçtiğim — puanlar ya da sayaçlar olmadan, kendi sözlerimle.'
    ),
    story: l('In my own words', 'Kendi sözlerimle'),
    cta: l('Write to me', 'Bana yazın'),
    ctaHome: l('Or see the contact chapter', 'Ya da iletişim bölümüne bakın'),
    skills: l('Instruments', 'Araçlar'),
    skillsIntro: l(
      'The tools I list on this site, grouped by where they sit in a system. No ratings — the projects are the evidence.',
      'Bu sitede listelediğim araçlar, bir sistemdeki yerlerine göre gruplandı. Puanlama yok; kanıt projelerdir.'
    ),
  },
  recruiter: {
    eyebrow: l('Recruiter view', 'İşe alım görünümü'),
    note: l(
      'The same content as the full site, on one page. Printable.',
      'Tam sitedeki içeriğin aynısı, tek sayfada. Yazdırılabilir.'
    ),
    print: l('Print', 'Yazdır'),
    back: l('Back to the full experience', 'Tam deneyime dönün'),
    summary: l('Summary', 'Özet'),
    contact: l('Contact', 'İletişim'),
    selected: l('Selected projects', 'Seçili projeler'),
    other: l('Other projects', 'Diğer projeler'),
    experience: l('Experience', 'Deneyim'),
    education: l('Education & programmes', 'Eğitim ve programlar'),
    skills: l('Skills', 'Yetenekler'),
    cv: l('CV (PDF)', 'Özgeçmiş (PDF)'),
    download: l('Download', 'İndir'),
  },
  notFound: {
    title: l('Uncharted water.', 'Haritada olmayan sular.'),
    body: l(
      'This page doesn’t exist, or it has drifted somewhere else.',
      'Bu sayfa mevcut değil ya da başka bir yere sürüklenmiş.'
    ),
    home: l('Back to the surface', 'Yüzeye dönün'),
    archive: l('Browse the archive', 'Arşive göz atın'),
  },
  palette: {
    label: l('Search pages and projects', 'Sayfalarda ve projelerde arayın'),
    placeholder: l('Search pages, projects, actions…', 'Sayfa, proje ya da eylem arayın…'),
    empty: l('No matches.', 'Eşleşme yok.'),
    chapters: l('Chapters', 'Bölümler'),
    pages: l('Pages', 'Sayfalar'),
    projects: l('Projects', 'Projeler'),
    actions: l('Actions', 'Eylemler'),
    copyEmail: l('Copy email address', 'E-posta adresini kopyalayın'),
    copied: l('Email copied', 'E-posta kopyalandı'),
    openCv: l('Open CV', 'Özgeçmişi açın'),
    switchLang: l('Türkçe’ye geç', 'Switch to English'),
    hint: l('↑↓ to move · Enter to open · Esc to close', '↑↓ gezin · Enter açın · Esc kapatın'),
  },
} as const;
