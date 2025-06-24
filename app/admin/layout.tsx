export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="font-sans min-h-screen">
      {children}
    </div>
  )
}