export const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">Página no encontrada</p>
        <a href="/" className="text-blue-600 hover:underline">Volver al inicio</a>
      </div>
    </div>
  )
}
