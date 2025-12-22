// app/group/invite/[id].tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../../stores/themeStore';
import { useGroupStore } from '../../../stores/groupStore';
import { useAuthStore } from '../../../stores/authStore';
import { useToast } from '../../../utils/toastManager';
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
  const { showToast } = useToast();

  const [invite, setInvite] = useState<GroupInvite | null>(null);
  const [loading, setLoading] = useState(false);

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
      showToast(error.message || 'Failed to generate invite', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!invite) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(invite.code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('Invite code copied!', 'success');
  };

  const handleCopyLink = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(inviteLink);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('Invite link copied!', 'success');
  };

  const handleShare = async () => {
    if (!invite) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await Share.share({
        message: `Join "${currentGroup?.name}" on Mixi!\n\nGroup Code: ${invite.code}\nOr use this link: ${inviteLink}`,
        title: 'Invite to Mixi Group',
      });
      
      if (result.action === Share.sharedAction) {
        showToast('Invite shared successfully!', 'success');
      }
    } catch (error) {
      console.error('Share error:', error);
      showToast('Failed to share invite', 'error');
    }
  };

  if (loading || !invite) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
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
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.gradientStart + '15', theme.colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Invite Members
          </Text>
          
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* QR Code with Enhanced Styling */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 600 }}
          style={styles.qrSection}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart + '10', theme.colors.gradientEnd + '10']}
            style={styles.qrGradientBorder}
          >
            <View
              style={[
                styles.qrContainer,
                { backgroundColor: theme.colors.cardBackground },
              ]}
            >
              <QRCode
                value={inviteLink}
                size={200}
                backgroundColor={theme.colors.cardBackground}
                color={theme.colors.textPrimary}
              />
            </View>
          </LinearGradient>
          
          <Text style={[styles.qrText, { color: theme.colors.textSecondary }]}>
            Scan to join the group
          </Text>
        </MotiView>

        {/* Group Code Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialIcons name="vpn-key" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Group Code
            </Text>
          </View>
          
          <View
            style={[
              styles.codeContainer,
              {
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.code, { color: theme.colors.primary }]}>
              {invite.code}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.8}>
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={styles.button}
            >
              <MaterialIcons name="content-copy" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Copy Code</Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>

        {/* Share Link Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialIcons name="link" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Share Link
            </Text>
          </View>
          
          <View
            style={[
              styles.linkContainer,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.inputBorder,
              },
            ]}
          >
            <MaterialIcons name="link" size={18} color={theme.colors.textMuted} />
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
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
              onPress={handleCopyLink}
              activeOpacity={0.7}
            >
              <MaterialIcons name="content-copy" size={20} color={theme.colors.primary} />
              <Text style={[styles.buttonTextSecondary, { color: theme.colors.primary }]}>
                Copy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleShare} activeOpacity={0.8} style={{ flex: 1 }}>
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={styles.buttonHalfGradient}
              >
                <MaterialIcons name="share" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Share</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Invite Info */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 600 }}
          style={[
            styles.infoBox,
            {
              backgroundColor: theme.colors.warningLight,
              borderColor: theme.colors.warning + '30',
            },
          ]}
        >
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.colors.warning + '20' }]}>
              <MaterialIcons name="info" size={20} color={theme.colors.warning} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>
                This invite expires in 24 hours
              </Text>
              <Text style={[styles.infoSubtext, { color: theme.colors.textSecondary }]}>
                Used: {invite.uses}/{invite.maxUses} times
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
    fontWeight: '500',
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
  headerButton: {
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
    paddingTop: 24,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  qrGradientBorder: {
    padding: 3,
    borderRadius: 28,
    marginBottom: 16,
  },
  qrContainer: {
    padding: 24,
    borderRadius: 24,
  },
  qrText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  codeContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 3,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  link: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    borderRadius: 14,
    gap: 8,
    borderWidth: 2,
  },
  buttonHalfGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '500',
  },
});
