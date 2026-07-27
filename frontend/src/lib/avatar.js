/**
 * Returns a profile picture URL. If none exists (or if it is the legacy gray fallback),
 * generates an avatar image containing the initials of words in the user's name.
 */
export function getAvatarUrl(profilePic, fullName) {
  if (profilePic && profilePic.trim() !== "" && profilePic !== "/avatar.png") {
    return profilePic;
  }
  const name = fullName || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=256&bold=true`;
}
