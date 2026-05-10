import { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PinchGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { COLORS, FONTS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ZoomableImage = ({ source }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(1);

  const onPinch = ({ nativeEvent }) => {
    const s = Math.max(1, Math.min(4, baseScale.current * nativeEvent.scale));
    scale.setValue(s);
  };

  const onPinchEnd = ({ nativeEvent }) => {
    baseScale.current = Math.max(
      1,
      Math.min(4, baseScale.current * nativeEvent.scale),
    );
    if (baseScale.current <= 1) {
      baseScale.current = 1;
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }
  };

  const onDoubleTap = () => {
    if (baseScale.current > 1) {
      baseScale.current = 1;
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    } else {
      baseScale.current = 2.5;
      Animated.spring(scale, { toValue: 2.5, useNativeDriver: true }).start();
    }
  };

  return (
    <PinchGestureHandler
      onGestureEvent={({ nativeEvent }) => onPinch({ nativeEvent })}
      onEnded={({ nativeEvent }) => onPinchEnd({ nativeEvent })}
    >
      <Animated.View style={styles.zoomContainer}>
        <TouchableWithoutFeedback onPress={onDoubleTap}>
          <Animated.Image
            source={source}
            style={[styles.zoomImage, { transform: [{ scale }] }]}
            resizeMode="contain"
          />
        </TouchableWithoutFeedback>
      </Animated.View>
    </PinchGestureHandler>
  );
};

const ImageHero = ({
  sources = [],
  source,
  height = 300,
  onBack,
  wishlisted = false,
  onWishlist,
  style,
}) => {
  const images = sources.length > 0 ? sources : source ? [source] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [liked, setLiked] = useState(wishlisted);
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLiked(wishlisted);
  }, [wishlisted]);

  const handleHeart = () => {
    const next = !liked;
    setLiked(next);
    onWishlist?.(next);
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.4,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const toSource = (item) => (typeof item === "string" ? { uri: item } : item);

  return (
    <View style={[styles.container, { height }, style]}>
      {images.length > 0 ? (
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => (
            <TouchableWithoutFeedback onPress={() => setLightboxIndex(index)}>
              <Image
                source={toSource(item)}
                style={[styles.image, { width: SCREEN_WIDTH }]}
                resizeMode="cover"
              />
            </TouchableWithoutFeedback>
          )}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}

      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}

      {images.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {activeIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      <SafeAreaView edges={["top"]} style={styles.controls}>
        {onBack && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {onWishlist !== undefined && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleHeart}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={22}
                color={liked ? COLORS.heartActive : COLORS.primary}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </SafeAreaView>
      <Modal
        visible={lightboxIndex !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setLightboxIndex(null)}
      >
        <GestureHandlerRootView style={styles.lightbox}>
          <StatusBar hidden />

          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={lightboxIndex ?? 0}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => <ZoomableImage source={toSource(item)} />}
          />

          <SafeAreaView style={styles.lightboxBar}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setLightboxIndex(null)}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.lightboxHint}>
            <Text style={styles.lightboxHintText}>
              Pinch or double-tap to zoom
            </Text>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    backgroundColor: "#1E3A5F",
  },
  image: {
    height: "100%",
  },
  placeholder: {
    width: "100%",
    backgroundColor: "#2B4A6F",
  },
  controls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.neutral,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  heartIcon: {
    fontSize: 18,
    color: COLORS.primary,
    lineHeight: 20,
    fontFamily: FONTS.label,
  },
  dots: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 18,
  },
  counter: {
    position: "absolute",
    bottom: 30,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  counterText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: FONTS.label,
  },
  lightbox: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  zoomContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  lightboxBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxHint: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  lightboxHintText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontFamily: FONTS.label,
  },
});

export default ImageHero;
