"use client";

import { useState, useEffect, useRef } from "react"; // 1. Imported useRef
import { UserContext } from "@/app/types/authTypes";
import CustomModal from "../modal/customModal";
import Image from "next/image";
import { BirthdayPicker } from "../birthdayPicker/BirthdayPicker";
import { updateUserProfile } from "@/app/utils/login/authUtils";
import { useAuth } from "@/app/context/AuthContext";

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
  const { refreshUser } = useAuth();

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [sex, setSex] = useState("NA");
  const [birthday, setBirthday] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && existingUser?.profile) {
      setDisplayName(existingUser.profile.display_name || "");
      setBio(existingUser.profile.bio || "");
      setSex(existingUser.profile.sex || "NA");
      setBirthday(existingUser.profile.birthday || "");
    }
  }, [isOpen, existingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingUser?.id) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const { error } = await updateUserProfile({
        userId: existingUser.id,
        display_name: displayName,
        bio,
        sex,
        birthday,
      });

      if (error) {
        setFormError(error.message);
      } else {
        await refreshUser();
        onClose();
      }
    } catch (err) {
      setFormError("An unexpected error occurred while saving.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalActionClick = () => {
    if (submitButtonRef.current) {
      submitButtonRef.current.click();
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={"Edit Profile"}
      modalType="action"
      closeButtonText="Cancel"
      actionButtonText={isSubmitting ? "Saving..." : "Save"}
      onActionClick={handleModalActionClick}
    >
      <form
        onSubmit={handleSubmit}
        className="flexCenter flex-col gap-4 p-4 rounded-xl"
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
          maxLength={15}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <textarea
          placeholder="Bio"
          className="signUpFormField w-full text-black"
          value={bio}
          maxLength={30}
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

        <BirthdayPicker
          value={birthday}
          onChange={(dateString) => setBirthday(dateString)}
          className={"signUpFormField"}
        />

        {formError && (
          <div className="text-red-500 text-sm mt-2">{formError}</div>
        )}

        <button
          type="submit"
          ref={submitButtonRef}
          style={{ display: "none" }}
        />
      </form>
    </CustomModal>
  );
};

export default EditProfileModal;
