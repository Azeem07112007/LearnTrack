import { createFileRoute } from "@tanstack/react-router";
import { QuizPage } from "../components/learntrack/pages";
export const Route=createFileRoute("/quiz")({head:()=>({meta:[{title:"Quiz Workspace — LearnTrack"},{name:"description",content:"Practice computer science modules and complete live assessments."},{property:"og:title",content:"Quiz Workspace — LearnTrack"},{property:"og:description",content:"Practice computer science modules and complete live assessments."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:QuizPage});
