import { useState, useRef } from "react";
import { LogOutIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { getAvatarUrl } from "../lib/avatar";
import { compressImage } from "../lib/imageUtils";

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64Image = await compressImage(file, 800, 800, 0.85);
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    } catch (error) {
      console.error("Profile image upload failed:", error);
    }
  };

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || getAvatarUrl(authUser.profilePic, authUser.fullName)}
                alt="User image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
              {authUser.fullName}
            </h3>

            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        <button
          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-colors"
          title="Logout"
          onClick={logout}
        >
          <LogOutIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
export default ProfileHeader;