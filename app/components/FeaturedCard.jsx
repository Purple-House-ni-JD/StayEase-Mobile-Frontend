import {
  TouchableOpacity,
  ImageBackground,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { COLORS, FONTS } from "../constants/colors";

const FeaturedCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.featuredCard}
    onPress={onPress}
    activeOpacity={0.92}
  >
    <ImageBackground
      source={
        item?.image || {
          uri: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200",
        }
      }
      style={styles.featuredImage}
      imageStyle={styles.featuredImageRadius}
      resizeMode="cover"
    >
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>{item.badge}</Text>
        </View>

        <View style={styles.featuredBottom}>
          <View>
            <Text style={styles.featuredName}>{item.name}</Text>
            <Text style={styles.featuredLocation}>{item.location}</Text>
          </View>
          <View style={styles.featuredPriceBox}>
            <Text style={styles.featuredPrice}>₱{item.price}</Text>
            <Text style={styles.featuredPriceSub}>per night</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  featuredCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  featuredImage: {
    height: 210,
    overflow: "hidden",
  },
  featuredImageRadius: {
    borderRadius: 20,
  },
  featuredOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
    backgroundColor: "rgba(10, 29, 55, 0.28)",
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  featuredBadgeText: {
    fontFamily: FONTS.label,
    fontSize: 10.5,
    color: COLORS.neutral,
    letterSpacing: 1.5,
  },
  featuredBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  featuredName: {
    fontFamily: FONTS.headline,
    fontSize: 20,
    color: COLORS.neutral,
    letterSpacing: 0.25,
  },
  featuredLocation: {
    fontFamily: FONTS.bodyLight,
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    marginTop: 4,
  },
  featuredPriceBox: {
    alignItems: "flex-end",
  },
  featuredPrice: {
    fontFamily: FONTS.headline,
    fontSize: 22,
    color: COLORS.tertiary,
  },
  featuredPriceSub: {
    fontFamily: FONTS.bodyLight,
    fontSize: 11.5,
    color: "rgba(255,255,255,0.72)",
  },
});

export default FeaturedCard;
