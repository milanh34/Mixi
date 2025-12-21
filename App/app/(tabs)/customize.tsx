// app/(tabs)/customize.tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore, THEMES } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../utils/toastManager';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2;

export default function CustomizeScreen() {
  const { theme, themeName, setTheme } = useThemeStore();
  const { signOut } = useAuthStore();
  const { showToast } = useToast();

  const lightThemes = Object.entries(THEMES).filter(([_, t]) => !t.isDark);
  const darkThemes = Object.entries(THEMES).filter(([_, t]) => t.isDark);

  const handleSignOut = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await signOut();
      showToast('Signed out successfully', 'success');
    } catch (error) {
      showToast('Failed to sign out', 'error');
    }
  };

  const handleThemeChange = async (name: keyof typeof THEMES) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(name);
    showToast(`${THEMES[name].name} theme applied`, 'success');
  };

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
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 600 }}
          >
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              Themes
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Choose your style
            </Text>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 300 }}
          >
            <TouchableOpacity
              style={[
                styles.signOutButton, 
                { 
                  backgroundColor: theme.colors.errorLight,
                  borderColor: theme.colors.error + '30',
                }
              ]}
              onPress={handleSignOut}
            >
              <MaterialIcons name="logout" size={20} color={theme.colors.error} />
              <Text style={[styles.signOutText, { color: theme.colors.error }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </LinearGradient>

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
          <View style={styles.sectionHeader}>
            <MaterialIcons name="wb-sunny" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Light Themes
            </Text>
          </View>
          
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
                      backgroundColor: themeData.colors.cardBackground,
                      borderColor:
                        themeName === name
                          ? themeData.colors.primary
                          : themeData.colors.cardBorder,
                      borderWidth: themeName === name ? 3 : 1,
                      shadowColor: themeName === name ? themeData.colors.primary : themeData.colors.cardShadow,
                    },
                  ]}
                  onPress={() => handleThemeChange(name as keyof typeof THEMES)}
                  activeOpacity={0.8}
                >
                  {/* Color Preview */}
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
                  
                  {/* Gradient Preview */}
                  <LinearGradient
                    colors={[themeData.colors.gradientStart, themeData.colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientPreview}
                  />
                  
                  <Text
                    style={[
                      styles.themeName,
                      { color: themeData.colors.textPrimary },
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
          <View style={styles.sectionHeader}>
            <MaterialIcons name="nightlight-round" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Dark Themes
            </Text>
          </View>
          
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
                      backgroundColor: themeData.colors.cardBackground,
                      borderColor:
                        themeName === name
                          ? themeData.colors.primary
                          : themeData.colors.cardBorder,
                      borderWidth: themeName === name ? 3 : 1,
                      shadowColor: themeName === name ? themeData.colors.primary : themeData.colors.cardShadow,
                    },
                  ]}
                  onPress={() => handleThemeChange(name as keyof typeof THEMES)}
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
                  
                  <LinearGradient
                    colors={[themeData.colors.gradientStart, themeData.colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientPreview}
                  />
                  
                  <Text
                    style={[
                      styles.themeName,
                      { color: themeData.colors.textPrimary },
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
  headerGradient: {
    paddingBottom: 16,
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
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  themeCard: {
    width: CARD_WIDTH,
    aspectRatio: 0.9,
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  colorBox: {
    flex: 1,
    height: 32,
    borderRadius: 8,
  },
  gradientPreview: {
    height: 40,
    borderRadius: 12,
    marginBottom: 12,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
