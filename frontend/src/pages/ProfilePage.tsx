import { useAuthStore } from "@/store/authStore"
import { BriefcaseBusiness, Mail, User, Activity } from "lucide-react";

export const ProfilePage = () => {
  const user = useAuthStore.getState().authUser?.user;
  console.log("user", user);


  return (
    <div className="p-6">
      {user ? (
        <div className="bg-white overflow-hidden shadow rounded-lg border">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Perfil de Usuario
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Esta es información sobre el usuario.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  <User className="inline-block mr-2 mb-1" size={16} />
                  Nombre completo
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.fullname}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  <Mail className="inline-block mr-2 mb-1" size={16} />
                  Dirección de correo electrónico
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.email}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  <BriefcaseBusiness className="inline-block mr-2 mb-1" size={16} />
                  Rol
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.role}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  <Activity className="inline-block mr-2 mb-1" size={16} />
                  Estado
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.isActive ? "Activo" : "Inactivo"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <p>No se ha encontrado información del usuario.</p>
      )}
    </div>
  )
}
