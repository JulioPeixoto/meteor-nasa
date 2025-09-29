export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Hello World
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to your Next.js app with React and Tailwind CSS
        </p>
        <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
          Get Started
        </div>
      </div>
    </main>
  )
}
