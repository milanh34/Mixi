// components/profile/ProfileDetails.tsx
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { format } from 'date-fns';

interface ProfileDetailsProps {
  user: any;
  isEditing: boolean;
}

export function ProfileDetails({ user, isEditing }: ProfileDetailsProps) {
  const { theme } = useThemeStore();

  if (isEditing) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <DetailRow
        icon="email"
        label="Email"
        value={user.email}
      />
      
      {user.bio && (
        <DetailRow
          icon="description"
          label="Bio"
          value={user.bio}
          style={styles.bioRow}
        />
      )}
      
      {user.dateOfBirth && (
        <DetailRow
          icon="cake"
          label="Date of Birth"
          value={format(user.dateOfBirth.toDate(), 'MMMM dd, yyyy')}
        />
      )}
      
      {user.phoneNumber && (
        <DetailRow
          icon="phone"
          label="Phone"
          value={user.phoneNumber}
        />
      )}
      
      {user.address && (
        <DetailRow
          icon="location-on"
          label="Location"
          value={user.address}
          style={styles.longText}
        />
      )}
    </ScrollView>
  );
}

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
  style?: any;
}

function DetailRow({ icon, label, value, style }: DetailRowProps) {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.detailRow, style]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
        <MaterialIcons name={icon as any} size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.detailContent}>
        <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  bioRow: {
    backgroundColor: 'transparent',
  },
  longText: {
    minHeight: 60,
  },
});
