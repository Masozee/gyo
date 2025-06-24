import { EmailFolderPage } from "@/components/email-folder-page"

export default function ArchivePage() {
  return (
    <EmailFolderPage 
      title="Archive" 
      folder="archive"
      emptyMessage="No archived emails"
      emptySubMessage="Archived emails will appear here"
    />
  )
}