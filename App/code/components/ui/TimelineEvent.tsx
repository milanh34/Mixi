// components/ui/TimelineEvent.tsx
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GroupTimelineEvent } from '../../lib/schema';
import { useThemeStore } from '../../stores/themeStore';
import { MotiView } from 'moti';

interface TimelineEventProps {
  event: GroupTimelineEvent;
}

export function TimelineEvent({ event }: TimelineEventProps) {
  const { theme } = useThemeStore();
  
  const date = event.date.toDate();
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getTypeIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
    const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
      milestone: 'flag',
      payment: 'payment',
      movement: 'place',
    };
    return icons[type] || 'event';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      milestone: theme.colors.success,
      payment: theme.colors.primary,
      movement: theme.colors.warning,
    };
    return colors[type] || theme.colors.accent;
  };

  const typeColor = getTypeColor(event.type);

  return (
    <View style={styles.container}>
      {/* Timeline Line */}
      <View style={styles.timeline}>
        <LinearGradient
          colors={[typeColor, typeColor + '80']}
          style={styles.dot}
        />
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
      </View>

      {/* Event Content */}
      <MotiView
        from={{ opacity: 0, translateX: 20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder,
          },
        ]}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={[typeColor + '30', typeColor + '15']}
            style={styles.iconContainer}
          >
            <MaterialIcons name={getTypeIcon(event.type)} size={20} color={typeColor} />
          </LinearGradient>
          
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {event.title}
            </Text>
            <View style={styles.dateRow}>
              <MaterialIcons name="calendar-today" size={12} color={theme.colors.textMuted} />
              <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                {dateStr}
              </Text>
            </View>
          </View>
        </View>

        {event.description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {event.description}
          </Text>
        )}

        {event.location && (
          <View style={[styles.location, { backgroundColor: theme.colors.primary + '10' }]}>
            <MaterialIcons name="place" size={16} color={theme.colors.primary} />
            <Text style={[styles.locationText, { color: theme.colors.primary }]}>
              {event.location.name}
            </Text>
          </View>
        )}

        {event.photos.length > 0 && (
          <View style={styles.photos}>
            {event.photos.slice(0, 3).map((photo, index) => (
              <TouchableOpacity key={index} activeOpacity={0.8}>
                <Image source={{ uri: photo }} style={styles.photo} />
              </TouchableOpacity>
            ))}
            {event.photos.length > 3 && (
              <View style={[styles.morePhotos, { backgroundColor: theme.colors.overlay }]}>
                <Text style={styles.moreText}>
                  +{event.photos.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 4,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  photos: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  morePhotos: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
