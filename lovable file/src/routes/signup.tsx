import { createFileRoute } from '@tanstack/react-router'
import { SignupPage } from '../components/learntrack/pages'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})
