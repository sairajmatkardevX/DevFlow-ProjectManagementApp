// app/page.tsx - Simple public landing page
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center max-w-2xl mx-auto p-8">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DevFlow
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Streamline your projects, collaborate with your team, and deliver exceptional results.
        </p>
        <div className="flex gap-4 justify-center">
          <a 
            href="/auth/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
          <a 
            href="/auth/register" 
            className="px-6 py-3 border border-border bg-white text-foreground rounded-lg font-semibold hover:bg-accent transition-colors"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}