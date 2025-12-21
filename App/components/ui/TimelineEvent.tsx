// components/ui/TimelineEvent.tsx
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GroupTimelineEvent } from '../../lib/schema';
import { useThemeStore } from '../../stores/themeStore';

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

  const getTypeIcon = (type: string) => {
    const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
      milestone: 'flag',
      payment: 'payment',
      movement: 'place',
    };
    return icons[type] || 'event';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      milestone: '#4CAF50',
      payment: '#2196F3',
      movement: '#FF9800',
    };
    return colors[type] || theme.colors.primary;
  };

  const typeColor = getTypeColor(event.type);

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.dot, { backgroundColor: typeColor }]} />
        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
      </View>

      <View
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
            <MaterialIcons name={getTypeIcon(event.type)} size={20} color={typeColor} />
          </View>
          
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {event.title}
            </Text>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              {dateStr}
            </Text>
          </View>
        </View>

        {event.description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {event.description}
          </Text>
        )}

        {event.location && (
          <View style={styles.location}>
            <MaterialIcons
              name="place"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
              {event.location.name}
            </Text>
          </View>
        )}

        {event.photos.length > 0 && (
          <View style={styles.photos}>
            {event.photos.slice(0, 3).map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))}
            {event.photos.length > 3 && (
              <View style={styles.morePhotos}>
                <Text style={[styles.moreText, { color: theme.colors.text }]}>
                  +{event.photos.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
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
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  photos: {
    flexDirection: 'row',
    gap: 8,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  morePhotos: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#00000020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
