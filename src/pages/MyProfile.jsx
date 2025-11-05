import { useAuth } from "../context/AuthProvider.jsx";

export default function MyProfile() {
  const { user } = useAuth();

  return (
    <section className="grid gap-2">
      <h2 className="text-2xl font-semibold">Mi perfil</h2>
      {user ? (
        <div className="grid gap-1">
          <div><b>Nombre:</b> {user.displayName ?? "(sin nombre)"}</div>
          <div><b>Correo:</b> {user.email}</div>
          <div><b>UID:</b> {user.uid}</div>
        </div>
      ) : (
        <p>No hay usuario.</p>
      )}
    </section>
  );
}
