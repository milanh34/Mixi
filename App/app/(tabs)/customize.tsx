// app/(tabs)/customize.tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore, THEMES } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2; // 2 columns with padding

export default function CustomizeScreen() {
  const { theme, themeName, setTheme } = useThemeStore();
  const { signOut } = useAuthStore();

  const lightThemes = Object.entries(THEMES).filter(([_, t]) => !t.isDark);
  const darkThemes = Object.entries(THEMES).filter(([_, t]) => t.isDark);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Themes
        </Text>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: theme.colors.error + '15' }]}
          onPress={() => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: signOut,
                },
              ]
            );
          }}
        >
          <MaterialIcons name="logout" size={20} color={theme.colors.error} />
          <Text style={[styles.signOutText, { color: theme.colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Light Themes */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Light Themes
          </Text>
          <View style={styles.themesGrid}>
            {lightThemes.map(([name, themeData], index) => (
              <MotiView
                key={name}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: index * 100 }}
              >
                <TouchableOpacity
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: themeData.colors.card,
                      borderColor:
                        themeName === name
                          ? themeData.colors.primary
                          : themeData.colors.border,
                      borderWidth: themeName === name ? 3 : 1,
                    },
                  ]}
                  onPress={() => setTheme(name as keyof typeof THEMES)}
                  activeOpacity={0.8}
                >
                  <View style={styles.colorPreview}>
                    <View
                      style={[
                        styles.colorBox,
                        { backgroundColor: themeData.colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorBox,
                        { backgroundColor: themeData.colors.secondary },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorBox,
                        { backgroundColor: themeData.colors.accent },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.themeName,
                      { color: themeData.colors.text },
                    ]}
                  >
                    {themeData.name}
                  </Text>
                  {themeName === name && (
                    <View
                      style={[
                        styles.checkmark,
                        { backgroundColor: themeData.colors.primary },
                      ]}
                    >
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Dark Themes */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Dark Themes
          </Text>
          <View style={styles.themesGrid}>
            {darkThemes.map(([name, themeData], index) => (
              <MotiView
                key={name}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: index * 100 }}
              >
                <TouchableOpacity
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: themeData.colors.card,
                      borderColor:
                        themeName === name
                          ? themeData.colors.primary
                          : themeData.colors.border,
                      borderWidth: themeName === name ? 3 : 1,
                    },
                  ]}
                  onPress={() => setTheme(name as keyof typeof THEMES)}
                  activeOpacity={0.8}
                >
                  <View style={styles.colorPreview}>
                    <View
                      style={[
                        styles.colorBox,
                        { backgroundColor: themeData.colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorBox,
                        { backgroundColor: themeData.colors.secondary },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorBox,
                        { backgroundColor: themeData.colors.accent },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.themeName,
                      { color: themeData.colors.text },
                    ]}
                  >
                    {themeData.name}
                  </Text>
                  {themeName === name && (
                    <View
                      style={[
                        styles.checkmark,
                        { backgroundColor: themeData.colors.primary },
                      ]}
                    >
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        </MotiView>
      </ScrollView>
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
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  themeCard: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  colorBox: {
    flex: 1,
    height: 40,
    borderRadius: 8,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
