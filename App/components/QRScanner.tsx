import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';

interface QRScannerProps {
  onScanned: (data: string) => void;
}

export function QRScanner({ onScanned }: QRScannerProps) {
  const { theme } = useThemeStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={[styles.message, { color: theme.colors.text }]}>
          Loading camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="camera-alt" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionText, { color: theme.colors.textSecondary }]}>
            We need access to your camera to scan QR codes
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    onScanned(data);
    
    // Reset after 2 seconds in case of error
    setTimeout(() => setScanned(false), 2000);
  };

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
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft, { borderColor: theme.colors.primary }]} />
          <View style={[styles.corner, styles.topRight, { borderColor: theme.colors.primary }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.colors.primary }]} />
          <View style={[styles.corner, styles.bottomRight, { borderColor: theme.colors.primary }]} />
        </View>
        
        <View style={styles.instructionContainer}>
          <Text style={styles.instruction}>
            Position the QR code within the frame
          </Text>
        </View>
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
  message: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
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
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderWidth: 4,
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
  instructionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
});
