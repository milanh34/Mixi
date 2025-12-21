// app/auth/login.tsx
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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuthStore();
  const { theme } = useThemeStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signIn(email.trim(), password);
      
      // Navigate to home after successful login
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login Failed', error.message);
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
        {/* Logo Section */}
        <MotiView
          from={{ opacity: 0, translateY: -50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800 }}
          style={styles.logoSection}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.logoCircle}
          >
            <MaterialIcons name="receipt-long" size={48} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.appName, { color: theme.colors.text }]}>Mixi</Text>
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            Split expenses, share memories
          </Text>
        </MotiView>

        {/* Form Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 300, duration: 600 }}
          style={styles.formSection}
        >
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
              placeholder="Password"
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

          <TouchableOpacity
            onPress={() => Alert.alert('Forgot Password', 'Feature coming soon!')}
          >
            <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
              OR
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: theme.colors.card }]}
            onPress={() => Alert.alert('Google Sign In', 'Coming soon!')}
          >
            <MaterialIcons name="login" size={20} color={theme.colors.text} />
            <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>
        </MotiView>

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 600, duration: 600 }}
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </MotiView>
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
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
  },
  formSection: {
    gap: 16,
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
  forgotPassword: {
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
