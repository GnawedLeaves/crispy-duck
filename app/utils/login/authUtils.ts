"use server";
import { UserContext, UserProfile } from "@/app/types/authTypes";
import { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createClient } from "../supabase/server";
import { generateRandomUsername } from "./utils";

export interface UpdateProfilePayload {
  userId: string;
  display_name: string;
  bio: string;
  sex: string;
  birthday: string;
  username: string;
  avatar_url: string | null;
}

// ---------------------------------------------------------------------------
// STEP 1 — Create the Supabase auth account (email + password only)
// Call this at the end of the email/password pages in the wizard.
// ---------------------------------------------------------------------------
export const createAccountAction = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code, status: error.status },
    };
  }

  return { data, error: null };
};

// ---------------------------------------------------------------------------
// STEP 2 — Create the user's profile row (display_name, birthday, sex, …)
// Call this when the user completes the profile pages in the wizard.
// The user is already authenticated at this point (session exists from step 1).
//
// If a user drops off mid-wizard, their profile row won't exist yet.
// On next login, check `profile === null` and redirect them back to the
// profile step (page 3 in your wizard).
// ---------------------------------------------------------------------------

export const createProfileAction = async ({
  display_name,
  birthday,
  sex,
}: {
  display_name: string;
  birthday: string;
  sex: string;
}) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: {
        message: "Not authenticated. Please sign in again.",
        code: "NOT_AUTHENTICATED",
      },
    };
  }

  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const username = generateRandomUsername();

    const { data, error } = await supabase.from("profiles").insert([
      {
        id: user.id,
        display_name,
        username,
        birthday,
        sex,
      },
    ]);

    if (!error) {
      return { data, error: null };
    }

    // 23505 = unique_violation in Postgres — username collision, try again
    if (error.code === "23505") {
      continue;
    }

    // Any other error is a real failure, bail out immediately
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: null,
    error: {
      message: "Could not generate a unique username. Please try again.",
      code: "USERNAME_GENERATION_FAILED",
    },
  };
};
// ---------------------------------------------------------------------------
// Kept for backwards compat — prefer createAccountAction + createProfileAction
// ---------------------------------------------------------------------------
/** @deprecated Use createAccountAction then createProfileAction instead */
export const signUpAction = async ({
  email,
  password,
  display_name,
  birthday,
  sex,
}: {
  email: string;
  password: string;
  display_name: string;
  birthday: string;
  sex: string;
}) => {
  const accountResult = await createAccountAction({ email, password });
  if (accountResult.error) return accountResult;

  const profileResult = await createProfileAction({
    display_name,
    birthday,
    sex,
  });
  if (profileResult.error) return { data: null, error: profileResult.error };

  return { data: accountResult.data, error: null };
};

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export const loginActionWithEmail = async (email: string, password: string) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code, status: error.status },
    };
  }

  return { data, error: null };
};

// ---------------------------------------------------------------------------
// Profile helpers
// ---------------------------------------------------------------------------
const getUserProfile = async (user: User): Promise<UserProfile | null> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null; // profile doesn't exist yet (mid-wizard drop-off)
  return profile as UserProfile;
};

export const getUserContext = async (): Promise<UserContext> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const profile = await getUserProfile(user);

  return {
    profile, // null if they dropped off mid-wizard — check this on login
    ...user,
    isLoggedIn: true,
  };
};

export const updateUserProfile = async ({
  userId,
  display_name,
  username,
  bio,
  sex,
  birthday,
  avatar_url,
}: UpdateProfilePayload) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name, username, bio, sex, birthday, avatar_url })
    .eq("id", userId);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data, error: null };
};

export const checkUsernameAvailability = async (
  username: string,
  currentUserId?: string,
) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase.from("profiles").select("id").eq("username", username);

  if (currentUserId) {
    query = query.neq("id", currentUserId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return {
      available: false,
      error: { message: error.message, code: error.code },
    };
  }

  return { available: !data, error: null };
};

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
export const signOutAction = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
};

// ---------------------------------------------------------------------------
// Guest sign-in
// ---------------------------------------------------------------------------
export const signUpAsGuestAction = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code, status: error.status },
    };
  }

  return { data, error: null };
};

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_SIZE_MB = 5;

export async function uploadAvatar(userId: string, file: File) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!file.type.startsWith("image/")) {
    return { url: null, error: { message: "Please select an image file." } };
  }
  if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
    return {
      url: null,
      error: { message: `Image must be under ${MAX_AVATAR_SIZE_MB}MB.` },
    };
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  // cache-bust so the new image shows immediately instead of a stale CDN copy
  return { url: `${data.publicUrl}?t=${Date.now()}`, error: null };
}
