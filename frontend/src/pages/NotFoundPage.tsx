export const NotFoundPage = () => {
  return (
    <div className="auth-page flex items-center justify-center h-screen">
      <div className="auth-card p-8 rounded-2xl shadow-md text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">Página no encontrada</p>
        <a href="/">Volver al inicio</a>
      </div>
    </div>
  )
}
