interface UseFriendControllerProps {
  senderId: string;
  recieverId: string;
}

const useFriendController = ({
  senderId,
  recieverId,
}: UseFriendControllerProps) => {
  const sendFriendRequest = () => {};
  const acceptFriendRequest = () => {};
  const rejectFriendRequest = () => {};
  const cancelFriendRequest = () => {};

  return {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
  };
};

export default useFriendController;
