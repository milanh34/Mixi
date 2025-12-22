// app/join-group.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useGroupStore } from '../stores/groupStore';
import { useToast } from '../utils/toastManager';
import { MotiView } from 'moti';
import { Group } from '../lib/schema';
import * as Haptics from 'expo-haptics';

const GROUP_TYPES: Group['type'][] = ['trip', 'project', 'household', 'event'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

const TYPE_ICONS: Record<Group['type'], keyof typeof MaterialIcons.glyphMap> = {
  trip: 'flight',
  project: 'work',
  household: 'home',
  event: 'event',
};

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { createGroup, loading } = useGroupStore();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Group['type']>('trip');
  const [currency, setCurrency] = useState('INR');

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Please enter a group name', 'error');
      return;
    }

    if (name.trim().length < 3) {
      showToast('Group name must be at least 3 characters', 'error');
      return;
    }

    if (!user) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const groupId = await createGroup(
        user.uid,
        name.trim(),
        type,
        currency,
        description.trim()
      );
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Group created successfully!', 'success');
      router.replace(`/group/${groupId}` as any);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to create group', 'error');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[theme.colors.gradientStart + '15', theme.colors.background]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              Create Group
            </Text>
            
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            {/* Group Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Group Name *
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons name="group" size={20} color={theme.colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: theme.colors.inputText }]}
                  placeholder="e.g., Trip to Goa"
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Description (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                placeholder="Add details about this group..."
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Group Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Group Type
              </Text>
              <View style={styles.typeGrid}>
                {GROUP_TYPES.map((groupType) => (
                  <TouchableOpacity
                    key={groupType}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          type === groupType
                            ? theme.colors.primary + '20'
                            : theme.colors.cardBackground,
                        borderColor:
                          type === groupType
                            ? theme.colors.primary
                            : theme.colors.cardBorder,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setType(groupType);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={TYPE_ICONS[groupType]}
                      size={24}
                      color={type === groupType ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        {
                          color:
                            type === groupType
                              ? theme.colors.primary
                              : theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {groupType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Currency */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Currency
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.currencyRow}
              >
                {CURRENCIES.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.currencyButton,
                      {
                        backgroundColor:
                          currency === curr
                            ? theme.colors.primary
                            : theme.colors.cardBackground,
                        borderColor:
                          currency === curr
                            ? theme.colors.primary
                            : theme.colors.cardBorder,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCurrency(curr);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        {
                          color:
                            currency === curr ? '#FFFFFF' : theme.colors.textPrimary,
                          fontWeight: currency === curr ? '700' : '600',
                        },
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </MotiView>
        </ScrollView>

        {/* Create Button with Gradient */}
        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={[
                styles.createButton,
                loading && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.createButtonText}>Create Group</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  currencyRow: {
    gap: 10,
    paddingRight: 24,
  },
  currencyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    minWidth: 70,
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  createButton: {
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
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
