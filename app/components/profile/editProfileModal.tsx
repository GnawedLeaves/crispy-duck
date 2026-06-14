"use client";

import { useState, useEffect } from "react";
import { UserContext } from "@/app/types/authTypes";
import CustomModal from "../modal/customModal";
import Image from "next/image";

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  existingUser?: UserContext;
}

const EditProfileModal = ({
  isOpen,
  onClose,
  existingUser,
}: EditProfileProps) => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [sex, setSex] = useState("NA");

  useEffect(() => {
    if (isOpen && existingUser?.profile) {
      setUsername(existingUser.profile.username || "");
      setBio(existingUser.profile.bio || "");
      setSex(existingUser.profile.sex || "");
    }
  }, [isOpen, existingUser]);

  // 3. Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Your Supabase update logic will go here
      console.log("Submitting updated profile:", { username, bio, sex });

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleModalActionClick = () => {};
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={"Edit Profile"}
      modalType="action"
      closeButtonText="Cancel"
      actionButtonText="Save"
      onActionClick={handleModalActionClick}
    >
      <form
        onSubmit={handleSubmit}
        className="flexCenter flex-col gap-4  p-4 rounded-xl"
      >
        {existingUser?.profile?.avatar_url && (
          <Image
            src={existingUser.profile.avatar_url}
            alt="profile_picture"
            width={100}
            height={100}
            className="rounded-full"
          />
        )}

        <input
          type="text"
          placeholder="Username"
          className="signUpFormField w-full"
          maxLength={30}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <textarea
          placeholder="Bio"
          className="signUpFormField w-full text-black"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <select
          className="w-full signUpFormField"
          value={sex}
          onChange={(e) => setSex(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Sex
          </option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="NA">Prefer not to say</option>
        </select>
        <button></button>
      </form>
    </CustomModal>
  );
};

export default EditProfileModal;
