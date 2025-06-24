import { EmailFolderPage } from "@/components/email-folder-page"

export default function StarredPage() {
  return (
    <EmailFolderPage 
      title="Starred" 
      folder="inbox"
      starred={true}
      emptyMessage="No starred emails"
      emptySubMessage="Star important emails to find them here"
    />
  )
}