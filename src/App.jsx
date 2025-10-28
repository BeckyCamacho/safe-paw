<nav className="text-sm flex gap-4 items-center relative">
  <Link to="/">Inicio</Link>
  <Link to="/caregivers">Cuidadores</Link>

  {!authLoading && user ? (
    <>
      {/* Mis reservas (sin badge) */}
      <Link to="/my-bookings">Mis reservas</Link>

      {/* Mi perfil */}
      <Link to="/profile" className="hover:underline">
        Mi perfil
      </Link>

      {/* Solicitudes (con badge de pendientes del cuidador) */}
      <Link to="/requests" className="relative">
        Solicitudes
        {pending > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {pending > 99 ? "99+" : pending}
          </span>
        )}
      </Link>

      {/* Usuario y salir */}
      <span className="text-gray-500 hidden sm:inline">({user.email})</span>
      <button
        onClick={signOut}
        className="border rounded px-2 py-1 hover:bg-gray-100"
      >
        Salir
      </button>
    </>
  ) : (
    <>
      <Link to="/signin">Entrar</Link>
      <Link to="/signup">Registrarse</Link>
    </>
  )}
</nav>
