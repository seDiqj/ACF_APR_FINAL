import { UserAvatarInterface } from "@/interfaces/Interfaces";

const UserAvatar = (props: UserAvatarInterface) => {
  const makeUserHash = (userName: string) => {
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const hashToColor = (userName: string) => {
    const hash = makeUserHash(userName);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getUserNameFirstLitter = (userName: string) => {
    return userName.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full text-white hover:cursor-default`}
      style={{ backgroundColor: hashToColor(props.userName) }}
    >
      {getUserNameFirstLitter(props.userName)}
    </div>
  );
};

export default UserAvatar;
