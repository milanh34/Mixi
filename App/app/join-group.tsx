// app/join-group.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { QRScanner } from '../components/QRScanner';
import { joinGroupByCode } from '../lib/groupJoin';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  const [mode, setMode] = useState<'select' | 'qr' | 'code'>('select');
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeSubmit = async () => {
    if (!groupCode.trim()) {
      Alert.alert('Error', 'Please enter a group code');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a group');
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await joinGroupByCode(groupCode.trim().toUpperCase(), user.uid, user.name);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `Joined "${result.groupName}" successfully!`, [
        {
          text: 'View Group',
          onPress: () => {
            router.replace({
              pathname: '/group/[id]',
              params: { id: result.groupId },
            });
          },
        },
      ]);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanned = async (data: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a group');
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Extract code from QR data (format: mixi://join/GROUP_CODE or just GROUP_CODE)
      const code = data.includes('mixi://join/')
        ? data.split('mixi://join/')[1]
        : data;

      const result = await joinGroupByCode(code.trim().toUpperCase(), user.uid, user.name);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `Joined "${result.groupName}" successfully!`, [
        {
          text: 'View Group',
          onPress: () => {
            router.replace({
              pathname: '/group/[id]',
              params: { id: result.groupId },
            });
          },
        },
      ]);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setMode('select');
    }
  };

  if (mode === 'qr') {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMode('select')}>
            <MaterialIcons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Scan QR Code
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <QRScanner onScanned={handleQRScanned} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Join Group
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {mode === 'select' ? (
          <>
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 600 }}
            >
              <Text style={[styles.title, { color: theme.colors.text }]}>
                How would you like to join?
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 200 }}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setMode('qr')}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primary + '20' },
                  ]}
                >
                  <MaterialIcons name="qr-code-scanner" size={48} color={theme.colors.primary} />
                </View>
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                  Scan QR Code
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  Scan a QR code shared by group admin
                </Text>
              </TouchableOpacity>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 400 }}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setMode('code')}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primary + '20' },
                  ]}
                >
                  <MaterialIcons name="vpn-key" size={48} color={theme.colors.primary} />
                </View>
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                  Enter Group Code
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  Type in the 8-character group code
                </Text>
              </TouchableOpacity>
            </MotiView>
          </>
        ) : (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 600 }}
            style={styles.codeForm}
          >
            <View
              style={[
                styles.codeInputContainer,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <MaterialIcons name="vpn-key" size={24} color={theme.colors.primary} />
              <TextInput
                style={[styles.codeInput, { color: theme.colors.text }]}
                placeholder="MIXI-XXXXXX"
                placeholderTextColor={theme.colors.textSecondary}
                value={groupCode}
                onChangeText={(text) => setGroupCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={13}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleCodeSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Join Group</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setMode('select');
                setGroupCode('');
              }}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
                Back to options
              </Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionCard: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeForm: {
    gap: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  codeInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
  },
});
