import { useAuthStore } from "@/store/authStore"

export const ProfilePage = () => {
  const user = useAuthStore.getState().authUser?.user;
  console.log("user", user);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
    </div>
  )
}
