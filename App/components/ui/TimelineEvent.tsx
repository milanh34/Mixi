// components/ui/TimelineEvent.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import { GroupTimelineEvent } from '../../lib/schema';
import { format } from 'date-fns';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface TimelineEventProps {
  event: GroupTimelineEvent;
  isFirst?: boolean;
  isLast?: boolean;
}

export function TimelineEvent({ event, isFirst, isLast }: TimelineEventProps) {
  const { theme } = useThemeStore();
  const [showDetails, setShowDetails] = useState(false);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDetails(true);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'flag';
      case 'payment':
        return 'payment';
      case 'movement':
        return 'place';
      default:
        return 'event';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return theme.colors.success;
      case 'payment':
        return theme.colors.primary;
      case 'movement':
        return theme.colors.warning;
      default:
        return theme.colors.textMuted;
    }
  };

  const eventColor = getEventColor(event.type);
  const eventIcon = getEventIcon(event.type);

  return (
    <>
      <View style={styles.container}>
        {/* Timeline Line */}
        {!isFirst && (
          <View
            style={[
              styles.timelineLineTop,
              { backgroundColor: theme.colors.border },
            ]}
          />
        )}
        {!isLast && (
          <View
            style={[
              styles.timelineLineBottom,
              { backgroundColor: theme.colors.border },
            ]}
          />
        )}

        {/* Date Badge */}
        <View style={styles.dateContainer}>
          <View
            style={[
              styles.dateBadge,
              {
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {format(event.date.toDate(), 'MMM dd')}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
              {format(event.date.toDate(), 'hh:mm a')}
            </Text>
          </View>
        </View>

        {/* Timeline Dot */}
        <View style={styles.dotContainer}>
          <View style={[styles.dotOuter, { borderColor: eventColor + '40' }]}>
            <View style={[styles.dotInner, { backgroundColor: eventColor }]}>
              <MaterialIcons name={eventIcon as any} size={14} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Event Card */}
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <MotiView
            from={{ opacity: 0, translateX: 30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              {/* Color Accent */}
              <View style={[styles.cardAccent, { backgroundColor: eventColor }]} />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.cardIcon,
                      { backgroundColor: eventColor + '20' },
                    ]}
                  >
                    <MaterialIcons name={eventIcon as any} size={20} color={eventColor} />
                  </View>
                  <Text
                    style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>
                </View>

                {event.description && (
                  <Text
                    style={[styles.cardDescription, { color: theme.colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {event.description}
                  </Text>
                )}

                {event.location && (
                  <View style={styles.locationRow}>
                    <MaterialIcons
                      name="location-on"
                      size={14}
                      color={theme.colors.textMuted}
                    />
                    <Text style={[styles.locationText, { color: theme.colors.textMuted }]}>
                      {event.location.name}
                    </Text>
                  </View>
                )}

                {event.photos && event.photos.length > 0 && (
                  <View style={styles.photoPreviewRow}>
                    <MaterialIcons name="photo" size={14} color={theme.colors.primary} />
                    <Text style={[styles.photoPreviewText, { color: theme.colors.primary }]}>
                      {event.photos.length} {event.photos.length === 1 ? 'photo' : 'photos'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </MotiView>
        </TouchableOpacity>
      </View>

      {/* Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <LinearGradient
            colors={[eventColor + '40', theme.colors.background]}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity
                onPress={() => setShowDetails(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Event Details
              </Text>
              <View style={{ width: 40 }} />
            </View>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Main Info Card */}
            <View
              style={[
                styles.detailCard,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <View style={styles.detailHeader}>
                <View style={[styles.detailIcon, { backgroundColor: eventColor + '20' }]}>
                  <MaterialIcons name={eventIcon as any} size={28} color={eventColor} />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={[styles.detailTitle, { color: theme.colors.textPrimary }]}>
                    {event.title}
                  </Text>
                  <Text style={[styles.detailDate, { color: theme.colors.textSecondary }]}>
                    {format(event.date.toDate(), 'EEEE, MMMM dd, yyyy')}
                  </Text>
                  <Text style={[styles.detailTime, { color: theme.colors.textMuted }]}>
                    {format(event.date.toDate(), 'hh:mm a')}
                  </Text>
                </View>
              </View>

              {event.description && (
                <>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailSection}>
                    <Text
                      style={[styles.detailSectionTitle, { color: theme.colors.textPrimary }]}
                    >
                      Description
                    </Text>
                    <Text
                      style={[styles.detailSectionText, { color: theme.colors.textSecondary }]}
                    >
                      {event.description}
                    </Text>
                  </View>
                </>
              )}

              {event.location && (
                <>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailSection}>
                    <Text
                      style={[styles.detailSectionTitle, { color: theme.colors.textPrimary }]}
                    >
                      Location
                    </Text>
                    <View style={styles.locationDetailRow}>
                      <MaterialIcons
                        name="location-on"
                        size={18}
                        color={theme.colors.warning}
                      />
                      <Text
                        style={[
                          styles.detailSectionText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {event.location.name}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Photos */}
            {event.photos && event.photos.length > 0 && (
              <View
                style={[
                  styles.detailCard,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.photoSectionTitle, { color: theme.colors.textPrimary }]}>
                  Photos ({event.photos.length})
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photosScroll}
                >
                  {event.photos.map((photo, index) => (
                    <View key={index} style={styles.photoWrapper}>
                      <Image source={{ uri: photo }} style={styles.photo} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  timelineLineTop: {
    position: 'absolute',
    left: 79,
    top: 0,
    width: 2,
    height: 40,
  },
  timelineLineBottom: {
    position: 'absolute',
    left: 79,
    top: 72,
    width: 2,
    bottom: -24,
  },
  dateContainer: {
    width: 60,
    paddingTop: 8,
  },
  dateBadge: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
  dotContainer: {
    width: 40,
    alignItems: 'center',
    paddingTop: 8,
  },
  dotOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    paddingTop: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardAccent: {
    height: 4,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photoPreviewText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  detailCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  detailDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  detailTime: {
    fontSize: 13,
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 14,
  },
  detailSection: {
    gap: 8,
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  detailSectionText: {
    fontSize: 14,
    lineHeight: 21,
  },
  locationDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  photosScroll: {
    gap: 12,
  },
  photoWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 12,
  },
});
