import { AuthError, Session, User } from "@supabase/supabase-js";
import { TremorLineGraphColor } from "./commonTypes";

export interface UserSignUpNewEmailProps {
  email: string;
  password: string;
}

export interface UserSignUpNewEmailRes {
  data: UserSignUpDataRes;
  error: AuthError | null;
}

export interface UserSignUpDataRes {
  user: User | null;
  session: Session | null;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  birthday: string;
  sex?: "M" | "F" | "NA";
  graphColor?: TremorLineGraphColor;
}

//main User type
export interface ExtendedUser extends User {
  profile: UserProfile | null;
  isLoggedIn: boolean;
}

// export interface LoggedOutUser {
//   isLoggedIn: false;
// }

export type UserContext = ExtendedUser | null;
