"use client";

import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { getUserContext } from "@/app/utils/login/authUtils";
import { ExtendedUser, UserContext } from "../types/authTypes";
import femaleDefaultAvatar from "../assets/default_profile_pic_female.png";
import maleDefaultAvatar from "../assets/default_profile_pic_male.png";
import naDefaultAvatar from "../assets/default_profile_pic_NA.png";
interface AuthContextType {
  user: UserContext | undefined;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAnonymous: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserContext>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const checkForProfilePicture = (user: UserContext) => {
    if (!user || !user.profile) {
      return user;
    }
    let defaultProfilePic;
    if (user?.profile?.avatar_url) {
      return user;
    } else if (user?.profile?.sex === "M") {
      defaultProfilePic = maleDefaultAvatar.src;
    } else if (user?.profile?.sex === "F") {
      defaultProfilePic = femaleDefaultAvatar.src;
    } else {
      defaultProfilePic = naDefaultAvatar.src;
    }
    const newUserWithProfilePic: UserContext = {
      ...user,
      profile: {
        ...user?.profile,
        avatar_url: defaultProfilePic,
      },
    };
    return newUserWithProfilePic;
  };

  // Fetch user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const user = await getUserContext();
        const userWithAvatar = checkForProfilePicture(user);
        setUser(userWithAvatar);
        setIsLoggedIn(isLoggedIn);
        setIsAnonymous(userWithAvatar?.is_anonymous ?? false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(undefined);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const user = await getUserContext();
      const userWithAvatar = checkForProfilePicture(user);
      setUser(userWithAvatar);
      setIsLoggedIn(isLoggedIn);
      setIsAnonymous(userWithAvatar?.is_anonymous ?? false);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        isAnonymous,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
