import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Phone, ShieldAlert, Siren } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EmergencyContacts() {
  return (
    <Alert variant="destructive" className="mb-4 theme-safety:animate-glow">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Emergency Detected</AlertTitle>
      <AlertDescription>
        <p className="mb-2 font-semibold">If you are in immediate danger, please contact emergency services.</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 mt-2">
            <a href="tel:100" className="flex items-center gap-2 hover:underline font-medium">
                <Siren className="h-5 w-5" />
                <span>Police: 100</span>
            </a>
            <a href="tel:101" className="flex items-center gap-2 hover:underline font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                <span>Fire: 101</span>
            </a>
            <a href="tel:102" className="flex items-center gap-2 hover:underline font-medium">
                <Phone className="h-5 w-5" />
                <span>Ambulance: 102</span>
            </a>
        </div>
      </AlertDescription>
    </Alert>
  )
}
