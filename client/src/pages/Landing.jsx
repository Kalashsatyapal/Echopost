export default function Landing() {
  return (
    <div className="h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-end items-center p-6">
        <a
          href="/login"
          className="px-4 py-2 mr-4 bg-white text-blue-600 rounded-lg shadow hover:bg-blue-100 transition"
        >
          Login
        </a>
        <a
          href="/register"
          className="px-4 py-2 bg-white text-purple-600 rounded-lg shadow hover:bg-purple-100 transition"
        >
          Register
        </a>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-5xl font-bold mb-4">Welcome to EchoPost</h1>
        <p className="mb-6 text-lg">A modern MERN app with user authentication</p>
        <a
          href="/login"
          className="px-6 py-2 bg-white text-blue-600 rounded-lg shadow-md hover:bg-blue-100 transition"
        >
          Get Started
        </a>
      </main>
    </div>
  );
}
