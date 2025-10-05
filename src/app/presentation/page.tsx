import { redirect } from 'next/navigation'
import { i18n } from '../../../i18n/request'

export default function PresentationRedirect() {
  redirect(`/${i18n.defaultLocale}/presentation`)
}
