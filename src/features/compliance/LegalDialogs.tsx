import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useTranslation } from '@/features/localization/LanguageContext'
import { useLegalNotice } from '@/features/compliance/LegalNoticeContext'
import { PrivacyPolicyContent } from '@/features/compliance/PrivacyPolicyContent'
import { CookiePolicyContent } from '@/features/compliance/CookiePolicyContent'
import { cn } from '@/shared/lib/utils'

export function LegalDialogs() {
  const { lang, t } = useTranslation()
  const { panel, closePanel } = useLegalNotice()
  const open = panel !== null

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) closePanel()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2100] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[2101] max-h-[min(90vh,900px)] w-[min(100vw-2rem,720px)] -translate-x-1/2 -translate-y-1/2',
            'rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 shadow-2xl outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-white">
              {panel === 'cookies' ? t('footer-cookies') : t('footer-privacy')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={t('legal-close')}
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            {panel === 'cookies' ? t('footer-cookies') : t('footer-privacy')}
          </Dialog.Description>
          <div className="max-h-[calc(min(90vh,900px)-5rem)] overflow-y-auto pr-1">
            {panel === 'privacy' ? <PrivacyPolicyContent lang={lang} /> : null}
            {panel === 'cookies' ? <CookiePolicyContent lang={lang} /> : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
