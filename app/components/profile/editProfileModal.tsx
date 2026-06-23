"use client";

import { useState, useEffect, useRef } from "react"; // 1. Imported useRef
import { UserContext } from "@/app/types/authTypes";
import CustomModal from "../modal/customModal";
import Image from "next/image";
import { BirthdayPicker } from "../birthdayPicker/BirthdayPicker";
import {
  updateUserProfile,
  checkUsernameAvailability,
} from "@/app/utils/login/authUtils";
import { useAuth } from "@/app/context/AuthContext";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const USERNAME_MIN_LENGTH = 7;

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  existingUser?: UserContext;
}

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

const EditProfileModal = ({
  isOpen,
  onClose,
  existingUser,
}: EditProfileProps) => {
  const { refreshUser } = useAuth();

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [bio, setBio] = useState("");
  const [sex, setSex] = useState("NA");
  const [birthday, setBirthday] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && existingUser?.profile) {
      setDisplayName(existingUser.profile.display_name || "");
      setUsername(existingUser.profile.username || "");
      setBio(existingUser.profile.bio || "");
      setSex(existingUser.profile.sex || "NA");
      setBirthday(existingUser.profile.birthday || "");
      setUsernameStatus("idle");
    }
  }, [isOpen, existingUser]);

  useEffect(() => {
    const currentUsername = existingUser?.profile?.username || "";

    if (
      !username ||
      username === currentUsername ||
      username.length < USERNAME_MIN_LENGTH
    ) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    const timeoutId = setTimeout(async () => {
      try {
        const { available, error } = await checkUsernameAvailability(
          username,
          existingUser?.id,
        );
        setUsernameStatus(error ? "error" : available ? "available" : "taken");
      } catch (err) {
        setUsernameStatus("error");
        console.error(err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, existingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingUser?.id) return;

    if (usernameStatus === "taken") {
      setFormError("That username is already taken.");
      return;
    }
    if (username.length < USERNAME_MIN_LENGTH) {
      setFormError(
        `Username must be at least ${USERNAME_MIN_LENGTH} characters.`,
      );
      return;
    }

    if (!USERNAME_REGEX.test(username)) {
      setFormError(
        "Username can only contain letters, numbers, and underscores.",
      );
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const { error } = await updateUserProfile({
        userId: existingUser.id,
        display_name: displayName,
        username,
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

        <div className="w-full flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Display Name</label>
          <input
            type="text"
            placeholder="Display Name"
            className="signUpFormField w-full"
            maxLength={15}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Username</label>
          <input
            type="text"
            placeholder="Username"
            className="signUpFormField w-full"
            maxLength={20}
            value={username}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
              setUsername(sanitized);
            }}
            required
          />
          {usernameStatus === "checking" && (
            <span className="text-xs text-gray-400 ml-1">
              Checking availability...
            </span>
          )}
          {usernameStatus === "available" && (
            <span className="text-xs text-green-500 ml-1">
              Username available
            </span>
          )}
          {usernameStatus === "taken" && (
            <span className="text-xs text-red-500 ml-1">
              Username already taken
            </span>
          )}
          {usernameStatus === "error" && (
            <span className="text-xs text-red-500 ml-1">
              Couldn&apos;t check username right now
            </span>
          )}
          {username.length > 0 &&
            username.length < USERNAME_MIN_LENGTH &&
            usernameStatus === "idle" && (
              <span className="text-xs text-red-500 ml-1">
                Username must be at least {USERNAME_MIN_LENGTH} characters
              </span>
            )}
        </div>

        <div className="w-full flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Bio</label>
          <textarea
            placeholder="Bio"
            className="signUpFormField w-full text-black"
            value={bio}
            maxLength={30}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Sex</label>
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
        </div>

        <div className="w-full flex flex-col gap-1">
          <label className="text-xs text-gray-400 ml-1">Birthday</label>
          <BirthdayPicker
            value={birthday}
            onChange={(dateString) => setBirthday(dateString)}
            className={"signUpFormField"}
          />
        </div>

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
