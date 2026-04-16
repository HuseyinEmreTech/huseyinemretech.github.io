import type { SupportedLanguage } from '@/features/localization/translations'

export function PrivacyPolicyContent({ lang }: { lang: SupportedLanguage }) {
  if (lang === 'en') return <PrivacyEn />
  return <PrivacyTr />
}

function PrivacyTr() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-white/80">
      <p className="text-white/50">
        Son güncelleme: 16 Nisan 2026. Bu metin genel bilgilendirme amaçlıdır; somut hukuki sonuç için avukata
        danışınız.
      </p>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">1. Veri sorumlusu</h3>
        <p>
          Bu internet sitesinin veri sorumlusu: <strong className="text-white">Hüseyin Emre</strong> (bireysel
          portföy sitesi). İletişim:{' '}
          <a className="text-cyan-300 underline" href="mailto:huseyinemre.tech@gmail.com">
            huseyinemre.tech@gmail.com
          </a>
          . KVKK kapsamındaki taleplerinizi bu adrese iletebilirsiniz.
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">2. İşlenen kişisel veriler ve amaçlar</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Sunucu / barındırma trafiği:</strong> Sayfa isteği sırasında IP adresi,
            zaman damgası, tarayıcı türü gibi teknik veriler; barındırma sağlayıcısı (ör. GitHub Pages) tarafından 5651
            sayılı Kanun ve ilgili düzenlemeler çerçevesinde tutulabilir. Bu süreçte veri sorumlusu olarak site
            sahibinin rolü, ziyaretçi verilerinin hangi altyapıda işlendiğini aydınlatmaktır.
          </li>
          <li>
            <strong className="text-white">GitHub API:</strong> Projeler bölümünde herkese açık depolar listelenmek
            üzere GitHub API’sine istek yapılır. Bu istek sırasında teknik olarak GitHub’a (yurt dışı) trafik
            oluşabilir.
          </li>
          <li>
            <strong className="text-white">Google Fonts (isteğe bağlı):</strong> Yalnızca çerez tercihinizde “Tümünü
            kabul et” seçeneğini işaretlediğinizde yazı tipleri Google sunucularından yüklenir.
          </li>
          <li>
            <strong className="text-white">E-posta ile iletişim:</strong> Bize doğrudan e-posta göndermeniz halinde
            ilettiğiniz içerik ve iletişim bilgileriniz yalnızca talebinizi yanıtlamak amacıyla işlenir.
          </li>
        </ul>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">3. Hukuki sebepler</h3>
        <p>
          Veri işleme faaliyetleri; KVKK m. 5 kapsamında <strong className="text-white">meşru menfaat</strong> (site
          güvenliği ve temel işleyiş), <strong className="text-white">sözleşmenin kurulması veya ifası</strong> / ön
          bilgilendirme (iş birliği talepleri), <strong className="text-white">açık rıza</strong> (Google Fonts
          yüklemesi) ve ilgili hallerde <strong className="text-white">kanuni yükümlülük</strong> başlıklarıyla
          sınırlı ve ölçülü şekilde yürütülür.
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">4. Aktarım</h3>
        <p>
          GitHub ve Google hizmetleri yurt dışında yerleşik olabilir. Bu aktarımlar KVKK m. 9 ve ilgili ikincil
          mevzuata tabidir. Uygun güvenceler ve bildirim yükümlülükleri bakımından somut hizmet sağlayıcı
          sözleşmelerinizi güncel tutmanız önerilir.
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">5. Saklama süresi</h3>
        <p>
          E-posta iletişimi, amacın gerektirdiği süre ve zamanaşımı süreleriyle sınırlı tutulur. Teknik logların saklama
          süresi barındırma sağlayıcısının politikalarına bağlıdır.
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">6. İlgili kişi hakları (KVKK m. 11)</h3>
        <p>
          Haklarınızı kullanmak için yukarıdaki e-posta adresine başvurabilirsiniz. Başvurunuza en geç otuz gün içinde
          yanıt verilir. Şikâyet hakkınız saklıdır.
        </p>
      </section>
    </article>
  )
}

function PrivacyEn() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-white/80">
      <p className="text-white/50">
        Last updated: April 16, 2026. This text is for general information and is not legal advice.
      </p>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">1. Data controller</h3>
        <p>
          Controller of this website: <strong className="text-white">Hüseyin Emre</strong> (personal portfolio). Contact:{' '}
          <a className="text-cyan-300 underline" href="mailto:huseyinemre.tech@gmail.com">
            huseyinemre.tech@gmail.com
          </a>
          .
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">2. Data processed and purposes</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Hosting traffic:</strong> Technical data such as IP address and timestamps
            may be processed by the hosting provider (e.g. GitHub Pages) under applicable telecom/content laws.
          </li>
          <li>
            <strong className="text-white">GitHub API:</strong> The projects section fetches public repositories; requests
            may reach GitHub (possibly outside Türkiye).
          </li>
          <li>
            <strong className="text-white">Google Fonts (optional):</strong> Fonts load from Google only if you choose
            “Accept all” in the cookie banner.
          </li>
          <li>
            <strong className="text-white">Email:</strong> If you email us, we process what you send to respond to your
            request.
          </li>
        </ul>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">3. Legal bases</h3>
        <p>
          Processing relies on legitimate interests, pre-contractual steps / performance where applicable, consent for
          Google Fonts, and legal obligations where applicable, in line with Turkish law (KVKK).
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">4. Transfers</h3>
        <p>
          GitHub/Google may involve transfers abroad subject to KVKK Article 9 and related rules. Keep your vendor
          documentation up to date.
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">5. Retention</h3>
        <p>
          Emails are kept only as long as needed for the purpose and applicable limitation periods. Hosting logs follow
          provider policies.
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-white">6. Your rights</h3>
        <p>
          You may exercise your KVKK rights by contacting the email above. We respond within thirty days where
          applicable.
        </p>
      </section>
    </article>
  )
}
