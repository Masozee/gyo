import { EmailFolderPage } from "@/components/email-folder-page"

export default function DraftsPage() {
  return (
    <EmailFolderPage 
      title="Drafts" 
      folder="drafts"
      emptyMessage="No drafts"
      emptySubMessage="Your draft emails will appear here"
    />
  )
}