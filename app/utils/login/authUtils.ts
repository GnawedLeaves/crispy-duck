"use server";
import { UserContext, UserProfile } from "@/app/types/authTypes";
import { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createClient } from "../supabase/server";
export interface UpdateProfilePayload {
  userId: string;
  display_name: string;
  bio: string;
  sex: string;
  birthday: string;
}
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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // convert error to plain object (Error objects can't be serialized will cause error in console)
  if (error) {
    return {
      data: null,
      error: {
        message: error.message,
        code: error.code,
        status: error.status,
      },
    };
  }

  if (data.user?.id) {
    const profileResult = await createUserProfile(
      data.user.id,
      display_name,
      birthday,
      sex,
    );

    if (profileResult.error) {
      return {
        data: null,
        error: profileResult.error,
      };
    }
  }

  return { data, error: null };
};

export const loginActionWithEmail = async (email: string, password: string) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  // then login info will be store in cookies

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code, status: error.status },
    };
  }

  console.log("login data", { data });
  return {
    data,
    error: null,
  };
};

const getUserProfile = async (user: User): Promise<UserProfile> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as UserProfile;
};

export const getUserContext = async (): Promise<UserContext> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const profile = await getUserProfile(user);

  return {
    profile: profile,
    ...user,
    isLoggedIn: true,
  };
};
export const updateUserProfile = async ({
  userId,
  display_name,
  bio,
  sex,
  birthday,
}: UpdateProfilePayload) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name,
      bio,
      sex,
      birthday,
    })
    .eq("id", userId);

  if (error) {
    return {
      data: null,
      error: {
        message: error.message,
        code: error.code,
      },
    };
  }

  return { data, error: null };
};
export const createUserProfile = async (
  userId: string,
  display_name: string,
  birthday: string,
  sex: string,
  // displayName: string,
) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("profiles").insert([
    {
      id: userId,
      display_name,
      birthday,
      sex,
      // display_name: displayName,
    },
  ]);

  if (error) {
    return {
      data: null,
      error: {
        message: error.message,
        code: error.code,
      },
    };
  }

  return { data, error: null };
};

export const signOutAction = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  console.log("signing out");
  await supabase.auth.signOut();
  // await supabase.auth.signOut({ scope: 'local' })
};

export const signUpAsGuestAction = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Error signing in as guest");
    return {
      data: null,
      error: { message: error.message, code: error.code, status: error.status },
    };
  }
  return {
    data,
    error: null,
  };
};
