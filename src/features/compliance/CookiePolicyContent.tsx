import type { SupportedLanguage } from '@/features/localization/translations'

export function CookiePolicyContent({ lang }: { lang: SupportedLanguage }) {
  if (lang === 'en') return <CookieEn />
  return <CookieTr />
}

function CookieTr() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-white/80">
      <p className="text-white/50">Son güncelleme: 16 Nisan 2026.</p>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">Kullanılan teknolojiler</h3>
        <p>
          Bu sitede <strong className="text-white">reklam veya davranışsal izleme çerezi</strong> kullanılmamaktadır.
          Tercihinizi hatırlamak için{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">localStorage</code> anahtarı (
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">huseyinemre.portfolio.cookieConsent</code>)
          kullanılır; bu, tarayıcıda saklanan küçük bir metin dosyasıdır.
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">Tercih seçenekleri</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Yalnızca zorunlu / gerekli:</strong> Google Fonts yüklenmez; sistem
            yazı tipleri kullanılır. GitHub API ile proje listesi gösterilmeye devam eder (site içeriği için gerekli
            veri akışı).
          </li>
          <li>
            <strong className="text-white">Tümünü kabul:</strong> Google üzerinden Inter ve JetBrains Mono yazı
            tipleri yüklenir; IP adresiniz bu istekle Google’a iletilebilir.
          </li>
        </ul>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">Tercihi değiştirme</h3>
        <p>
          Tarayıcıda site verilerini silerek tercihi sıfırlayabilir veya gizlilik modunda tekrar seçim yapabilirsiniz.
          İleride bu sayfaya “tercihi sıfırla” düğmesi eklenebilir.
        </p>
      </section>
    </article>
  )
}

function CookieEn() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-white/80">
      <p className="text-white/50">Last updated: April 16, 2026.</p>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">Technologies used</h3>
        <p>
          We do <strong className="text-white">not</strong> use advertising or behavioural tracking cookies. We store
          your choice in <code className="rounded bg-white/10 px-1 py-0.5 text-xs">localStorage</code> under the key{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">huseyinemre.portfolio.cookieConsent</code>.
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">Choices</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Necessary only:</strong> Google Fonts are not loaded (system fonts). GitHub
            API calls still run to show public repositories.
          </li>
          <li>
            <strong className="text-white">Accept all:</strong> Google Fonts may load; your IP may be processed by
            Google for font delivery.
          </li>
        </ul>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">Changing your choice</h3>
        <p>
          Clear site data in your browser to reset the choice, or use a private window. A dedicated “reset choice”
          control may be added later.
        </p>
      </section>
    </article>
  )
}
