import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useGroupStore } from '../../stores/groupStore';
import { MotiView } from 'moti';
import { Group } from '../../lib/schema';

const GROUP_TYPES: Group['type'][] = ['trip', 'project', 'household', 'event'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { createGroup, loading } = useGroupStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Group['type']>('trip');
  const [currency, setCurrency] = useState('INR');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!user) return;

    try {
      const groupId = await createGroup(
        user.uid,
        name.trim(),
        type,
        currency,
        description.trim()
      );
      
      Alert.alert('Success', 'Group created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace(`/group/${groupId}` as any),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Create Group
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            {/* Group Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Group Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="e.g., Trip to Goa"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Description (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Add details about this group..."
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Group Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
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
                            : theme.colors.surface,
                        borderColor:
                          type === groupType
                            ? theme.colors.primary
                            : theme.colors.border,
                      },
                    ]}
                    onPress={() => setType(groupType)}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        {
                          color:
                            type === groupType
                              ? theme.colors.primary
                              : theme.colors.text,
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
              <Text style={[styles.label, { color: theme.colors.text }]}>
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
                            : theme.colors.surface,
                        borderColor:
                          currency === curr
                            ? theme.colors.primary
                            : theme.colors.border,
                      },
                    ]}
                    onPress={() => setCurrency(curr)}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        {
                          color:
                            currency === curr ? '#FFFFFF' : theme.colors.text,
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

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Group'}
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
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
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  currencyRow: {
    gap: 12,
  },
  currencyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
  },
  createButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
