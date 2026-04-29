import { useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";


/**
 * ImageHero
 * Full-bleed hero image with floating back button and wishlist heart.
 * Designed for detail pages (Room, Property).
 *
 * @param {any}       source        - Image source (require() or { uri })
 * @param {number}    [height]      - Hero image height, default 300
 * @param {Function}  [onBack]      - Back button callback
 * @param {boolean}   [wishlisted]  - Controlled wishlist state
 * @param {Function}  [onWishlist]  - Wishlist toggle callback
 * @param {object}    [style]       - Container style override
 */
const ImageHero = ({
  source,
  height = 300,
  onBack,
  wishlisted = false,
  onWishlist,
  style,
}) => {
  const [liked, setLiked] = useState(wishlisted);
  const heartScale = useRef(new Animated.Value(1)).current;

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

  return (
    <View style={[styles.container, { height }, style]}>
      {/* Hero image — replace source with your Cloudinary URL { uri: room.cover_image_url } */}
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        // Placeholder when no image provided
        <View style={[styles.image, styles.placeholder]} />
      )}

      {/* Floating controls */}
      <SafeAreaView edges={["top"]} style={styles.controls}>
        {/* Back */}
        {onBack && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onBack}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}

        {/* Heart */}
        {onWishlist !== undefined && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleHeart}
            activeOpacity={0.85}
          >
            <Animated.Text
              style={[
                styles.heartIcon,
                { transform: [{ scale: heartScale }] },
                liked && { color: COLORS.heartActive },
              ]}
            >
              {liked ? "♥" : "♡"}
            </Animated.Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
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
    width: "100%",
    height: "100%",
  },
  placeholder: {
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.overlayBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  backArrow: {
    fontSize: 18,
    color: COLORS.heartInactive,
    lineHeight: 20,
  },
  heartIcon: {
    fontSize: 18,
    color: COLORS.primary,
    lineHeight: 20,
    fontFamily: FONTS.label,
  },
});

export default ImageHero;
