import { permanentRedirect } from 'next/navigation'

export default function LoginPage() {
  permanentRedirect('/auth?tab=signin')
}
