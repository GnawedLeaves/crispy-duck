"use client";

import { useState, useEffect, useRef } from "react"; // 1. Imported useRef
import { UserContext } from "@/app/types/authTypes";
import CustomModal from "../modal/customModal";
import Image from "next/image";
import { BirthdayPicker } from "../birthdayPicker/BirthdayPicker";
import {
  updateUserProfile,
  checkUsernameAvailability,
  uploadAvatar,
} from "@/app/utils/login/authUtils";
import { useAuth } from "@/app/context/AuthContext";
import { NativeBirthdayPicker } from "../birthdayPicker/NativeBirthdayPicker";
import { token } from "@/app/theme";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && existingUser?.profile) {
      setDisplayName(existingUser.profile.display_name || "");
      setUsername(existingUser.profile.username || "");
      setBio(existingUser.profile.bio || "");
      setSex(existingUser.profile.sex || "NA");
      setBirthday(existingUser.profile.birthday || "");
      setUsernameStatus("idle");
      setAvatarFile(null);
      setAvatarPreview(null);
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
      let avatarUrl = existingUser.profile?.avatar_url ?? null;

      if (avatarFile) {
        const { url, error: uploadError } = await uploadAvatar(
          existingUser.id,
          avatarFile,
        );
        if (uploadError) {
          setFormError(uploadError.message);
          setIsSubmitting(false);
          return;
        }
        avatarUrl = url;
      }

      const { error } = await updateUserProfile({
        userId: existingUser.id,
        display_name: displayName,
        username,
        bio,
        sex,
        birthday,
        avatar_url: avatarUrl, // make sure updateUserProfile accepts/writes this column
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
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be under 5MB.");
      return;
    }

    setFormError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
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
          <div
            className="relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image
              src={
                avatarPreview ||
                existingUser?.profile?.avatar_url ||
                "/default-avatar.png"
              }
              alt="profile_picture"
              width={100}
              height={100}
              className="rounded-full object-cover w-[100px] h-[100px] border-2 border-black"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
              Change
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
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
            maxLength={15}
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
            <span
              className="text-xs  ml-1"
              style={{ color: token.light.greenColor }}
            >
              Username available
            </span>
          )}
          {usernameStatus === "taken" && (
            <span
              className="text-xs  ml-1"
              style={{ color: token.light.redColor }}
            >
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
          <NativeBirthdayPicker
            value={birthday}
            onChange={(dateString) => setBirthday(dateString)}
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
