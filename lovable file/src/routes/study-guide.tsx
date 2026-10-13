import { createFileRoute } from '@tanstack/react-router'
import { StudyGuidePage } from '../components/learntrack/pages'

export const Route = createFileRoute('/study-guide')({
  component: StudyGuidePage,
})
