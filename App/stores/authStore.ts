// stores/authStore.ts
import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { User } from "../lib/schema";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_STORAGE_KEY = "@mixi_auth_user";

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;

  signUp: (
    email: string,
    password: string,
    username: string,
    name: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,

  initializeAuth: async () => {
    console.log("🔥 Initializing auth...");

    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);

        // Ensure stats exist
        if (!userData.stats) {
          userData.stats = {
            totalGroups: 0,
            totalExpenses: 0,
            totalBalance: 0,
          };
        }

        console.log("📦 Found stored user:", userData.email);
        set({
          user: userData,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Error loading stored user:", error);
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          console.log(
            "🔥 Auth state changed:",
            firebaseUser?.email || "No user"
          );

          if (firebaseUser) {
            try {
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              if (userDoc.exists()) {
                let userData = userDoc.data() as User;

                // Ensure stats exist - migrate old users
                if (!userData.stats) {
                  userData.stats = {
                    totalGroups: 0,
                    totalExpenses: 0,
                    totalBalance: 0,
                  };

                  // Update in Firestore
                  await updateDoc(doc(db, "users", firebaseUser.uid), {
                    stats: userData.stats,
                  });

                  console.log("✅ Migrated user stats");
                }

                await AsyncStorage.setItem(
                  AUTH_STORAGE_KEY,
                  JSON.stringify(userData)
                );

                set({
                  firebaseUser,
                  user: userData,
                  isAuthenticated: true,
                  isInitialized: true,
                });
                console.log("✅ User authenticated:", userData.email);
              } else {
                console.log("❌ User doc not found in Firestore");
                await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
                set({
                  firebaseUser: null,
                  user: null,
                  isAuthenticated: false,
                  isInitialized: true,
                });
              }
            } catch (error) {
              console.error("❌ Error loading user:", error);
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
              set({
                firebaseUser: null,
                user: null,
                isAuthenticated: false,
                isInitialized: true,
              });
            }
          } else {
            console.log("🚫 No authenticated user");
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            set({
              firebaseUser: null,
              user: null,
              isAuthenticated: false,
              isInitialized: true,
            });
          }

          resolve();
        },
        (error) => {
          console.error("❌ Auth listener error:", error);
          set({
            firebaseUser: null,
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            error: error.message,
          });
          resolve();
        }
      );
    });
  },

  signUp: async (email, password, username, name) => {
    set({ loading: true, error: null });
    try {
      console.log("📝 Signing up:", email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      const newUser: User = {
        uid,
        email,
        username,
        name,
        preferences: {
          theme: "system",
          primaryColor: "#4285F4",
          fontFamily: "Inter",
          fontWeight: "400",
        },
        stats: {
          totalGroups: 0,
          totalExpenses: 0,
          totalBalance: 0,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "users", uid), newUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));

      console.log("✅ User created:", email);

      set({
        firebaseUser: userCredential.user,
        user: newUser,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      console.log("🔐 Signing in:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;

        // Ensure stats exist
        if (!userData.stats) {
          userData.stats = {
            totalGroups: 0,
            totalExpenses: 0,
            totalBalance: 0,
          };
          // Update in Firestore
          await updateDoc(doc(db, "users", userCredential.user.uid), {
            stats: userData.stats,
          });
        }

        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));

        console.log("✅ Sign in successful:", email);

        set({
          firebaseUser: userCredential.user,
          user: userData,
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (error: any) {
      console.error("❌ Sign in error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      console.log("👋 Signing out...");
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      set({
        user: null,
        firebaseUser: null,
        isAuthenticated: false,
      });
      console.log("✅ Sign out successful");
    } catch (error: any) {
      console.error("❌ Sign out error:", error);
      set({ error: error.message });
      throw error;
    }
  },

  updateUserProfile: async (updates: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    set({ loading: true, error: null });
    try {
      const updatedUser = {
        ...currentUser,
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, "users", currentUser.uid), updates);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));

      set({ user: updatedUser, loading: false });
      console.log("✅ Profile updated");
    } catch (error: any) {
      console.error("❌ Update profile error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  refreshUser: async () => {
    const currentUser = get().firebaseUser;
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        set({ user: userData });
      }
    } catch (error) {
      console.error("❌ Refresh user error:", error);
    }
  },

  clearError: () => set({ error: null }),
}));
