// app/auth/signup.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuthStore();
  const { theme } = useThemeStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signUp(email.trim(), password, username.trim(), name.trim());

      // Navigate to home after successful signup
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600 }}
            style={styles.header}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.logoCircle}
            >
              <MaterialIcons name="person-add" size={40} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Join Mixi and start splitting expenses
            </Text>
          </MotiView>

          {/* Form */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 200, duration: 600 }}
            style={styles.form}
          >
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
              <MaterialIcons name="person" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Full Name"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoComplete="name"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
              <MaterialIcons name="alternate-email" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Username"
                placeholderTextColor={theme.colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
              <MaterialIcons name="email" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Email"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
              <MaterialIcons name="lock" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Password (min 6 characters)"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSignUp} disabled={loading}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signUpButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.signUpButtonText}>Create Account</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>

          {/* Footer */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 400, duration: 600 }}
            style={styles.footer}
          >
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  signUpButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
