import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "../components/learntrack/pages";
export const Route=createFileRoute("/login")({head:()=>({meta:[{title:"Sign in — LearnTrack"},{name:"description",content:"Sign in to the LearnTrack academic portal."},{property:"og:title",content:"Sign in — LearnTrack"},{property:"og:description",content:"Sign in to the LearnTrack academic portal."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:LoginPage});
