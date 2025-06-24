import { EmailFolderPage } from "@/components/email-folder-page"

export default function SpamPage() {
  return (
    <EmailFolderPage 
      title="Spam" 
      folder="spam"
      emptyMessage="No spam emails"
      emptySubMessage="Spam emails will appear here"
    />
  )
}