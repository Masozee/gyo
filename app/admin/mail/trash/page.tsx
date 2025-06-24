import { EmailFolderPage } from "@/components/email-folder-page"

export default function TrashPage() {
  return (
    <EmailFolderPage 
      title="Trash" 
      folder="trash"
      emptyMessage="No deleted emails"
      emptySubMessage="Deleted emails will appear here"
    />
  )
}