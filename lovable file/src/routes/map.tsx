import { createFileRoute } from "@tanstack/react-router";
import { MapPage } from "../components/learntrack/pages";
export const Route=createFileRoute("/map")({head:()=>({meta:[{title:"Curriculum Map — LearnTrack"},{name:"description",content:"Track course units, topics, prerequisites, and mastery progress."},{property:"og:title",content:"Curriculum Map — LearnTrack"},{property:"og:description",content:"Track course units, topics, prerequisites, and mastery progress."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:MapPage});
