import { Header } from '@/components/layout/header'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container max-w-screen-2xl p-4 md:p-8 mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
