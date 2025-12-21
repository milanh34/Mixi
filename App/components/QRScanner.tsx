// components/QRScanner.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface QRScannerProps {
  onScanned: (data: string) => void;
}

export function QRScanner({ onScanned }: QRScannerProps) {
  const { theme } = useThemeStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <MotiView
            from={{ rotate: '0deg' }}
            animate={{ rotate: '360deg' }}
            transition={{ type: 'timing', duration: 1000, loop: true }}
          >
            <MaterialIcons name="camera-alt" size={48} color={theme.colors.primary} />
          </MotiView>
          <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '500' }}>
            Loading camera...
          </Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContainer}>
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 600 }}
          >
            <LinearGradient
              colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
              style={styles.permissionIconContainer}
            >
              <MaterialIcons name="camera-alt" size={64} color={theme.colors.primary} />
            </LinearGradient>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            style={styles.permissionTextContainer}
          >
            <Text style={[styles.permissionTitle, { color: theme.colors.textPrimary }]}>
              Camera Permission Required
            </Text>
            <Text style={[styles.permissionText, { color: theme.colors.textSecondary }]}>
              We need access to your camera to scan QR codes and join groups
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 400 }}
          >
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                requestPermission();
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                style={styles.permissionButton}
              >
                <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onScanned(data);

    // Reset after 2 seconds in case of error
    setTimeout(() => setScanned(false), 2000);
  };

  const corners = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        {/* Scan Area with Animated Corners */}
        <View style={styles.scanArea}>
          {corners.map((corner, index) => (
            <MotiView
              key={corner}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                duration: 600,
                delay: index * 100,
              }}
              style={[
                styles.corner,
                styles[corner],
                { borderColor: theme.colors.primary },
              ]}
            />
          ))}

          {/* Scanning Line Animation */}
          {!scanned && (
            <MotiView
              from={{ translateY: -140 }}
              animate={{ translateY: 140 }}
              transition={{
                type: 'timing',
                duration: 2000,
                loop: true,
              }}
              style={styles.scanLine}
            >
              <LinearGradient
                colors={['transparent', theme.colors.primary + 'AA', 'transparent']}
                style={styles.scanLineGradient}
              />
            </MotiView>
          )}
        </View>

        {/* Instruction */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
          style={styles.instructionContainer}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
            style={styles.instructionGradient}
          >
            <MaterialIcons name="qr-code-scanner" size={20} color="#FFFFFF" />
            <Text style={styles.instruction}>
              Position the QR code within the frame
            </Text>
          </LinearGradient>
        </MotiView>

        {/* Scanned Success Indicator */}
        {scanned && (
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
            style={styles.successIndicator}
          >
            <View style={[styles.successCircle, { backgroundColor: theme.colors.success }]}>
              <MaterialIcons name="check" size={48} color="#FFFFFF" />
            </View>
          </MotiView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 24,
  },
  permissionIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTextContainer: {
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 280,
    height: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderWidth: 5,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
  },
  scanLineGradient: {
    width: '100%',
    height: '100%',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
  },
  instructionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  successIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
