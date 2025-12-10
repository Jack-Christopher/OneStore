export const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="bg-card p-8 rounded-2xl shadow-md text-center border border-border">
        <h1 className="text-4xl font-bold mb-4 text-card-foreground">404</h1>
        <p className="text-lg mb-6 text-card-foreground">Página no encontrada</p>
        <a href="/" className="text-primary hover:underline">Volver al inicio</a>
      </div>
    </div>
  )
}
