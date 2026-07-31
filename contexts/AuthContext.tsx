import { AuthContextType, User } from '@/@types/auth';
import { API_BASE_URL } from '@/constants/Config';
import { registerForPushNotificationsAsync, savePushTokenToServer } from '@/services/pushNotificationService';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import Toast from "react-native-toast-message";

// Context To pass variables 
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => { },
  logout: async () => { },
  loading: true,
  clearUser: () => { },
  updateUserPolicyStatus: async () => { },
  updateUser: async () => { },
  refreshUser: async () => undefined,
  changePassword: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Activate user session
  const activateSession = async (userId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/login.php`, {
        update_session: true,
        user_id: userId
      });
      //console.log('Session activated for user:', userId);
    } catch (error) {
      console.error('Error activating session:', error);
    }
  };

  // Remove user session
  const removeSession = async (userId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/logout.php`, {
        user_id: userId
      });
      //console.log('Session removed for user:', userId);
    } catch (error) {
      console.error('Error removing session:', error);
    }
  };

  // Load user from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          //console.log("User loaded from storage:", parsedUser.id);

          // Set loading to false immediately after setting the user
          // This allows the app to render the main content without waiting for background tasks
          setLoading(false);

          // Perform background tasks without awaiting them (non-blocking)
          activateSession(parsedUser.id).catch(err => console.error('Background session activation failed:', err));

          // Register push notifications in background
          registerForPushNotificationsAsync().then(async (pushToken) => {
            if (pushToken) {
              await savePushTokenToServer(parsedUser.id, pushToken);
            }
          }).catch(error => {
            console.error('Error registering push notifications on app start:', error);
          });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Listen for AppState changes to re-query backend database live whenever app comes to foreground
  useEffect(() => {
    if (!user?.id) return;

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        refreshUser();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user?.id]);

  const login = async (userData: User) => {
    // Prevent login if account is deactivated
    if (userData.account_status === "Deactivated" || userData.account_status === "deactivated") {
      console.warn("Login failed: Account is deactivated.");
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Your account has been deactivated",
        position: "top",
      });
      return;
    }

    // default values for optional fields with proper avatar handling
    const userWithDefaults: User = {
      ...userData,
      avatar: userData.avatar || userData.avatar_url || "https://msis-som.eduisync.io/swu-head.png",
      avatar_url: userData.avatar_url || userData.avatar || undefined,
      avatar_data: userData.avatar_data || undefined,
      contact_number: userData.contact_number || "",
      joinDate: userData.joinDate || "",
      policy_accepted: userData.policy_accepted || 0,
      year_level_name: userData.year_level_name || (Number(userData.year_level_id) === 4 ? "Graduating" : `Year ${userData.year_level_id}`),
    };

    console.log("Storing user in context:", {
      id: userWithDefaults.id,
      student_id: userWithDefaults.student_id,
      has_avatar_data: !!userWithDefaults.avatar_data,
      has_avatar_url: !!userWithDefaults.avatar_url
    });

    setUser(userWithDefaults);
    await AsyncStorage.setItem("user", JSON.stringify(userWithDefaults));

    // Activate session on login
    await activateSession(userWithDefaults.id);

    // Register for push notifications
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await savePushTokenToServer(userWithDefaults.id, pushToken);
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }

    //console.log("User stored successfully in AsyncStorage");
  };

  const logout = async () => {
    //console.log("Logging out user");

    // Remove session before clearing user data
    if (user?.id) {
      await removeSession(user.id);
    }

    setUser(null);
    await AsyncStorage.removeItem("user");
    console.log("User removed from storage");
  };

  // Clear user without removing from storage (for edge cases)
  const clearUser = () => {
    console.log("Clearing user from context (soft logout)");
    setUser(null);
  };

  // Update user's policy acceptance status
  const updateUserPolicyStatus = async (accepted: boolean) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      policy_accepted: accepted ? 1 : 0,
    };

    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    //console.log("Policy status updated:", accepted);
  };

  // Update any user properties
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...updates,
    };

    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    //console.log("User updated with:", Object.keys(updates));
  };

  // Refresh user data live from backend database (triggered by DB updates, promotions, or DB factors)
  const refreshUser = async () => {
    if (!user?.id) return false;

    try {
      const API_URL = `${API_BASE_URL}/api`;
      const response = await axios.post(`${API_URL}/get_user_data.php`, {
        user_id: user.id,
        live_fetch: true
      }, {
        timeout: 8000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = response.data;

      if (data.success && data.user) {
        const freshUser: User = data.user;

        if (freshUser.account_status === "Deactivated" || freshUser.account_status === "deactivated") {
          console.warn("Account deactivated in database. Clearing session.");
          await logout();
          return false;
        }

        const userWithDefaults: User = {
          ...freshUser,
          avatar: freshUser.avatar || freshUser.avatar_url || "https://msis-som.eduisync.io/swu-head.png",
          avatar_url: freshUser.avatar_url || freshUser.avatar || undefined,
          avatar_data: freshUser.avatar_data || undefined,
          contact_number: freshUser.contact_number || "",
          joinDate: freshUser.joinDate || "",
          policy_accepted: freshUser.policy_accepted ?? user.policy_accepted ?? 0,
          year_level_name: freshUser.year_level_name || (Number(freshUser.year_level_id) === 4 ? "Graduating" : `Year ${freshUser.year_level_id}`),
        };

        const hasChanged =
          user.year_level_id !== userWithDefaults.year_level_id ||
          user.status !== userWithDefaults.status ||
          user.year_level_name !== userWithDefaults.year_level_name ||
          user.account_status !== userWithDefaults.account_status ||
          user.enrollment_status !== userWithDefaults.enrollment_status ||
          user.evaluation_status !== userWithDefaults.evaluation_status ||
          user.nationality !== userWithDefaults.nationality ||
          user.avatar_data !== userWithDefaults.avatar_data ||
          user.avatar_url !== userWithDefaults.avatar_url ||
          user.first_name !== userWithDefaults.first_name ||
          user.last_name !== userWithDefaults.last_name ||
          JSON.stringify(user) !== JSON.stringify(userWithDefaults);

        if (hasChanged) {
          setUser(userWithDefaults);
          await AsyncStorage.setItem("user", JSON.stringify(userWithDefaults));
        }
        return true;
      } else if (data.message?.includes("deactivated")) {
        await logout();
        return false;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing user data from database:", error);
      return false;
    }
  };

  // Change user password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const API_URL = `${API_BASE_URL}/api`;
      const response = await axios.post(`${API_URL}/change_password.php`, {
        user_id: user.id,
        current_password: currentPassword,
        new_password: newPassword
      });

      const data = response.data;

      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password updated successfully',
          position: 'top',
        });
        return true;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Failed to change password',
          position: 'top',
        });
        return false;
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error. Please try again.',
        position: 'top',
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      clearUser,
      updateUserPolicyStatus,
      updateUser,
      refreshUser,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Identfy error if the Auth is within the Auth Provider 
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};