// app/join-group.tsx
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useToast } from '../utils/toastManager';
import { joinGroupByCode } from '../lib/groupJoin';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

type Mode = 'menu' | 'qr' | 'code';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { showToast } = useToast();

  const [mode, setMode] = useState<Mode>('menu');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQRModePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        showToast('Camera permission required to scan QR codes', 'warning', {
          confirmAction: async () => {
            await requestPermission();
          },
          confirmText: 'Grant Permission'
        });
        return;
      }
    }

    setMode('qr');
    setScanned(false);
  };

  const handleCodeModePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode('code');
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Extract code from QR data (expects format: "MIXI-XXXXXX" or full URL)
    let code = data;
    if (data.includes('MIXI-')) {
      const match = data.match(/MIXI-[A-Z0-9]{6,}/);
      if (match) {
        code = match[0];
      }
    }

    await handleJoinGroup(code);
  };

  const handleManualJoin = async () => {
    if (!groupCode.trim()) {
      showToast('Please enter a group code', 'error');
      return;
    }

    const formattedCode = groupCode.trim().toUpperCase();
    if (!formattedCode.startsWith('MIXI-')) {
      showToast('Invalid code format. Code should start with MIXI-', 'error');
      return;
    }

    await handleJoinGroup(formattedCode);
  };

  const handleJoinGroup = async (code: string) => {
    if (!user) {
      showToast('Please sign in to join groups', 'error');
      return;
    }

    setLoading(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await joinGroupByCode(code, user.uid, user.name);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(`Joined ${result.groupName}!`, 'success');

      // Navigate to group detail
      setTimeout(() => {
        router.replace({
          pathname: '/group/[id]',
          params: { id: result.groupId },
        });
      }, 500);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Join group error:', error);
      showToast(error.message || 'Failed to join group', 'error');

      // Reset for retry
      setScanned(false);
      setGroupCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mode === 'menu') {
      router.back();
    } else {
      setMode('menu');
      setScanned(false);
      setGroupCode('');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.gradientStart + '15', theme.colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Join Group
          </Text>

          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {mode === 'menu' && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 400 }}
            style={styles.menuContainer}
          >
            <View style={styles.iconCircle}>
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={styles.iconGradient}
              >
                <MaterialIcons name="group-add" size={56} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Join a Group
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Choose how you want to join an existing group
            </Text>

            {/* QR Code Option */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
              onPress={handleQRModePress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: theme.colors.primary + '20' },
                ]}
              >
                <MaterialIcons name="qr-code-scanner" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                  Scan QR Code
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  Use your camera to scan a group's QR code
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>

            {/* Manual Code Option */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
              onPress={handleCodeModePress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: theme.colors.success + '20' },
                ]}
              >
                <MaterialIcons name="vpn-key" size={32} color={theme.colors.success} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>
                  Enter Code
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  Manually type the group code
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </MotiView>
        )}

        {mode === 'qr' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.scannerContainer}
          >
            {!permission?.granted ? (
              <View style={styles.permissionDenied}>
                <MaterialIcons
                  name="camera-alt"
                  size={64}
                  color={theme.colors.textMuted}
                />
                <Text style={[styles.permissionText, { color: theme.colors.textPrimary }]}>
                  Camera permission required
                </Text>
                <TouchableOpacity
                  style={[
                    styles.permissionButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={requestPermission}
                >
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.scannerFrame}>
                  <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                  />

                  {/* Scanning Overlay */}
                  <View style={styles.scannerOverlay}>
                    <View style={styles.scannerCorners}>
                      {/* Top-left corner */}
                      <View style={[styles.corner, styles.cornerTL, { borderColor: theme.colors.primary }]} />
                      {/* Top-right corner */}
                      <View style={[styles.corner, styles.cornerTR, { borderColor: theme.colors.primary }]} />
                      {/* Bottom-left corner */}
                      <View style={[styles.corner, styles.cornerBL, { borderColor: theme.colors.primary }]} />
                      {/* Bottom-right corner */}
                      <View style={[styles.corner, styles.cornerBR, { borderColor: theme.colors.primary }]} />
                    </View>
                  </View>

                  {loading && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                      <Text style={styles.loadingText}>Joining group...</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.scannerInstructions, { color: theme.colors.textSecondary }]}>
                  Position the QR code within the frame
                </Text>

                {scanned && !loading && (
                  <TouchableOpacity
                    style={[styles.rescanButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setScanned(false)}
                  >
                    <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.rescanButtonText}>Scan Again</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </MotiView>
        )}

        {mode === 'code' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.codeContainer}
          >
            <View
              style={[
                styles.codeIconContainer,
                { backgroundColor: theme.colors.success + '20' },
              ]}
            >
              <MaterialIcons name="vpn-key" size={48} color={theme.colors.success} />
            </View>

            <Text style={[styles.codeTitle, { color: theme.colors.textPrimary }]}>
              Enter Group Code
            </Text>
            <Text style={[styles.codeSubtitle, { color: theme.colors.textSecondary }]}>
              Ask the group admin for the invite code
            </Text>

            {/* Code Input */}
            <View style={styles.codeInputContainer}>
              <View
                style={[
                  styles.codeInputWrapper,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons name="tag" size={20} color={theme.colors.textMuted} />
                <TextInput
                  style={[styles.codeInput, { color: theme.colors.inputText }]}
                  placeholder="MIXI-XXXXXX"
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  value={groupCode}
                  onChangeText={setGroupCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={12}
                />
              </View>

              <Text style={[styles.codeHint, { color: theme.colors.textMuted }]}>
                Format: MIXI-XXXXXX (e.g., MIXI-A1B2C3)
              </Text>
            </View>

            {/* Join Button */}
            <TouchableOpacity
              onPress={handleManualJoin}
              disabled={loading || !groupCode.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={[
                  styles.joinButton,
                  (!groupCode.trim() || loading) && { opacity: 0.5 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.joinButtonText}>Join Group</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scannerCorners: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerInstructions: {
    marginTop: 24,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rescanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionDenied: {
    alignItems: 'center',
    gap: 16,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  permissionButton: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  codeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  codeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  codeTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  codeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  codeInputContainer: {
    marginBottom: 32,
  },
  codeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
  },
  codeInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  codeHint: {
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
