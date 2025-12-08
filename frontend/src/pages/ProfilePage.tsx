import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { BriefcaseBusiness, Mail, User, Activity, Edit2, Save, X } from "lucide-react";
import { Button, TextField, Box, Alert, Snackbar } from "@mui/material";

export const ProfilePage = () => {
  const { authUser, updateUserProfile, loading } = useAuthStore();
  const user = authUser?.user;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleEdit = () => {
    setFormData({
      fullname: user?.fullname || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullname: user?.fullname || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.fullname.trim()) {
      setSnackbar({
        open: true,
        message: "El nombre completo es requerido",
        severity: 'error',
      });
      return;
    }

    if (!formData.email.trim()) {
      setSnackbar({
        open: true,
        message: "El email es requerido",
        severity: 'error',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSnackbar({
        open: true,
        message: "El email no es válido",
        severity: 'error',
      });
      return;
    }

    // Password validation (only if password is provided)
    if (formData.password) {
      if (formData.password.length < 6) {
        setSnackbar({
          open: true,
          message: "La contraseña debe tener al menos 6 caracteres",
          severity: 'error',
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setSnackbar({
          open: true,
          message: "Las contraseñas no coinciden",
          severity: 'error',
        });
        return;
      }
    }

    try {
      const payload: any = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
      };

      // Only include password if it was provided
      if (formData.password) {
        payload.password = formData.password;
      }

      await updateUserProfile(payload);
      
      setSnackbar({
        open: true,
        message: "Perfil actualizado exitosamente",
        severity: 'success',
      });
      
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error al actualizar el perfil",
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return (
      <div className="p-6">
        <p>No se ha encontrado información del usuario.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white overflow-hidden shadow rounded-lg border">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Perfil de Usuario
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {isEditing ? "Edita tu información personal" : "Esta es información sobre el usuario."}
            </p>
          </div>
          {!isEditing && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Edit2 size={20} />}
              onClick={handleEdit}
            >
              Editar Perfil
            </Button>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            {/* Full Name */}
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <User className="inline-block mr-2 mb-1" size={16} />
                Nombre completo
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.fullname}
                    onChange={handleChange('fullname')}
                    placeholder="Nombre completo"
                  />
                ) : (
                  user.fullname
                )}
              </dd>
            </div>

            {/* Email */}
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="inline-block mr-2 mb-1" size={16} />
                Dirección de correo electrónico
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="Email"
                  />
                ) : (
                  user.email
                )}
              </dd>
            </div>

            {/* Password (only when editing) */}
            {isEditing && (
              <>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    Nueva contraseña
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      value={formData.password}
                      onChange={handleChange('password')}
                      placeholder="Dejar vacío para no cambiar"
                      helperText="Deja vacío si no deseas cambiar la contraseña"
                    />
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    Confirmar contraseña
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      placeholder="Confirmar nueva contraseña"
                    />
                  </dd>
                </div>
              </>
            )}

            {/* Role (read-only) */}
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <BriefcaseBusiness className="inline-block mr-2 mb-1" size={16} />
                Rol
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.role}
              </dd>
            </div>

            {/* Status (read-only) */}
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Activity className="inline-block mr-2 mb-1" size={16} />
                Estado
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.isActive ? "Activo" : "Inactivo"}
              </dd>
            </div>
          </dl>

          {/* Action Buttons */}
          {isEditing && (
            <div className="px-4 py-4 sm:px-6 flex gap-2 justify-end border-t border-gray-200">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<X size={20} />}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save size={20} />}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};
