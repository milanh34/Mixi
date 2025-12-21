import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useThemeStore } from '../../../stores/themeStore';
import { useGroupStore } from '../../../stores/groupStore';
import { useAuthStore } from '../../../stores/authStore';
import { generateGroupInvite } from '../../../lib/groupJoin';
import { GroupInvite } from '../../../lib/schema';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

export default function InviteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeStore();
  const { currentGroup } = useGroupStore();
  const { user } = useAuthStore();

  const [invite, setInvite] = useState<GroupInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);

  const inviteLink = invite ? `mixi://join/${invite.code}` : '';

  useEffect(() => {
    generateInvite();
  }, []);

  const generateInvite = async () => {
    if (!id || !user) return;

    setLoading(true);
    try {
      const newInvite = await generateGroupInvite(id, user.uid);
      setInvite(newInvite);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!invite) return;
    await Clipboard.setStringAsync(invite.code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(inviteLink);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', 'Invite link copied to clipboard');
  };

  const handleShare = async () => {
    if (!invite) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `Join "${currentGroup?.name}" on Mixi!\n\nGroup Code: ${invite.code}\nOr use this link: ${inviteLink}`,
        title: 'Invite to Mixi Group',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleGenerateQR = async () => {
    setGeneratingQR(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // QR generation is automatic via QRCode component
    setTimeout(() => setGeneratingQR(false), 500);
  };

  if (loading || !invite) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Generating invite...
          </Text>
        </View>
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
          Invite Members
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* QR Code */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 600 }}
          style={styles.qrSection}
        >
          <View
            style={[
              styles.qrContainer,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <QRCode
              value={inviteLink}
              size={200}
              backgroundColor={theme.colors.card}
              color={theme.colors.text}
            />
          </View>
          <Text style={[styles.qrText, { color: theme.colors.textSecondary }]}>
            Scan to join the group
          </Text>
        </MotiView>

        {/* Group Code */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 200 }}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Group Code
          </Text>
          <View
            style={[
              styles.codeContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.code, { color: theme.colors.primary }]}>
              {invite.code}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleCopyCode}
          >
            <MaterialIcons name="content-copy" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Copy Code</Text>
          </TouchableOpacity>
        </MotiView>

        {/* Share Link */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 400 }}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Share Link
          </Text>
          <View
            style={[
              styles.linkContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[styles.link, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {inviteLink}
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.buttonHalf,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
              onPress={handleCopyLink}
            >
              <MaterialIcons
                name="content-copy"
                size={20}
                color={theme.colors.text}
              />
              <Text style={[styles.buttonTextSecondary, { color: theme.colors.text }]}>
                Copy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.buttonHalf, { backgroundColor: theme.colors.primary }]}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Invite Info */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 600 }}
          style={[styles.infoBox, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.infoRow}>
            <MaterialIcons name="info" size={20} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                This invite expires in 24 hours
              </Text>
              <Text style={[styles.infoSubtext, { color: theme.colors.textSecondary }]}>
                Used: {invite.uses}/{invite.maxUses}
              </Text>
            </View>
          </View>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
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
    paddingTop: 24,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  qrContainer: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    marginBottom: 16,
  },
  qrText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  codeContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 16,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
  },
  linkContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  link: {
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 13,
  },
});
